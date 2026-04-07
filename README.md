# 二手交易平台系统 (Second Hand Transaction Platform)

这是一个基于 Go + Gin + MySQL + Redis + Casdoor 构建的后端与前端分离的一套二手交易平台系统。

## 技术栈

*   **后端**: Go 1.26.1 (Gin 框架)
*   **数据库**: MySQL 8.0
*   **缓存**: Redis alpine
*   **认证/授权**: Casdoor (SSO 单点登录)
*   **部署**: Docker Compose

## 快速启动指南

### 1. 克隆项目
```bash
git clone <repository_url>
cd second_hand_transaction
```

### 2. 环境部署 (Docker)
项目根目录下包含 `docker-compose.yml`，一键启动所有基础服务。

> [!IMPORTANT]
> **常见问题 (端口冲突)**:
> 在执行 `docker compose up` 前，请确保您的宿主机没有占用 `3306` 端口的 MySQL 服务。如果报错 `address already in use`，请先通过以下命令停止本地 MySQL：
> `sudo systemctl stop mysql` (Linux) 或在服务管理器中停止。

```bash
docker compose up -d
```
该命令会自动启动以下容器：
*   `mysql`: 数据库服务 (端口 3306)
*   `redis`: 缓存服务 (端口 6379)
*   `casdoor`: 认证服务 (端口 8000)
*   `api`: 后端应用服务 (端口 8080)

### 3. 后端配置 (Casdoor 鉴权)
后端运行需要真实的 Casdoor 应用参数。
1.  访问 `http://localhost:8000` (默认账号: `admin`, 密码: `123`)。
2.  按照 [Casdoor 配置指南](casdoor_setup_guide.md) 创建组织和应用。
3.  将生成的 `clientId`, `clientSecret` 和 `publicKey` 填入 `config/config.json`。

### 4. 数据库初始化
MySQL 容器启动时会自动加载 `sql/init.sql` 进行表结构初始化。

---

## 开发者提示

*   **Go 版本要求**: 项目要求 **Go 1.25+** (推荐 1.26.1)。
*   **热更新**: 开发环境下建议使用 `air` 或直接 `go run cmd/api/main.go`。
*   **镜像构建**: 如果修改了后端代码，需要重新构建镜像：
    ```bash
    docker compose build api
    docker compose up -d
    ```

## 贡献
如果您发现任何 Bug 或有功能建议，请提交 Issue 或 Pull Request。
