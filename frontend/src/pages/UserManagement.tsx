import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Avatar, Tag, Empty } from "antd";
import { Users as UsersIcon, Edit, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { sdkConfig } from "../casdoor";

interface CasdoorUser {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  avatar: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<CasdoorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CasdoorUser | null>(null);
  const [form] = Form.useForm();

  const token = localStorage.getItem("token");

  // 直接调用 Casdoor REST API 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${sdkConfig.serverUrl}/api/get-users?owner=${sdkConfig.organizationName}&clientId=${sdkConfig.clientId}&clientSecret=c3f3aa01c23b1be90ce2acf0dbed7f8ecec92e72`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("获取用户列表失败");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      message.error("获取用户列表失败: " + err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, []);

  const handleUpdate = async (values: any) => {
    if (!editingUser) return;
    try {
      const payload = { ...editingUser, ...values };
      const response = await fetch(
        `${sdkConfig.serverUrl}/api/update-user?id=${editingUser.owner}/${editingUser.name}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("更新失败");
      message.success("用户信息已更新");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      message.error("更新失败: " + err.message);
    }
  };

  const handleDelete = async (user: CasdoorUser) => {
    Modal.confirm({
      title: "确认删除用户?",
      content: `确定要删除用户 ${user.displayName || user.name} 吗? 此操作不可撤销。`,
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(
            `${sdkConfig.serverUrl}/api/delete-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify(user),
            }
          );
          if (!response.ok) throw new Error("删除失败");
          message.success("用户已删除");
          fetchUsers();
        } catch (err: any) {
          message.error("删除失败: " + err.message);
        }
      },
    });
  };

  const columns = [
    {
      title: "用户",
      key: "user",
      render: (user: CasdoorUser) => (
        <Space>
          <Avatar src={user.avatar} style={{ backgroundColor: "#FF5000" }}>
            {(user.displayName || user.name || "U").charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: "bold" }}>{user.displayName || user.name}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>{user.name}</div>
          </div>
        </Space>
      ),
    },
    { title: "邮箱", dataIndex: "email", key: "email", render: (v: string) => v || "-" },
    { title: "电话", dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
    {
      title: "角色",
      key: "role",
      render: (user: CasdoorUser) => (
        user.isAdmin
          ? <Tag color="gold" icon={<ShieldCheck size={12} />}>管理员</Tag>
          : <Tag>普通用户</Tag>
      ),
    },
    {
      title: "加入时间",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (val: string) => val ? val.split("T")[0] : "-"
    },
    {
      title: "操作",
      key: "action",
      render: (user: CasdoorUser) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<Edit size={14} />}
            onClick={() => {
              setEditingUser(user);
              form.setFieldsValue({
                displayName: user.displayName,
                email: user.email,
                phone: user.phone,
              });
              setIsModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(user)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (!token) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Empty description="请先登录后使用用户管理功能" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", padding: "30px 50px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UsersIcon color="#FF5000" size={24} />
            <h2 style={{ margin: 0, fontSize: 22 }}>用户管理</h2>
            <Tag color="orange">Casdoor</Tag>
          </div>
          <Button icon={<RefreshCw size={14} />} onClick={fetchUsers} loading={loading}>
            刷新
          </Button>
        </div>

        <Table
          loading={loading}
          rowKey="name"
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: 8 }}
        />
      </div>

      <Modal
        title="编辑用户信息"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: "#FF5000" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="displayName" label="显示名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
