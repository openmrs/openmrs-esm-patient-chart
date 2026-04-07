import React from 'react';
import styles from './grid.scss';

interface GridProps {
  children?: React.ReactNode;
  style: React.CSSProperties;
  padding?: boolean;
  dataColumns: number;
}

export const Grid: React.FC<GridProps> = ({ dataColumns, style = {}, padding = false, ...props }) => {
  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `${padding ? '9rem ' : ''} repeat(${dataColumns}, minmax(8rem, 1fr))`,
        overflow: 'hidden',
        width: '100%',
        minWidth: '100%',
      }}
      className={styles.grid}
      {...props}
    />
  );
};
