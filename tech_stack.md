# 二手交易平台系统 - 全栈技术与架构设计白皮书

本项目是一套完整覆盖了展示、交易结算以及客户端双向实时交流的综合性二手交易平台应用。本文档系统论述了本平台所依托的前后端核心技术选型以及底层代码编写所遵守的设计模式规范。

## 1. 核心技术栈选型架构

### 1.1 后端服务栈 (Backend) - Go
构建于注重高并发与工程化的 **Golang** 生态体系。
* **应用通信层**: `Gin` (`github.com/gin-gonic/gin`)，轻量且高性能的 HTTP RESTful API 开发底座；联合 `Gorilla WebSocket` 实现长连接的消息全双工实时握手推送。
* **关系型存储及迁移**: 
  * 依托 `MySQL 8.0` 作为底层的数据支撑。
  * `GORM` (`gorm.io/gorm`) 作为数据表映射框架解决底层 CRUD。
  * 结合 `golang-migrate` 承担数据表的自动化初始化版本迁移控制工作。
* **内存中间件与锁**: `Redis v9` (`github.com/redis/go-redis/v9`) 提供关键高频查询接口的内存级读取速度，并用作高访问性能的数据降级缓存。
* **SSO单点登录与安全**: 基于第三方的 `Casdoor SDK` (`github.com/casdoor/casdoor-go-sdk`) 提供强壮的微服务级 OAuth2 / OIDC 通用认证。
* **治理与链路监控**: 
  * `Viper` (构建级与多环境配置文件解析)。
  * `Zap` (强吞吐型的系统报错及业务日志落盘控制)。
  * `ginprometheus` (暴露出支持 Prometheus 采集框架的系统运行态 metrics 探针)。

### 1.2 前端展现层 (Frontend) - React
为规避各种历史安全性包（如恶意 axios 事件），前端应用拥抱原生防干预生态与重响应开发范式。
* **编译器与脚手架**: 基于原生提速环境 `Vite` 构建，原生拥抱全量 TypeScript，保障参数校验的严谨。
* **视图组件库**: `React Router Dom` 驱动路由流转，并借用企业级 `Ant Design 5 (antd)` 构建现代化的后台交互卡片与表格视觉系统。
* **无侵入网络层**: 彻底剔除 axios 包，基于浏览器底层原生 `Fetch API` 自主封装双重安全处理与 Casdoor Bearer Token 感知注入模块 (`/src/utils/request.ts`)。

### 1.3 容器虚拟化 (DevOps)
* `Docker & Docker Compose` 容器化：提供与本机配置环境解耦的一键拉起脚本，解决 Casdoor, Redis, MySQL 等相互组网信任依赖的问题。

---

## 2. 软件工程设计模式应用 (Design Patterns)

在源码组织开发过程中，团队严格坚持了经典的面相对象与微服务设计套路，以保证代码的安全扩展和高频维护体验。具体沉淀出的设计模式包含：

### 2.1 依赖注入模式 (Dependency Injection Pattern)
主要应用在整个后端的启动阶段生命周期 (`cmd/api/main.go`)。
我们拒绝在各自包中硬编码新建实例，而是遵循以底层数据库 `db` 为最初对象，自下而上注入进 `Repository(仓储)` -> `Service(服务)` -> `Handler(控制)` 的层级传递链路中。这样能带来极强的结构解耦，并完美迎合各类 mock 测试。

### 2.2 仓储隔离模式 (Repository Pattern)
在各个 `internal/repository/*.go` 当中。
我们将涉及到基于 `GORM` 或纯粹底层 SQL 操作的基础数据增产改查逻辑严格包入 `ProductRepo`, `OrderRepo` 与 `MessageRepo` 内。这有效隐藏住了对数据库驱动库的真实依赖细节（如果在未来系统架构要切出 MySQL 换成 PostgreSQL，业务服务层 `Service` 的代码近乎不需作出一行改动）。

### 2.3 状态机模式 (State Machine Pattern)
应用在交易订单中心 (`internal/service/order.go` 的 `UpdateOrderStatus` 中)。
交易环节涉及到严格有序的操作校验，我们摒弃杂乱随意的 status 加减。而是预设了 “创建待支付 (Created)” -> “已支付未发货 (Paid)” -> “已发货 (Shipped)” -> “确认完成 (Completed)” / “废弃取消 (Cancelled)” 的受控时序图体系。严卡状态切换准入机制，防止被越级或重放入库。

### 2.4 面向行为的工厂方法模式 (Factory Method)
主要见于各类 `NewXXXX(xx,xx)` 包构造函数（比如 `NewProductSvc()` / `NewWsHub()` 等）。
Golang 中没有传统语言里的 class 生成概念，这种自研创建者工厂方法的变体能确保对外暴露的对象在创建瞬间就保证了私有字段与连接池得到严密地内存分配构建，屏蔽使用端的复杂构造认知。

### 2.5 集线器枢纽模式 / 变种发布订阅模式 (Hub / Pub-Sub)
针对聊天的实时通讯 (`internal/service/websocket.go`)，基于 `WsHub` 结构体进行设计。
针对长连接高内存消耗以及消息高扇出的痛点，我们在 Hub 维护了一张所有成功认证设备的通讯池 `map[userId]*websocket.Conn`。当服务抓捕到报文结构体携带接收目标 ID 时，能在 O(1) 性能下寻找目标连接符对象广播写入，辅以读写锁 `sync.RWMutex` 防范高并发脏写，构成了完备的路由发布集线器特征。
