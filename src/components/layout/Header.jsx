
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  UserRound,
  PlusCircle,
  ChevronDown,
  Package,
  History,
  LogOut
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadUser = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      const currentUser = session.user;

      if (mounted) setUser(currentUser);

      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (mounted) {
        setProfile({
          full_name:
            data?.full_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split('@')[0],

          avatar_url:
            data?.avatar_url ||
            currentUser.user_metadata?.avatar_url ||
            ''
        });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      loadUser(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      loadUser(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Đăng xuất thất bại: ' + error.message);
      return;
    }

    setUser(null);
    setProfile(null);
    setShowMenu(false);
    navigate('/');
  };
const handleSearch = (e) => {
  e.preventDefault();

  const keyword = searchTerm.trim();

  if (!keyword) {
    return;
  }

  navigate(`/?search=${encodeURIComponent(keyword)}#products`);
};
  return (
    <header className="site-header">
      <div className="header-container">

        {/* LOGO */}
        <Link to="/" className="brand">
          <img src="/logo.png.jpg" alt="PENTA Logo" />
        </Link>

        {/* TÌM KIẾM */}
        <div className="header-search">
          <Search size={20} />

          <input
  type="text"
  placeholder="Tìm kiếm món đồ bạn cần..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }}
/>

          <button onClick={handleSearch}>Tìm kiếm</button>
        </div>

        {/* MENU */}
        <nav className="header-actions">

          <Link to="/messages" title="Tin nhắn">
            <MessageCircle size={22} />
          </Link>

          {user ? (

            /* ĐÃ ĐĂNG NHẬP */
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>

              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#14532d',
                  fontWeight: '600'
                }}
              >

                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #166534'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}

                <span>
                  {profile?.full_name || 'Tài khoản'}
                </span>

                <ChevronDown size={16} />

              </button>

              {/* DROPDOWN */}
              {showMenu && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '220px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                  padding: '10px',
                  zIndex: 1000
                }}>

                  <Link
                    to="/profile"
                    onClick={() => setShowMenu(false)}
                    style={menuItemStyle}
                  >
                    <UserRound size={18} />
                    Hồ sơ cá nhân
                  </Link>

                  <Link
                    to="/my-products"
                    onClick={() => setShowMenu(false)}
                    style={menuItemStyle}
                  >
                    <Package size={18} />
                    Sản phẩm của tôi
                  </Link>

                  <Link
                    to="/transactions"
                    onClick={() => setShowMenu(false)}
                    style={menuItemStyle}
                  >
                    <History size={18} />
                    Lịch sử giao dịch
                  </Link>

                  <hr style={{
                    border: 'none',
                    borderTop: '1px solid #eee',
                    margin: '8px 0'
                  }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      ...menuItemStyle,
                      width: '100%',
                      color: '#dc2626',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>

                </div>
              )}

            </div>

          ) : (

            /* CHƯA ĐĂNG NHẬP */
            <>
              <Link to="/profile" title="Tài khoản">
                <UserRound size={22} />
              </Link>

              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>
            </>
          )}

          <Link to="/post-product" className="post-button">
            <PlusCircle size={18} />
            Đăng tin
          </Link>

        </nav>
      </div>
    </header>
  );
}

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px',
  textDecoration: 'none',
  color: '#14532d',
  fontSize: '14px',
  borderRadius: '8px'
};

export default Header;
