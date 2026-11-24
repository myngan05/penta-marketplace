
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function Exchange() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOffers = async () => {
    setLoading(true);
    setError('');

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError('Bạn cần đăng nhập để xem đề nghị trao đổi.');
      setLoading(false);
      return;
    }

    const user = userData.user;

    // Lấy sản phẩm của người đang đăng nhập
    const { data: myProducts, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', user.id);

    if (productError) {
      setError(productError.message);
      setLoading(false);
      return;
    }

    const myProductIds = (myProducts || []).map((p) => p.id);

    // Lấy đề nghị đã gửi
    const { data: sent, error: sentError } = await supabase
      .from('exchange_offers')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (sentError) {
      setError(sentError.message);
      setLoading(false);
      return;
    }

    // Lấy đề nghị gửi đến sản phẩm của mình
    let received = [];

    if (myProductIds.length > 0) {
      const { data, error: receivedError } = await supabase
        .from('exchange_offers')
        .select('*')
        .in('product_id', myProductIds)
        .order('created_at', { ascending: false });

      if (receivedError) {
        setError(receivedError.message);
        setLoading(false);
        return;
      }

      received = data || [];
    }

    // Lấy thông tin sản phẩm liên quan
    const allOffers = [...(sent || []), ...received];
    const productIds = [
      ...new Set(
        allOffers.flatMap((offer) => [
          offer.product_id,
          offer.offered_product_id
        ]).filter(Boolean)
      )
    ];

    let productMap = {};

    if (productIds.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('id, title, price, image_urls')
        .in('id', productIds);

      (productData || []).forEach((product) => {
        productMap[product.id] = product;
      });
    }

    setProducts(productMap);
    setSentOffers(sent || []);
    setReceivedOffers(received);
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const updateOfferStatus = async (offerId, status) => {
    const { error } = await supabase
      .from('exchange_offers')
      .update({ status })
      .eq('id', offerId);

    if (error) {
      alert('Không thể cập nhật đề nghị: ' + error.message);
      return;
    }

    await loadOffers();
  };

  const renderOffer = (offer, isReceived) => {
    const targetProduct = products[offer.product_id];
    const offeredProduct = products[offer.offered_product_id];

    return (
      <div className="exchange-card" key={offer.id}>
        <div className="exchange-products">
          <div>
            <img
              src={targetProduct?.image_urls?.[0] || '/logo.png.jpg'}
              alt={targetProduct?.title || 'Sản phẩm'}
            />
            <h3>{targetProduct?.title || 'Sản phẩm không còn tồn tại'}</h3>
            <p>
              {targetProduct?.price
                ? Number(targetProduct.price).toLocaleString('vi-VN') + ' ₫'
                : ''}
            </p>
          </div>

          <span className="exchange-arrow">⇄</span>

          <div>
            <img
              src={offeredProduct?.image_urls?.[0] || '/logo.png.jpg'}
              alt={offeredProduct?.title || 'Sản phẩm'}
            />
            <h3>{offeredProduct?.title || 'Sản phẩm không còn tồn tại'}</h3>
            <p>
              {offeredProduct?.price
                ? Number(offeredProduct.price).toLocaleString('vi-VN') + ' ₫'
                : ''}
            </p>
          </div>
        </div>

        {offer.message && (
          <p className="exchange-message">
            Lời nhắn: {offer.message}
          </p>
        )}

        <p className="exchange-status">
          Trạng thái: <strong>{offer.status}</strong>
        </p>

        {isReceived && offer.status === 'pending' && (
          <div className="exchange-buttons">
            <button
              onClick={() => updateOfferStatus(offer.id, 'accepted')}
              className="exchange-accept"
            >
              Chấp nhận
            </button>

            <button
              onClick={() => updateOfferStatus(offer.id, 'rejected')}
              className="exchange-reject"
            >
              Từ chối
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentOffers =
    activeTab === 'received' ? receivedOffers : sentOffers;

  return (
    <div className="exchange-page">
      <h1>Trao đổi sản phẩm</h1>
      <p>Quản lý các đề nghị trao đổi trên PENTA.</p>

      <div className="exchange-tabs">
        <button
          className={activeTab === 'received' ? 'active' : ''}
          onClick={() => setActiveTab('received')}
        >
          Đề nghị nhận được ({receivedOffers.length})
        </button>

        <button
          className={activeTab === 'sent' ? 'active' : ''}
          onClick={() => setActiveTab('sent')}
        >
          Đề nghị đã gửi ({sentOffers.length})
        </button>
      </div>

      {loading ? (
        <p>Đang tải đề nghị trao đổi...</p>
      ) : error ? (
        <p>{error}</p>
      ) : currentOffers.length === 0 ? (
        <div className="exchange-empty">
          <h3>Chưa có đề nghị trao đổi</h3>
          <p>Các đề nghị trao đổi của bạn sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="exchange-list">
          {currentOffers.map((offer) =>
            renderOffer(offer, activeTab === 'received')
          )}
        </div>
      )}
    </div>
  );
}

export default Exchange;
