import React from 'react';
import Settings from '../components/Settings/Settings';
import { useApp } from '../contexts/AppContext';

const SettingsRoute: React.FC = () => {
  const { knownWords, setKnownWords, fontSize, setFontSize } = useApp();
  return (
    <Settings
      knownWords={knownWords}
      setKnownWords={setKnownWords}
      fontSize={fontSize}
      setFontSize={setFontSize}
    />
  );
};

export default SettingsRoute;