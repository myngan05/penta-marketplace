
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Đã sử dụng');
  const [phone, setPhone] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        setError('Vui lòng đăng nhập để chỉnh sửa sản phẩm.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single();

      if (fetchError) {
        setError('Không tìm thấy sản phẩm hoặc bạn không có quyền chỉnh sửa.');
      } else {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(String(data.price ?? ''));
        setCondition(data.condition || 'Đã sử dụng');
        setPhone(data.phone || '');
        setImageUrls((data.image_urls || []).join('\n'));
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    if (price === '' || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError('Vui lòng nhập giá hợp lệ.');
      return;
    }

    setSaving(true);

    try {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Vui lòng đăng nhập lại.');
      }

      const images = imageUrls
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean);

      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition,
          phone: phone.trim() || null,
          image_urls: images
        })
        .eq('id', id)
        .eq('seller_id', user.id);

      if (updateError) throw updateError;

      alert('Cập nhật sản phẩm thành công!');
      navigate('/my-products');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <div className="edit-product-page">
      <h1>Chỉnh sửa sản phẩm</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Tên sản phẩm *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <label>Mô tả sản phẩm</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="5"
        />

        <label>Giá bán (VND) *</label>
        <input
          type="number"
          min="0"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />

        <label>Tình trạng</label>
        <select
          value={condition}
          onChange={e => setCondition(e.target.value)}
        >
          <option value="Mới">Mới</option>
          <option value="Như mới">Như mới</option>
          <option value="Đã sử dụng">Đã sử dụng</option>
          <option value="Cũ">Cũ</option>
        </select>

        <label>Số điện thoại</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <label>Đường dẫn ảnh (mỗi dòng một ảnh)</label>
        <textarea
          value={imageUrls}
          onChange={e => setImageUrls(e.target.value)}
          rows="4"
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/my-products')}
        >
          Hủy
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
