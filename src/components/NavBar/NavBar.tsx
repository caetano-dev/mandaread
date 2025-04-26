import React from 'react';
import styles from './NavBar.module.css';

type Page = 'home' | 'reader' | 'settings';

interface NavBarProps {
  page: Page;
  setPage: (page: Page) => void;
}

const NavBar: React.FC<NavBarProps> = ({ page, setPage }) => {
  return (
    <nav className={styles.nav}>
      <button onClick={() => setPage('home')} className={styles.navTitleButton}>Mandaread</button>
      <div className={styles.navButtons}>
        <button onClick={() => setPage('settings')} disabled={page === 'settings'}>Settings</button>
      </div>
    </nav>
  );
};

export default NavBar;
