
import { useState } from 'react';
import { supabase } from '../lib/supabase';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      setMessage(
        data.session
          ? 'Đăng ký thành công! Chào mừng bạn đến với PENTA.'
          : 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.'
      );

      setFullName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      setError(err.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px 16px',
      background: '#f4f8f1'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        padding: '35px',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 5px 25px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{
          color: '#14532d',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          Đăng ký PENTA
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#64748b',
          marginBottom: '30px'
        }}>
          Chào mừng bạn đến với PENTA!
        </p>

        <form onSubmit={handleRegister}>
          <label>Họ và tên</label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {error}
            </p>
          )}

          {message && (
            <p style={{ color: 'green', fontSize: '14px' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '20px',
              background: '#166534',
              color: 'white',
              border: 'none',
              borderRadius: '9px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '20px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '15px'
};

export default Register;
