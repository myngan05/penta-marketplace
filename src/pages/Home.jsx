import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Laptop,
  Shirt,
  Armchair,
  BookOpen,
  Bike,
  Smartphone,
  ArrowRight,
  Recycle
} from 'lucide-react';

import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Điện tử', icon: Laptop, ids: [2] },
  { name: 'Thời trang', icon: Shirt, ids: [1, 5, 6, 7] },
  { name: 'Nội thất', icon: Armchair, ids: [9] },
  { name: 'Sách', icon: BookOpen, ids: [3] },
  { name: 'Điện thoại', icon: Smartphone, ids: [2] },
  { name: 'Khác', icon: Recycle, ids: [10] }
];

function Home() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
const searchKeyword = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
const [exchangeOnly, setExchangeOnly] = useState(false);
const handleClearFilters = () => {
  setSelectedCategory(null);
  setSortOption('newest');
  setExchangeOnly(false);
  navigate('/');
};



  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, image_urls, condition, created_at, category_id, allow_exchange')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Lỗi tải sản phẩm:', error.message);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
  const matchesCategory =
    !selectedCategory ||
    selectedCategory.ids.includes(product.category_id);

  const matchesSearch =
    !searchKeyword ||
    product.title?.toLowerCase().includes(searchKeyword.toLowerCase());

  const matchesExchange =
    !exchangeOnly || product.allow_exchange === true;

  return matchesCategory && matchesSearch && matchesExchange;
});

const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortOption === 'price-asc') {
    return Number(a.price) - Number(b.price);
  }

  if (sortOption === 'price-desc') {
    return Number(b.price) - Number(a.price);
  }

  return new Date(b.created_at) - new Date(a.created_at);
});

  return (
    <div className="home-page">

      <section className="hero-section">
        <div className="hero-content">

          <span className="hero-label">
            <Recycle size={16} />
            SỐNG XANH CÙNG PENTA
          </span>

          <h1>
            Món đồ cũ,
            <br />
            <span>Giá trị mới.</span>
          </h1>

          <p>
            Trao đi những gì bạn không còn cần.
            Tìm thấy những gì bạn đang mong muốn.
            Cùng PENTA tạo nên vòng đời mới cho mỗi món đồ.
          </p>

          <div className="hero-buttons">
            <Link to="/post-product" className="primary-button">
              Đăng tin ngay <ArrowRight size={18} />
            </Link>

            <a href="#categories" className="secondary-button">
              Khám phá sản phẩm
            </a>
          </div>

          <div className="hero-stat">
            <div>
              <strong>BUY</strong>
              <span>Mua món đồ cần</span>
            </div>
            <div>
              <strong>SELL</strong>
              <span>Bán món đồ cũ</span>
            </div>
            <div>
              <strong>SWAP</strong>
              <span>Trao đổi giá trị</span>
            </div>
          </div>

        </div>

        <div className="hero-image">
          <img
            src="/logo.png.jpg"
            alt="PENTA - Reuse and recycle"
          />
        </div>
      </section>

      <section className="category-section" id="categories">

        <div className="section-heading">
          <div>
            <span className="section-label">KHÁM PHÁ</span>
            <h2>Danh mục sản phẩm</h2>
            <p>Tìm kiếm những món đồ phù hợp với bạn.</p>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
  className="category-card"
  key={category.name}
  onClick={() => setSelectedCategory(category)}
  style={{ cursor: 'pointer' }}
>
                <div className="category-icon">
                  <Icon size={27} />
                </div>

                <span>{category.name}</span>
              </div>
            );
          })}
        </div>

      </section>

      <section className="products-section">

        <div className="section-heading">
          <div>
            <span className="section-label">MARKETPLACE</span>
            <h2>Sản phẩm mới nhất</h2>
            <p>Những món đồ được cộng đồng PENTA chia sẻ.</p>
          </div>
        </div>
<div style={{
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '20px'
}}>
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    style={{
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}
  >
    <option value="newest">Mới nhất</option>
    <option value="price-asc">Giá thấp đến cao</option>
    <option value="price-desc">Giá cao đến thấp</option>
  </select>

  <button
    onClick={() => setExchangeOnly(!exchangeOnly)}
    style={{
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      background: exchangeOnly ? '#166534' : '#dcfce7',
      color: exchangeOnly ? 'white' : '#166534',
      cursor: 'pointer'
    }}
  >
    {exchangeOnly ? '✓ Đang xem sản phẩm trao đổi' : '⇄ Trao đổi'}
  </button>
</div>
<button
  onClick={handleClearFilters}
  style={{
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #16a34a',
    background: 'white',
    color: '#166534',
    cursor: 'pointer'
  }}

>
  Xóa bộ lọc
</button>
{selectedCategory && (
  <button
    onClick={() => setSelectedCategory(null)}
    style={{
      marginBottom: '20px',
      padding: '10px 18px',
      border: 'none',
      borderRadius: '8px',
      background: '#16a34a',
      color: 'white',
      cursor: 'pointer'
    }}
  >
    ← Xem tất cả sản phẩm
  </button>
)}
        {loading ? (
  <p>Đang tải sản phẩm...</p>
) : sortedProducts.length === 0 ? (
  <div className="empty-products">
    <Recycle size={42} />
    <h3>Chưa có sản phẩm nào</h3>
    <p>
      Hãy là người đầu tiên chia sẻ món đồ của bạn trên PENTA.
    </p>
    <Link to="/post-product">
      Đăng sản phẩm ngay
    </Link>
  </div>
) : (
  <div className="product-grid">
    {sortedProducts.map((product) => (
  <Link
    to={`/products/${product.id}`}
    className="product-card"
    key={product.id}
    style={{
      textDecoration: 'none',
      color: 'inherit',
      display: 'block'
    }}
  >
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

      <p style={{ color: '#16a34a', marginTop: '10px' }}>
        Xem chi tiết →
      </p>
    </div>
  </Link>
))}
  </div>
)}

      </section>

    </div>
  );
}

export default Home;
