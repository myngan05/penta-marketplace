
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Lỗi tải sản phẩm:', error.message);
        setError('Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn.');
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleChat = async () => {
    setChatLoading(true);
    setError('');

    try {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      if (user.id === product.seller_id) {
        setError('Bạn không thể tự nhắn tin cho chính mình.');
        return;
      }

      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller_id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (findError) throw findError;

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: createError } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            seller_id: product.seller_id,
            product_id: product.id
          })
          .select('id')
          .single();

        if (createError) throw createError;

        conversationId = created.id;
      }

      navigate(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Lỗi mở cuộc trò chuyện:', err);
      setError('Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <p style={{ padding: '40px' }}>Đang tải sản phẩm...</p>;
  }

  if (error && !product) {
    return (
      <div style={{ padding: '40px' }}>
        <h2>{error || 'Không tìm thấy sản phẩm.'}</h2>
        <Link to="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '40px auto',
      padding: '0 24px'
    }}>
      <Link to="/" style={{ color: '#16a34a' }}>
        ← Quay lại trang chủ
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        marginTop: '24px'
      }}>
        <div>
          {product.image_urls?.length > 0 ? (
            product.image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.title} - ảnh ${index + 1}`}
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  background: '#f3f4f6'
                }}
              />
            ))
          ) : (
            <img
              src="/logo.png.jpg"
              alt={product.title}
              style={{ width: '100%', borderRadius: '12px' }}
            />
          )}
        </div>

        <div>
          <h1>{product.title}</h1>

          <h2 style={{ color: '#16a34a' }}>
            {Number(product.price).toLocaleString('vi-VN')} ₫
          </h2>

          <p>
            <strong>Tình trạng:</strong> {product.condition}
          </p>

          <p>
            <strong>Mô tả sản phẩm:</strong>
          </p>

          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
            {product.description || 'Chưa có mô tả.'}
          </p>

          <p>
            <strong>Liên hệ:</strong> {product.phone || 'Chưa cung cấp'}
          </p>

          <button
            onClick={handleChat}
            disabled={chatLoading}
            style={{
              marginTop: '16px',
              padding: '13px 24px',
              background: '#166534',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: chatLoading ? 'wait' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {chatLoading ? 'Đang mở chat...' : '💬 Chat với người đăng'}
          </button>

          {error && (
            <p style={{ color: 'red', marginTop: '12px' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
