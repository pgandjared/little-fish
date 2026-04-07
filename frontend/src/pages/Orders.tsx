import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import { get, put } from "../utils/request";

interface Order {
  Id: number;
  BuyerId: string;
  SellerId: string;
  ProductId: number;
  Status: number;
  Cost: number;
  CreateTime: string;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "创建待支付", color: "default" },
  1: { text: "已支付待发货", color: "processing" },
  2: { text: "已发货", color: "warning" },
  3: { text: "已完成", color: "success" },
  4: { text: "已取消", color: "error" },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  
  // 假设当前登录用户的externalId，在真实环境里从状态库取
  const currentUserId = "mock_user_1";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await get<Order[]>(`/api/order?role=${role}`);
      if (data) setOrders(data);
    } catch (err: any) {
      message.error(err.message || alert("订单获取失败请登录"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [role]);

  const handleAction = async (orderId: number, action: string) => {
    try {
      await put(`/api/order/status`, { order_id: orderId, action });
      message.success("操作成功");
      fetchOrders();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: "订单号", dataIndex: "Id", key: "Id" },
    { title: "商品ID", dataIndex: "ProductId", key: "ProductId" },
    { title: "金额", dataIndex: "Cost", key: "Cost" },
    {
      title: "状态",
      dataIndex: "Status",
      key: "Status",
      render: (status: number) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.text || "未知"}
        </Tag>
      ),
    },
    { title: "角色", key: "Role", render: () => role === "buyer" ? "我买的" : "我卖的" },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Order) => (
        <Space size="middle">
          {role === "buyer" && record.Status === 0 && (
            <Button size="small" type="primary" onClick={() => handleAction(record.Id, "pay")}>去支付</Button>
          )}
          {role === "seller" && record.Status === 1 && (
            <Button size="small" type="primary" onClick={() => handleAction(record.Id, "ship")}>发货</Button>
          )}
          {role === "buyer" && record.Status === 2 && (
            <Button size="small" type="dashed" onClick={() => handleAction(record.Id, "complete")}>确认收货</Button>
          )}
          {record.Status < 2 && (
            <Button size="small" danger onClick={() => handleAction(record.Id, "cancel")}>取消订单</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type={role === "buyer" ? "primary" : "default"} onClick={() => setRole("buyer")}>
            我是买家
          </Button>
          <Button type={role === "seller" ? "primary" : "default"} onClick={() => setRole("seller")}>
            我是卖家
          </Button>
        </Space>
      </div>
      <Table 
        loading={loading}
        rowKey="Id" 
        columns={columns} 
        dataSource={orders} 
      />
    </div>
  );
}
