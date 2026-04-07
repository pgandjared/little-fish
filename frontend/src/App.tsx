import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div style={{ color: "white", fontSize: 20, marginRight: 40 }}>二手交易平台</div>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} style={{ flex: 1 }}>
            <Menu.Item key="1"><Link to="/orders">我的订单</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/chat">消息中心</Link></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 24 }}>
          <div style={{ background: "#fff", minHeight: 400, borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<div style={{padding: 24}}>欢迎使用，请点击上方菜单进入对应模块</div>} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Second Hand Transaction App ©2026</Footer>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
