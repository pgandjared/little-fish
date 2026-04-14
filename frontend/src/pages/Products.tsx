import { useEffect, useState } from "react";
import { Button, message, Modal, Form, Input, InputNumber, Card, Upload, Empty, Popconfirm, Tooltip } from "antd";
import { ShoppingCart, Plus, Package, Tag as TagIcon, Search, UploadCloud, Edit3, Trash2, MessageCircle } from "lucide-react";
import { get, post, put, del, request } from "../utils/request";
import { useNavigate } from "react-router-dom";
import type { UploadFile, UploadProps } from "antd";
import { casdoorSDK } from "../casdoor";

interface Product {
  Id: number;
  Name: string;
  Description: string;
  Cost: number;
  Image: string;
  UserId: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // 获取当前用户的 ExternalID
  let currentUserId = "";
  if (token) {
    try {
      const decoded: any = casdoorSDK.parseAccessToken(token);
      currentUserId = decoded?.sub || "";
    } catch {}
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await get<Product[]>("/pub/products");
      if (data) setProducts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const imageUrl = await request<string>("/api/upload", {
      method: "POST",
      body: formData,
    });
    return imageUrl;
  };

  const handleSubmit = async (values: any) => {
    try {
      let imageUrl = values.image_url || editingProduct?.Image || "";
      if (fileList.length > 0 && fileList[0].originFileObj) {
        setUploading(true);
        imageUrl = await handleUpload(fileList[0].originFileObj as File);
        setUploading(false);
      }

      if (editingProduct) {
        // 编辑
        await put("/api/product", { ...values, id: editingProduct.Id, image: imageUrl });
        message.success("商品信息已更新");
      } else {
        // 新增
        await post("/api/product", { ...values, image: imageUrl });
        message.success("宝贝发布成功！");
      }
      closeModal();
      fetchProducts();
    } catch (err: any) {
      setUploading(false);
      message.error(err.message || "操作失败");
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await del(`/api/product?id=${product.Id}`);
      message.success("商品已删除");
      fetchProducts();
    } catch (err: any) {
      message.error(err.message || "删除失败");
    }
  };

