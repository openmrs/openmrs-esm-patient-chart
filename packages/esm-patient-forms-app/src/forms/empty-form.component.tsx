import React from 'react';
import styles from './empty-form.component.scss';
import { useTranslation } from 'react-i18next';
import { Tile } from 'carbon-components-react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';

interface EmptyFormViewProps {
  action: string;
}

const EmptyFormView: React.FC<EmptyFormViewProps> = ({ action }) => {
  const { t } = useTranslation();

  return (
    <Tile light className={styles.tile}>
      <EmptyDataIllustration />
      <p className={styles.content}>{t('noFormsFound', 'Sorry, no forms have been found')}</p>
      <p className={styles.action}>{action}</p>
    </Tile>
  );
};

export default EmptyFormView;
