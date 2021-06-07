import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ tests }) => {
  const { t } = useTranslation();
  return tests && tests.length > 0 ? (
    <ExtensionSlot extensionSlotName="past-visit-test-results" />
  ) : (
    <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noTestsFound', 'No tests found')}</p>
  );
};

export default TestsSummary;
