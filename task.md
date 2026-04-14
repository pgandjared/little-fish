# 开发任务跟踪

## 后端开发 (Go / Gin)
- [ ] 1. 模型与 SQL 更新
    - [ ] `internal/model/user.go` 添加 `Image`
    - [ ] `internal/model/product.go` 添加 `Image`
    - [ ] `sql/init_mysql.sql` 追加 `image` 列，新增 `orders`, `messages` 表
    - [ ] 更新 `internal/handler/product.go` 和 `internal/service/product.go`，适配 Image 字段接收和持久化
- [ ] 2. 交易服务 (状态机)
    - [ ] 创建 `internal/model/order.go` 实体结构
    - [ ] 创建 `internal/repository/order.go` 提供数据落盘
    - [ ] 创建 `internal/service/order.go` 并实现订单状态机模型（如 Created -> Paid -> Shipped -> Completed 等流转逻辑）
    - [ ] 创建 `internal/handler/order.go` 并添加路由绑定
- [ ] 3. 通讯服务 (WebSocket)
    - [ ] 下载 `gorilla/websocket` 依赖包
    - [ ] 创建 `internal/model/message.go`
    - [ ] 创建 `internal/repository/message.go` 提供消息持久化
    - [ ] 创建 `internal/service/websocket.go` 实现 Hub 消息广播系统（按 receiverId 分发私聊消息）
    - [ ] 创建 `internal/handler/message.go` 暴露 `ws://` 接口
- [ ] 4. 依赖注入主入口
    - [ ] 在 `cmd/api/main.go` 中完成各个新增组件的注入并向 `InitRouter` 传参
    - [ ] 在 `internal/router/router.go` 中注册 Order 接口和 WS 接口

## 容器化打包 (Docker)
- [ ] 构建后端镜像
    - [ ] 在根目录提供 `Dockerfile` 打包 Go 后端。
- [ ] 环境编排编排
    - [ ] 在根目录提供 `docker-compose.yml` 包含 Backend, Casdoor, MySQL, Redis 的容器定义。

## 前端开发 (React)
- [ ] 初始化 React 项目
- [ ] 实现 Order 的前端展示与状态机操作面板
- [ ] 实现 WebSocket 的聊天对话框界面