  const handleBuy = async (product: Product) => {
    if (!token) {
      message.warning("请先登录");
      return;
    }
    try {
      await post("/api/order", { product_id: product.Id });
      message.success(`已成功下单「${product.Name}」，请前往订单页面查看`);
    } catch (err: any) {
      message.error(err.message || "下单失败");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.Name,
      description: product.Description,
      cost: product.Cost,
      image_url: product.Image,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    accept: "image/jpeg,image/png,image/gif,image/webp",
    listType: "picture-card",
    maxCount: 1,
  };

  const isMyProduct = (product: Product) => currentUserId && product.UserId === currentUserId;

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* 搜索栏 */}
      <div style={{
        background: "linear-gradient(135deg, #FF5000 0%, #FF7A30 100%)",
        padding: "20px 50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(255,80,0,0.3)"
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
            onClick={() => { setEditingProduct(null); form.resetFields(); setIsModalOpen(true); }}
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
          <span style={{ fontSize: "14px", color: "#999", marginLeft: "auto" }}>共 {products.length} 件宝贝</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>加载中...</div>
        ) : products.length === 0 ? (
          <Empty description="暂无商品，快来发布第一件宝贝吧！" style={{ padding: "100px 0" }} />
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
                  <div
                    style={{ height: "240px", overflow: "hidden", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                    onClick={() => setDetailProduct(item)}
                  >
                    {isMyProduct(item) && (
                      <div style={{
                        position: "absolute", top: 8, left: 8, zIndex: 2,
                        background: "#FF5000", color: "#fff", fontSize: "11px",
                        padding: "2px 8px", borderRadius: "10px"
                      }}>我的</div>
                    )}
                    {item.Image ? (
                      <img
                        alt={item.Name}
                        src={item.Image}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23bbb' stroke-width='1.5' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";
                          e.currentTarget.style.objectFit = "none";
                        }}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#bbb" }}>
                        <Package size={48} strokeWidth={1.5} />
                        <span style={{ fontSize: "14px" }}>暂无图片</span>
                      </div>
                    )}
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
                    <span style={{ fontSize: "14px" }}>¥</span>{item.Cost}
                  </div>
                </div>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {isMyProduct(item) ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Tooltip title="编辑">
                        <Button size="small" icon={<Edit3 size={14} />} onClick={() => openEditModal(item)} />
                      </Tooltip>
                      <Popconfirm title="确定删除这件宝贝吗？" onConfirm={() => handleDelete(item)} okText="删除" cancelText="取消">
                        <Tooltip title="删除">
                          <Button size="small" danger icon={<Trash2 size={14} />} />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  ) : (
                    <Tooltip title="和卖家聊聊">
                      <Button
                        size="small"
                        icon={<MessageCircle size={14} />}
                        onClick={() => navigate(`/chat?peer=${item.UserId}`)}
                        style={{ borderRadius: "15px" }}
                      />
                    </Tooltip>
                  )}
                  {!isMyProduct(item) && (
                    <Popconfirm
                      title={`确认购买「${item.Name}」？`}
                      description={`价格：¥${item.Cost}`}
                      onConfirm={() => handleBuy(item)}
                      okText="确认下单"
                      cancelText="再想想"
                      okButtonProps={{ style: { backgroundColor: "#FF5000" } }}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<ShoppingCart size={14} />}
                        style={{ backgroundColor: "#FF5000", borderRadius: "15px" }}
                      >
                        想要
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 商品详情弹窗 */}
      <Modal
        title={null}
        open={!!detailProduct}
        onCancel={() => setDetailProduct(null)}
        footer={
          detailProduct && !isMyProduct(detailProduct) ? (
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button icon={<MessageCircle size={14} />} onClick={() => { setDetailProduct(null); navigate(`/chat?peer=${detailProduct.UserId}`); }}>
                联系卖家
              </Button>
              <Popconfirm title={`确认购买？`} description={`价格：¥${detailProduct.Cost}`} onConfirm={() => { handleBuy(detailProduct); setDetailProduct(null); }} okText="确认下单" cancelText="再想想" okButtonProps={{ style: { backgroundColor: "#FF5000" } }}>
                <Button type="primary" icon={<ShoppingCart size={14} />} style={{ backgroundColor: "#FF5000" }}>立即购买</Button>
              </Popconfirm>
            </div>
          ) : null
        }
        width={520}
      >
        {detailProduct && (
          <div>
            <div style={{ height: 300, backgroundColor: "#f5f5f5", borderRadius: 8, overflow: "hidden", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {detailProduct.Image ? (
                <img src={detailProduct.Image} alt={detailProduct.Name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1.5' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";
                  e.currentTarget.style.objectFit = "none";
                }}/>
              ) : (
                <Package size={64} color="#ccc" />
              )}
            </div>
            <h3 style={{ margin: "0 0 8px" }}>{detailProduct.Name}</h3>
            <div style={{ color: "#FF5000", fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>¥</span>{detailProduct.Cost}
            </div>
            <div style={{ color: "#666", lineHeight: "1.6", padding: "12px 0", borderTop: "1px solid #f0f0f0" }}>
              {detailProduct.Description || "暂无描述"}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
              卖家ID: {detailProduct.UserId}
            </div>
          </div>
        )}
      </Modal>

      {/* 发布/编辑弹窗 */}
      <Modal
        title={editingProduct ? "编辑宝贝" : "发布宝贝"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={uploading ? "上传中..." : editingProduct ? "保存修改" : "立即发布"}
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: "#FF5000" }, loading: uploading }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="宝贝标题" rules={[{ required: true }]}>
            <Input placeholder="输入宝贝名称，如：全新未拆封耳机" />
          </Form.Item>
          <Form.Item name="description" label="宝贝描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="描述一下宝贝的成色、来源和转手原因吧" />
          </Form.Item>
          <Form.Item name="cost" label="价格 (元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} step={1} prefix="¥" />
          </Form.Item>
          <Form.Item name="image_url" label="商品图片 (输入网络链接或本地绝对路径)">
            <Input placeholder="例如: https://... 或 /uploads/... 或 file:///C:/..." />
          </Form.Item>
          <Form.Item label="或者上传新的图片">
            <Upload {...uploadProps}>
              {fileList.length < 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <UploadCloud size={24} color="#999" />
                  <span style={{ fontSize: "12px", color: "#999" }}>点击上传图片 (优先使用此上传)</span>
                </div>
              )}
            </Upload>
            {editingProduct?.Image && fileList.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>当前使用: {editingProduct.Image}</div>
            )}
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              支持 jpg/png/gif/webp 格式，最大 10MB
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
