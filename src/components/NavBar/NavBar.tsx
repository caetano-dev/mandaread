import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className={styles.nav}>
      <button onClick={() => navigate('/')} className={styles.navTitleButton}>Mandaread</button>
      <div className={styles.navButtons}>
        <button onClick={() => navigate('/settings')} disabled={location.pathname === '/settings'}>Settings</button>
      </div>
    </nav>
  );
};

export default NavBar;
