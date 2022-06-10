import React from 'react';
import { Button } from '@carbon/react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './clinical-form-action-button.scss';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (layout === 'tablet')
    return (
      <Button kind="ghost" className={styles.container}>
        <Document size={20} />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );

  return (
    <Button
      className={styles.container}
      kind="ghost"
      renderIcon={(props) => <Document size={20} {...props} />}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default ClinicalFormActionButton;
