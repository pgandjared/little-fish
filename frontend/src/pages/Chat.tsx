import React, { useEffect, useState, useRef } from "react";
import { Input, Button, List, Card, message } from "antd";
import { get } from "../utils/request";

interface ChatMessage {
  Id?: number;
  SenderId: string;
  ReceiverId: string;
  Content: string;
  CreateTime?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [peerId, setPeerId] = useState("seller_id_001"); // 测试时直接指定一个交互目标Id
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 假设用 token 携带认证
    const token = localStorage.getItem("token") || "";
    // 构建 websocket 地址，需根据实际情况修改端口和 host
    const wsUrl = `ws://localhost:8080/api/message/ws?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => {
      console.log("WS Connected");
      message.success("聊天服务器连接成功");
    };
    ws.current.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        // 如果是发送给当前对话人的或者对方发来的，才追加到对话框
        if (msg.SenderId === peerId || msg.ReceiverId === peerId) {
          setMessages((prev) => [...prev, msg]);
        }
      } catch (e) {
        console.error("Parse msg error", e);
      }
    };
    ws.current.onerror = (e) => {
      console.error("WS Error", e);
    };

    return () => {
      ws.current?.close();
    };
  }, [peerId]);

  useEffect(() => {
    // 组件启动加载历史记录
    loadHistory();
  }, [peerId]);

  const loadHistory = async () => {
    try {
      const data = await get<ChatMessage[]>(`/api/message/history?peer_id=${peerId}`);
      if (data) setMessages(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const payload = {
      receiver_id: peerId,
      content: inputValue,
    };
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      
      // 自己发出的消息也要加到列表（因为后端 WS 不一定回传给自己）
      setMessages((prev) => [
        ...prev, 
        { SenderId: "me", ReceiverId: peerId, Content: inputValue }
      ]);
      setInputValue("");
    } else {
      message.error("聊天服务未连接");
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", gap: "20px" }}>
      <Card title="通讯服务" style={{ width: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <span>对话对方 ID: </span>
          <Input 
            value={peerId} 
            onChange={(e) => setPeerId(e.target.value)} 
            style={{ width: 200, marginLeft: 8 }}
          />
          <Button onClick={loadHistory} style={{ marginLeft: 8 }}>拉取历史</Button>
        </div>

        <div style={{ height: 400, overflowY: "auto", border: "1px solid #f0f0f0", padding: 16, marginBottom: 16 }}>
          <List
            dataSource={messages}
            renderItem={(item) => {
              const isMine = item.SenderId === "me" || item.SenderId === localStorage.getItem("external_id");
              return (
                <div style={{ textAlign: isMine ? "right" : "left", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                    {isMine ? "我" : item.SenderId} {item.CreateTime}
                  </div>
                  <div style={{ 
                    display: "inline-block",
                    padding: "8px 12px", 
                    background: isMine ? "#1677ff" : "#f5f5f5",
                    color: isMine ? "#fff" : "#333",
                    borderRadius: 8
                  }}>
                    {item.Content}
                  </div>
                </div>
              );
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            placeholder="输入聊天内容..."
          />
          <Button type="primary" onClick={handleSend}>发送</Button>
        </div>
      </Card>
    </div>
  );
}
