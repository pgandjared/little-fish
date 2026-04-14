# 目标描述

本计划旨在完善二手交易平台系统，主要包括：为用户和商品模型增加图片支持，完善用户之间的交易服务（订单），以及卖家与买家之间的通讯服务（聊天消息）。

## 拟定修改内容

### 1. 为 User 和 Product 增加图片字段
- **模型层 (Models)**:
  - `internal/model/user.go`: 并在 `User` 结构体中添加 `Image string` 字段（表示用户头像）。
  - `internal/model/product.go`: 在 `Product` 以及用于列表展示的 `EasyShowProduct` 结构体中添加 `Image string` 字段（表示商品主图）。
- **处理层和服务层 (Handlers & Services)**:
  - `internal/handler/product.go`: 修改 `CreateProduct` 和 `UpdateProduct` 接口的入参绑定，使其可以接收和处理前端传来的 `Image` 图片链接。
  - `internal/service/product.go`: 在 `Create` 和 `Update` 方法中支持保存 `Image` 数据，同时确保 `List` （商品列表查寻）接口会连同商品名称一起返回 `Image` 字段。
- **数据库表结构**:
  - 修改 `sql/init_mysql.sql`，在 `users` 和 `product` 表中加入 `image` 列（VARCHAR）。

---

### 2. 交易服务 (订单 Order)
此服务用于买家成功下单商品，并跟踪订单的交易状态。
- **模型 (Model)**: `internal/model/order.go`
  - 字段设计包括：`Id` (主键), `BuyerId` (买家 ExternalId), `SellerId` (卖家 ExternalId), `ProductId` (商品 ID), `Status` (订单状态，例如：0未支付，1已支付，2已发货，3已完成，4已取消), `Cost` (交易金额), 及时间戳字段。
- **数据层 (Repository)**: `internal/repository/order.go`
  - 提供 `CreateOrder` (创建订单), `GetOrder` (获取单个订单), `UpdateOrder` (更新订单状态), `ListOrdersByUser` (获取某用户的订单) 方法。
- **服务逻辑 (Service)**: `internal/service/order.go`
  - 提供 `Create`, `UpdateStatus` (支付/取消/完成), `List` 方法。
- **接口防区 (Handler)**: `internal/handler/order.go`
  - `POST /api/order`: 提交新订单。
  - `GET /api/order`: 查阅当前登录用户的所有订单。
  - `PUT /api/order/status`: 更新指定订单状态。
- **数据库表结构**:
  - 在 `init_mysql.sql` 中创建 `orders` 交易数据表。

---

### 3. 通讯服务 (聊天消息 Message)
此服务提供给卖家与买家进行沟通交流的基础后端支持。
- **模型 (Model)**: `internal/model/message.go`
  - 字段设计包括：`Id` (主键), `SenderId` (发送人 ID), `ReceiverId` (接收人 ID), `Content` (消息内容), `CreateTime` (时间戳)。
- **数据层 (Repository)**: `internal/repository/message.go`
  - 提供 `CreateMessage` (写库)和 `GetChatHistory` (查阅两位用户之间的全部消息) 等方法。
- **服务逻辑 (Service)**: `internal/service/message.go`
  - 处理 `SendMessage` 发送消息逻辑，以及 `GetHistory` 查询消息历史。
- **接口防区 (Handler)**: `internal/handler/message.go`
  - `POST /api/message`: 发送一条消息。
  - `GET /api/message`: 拉取自己和某一个对应商品/用户的全部对话记录。
- **数据库表结构**:
  - 在 `init_mysql.sql` 中创建 `messages` 通讯数据表。

---

### 4. 路由与程序入口更新
- **路由注册 (`internal/router/router.go`)**: 挂载新的 `/api/order` 和 `/api/message` 系列接口。
- **主程序入口 (`cmd/api/main.go`)**: 实例化 Order 和 Message 相关的 DB、Repo、Service、Handler 对象，完成依赖注入，再传入路由服务中。

---

> [!IMPORTANT]
> ## 需要您确认和做决定的几个问题：
>
> 1. **数据库迁移脚本**：当前项目使用 `golang-migrate`，但是 `sql/` 目录下只有一个非标准命名的 `init_mysql.sql`。**方案选择**：
>    - A: 我直接修改并把新表的 SQL 补充在现有的 `init_mysql.sql` 中。（简单快捷）
>    - B: 我为您将其规范化为 `000001_init.up.sql`, `000002_add_features.up.sql` 这种标准分步格式。
>
> 2. **通讯服务的设计方案**：
>    - A: **(推荐) REST API 模式**。按上方写的，留出一发一收两个 HTTP 接口即可。前端自己做个 1秒一次 的轮询拉取最新消息，最简单、不用重构其它部分。
>    - B: **WebSocket 实时模式**。使用 ws 协议长链接推送，需要改动引入 Websocket 控制库和协程读写阻塞机制。相对复杂。
>
> 3. **图片上传方案**：
>    - A: 数据库的 Image 只需要保存前端存好的第三方图床/OSS的【`URL字符串`】即可，我不介入图片真正的物理保存逻辑。
>    - B: 需要我在后端专门加一个 `POST /api/upload` 接口用于接收文件并将图片存储在服务器本地的文件系统中。

## 测试验证方案
- 部署修改后的代码并能够无挂起进行 `go build ./cmd/api` 运行。
- 在服务自动启动期间无报错，且会自动检测执行 SQL 创建新表（`users`, `product`有字段增加，新增`orders`, `messages`）。
- 我们将使用 curl 或内部命令测试发起 POST/GET 请求以验证业务联调能力。
