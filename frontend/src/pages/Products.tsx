import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, InputNumber, Card, Badge, Tag } from "antd";
import { ShoppingCart, Plus, Package, Tag as TagIcon, Search } from "lucide-react";
import { get, post } from "../utils/request";

interface Product {
  Id: number;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  Image: string;
  UserId: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await get<Product[]>("/api/products");
      if (data) setProducts(data);
    } catch (err: any) {
      console.error(err);
      // message.error("获取商品失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await post("/api/product", values);
      message.success("宝贝发布成功！已上架淘宝大厅");
      setIsModalOpen(false);
      form.resetFields();
      fetchProducts();
    } catch (err: any) {
      message.error(err.message || "发布失败");
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* 搜索栏模拟 */}
      <div style={{ 
        background: "#FF5000", 
        padding: "20px 50px", 
        display: "flex", 
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", flex: 1, maxWidth: "800px" }}>
          <Input 
            prefix={<Search size={18} color="#999" />} 
            placeholder="搜宝贝、搜店、搜闲置..." 
            style={{ 
              borderRadius: "20px 0 0 20px", 
              height: "40px", 
              border: "none",
              paddingLeft: "20px"
            }} 
          />
          <Button 
            style={{ 
              backgroundColor: "#FF5000", 
              color: "white", 
              border: "2px solid #fff",
              borderRadius: "0 20px 20px 0",
              height: "40px",
              fontWeight: "bold",
              width: "100px"
            }}
          >
            搜索
          </Button>
        </div>
        
        {token && (
          <Button 
            type="primary" 
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            style={{ 
              backgroundColor: "#FFF", 
              color: "#FF5000", 
              borderColor: "#FF5000",
              fontWeight: "bold",
              borderRadius: "20px",
              height: "40px"
            }}
          >
            发布闲置
          </Button>
        )}
      </div>

      <div style={{ padding: "30px 50px" }}>
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <TagIcon color="#FF5000" size={24} />
          <h2 style={{ margin: 0, fontSize: "24px", color: "#333" }}>今日精选宝贝</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>加载中...</div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
            gap: "20px" 
          }}>
            {products.map((item) => (
              <Card
                key={item.Id}
                hoverable
                cover={
                  <div style={{ height: "240px", overflow: "hidden", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      alt={item.Name}
                      src={item.Image || "https://img.alicdn.com/tfs/TB1..6Eeq67gK0jSZFHXXa9pXXa-300-300.png"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                }
                bodyStyle={{ padding: "12px" }}
                style={{ borderRadius: "12px", overflow: "hidden", border: "none" }}
              >
                <div style={{ 
                  fontSize: "15px", 
                  height: "40px", 
                  overflow: "hidden", 
                  marginBottom: "8px",
                  lineHeight: "20px",
                  color: "#333"
                }}>
                  {item.Name}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ color: "#FF5000", fontSize: "20px", fontWeight: "bold" }}>
                    <span style={{ fontSize: "14px" }}>¥</span>{item.Price}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>库存: {item.Stock}</div>
                </div>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    <Package size={12} style={{ marginRight: "4px" }} />
                    {item.UserId.substring(0, 8)}...
                  </span>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<ShoppingCart size={14} />}
                    style={{ backgroundColor: "#FF5000", borderRadius: "15px" }}
                    onClick={() => message.info("功能开发中，敬请期待")}
                  >
                    想要
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="发布宝贝"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="立即发布"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: "#FF5000" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="name" label="宝贝标题" rules={[{ required: true }]}>
            <Input placeholder="输入宝贝名称，如：全新未拆封耳机" />
          </Form.Item>
          <Form.Item name="description" label="宝贝描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="描述一下宝贝的成色、来源和转手原因吧" />
          </Form.Item>
          <Form.Item name="price" label="价格 (元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0.01} step={0.01} prefix="¥" />
          </Form.Item>
          <Form.Item name="stock" label="库存数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item name="image" label="图片地址 (URL)">
            <Input placeholder="粘贴图片链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
