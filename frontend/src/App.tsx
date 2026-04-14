import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button, message, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import Products from "./pages/Products";
import UserManagement from "./pages/UserManagement";
import AuthCallback from "./pages/AuthCallback";
import { casdoorSDK } from "./casdoor";

const { Header, Content } = Layout;

function NavMenu() {
  const location = useLocation();

  const pathToKey: Record<string, string> = {
    "/products": "1",
    "/orders": "2",
    "/chat": "3",
    "/users": "4",
  };

  const currentKey = pathToKey[location.pathname] || "1";

  return (
    <Menu theme="dark" mode="horizontal" selectedKeys={[currentKey]} style={{ flex: 1, backgroundColor: "transparent" }}>
      <Menu.Item key="1"><Link to="/products">商品大厅</Link></Menu.Item>
      <Menu.Item key="2"><Link to="/orders">我的订单</Link></Menu.Item>
      <Menu.Item key="3"><Link to="/chat">消息中心</Link></Menu.Item>
      <Menu.Item key="4"><Link to="/users">用户管理</Link></Menu.Item>
    </Menu>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const decoded = casdoorSDK.parseAccessToken(savedToken);
        setUserInfo(decoded);
      } catch (e) {
        console.error("Token 解析失败", e);
      }
    }
  }, []);

  const handleLogin = () => {
    const loginUrl = casdoorSDK.getSigninUrl();
    window.location.href = loginUrl.replace("response_type=code", "response_type=token");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserInfo(null);
    message.success("已退出登录");
    setTimeout(() => {
      window.location.href = "/products";
    }, 500);
  };

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#1a1a2e",
          padding: "0 30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}>
          <Link to="/products" style={{ color: "white", fontSize: 20, marginRight: 40, fontWeight: "bold", textDecoration: "none" }}>
            🐟 二手交易平台
          </Link>
          <NavMenu />
          <div style={{ marginLeft: "auto" }}>
            {token ? (
              <Space size="large">
                <Space style={{ cursor: "pointer", color: "white" }}>
                  <Avatar
                    src={userInfo?.picture || userInfo?.avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#FF5000" }}
                  />
                  <span style={{ fontSize: 14 }}>{userInfo?.displayName || userInfo?.name || "用户"}</span>
                </Space>
                <Button type="primary" danger size="small" onClick={handleLogout} style={{ borderRadius: 15 }}>退出登录</Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleLogin} style={{ backgroundColor: "#FF5000", borderRadius: 15 }}>登录</Button>
            )}
          </div>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/callback" element={<AuthCallback />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
