
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Email hoặc mật khẩu không chính xác.");
      return;
    }

    navigate("/");
  } catch (err) {
    setError("Không thể kết nối. Vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f8ef",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "white",
        padding: "35px",
        borderRadius: "18px",
        boxShadow: "0 5px 25px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{
          color: "#14532d",
          textAlign: "center"
        }}>
          Đăng nhập PENTA
        </h1>

        <p style={{ textAlign: "center", color: "#64748b" }}>
          Chào mừng bạn quay trở lại!
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Mật khẩu</label>

          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "red", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ color: "#15803d" }}>
            Đăng ký ngay
          </Link>
        </p>

        <p style={{ textAlign: "center" }}>
          <Link to="/" style={{ color: "#15803d" }}>
            ← Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}

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

export default Login;
