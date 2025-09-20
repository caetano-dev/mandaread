import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useText } from '../contexts/TextContext';
import Reader from '../components/Reader/Reader';
import { useApp } from '../contexts/AppContext';

const ReaderRoute: React.FC = () => {
  const { knownWords, setKnownWords } = useApp();
  const navigate = useNavigate();
  const { selectedText } = useText();

  if (!selectedText) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No text selected. Please go back to home and select a text.</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <Reader
      text={selectedText}
      knownWords={knownWords}
      setKnownWords={setKnownWords}
    />
  );
};

export default ReaderRoute;