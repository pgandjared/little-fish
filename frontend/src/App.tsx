import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout, Menu, Button, message, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import Products from "./pages/Products";
import UserManagement from "./pages/UserManagement";
import AuthCallback from "./pages/AuthCallback";
import { casdoorSDK } from "./casdoor";

const { Header, Content, Footer } = Layout;

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        // 使用 SDK 解析 JWT Token 获得用户信息
        const decoded = casdoorSDK.parseAccessToken(savedToken);
        setUserInfo(decoded);
      } catch (e) {
        console.error("Token 解析失败", e);
      }
    }
  }, []);

  const handleLogin = () => {
    // 强制使用隐式流 (Implicit Flow)，直接获取 Token
    const loginUrl = casdoorSDK.getSigninUrl();
    window.location.href = loginUrl.replace("response_type=code", "response_type=token");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserInfo(null);
    message.success("已退出登录");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div style={{ color: "white", fontSize: 20, marginRight: 40 }}>二手交易平台</div>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} style={{ flex: 1 }}>
            <Menu.Item key="1"><Link to="/products">商品大厅</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/orders">我的订单</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/chat">消息中心</Link></Menu.Item>
            <Menu.Item key="4"><Link to="/users">用户管理</Link></Menu.Item>
          </Menu>
          <div style={{ marginLeft: "auto" }}>
            {token ? (
              <Space size="large">
                <Link to="/users">
                  <Space style={{ cursor: "pointer", color: "white" }}>
                    <Avatar 
                      src={userInfo?.picture || userInfo?.avatar} 
                      icon={<UserOutlined />} 
                    />
                    <span style={{ fontSize: 14 }}>{userInfo?.displayName || userInfo?.name}</span>
                  </Space>
                </Link>
                <Button type="primary" danger size="small" onClick={handleLogout}>退出登录</Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleLogin}>登录</Button>
            )}
          </div>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 24 }}>
          <div style={{ background: "#fff", minHeight: 400, borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<div style={{padding: 24}}>欢迎使用，请点击上方菜单进入对应模块</div>} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/callback" element={<AuthCallback />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Second Hand Transaction App ©2026</Footer>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
