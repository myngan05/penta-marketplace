
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

function MainLayout() {
  return (
    <div className="app-layout">

      <Header />

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          © 2026 PENTA. Mua bán và trao đổi,
          cùng nhau tái sử dụng.
        </p>
      </footer>

    </div>
  );
}

export default MainLayout;
