// src/shared/components/Layout.jsx

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header hidden on Home screen */}
      {/* {!isHome && <Header />} */}

      <main className="flex-1">{children}</main>

      {/* Footer always visible */}
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;