import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ tests }) => {
  const { t } = useTranslation();
  return <p className={styles.bodyLong01}>{t('noTestsFound', 'No tests found')}</p>;
};

export default TestsSummary;
