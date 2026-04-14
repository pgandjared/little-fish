import { useEffect, useState, useRef } from "react";
import { Input, Button, message, Empty, Badge } from "antd";
import { Send, Wifi, WifiOff, MessageCircle } from "lucide-react";
import { get } from "../utils/request";
import { useSearchParams } from "react-router-dom";
import { casdoorSDK } from "../casdoor";

interface ChatMessage {
  Id?: number;
  SenderId: string;
  ReceiverId: string;
  Content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchParams] = useSearchParams();
  const [peerId, setPeerId] = useState(searchParams.get("peer") || "");
  const [peerInput, setPeerInput] = useState(searchParams.get("peer") || "");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token") || "";
  let currentUserId = "";
  if (token) {
    try {
      const decoded: any = casdoorSDK.parseAccessToken(token);
      currentUserId = decoded?.sub || "";
    } catch {}
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket连接
  useEffect(() => {
    if (!token) return;

    setConnecting(true);
    const wsUrl = `ws://localhost:8080/api/message/ws?token=${token}`;

    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => {
      setConnected(true);
      setConnecting(false);
    };
    ws.current.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error("Parse msg error", e);
      }
    };
    ws.current.onerror = () => {
      setConnected(false);
      setConnecting(false);
    };
    ws.current.onclose = () => {
      setConnected(false);
      setConnecting(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [token]);

  // 切换对话人时加载历史
  useEffect(() => {
    if (peerId) {
      loadHistory();
    }
  }, [peerId]);

  // URL参数变化时更新
  useEffect(() => {
    const peer = searchParams.get("peer");
    if (peer && peer !== peerId) {
      setPeerId(peer);
      setPeerInput(peer);
    }
  }, [searchParams]);

  const loadHistory = async () => {
    try {
      const data = await get<ChatMessage[]>(`/api/message/history?peer_id=${peerId}`);
      if (data) setMessages(data);
      else setMessages([]);
    } catch (err: any) {
      console.error(err);
      setMessages([]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (!peerId) {
      message.warning("请先输入对方的ID");
      return;
    }

    const payload = {
      receiver_id: peerId,
      content: inputValue,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      setMessages((prev) => [
        ...prev,
        { SenderId: currentUserId, ReceiverId: peerId, Content: inputValue }
      ]);
      setInputValue("");
    } else {
      message.error("聊天服务未连接，请刷新页面重试");
    }
  };

  const startChat = () => {
    if (peerInput.trim()) {
      setPeerId(peerInput.trim());
    }
  };

  const isMine = (msg: ChatMessage) => msg.SenderId === currentUserId;

  if (!token) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Empty description="请先登录后使用聊天功能" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", padding: "30px 50px" }}>
      <div style={{ display: "flex", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        {/* 聊天主区域 */}
        <div style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 140px)"
        }}>
          {/* 聊天头部 */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fafafa"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MessageCircle size={20} color="#FF5000" />
              <span style={{ fontWeight: "bold", fontSize: 16 }}>
                {peerId ? `与 ${peerId.substring(0, 12)}... 对话` : "消息中心"}
              </span>
            </div>
            <Badge
              status={connected ? "success" : connecting ? "processing" : "error"}
              text={
                <span style={{ fontSize: 12, color: "#999" }}>
                  {connected ? "已连接" : connecting ? "连接中..." : "未连接"}
                </span>
              }
            />
          </div>

          {/* 对话人输入 */}
          {!peerId && (
            <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>请输入对方的用户ID开始聊天</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  value={peerInput}
                  onChange={(e) => setPeerInput(e.target.value)}
                  onPressEnter={startChat}
                  placeholder="输入对方ID..."
                  style={{ borderRadius: 20 }}
                />
                <Button type="primary" onClick={startChat} style={{ backgroundColor: "#FF5000", borderRadius: 20 }}>
                  开始聊天
                </Button>
              </div>
            </div>
          )}

          {/* 消息区域 */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            backgroundColor: "#f7f7f8"
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                {peerId ? "暂无消息，发送第一条消息吧" : "选择一个对话开始聊天"}
              </div>
            ) : (
              messages.map((msg, index) => {
                const mine = isMine(msg);
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      marginBottom: 16
                    }}
                  >
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{
                        fontSize: 11,
                        color: "#bbb",
                        marginBottom: 4,
                        textAlign: mine ? "right" : "left"
                      }}>
                        {mine ? "我" : msg.SenderId.substring(0, 8) + "..."}
                      </div>
                      <div style={{
                        padding: "10px 16px",
                        borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        backgroundColor: mine ? "#FF5000" : "#fff",
                        color: mine ? "#fff" : "#333",
                        fontSize: 14,
                        lineHeight: "1.5",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        wordBreak: "break-word"
                      }}>
                        {msg.Content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          {peerId && (
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fff",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                placeholder="输入消息..."
                style={{ borderRadius: 20, height: 40 }}
                disabled={!connected}
              />
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSend}
                disabled={!connected || !inputValue.trim()}
                style={{
                  backgroundColor: "#FF5000",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
