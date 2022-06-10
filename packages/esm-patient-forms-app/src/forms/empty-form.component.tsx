import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import styles from './empty-form.scss';

interface EmptyFormViewProps {
  action: string;
}

const EmptyFormView: React.FC<EmptyFormViewProps> = ({ action }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tile}>
      <EmptyDataIllustration />
      <p className={styles.content}>{t('noFormsFound', 'Sorry, no forms have been found')}</p>
      <p className={styles.action}>{action}</p>
    </Tile>
  );
};

export default EmptyFormView;
