
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Messages() {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('conversation');

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedId && conversations.length > 0) {
      const found = conversations.find(item => item.id === selectedId);
      if (found) setActiveConversation(found);
    }
  }, [selectedId, conversations]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const loadConversations = async () => {
    setLoading(true);
    setError('');

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setError('Bạn cần đăng nhập để xem tin nhắn.');
      setLoading(false);
      return;
    }

    const currentUser = authData.user;
    setUser(currentUser);

    const { data, error: queryError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id, product_id, created_at')
      .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error(queryError);
      setError('Không thể tải danh sách cuộc trò chuyện.');
      setLoading(false);
      return;
    }

    const productIds = [...new Set((data || []).map(item => item.product_id))];
    const otherIds = [...new Set((data || []).map(item =>
      item.buyer_id === currentUser.id ? item.seller_id : item.buyer_id
    ))];

    let productMap = {};
    let profileMap = {};

    if (productIds.length) {
      const { data: products } = await supabase
        .from('products')
        .select('id, title, image_urls')
        .in('id', productIds);

      (products || []).forEach(item => {
        productMap[item.id] = item;
      });
    }

    if (otherIds.length) {
      const { data: profiles } = await supabase
        .from('public_profile_names')
        .select('*')
        .in('id', otherIds);

      (profiles || []).forEach(item => {
        profileMap[item.id] = item;
      });
    }

    const result = (data || []).map(item => {
      const otherId = item.buyer_id === currentUser.id
        ? item.seller_id
        : item.buyer_id;

      return {
        ...item,
        product: productMap[item.product_id],
        otherProfile: profileMap[otherId],
        otherId
      };
    });

    setConversations(result);
    setLoading(false);
  };

  const loadMessages = async (conversationId) => {
    setError('');

    const { data, error: queryError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error(queryError);
      setError('Không thể tải tin nhắn.');
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = content.trim();
    if (!text || !activeConversation || sending) return;

    setSending(true);
    setError('');

    const { error: sendError } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: text
      });

    if (sendError) {
      console.error(sendError);
      setError('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    } else {
      setContent('');
      await loadMessages(activeConversation.id);
    }

    setSending(false);
  };

  if (loading) {
    return <p style={{ padding: 30 }}>Đang tải tin nhắn...</p>;
  }

  return (
    <div style={{
      maxWidth: 1100,
      margin: '30px auto',
      padding: '0 16px'
    }}>
      <h1>Tin nhắn PENTA</h1>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 1fr) 2fr',
        minHeight: 500,
        border: '1px solid #ddd',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        <div style={{
          borderRight: '1px solid #ddd',
          padding: 16
        }}>
          <h3>Cuộc trò chuyện</h3>

          {conversations.length === 0 ? (
            <p>Chưa có cuộc trò chuyện nào.</p>
          ) : (
            conversations.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveConversation(item)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 12,
                  marginBottom: 8,
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: activeConversation?.id === item.id
                    ? '#dcfce7'
                    : 'white',
                  cursor: 'pointer'
                }}
              >
                <strong>
                  {item.otherProfile?.full_name ||
                    item.otherProfile?.name ||
                    'Người dùng PENTA'}
                </strong>
                <br />
                <small>
                  {item.product?.title || 'Sản phẩm'}
                </small>
              </button>
            ))
          )}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          minWidth: 0
        }}>
          {activeConversation ? (
            <>
              <h3>
                Chat về: {activeConversation.product?.title || 'Sản phẩm'}
              </h3>

              <div style={{
                flex: 1,
                minHeight: 300,
                maxHeight: 450,
                overflowY: 'auto',
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8
              }}>
                {messages.length === 0 ? (
                  <p>Hãy gửi lời nhắn đầu tiên!</p>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent:
                          message.sender_id === user.id
                            ? 'flex-end'
                            : 'flex-start',
                        marginBottom: 12
                      }}
                    >
                      <div style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background:
                          message.sender_id === user.id
                            ? '#dcfce7'
                            : 'white',
                        border: '1px solid #ddd',
                        overflowWrap: 'anywhere'
                      }}>
                        {message.content}
                        <br />
                        <small style={{ color: '#777' }}>
                          {new Date(message.created_at)
                            .toLocaleString('vi-VN')}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={sendMessage}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 12
                }}
              >
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 12,
                    border: '1px solid #ccc',
                    borderRadius: 8
                  }}
                />

                <button
                  type="submit"
                  disabled={sending || !content.trim()}
                  style={{
                    padding: '10px 18px',
                    background: '#166534',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </>
          ) : (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: '#666'
            }}>
              <h3>💬 Tin nhắn PENTA</h3>
              <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
