import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ tests }) => {
  const { t } = useTranslation();
  return <ExtensionSlot extensionSlotName="past-visit-test-results" />;
};

export default TestsSummary;
