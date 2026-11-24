
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleDelete = async (productId) => {
  const confirmed = window.confirm(
    'Bạn có chắc chắn muốn xóa sản phẩm này không?'
  );

  if (!confirmed) return;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert('Vui lòng đăng nhập lại.');
    return;
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', user.id);

  if (error) {
    alert('Xóa sản phẩm thất bại: ' + error.message);
    return;
  }

  setProducts((currentProducts) =>
    currentProducts.filter((product) => product.id !== productId)
  );

  alert('Đã xóa sản phẩm thành công!');
};

  useEffect(() => {
    const fetchMyProducts = async () => {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        setError('Vui lòng đăng nhập để xem sản phẩm của bạn.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, title, price, image_urls, condition, status, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchMyProducts();
  }, []);

  return (
    <div className="my-products-page">
      <h1>Sản phẩm của tôi</h1>
      <p>Quản lý những món đồ bạn đã đăng trên PENTA.</p>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : error ? (
        <p>{error}</p>
      ) : products.length === 0 ? (
        <div>
          <h3>Bạn chưa đăng sản phẩm nào.</h3>
          <Link to="/post-product">Đăng sản phẩm ngay</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-box">
                <img
                  src={product.image_urls?.[0] || '/logo.png.jpg'}
                  alt={product.title}
                />
              </div>

              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="product-price">
                  {Number(product.price).toLocaleString('vi-VN')} ₫
                </p>
                <span>{product.condition}</span>
                <p>Trạng thái: {product.status}</p>
                                <div className="product-actions">

                  <Link
                    to={`/edit-product/${product.id}`}
                    className="edit-product-button"
                  >
                    Chỉnh sửa
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="delete-product-button"
                  >
                    Xóa sản phẩm
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProducts;
