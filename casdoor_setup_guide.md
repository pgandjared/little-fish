# Casdoor 配置与参数提取指南

要让我们的后端的 SSO 单点登录与权限校验跑通，我们需要在 Casdoor 管理后台创建一个应用，并将生成的鉴权凭证填入项目的 `config/config.json` 当中。

请按照以下明确的步骤进行：

## 步骤 1：启动并登录 Casdoor 面板

1. 确保您的 Docker 已经启动。在我们的项目根目录运行 `docker-compose up -d`。
2. 浏览器访问：**`http://localhost:8000`** 
3. 因为是初次运行，Casdoor 会用默认用户名和密码登录。
   - **默认账号**：`admin`
   - **默认密码**：`123`

## 步骤 2：了解 Organization (组织)

在 Casdoor 中，所有的独立业务都是以 `Organization` (组织) 为基础进行划分的。
1. 在左侧菜单栏找到 **Organizations（组织）**。
2. Casdoor 默认已经带有一个名为 **`built-in`** 的组织。
3. 您可以直接使用这个默认组织，也可以点击右上角新建一个。此时，您的 `config.json` 中的 `"organName"` 即为您定下的组织名（比如就是 `"built-in"`）。

## 步骤 3：创建您的 Application (应用)

应用是负责颁发 Token 并对应我们当前 "二手交易平台" 这个实际工程的实体。
1. 在左侧菜单栏找到 **Applications（应用）**，点击右上角 **Add（添加）**。
2. 将 **Name** 设置为容易辨识的名字（例如：`second-hand-app`）。此时，您的 `config.json` 中的 `"appName"` 也就是 `"second-hand-app"`。
3. 确保这个应用的 **Organization** 下拉框选中了您在步骤 2 中的组织（比如 `built-in`）。
4. 在下方配置好对应的参数并保存！

## 步骤 4：提取核心密钥并写入 `config.json`

当进入您刚才建好的 Application (第二步新建的应用界面) 之后，您就能拿到最关键的凭证了：

1. **获取 Client ID 和 Client Secret**：
   在应用详情的中间区域，您会看到两个只读输入框：
   - **`Client ID`**：一长串的特征码。请将它复制，填入 `config.json` 中的 `"clientId"`。
   - **`Client Secret`**：更长的一串密文。请将它复制，填入 `config.json` 中的 `"clientSecret"`。
2. **提取公钥 (Public Key)**：
   Casdoor 是基于 JWT （非对称加密）下发身份 Token 令牌的，因此我们在验证时需要获得**公钥**。
   - 在应用设置页面中，往下划，会有一个 **Cert（证书）** 下拉框（预设可能是 `cert-built-in`）。请顺着那个证书或者去左侧菜单点击 **Certs（证书）** 找到它。
   - 找到名为 `cert-built-in` 的证书记录点进去编辑。
   - 在编辑页面，您会看到一个多行的大文本框，上面写着 **Public key（公钥）**。其内容形如：
     ```text
     -----BEGIN CERTIFICATE-----
     MIIE+TCCAuGgAw...
     ...这里有一大段字母...
     -----END CERTIFICATE-----
     ```
   - **非常重要**：将其完整复制下来，由于 JSON 文件本来不支持直接换行折行的字符串内容，您需要手动把换行符替换为转义符号 `\n`。比如处理为这样的单行格式填进去：`"-----BEGIN CERTIFICATE-----\nMII...省略...\n-----END CERTIFICATE-----"`。填入 `config.json` 的 `"publicKey"` 字段。
   > *(注：如果您在 Go Viper 中无法正确解析带有转义的 JSON 公钥，你也可以将这段原样保存为 `key.pem` 文本文件并配置程序去读取，但对目前配置只需在 JSON 中以 `\n` 紧密连接)。*

## 最终写入效果对比

您的 `config/config.json` 最终的 `casdoor` 节点看起来应该长这样：

```json
  "casdoor": {
    "url": "http://localhost:8000",
    "clientId": "6abxxxx您的真实ClientIDxxxx837",
    "clientSecret": "a828xxxx您的真实ClientSecretxxxxxee7",
    "publicKey": "-----BEGIN CERTIFICATE-----\nMIIE...这里是公钥密文...\n-----END CERTIFICATE-----",
    "organName": "built-in",
    "appName": "second-hand-app"
  }
```

按照此配置完成以后重启我们的 Go 并验证即可，后端就能借助 Casdoor 正常认证那些包含有效 Token 的请求了！
