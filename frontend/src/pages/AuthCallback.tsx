import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { casdoorSDK } from "../casdoor";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    // 优先尝试从 URL 哈希中直接获取 Token (隐式流)
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      localStorage.setItem("token", accessToken);
      message.success("登录成功 (隐式流)！");
      setTimeout(() => { window.location.href = "/"; }, 500);
      return;
    }

    // 如果没有 Token，再尝试用 code 去换 (原本的逻辑)
    const code = urlParams.get("code");
    if (code) {
      // 如果你不想改后端，这里会报错，所以我们给个友好提示
      casdoorSDK.signin("http://localhost:8080").then(res => res.json()).then((data: any) => {
        if (data.status === "ok") {
          localStorage.setItem("token", data.data);
          message.success("登录成功！");
          setTimeout(() => { window.location.href = "/"; }, 500);
        } else {
          message.error("换取 Token 失败，请确保后端接口已开启或使用隐式流");
          setLoading(false);
        }
      }).catch(() => {
        message.warning("后端接口未响应，正尝试解析 URL 内容...");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <div style={{ padding: 50, textAlign: "center" }}>
      {loading ? <Spin tip="正在处理登录状态..." size="large" /> : <div>跳转中...</div>}
    </div>
  );
}
