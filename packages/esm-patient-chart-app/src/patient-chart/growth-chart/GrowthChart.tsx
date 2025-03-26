// GSoC 2025 - Placeholder component for future Growth Chart feature
import React from 'react';
import styles from './growth-chart.module.scss';

const GrowthChart = () => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>
        <span role="img" aria-label="chart" className={styles.icon}>
          📈
        </span>
        Growth Chart Coming Soon
      </h3>
      <p className={styles.subtitle}>This is a placeholder component for GSoC 2025.</p>
    </div>
  );
};

export default GrowthChart;
