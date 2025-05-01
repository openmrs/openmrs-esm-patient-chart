import React from 'react';
import styles from './grid.scss';

export const Grid: React.FC<{
  children?: React.ReactNode;
  style: React.CSSProperties;
  padding?: boolean;
  dataColumns: number;
}> = ({ dataColumns, style = {}, padding = false, ...props }) => {
  const minColumnWidth = 4;
  const maxColumnWidth = 10;

  const dynamicColumnWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, 100 / dataColumns));

  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `${padding ? '9em ' : ''} repeat(${dataColumns}, ${dynamicColumnWidth}em)`,
        overflow: 'hidden',
      }}
      className={styles.grid}
      {...props}
    />
  );
};
