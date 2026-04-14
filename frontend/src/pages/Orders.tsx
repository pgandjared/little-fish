import { useEffect, useState } from "react";
import { Button, Tag, Space, message, Empty, Card, Popconfirm, Segmented } from "antd";
import { ShoppingBag, Truck, CheckCircle, XCircle, CreditCard, Package } from "lucide-react";
import { get, put } from "../utils/request";

interface Order {
  Id: number;
  BuyerId: string;
  SellerId: string;
  ProductId: number;
  Status: number;
  Cost: number;
}

const statusConfig: Record<number, { text: string; color: string; icon: any }> = {
  0: { text: "待支付", color: "#faad14", icon: <CreditCard size={16} /> },
  1: { text: "已支付·待发货", color: "#1677ff", icon: <Package size={16} /> },
  2: { text: "已发货·运输中", color: "#722ed1", icon: <Truck size={16} /> },
  3: { text: "已完成", color: "#52c41a", icon: <CheckCircle size={16} /> },
  4: { text: "已取消", color: "#ff4d4f", icon: <XCircle size={16} /> },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await get<Order[]>(`/api/order?role=${role}`);
      if (data) setOrders(data);
      else setOrders([]);
    } catch (err: any) {
      if (err.message?.includes("未登录")) {
        message.warning("请先登录后查看订单");
      } else {
        message.error(err.message || "获取订单失败");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [role]);

  const handleAction = async (orderId: number, action: string, actionText: string) => {
    try {
      await put(`/api/order/status`, { order_id: orderId, action });
      message.success(`${actionText}成功`);
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || "操作失败");
    }
  };

  const renderActions = (order: Order) => {
    const actions = [];

    if (role === "buyer" && order.Status === 0) {
      actions.push(
        <Popconfirm key="pay" title="确认支付该订单？" description={`金额：¥${order.Cost}`} onConfirm={() => handleAction(order.Id, "pay", "支付")} okText="确认支付" cancelText="取消" okButtonProps={{ style: { backgroundColor: "#FF5000" } }}>
          <Button type="primary" size="small" icon={<CreditCard size={14} />} style={{ backgroundColor: "#FF5000", borderRadius: "15px" }}>去支付</Button>
        </Popconfirm>
      );
    }
    if (role === "seller" && order.Status === 1) {
      actions.push(
        <Popconfirm key="ship" title="确认发货？" onConfirm={() => handleAction(order.Id, "ship", "发货")} okText="确认发货" cancelText="取消">
          <Button type="primary" size="small" icon={<Truck size={14} />} style={{ borderRadius: "15px" }}>发货</Button>
        </Popconfirm>
      );
    }
    if (role === "buyer" && order.Status === 2) {
      actions.push(
        <Popconfirm key="complete" title="确认收货？" onConfirm={() => handleAction(order.Id, "complete", "确认收货")} okText="确认收货" cancelText="取消">
          <Button size="small" icon={<CheckCircle size={14} />} style={{ borderRadius: "15px", color: "#52c41a", borderColor: "#52c41a" }}>确认收货</Button>
        </Popconfirm>
      );
    }
    if (order.Status < 2) {
      actions.push(
        <Popconfirm key="cancel" title="确定取消订单吗？" description="取消后不可恢复" onConfirm={() => handleAction(order.Id, "cancel", "取消")} okText="确定取消" cancelText="不取消" okButtonProps={{ danger: true }}>
          <Button size="small" danger style={{ borderRadius: "15px" }}>取消订单</Button>
        </Popconfirm>
      );
    }
    return actions;
  };

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", padding: "30px 50px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingBag color="#FF5000" size={24} />
          <h2 style={{ margin: 0, fontSize: 24, color: "#333" }}>我的订单</h2>
        </div>
        <Segmented
          value={role}
          onChange={(v) => setRole(v as "buyer" | "seller")}
          options={[
            { label: "我买到的", value: "buyer" },
            { label: "我卖出的", value: "seller" },
          ]}
          style={{ backgroundColor: "#fff" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 100 }}>加载中...</div>
      ) : orders.length === 0 ? (
        <Empty
          description={role === "buyer" ? "还没有买过东西，去逛逛商品大厅吧" : "还没有卖出过东西"}
          style={{ padding: "100px 0" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => {
            const status = statusConfig[order.Status] || statusConfig[0];
            return (
              <Card
                key={order.Id}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: "16px 24px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                    {/* 订单状态图标 */}
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      backgroundColor: `${status.color}15`, color: status.color,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {status.icon}
                    </div>

                    {/* 订单信息 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: "bold", fontSize: 15 }}>订单 #{order.Id}</span>
                        <Tag color={status.color} style={{ borderRadius: 10, margin: 0 }}>{status.text}</Tag>
                      </div>
                      <div style={{ fontSize: 13, color: "#999" }}>
                        商品ID: {order.ProductId} · {role === "buyer" ? `卖家: ${order.SellerId.substring(0, 8)}...` : `买家: ${order.BuyerId.substring(0, 8)}...`}
                      </div>
                    </div>

                    {/* 金额 */}
                    <div style={{ textAlign: "right", marginRight: 24 }}>
                      <div style={{ color: "#FF5000", fontSize: 22, fontWeight: "bold" }}>
                        <span style={{ fontSize: 14 }}>¥</span>{order.Cost}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <Space>
                    {renderActions(order)}
                  </Space>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
