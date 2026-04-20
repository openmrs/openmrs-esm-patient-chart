import React from 'react';
import { useTranslation } from 'react-i18next';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import PrintPreview from './print-preview.component';
import styles from './print.workspace.scss';

interface PrintWorkspaceProps {}

const PrintWorkspace: React.FC<PatientWorkspace2DefinitionProps<PrintWorkspaceProps, {}>> = ({
  groupProps: { patientUuid },
  closeWorkspace,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('printPatientInfo', 'Print Patient Info')}</h1>
        <button onClick={() => closeWorkspace()} className={styles.closeButton}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        <PrintPreview patientUuid={patientUuid} onClose={closeWorkspace} />
      </div>
    </div>
  );
};

export default PrintWorkspace;
