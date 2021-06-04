import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ tests }) => {
  const { t } = useTranslation();
  return tests.length ? (
    tests.map((test) => (
      <>
        <p>
          <b>{test.testName}</b>
        </p>
        <p>{test.value}</p>
      </>
    ))
  ) : (
    <p className={styles.bodyLong01}>{t('noTestsFound', 'No Tests found.')}</p>
  );
};

export default TestsSummary;
