import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useText } from '../contexts/TextContext';
import HomePage from '../components/HomePage/HomePage';
import { TextEntry } from '../db/database';

const HomeRoute: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedText } = useText();

  const handleSelectText = useCallback((text: TextEntry) => {
    setSelectedText(text);
    navigate('/reader');
  }, [navigate, setSelectedText]);

  return <HomePage onSelect={handleSelectText} />;
};

export default HomeRoute;