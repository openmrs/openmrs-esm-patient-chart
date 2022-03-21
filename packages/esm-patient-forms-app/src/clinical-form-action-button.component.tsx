import React from 'react';
import Document20 from '@carbon/icons-react/es/document/20';
import styles from './clinical-form-action-button.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { Button } from 'carbon-components-react';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (layout === 'tablet')
    return (
      <Button kind="ghost" className={styles.container}>
        <Document20 />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );

  return (
    <Button
      className={styles.container}
      kind="ghost"
      renderIcon={Document20}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      tooltipAlignment="end"
      tooltipPosition="bottom"
    />
  );
};

export default ClinicalFormActionButton;
