import React from 'react';
import Document16 from '@carbon/icons-react/es/document/16';
import styles from './clinical-form-action-menu.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';

const ClinicalFormActionMenu: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  return (
    <>
      {isTablet && (
        <div className={styles.clinicalFormActionMenuContainer} role="button" tabIndex={0} onClick={() => {}}>
          <Document16 />
          <span>{t('clinicalForm', 'Clinical form')}</span>
        </div>
      )}
    </>
  );
};

export default ClinicalFormActionMenu;
