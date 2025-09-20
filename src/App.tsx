import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import HomeRoute from './routes/HomeRoute';
import ReaderRoute from './routes/ReaderRoute';
import SettingsRoute from './routes/SettingsRoute';
import NotFoundRoute from './routes/NotFoundRoute';
import styles from './App.module.css';

const App: React.FC = () => {
  const { fontSize, isLoading } = useApp();

  if (isLoading) {
    return (
      <div style={{ fontSize: `${fontSize}px` }}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="reader" element={<ReaderRoute />} />
          <Route path="settings" element={<SettingsRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;