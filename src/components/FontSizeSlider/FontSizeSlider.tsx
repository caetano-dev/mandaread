import React from 'react';
import styles from './FontSizeSlider.module.css';

interface FontSizeSettingProps {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FontSizeSetting: React.FC<FontSizeSettingProps> = ({ fontSize, setFontSize }) => {
  return (
    <div className={styles.settingItem}>
      <label htmlFor="fontSizeRange" className={styles.label}>Font Size</label>
      <div className={styles.fontSizeControl}>
        <input
          id="fontSizeRange"
          type="range"
          min={14}
          max={36}
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          aria-labelledby="fontSizeLabel"
        />
        <span className={styles.fontSizeValue}>{fontSize}px</span>
      </div>
    </div>
  );
};

export default FontSizeSetting;
