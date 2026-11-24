
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        navigate("/login");
        return;
      }

      setUser(authData.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url")
        .eq("id", authData.user.id)
        .single();

      if (error) throw error;

      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setAvatarUrl(data.avatar_url || "");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage("Cập nhật hồ sơ thành công!");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/login");
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: 50 }}>
      Đang tải hồ sơ...
    </p>;
  }

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "#14532d", textAlign: "center" }}>
          Hồ sơ cá nhân PENTA
        </h1>

        <div style={{ textAlign: "center", margin: "25px 0" }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Ảnh đại diện"
              style={avatarStyle}
            />
          ) : (
            <div style={avatarPlaceholder}>
              {fullName ? fullName.charAt(0).toUpperCase() : "P"}
            </div>
          )}
        </div>

        <form onSubmit={handleUpdate}>
          <label>Họ và tên</label>
          <input
            style={inputStyle}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            required
          />

          <label>Email</label>
          <input
            style={inputStyle}
            value={user.email || ""}
            disabled
          />

          <label>Số điện thoại</label>
          <input
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <label>Đường dẫn ảnh đại diện</label>
          <input
            style={inputStyle}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Nhập URL ảnh đại diện"
          />

          {message && (
            <p style={{ color: "green" }}>{message}</p>
          )}

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={buttonStyle}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          style={logoutStyle}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "80vh",
  background: "#f3f8ef",
  padding: "40px 16px",
  display: "flex",
  justifyContent: "center"
};

const cardStyle = {
  width: "100%",
  maxWidth: "500px",
  background: "white",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
  height: "fit-content"
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "15px"
};

const avatarStyle = {
  width: "110px",
  height: "110px",
  borderRadius: "50%",
  objectFit: "cover"
};

const avatarPlaceholder = {
  width: "110px",
  height: "110px",
  borderRadius: "50%",
  background: "#dcfce7",
  color: "#166534",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "40px",
  fontWeight: "bold"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#166534",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer"
};

const logoutStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "15px",
  background: "white",
  color: "#dc2626",
  border: "1px solid #dc2626",
  borderRadius: "8px",
  fontSize: "15px",
  cursor: "pointer"
};

export default Profile;
