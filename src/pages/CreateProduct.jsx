
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function CreateProduct() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [condition, setCondition] = useState("Đã sử dụng");
  const [selectedImages, setSelectedImages] = useState([]);
  const [phone, setPhone] = useState("");
  const [allowExchange, setAllowExchange] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const handleImageChange = (e) => {
  const files = Array.from(e.target.files || []);

  if (selectedImages.length + files.length > 10) {
    setError("Bạn chỉ được chọn tối đa 10 ảnh.");
    e.target.value = "";
    return;
  }

  const validFiles = files.filter((file) => {
    return file.type.startsWith("image/");
  });

  if (validFiles.length !== files.length) {
    setError("Vui lòng chỉ chọn file hình ảnh.");
    return;
  }

  setError("");
  setSelectedImages((current) => [...current, ...validFiles]);

  e.target.value = "";
};

const removeSelectedImage = (index) => {
  setSelectedImages((current) =>
    current.filter((_, i) => i !== index)
  );
};
  useEffect(() => {
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi lấy danh mục:", error.message);
      return;
    }

    setCategories(data || []);
  };

  fetchCategories();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (price === "" || Number(price) < 0) {
      setError("Vui lòng nhập giá hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      // Lấy tài khoản đang đăng nhập
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Bạn cần đăng nhập để đăng tin.");
      }

      // Tải ảnh lên Supabase Storage
const images = [];

for (const file of selectedImages) {
  const fileExt = file.name.split(".").pop();

  const fileName =
    `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  images.push(publicUrlData.publicUrl);
}

      // Lưu sản phẩm vào Supabase
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          seller_id: user.id,
          category_id: Number(categoryId),
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition: condition,
          image_urls: images,
          phone: phone.trim() || null,
          allow_exchange: allowExchange,
          status: "active"
        });

      if (insertError) throw insertError;

      setMessage("Đăng tin sản phẩm thành công!");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err) {
      setError(err.message || "Không thể đăng sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Đăng tin sản phẩm</h1>

        <p style={descriptionStyle}>
          Chia sẻ món đồ bạn muốn bán hoặc trao đổi
          trên PENTA.
        </p>

        <form onSubmit={handleSubmit}>

          <label style={labelStyle}>Tên sản phẩm *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ví dụ: Áo thun nam"
            required
          />

          <label style={labelStyle}>Danh mục sản phẩm *</label>

<select
  style={inputStyle}
  value={categoryId}
  onChange={e => setCategoryId(e.target.value)}
  required
>
  <option value="">-- Chọn danh mục sản phẩm --</option>

  {categories.map(category => (
    <option key={category.id} value={category.id}>
      {category.name} (ID: {category.id})
    </option>
  ))}
</select>

          <label style={labelStyle}>Mô tả sản phẩm</label>
          <textarea
            style={textareaStyle}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết sản phẩm..."
            rows={5}
          />

          <label style={labelStyle}>Giá bán (VNĐ) *</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Ví dụ: 150000"
            required
          />

          <label style={labelStyle}>Tình trạng sản phẩm</label>
          <select
            style={inputStyle}
            value={condition}
            onChange={e => setCondition(e.target.value)}
          >
            <option value="Mới">Mới</option>
            <option value="Như mới">Như mới</option>
            <option value="Đã sử dụng">Đã sử dụng</option>
            <option value="Cũ">Cũ</option>
          </select>

          <label style={labelStyle}>
  Hình ảnh sản phẩm (tối đa 10 ảnh)
</label>

<input
  type="file"
  accept="image/*"
  multiple
  onChange={handleImageChange}
  style={inputStyle}
/>

<p style={{ color: "#64748b", fontSize: "13px" }}>
  Đã chọn {selectedImages.length}/10 ảnh
</p>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "22px"
  }}
>
  {selectedImages.map((file, index) => (
    <div
      key={`${file.name}-${index}`}
      style={{
        position: "relative",
        height: "120px"
      }}
    >
      <img
        src={URL.createObjectURL(file)}
        alt={`Ảnh sản phẩm ${index + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "8px"
        }}
      />

      <button
        type="button"
        onClick={() => removeSelectedImage(index)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "26px",
          height: "26px",
          cursor: "pointer"
        }}
      >
        ×
      </button>
    </div>
  ))}
</div>  

          <label style={labelStyle}>Số điện thoại</label>
          <input
            style={inputStyle}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <label style={checkboxStyle}>
            <input
              type="checkbox"
              checked={allowExchange}
              onChange={e => setAllowExchange(e.target.checked)}
            />
            Cho phép trao đổi sản phẩm
          </label>

          {error && (
            <p style={errorStyle}>{error}</p>
          )}

          {message && (
            <p style={successStyle}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Đang đăng tin..." : "Đăng tin sản phẩm"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={cancelStyle}
          >
            Quay về trang chủ
          </button>

        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "85vh",
  background: "#f3f8ef",
  padding: "40px 16px",
  display: "flex",
  justifyContent: "center"
};

const cardStyle = {
  width: "100%",
  maxWidth: "650px",
  background: "white",
  padding: "35px",
  borderRadius: "18px",
  boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
  boxSizing: "border-box"
};

const headingStyle = {
  color: "#14532d",
  textAlign: "center",
  marginBottom: "10px"
};

const descriptionStyle = {
  color: "#64748b",
  textAlign: "center",
  marginBottom: "30px"
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "8px",
  color: "#14532d"
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginBottom: "22px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "15px"
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical"
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px"
};

const buttonStyle = {
  width: "100%",
  padding: "15px",
  background: "#166534",
  color: "white",
  border: "none",
  borderRadius: "9px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer"
};

const cancelStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "12px",
  background: "white",
  color: "#166534",
  border: "1px solid #166534",
  borderRadius: "9px",
  cursor: "pointer"
};

const errorStyle = {
  color: "red",
  fontSize: "14px"
};

const successStyle = {
  color: "green",
  fontSize: "14px"
};

export default CreateProduct;
