import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Avatar, Tag } from "antd";
import { Users as UsersIcon, Edit, Trash2, ShieldCheck } from "lucide-react";
import { get, put, del } from "../utils/request";

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await get<CasdoorUser[]>("/api/users");
      if (data) setUsers(data);
    } catch (err: any) {
      message.error("获取用户列表失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (values: any) => {
    if (!editingUser) return;
    try {
      const payload = { ...editingUser, ...values };
      await put("/api/user", payload);
      message.success("用户信息更新成功");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      message.error("更新失败: " + err.message);
    }
  };

  const handleDelete = async (user: CasdoorUser) => {
    Modal.confirm({
      title: "确认删除用户?",
      content: `确定要删除用户 ${user.displayName} (${user.name}) 吗? 此操作不可撤销。`,
      onOk: async () => {
        try {
          await del("/api/user", { body: JSON.stringify(user) });
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
          <Avatar src={user.avatar} />
          <div>
            <div style={{ fontWeight: "bold" }}>{user.displayName}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>{user.name}</div>
          </div>
        </Space>
      ),
    },
    { title: "邮箱", dataIndex: "email", key: "email" },
    { title: "电话", dataIndex: "phone", key: "phone" },
    {
      title: "角色",
      key: "role",
      render: (user: CasdoorUser) => (
        user.isAdmin ? <Tag color="gold" icon={<ShieldCheck size={12} />}>管理员</Tag> : <Tag>普通用户</Tag>
      ),
    },
    { title: "加入时间", dataIndex: "createdTime", key: "createdTime", render: (val: string) => val.split("T")[0] },
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
              form.setFieldsValue(user);
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: "10px" }}>
        <UsersIcon color="#1677ff" size={24} />
        <h2 style={{ margin: 0 }}>用户管理 (对接 Casdoor)</h2>
      </div>

      <Table 
        loading={loading}
        rowKey="name" 
        columns={columns} 
        dataSource={users} 
      />

      <Modal
        title="编辑用户信息"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
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
          <Form.Item name="avatar" label="头像 URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
