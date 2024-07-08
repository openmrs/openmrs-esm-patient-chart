import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal, useFeatureFlag, usePatient } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patientUuid: string;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);
  const canPrintPatientIdentifierSticker = useFeatureFlag('print-patient-identifier-sticker');

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('print-identifier-sticker-modal', {
      closeModal: () => dispose(),
      patient,
    });
  }, [patient]);

  if (!patient || !canPrintPatientIdentifierSticker) {
    return null;
  }

  return (
    <OverflowMenuItem
      className={styles.menuitem}
      itemText={t('printIdentifierSticker', 'Print identifier sticker')}
      onClick={handleLaunchModal}
    />
  );
};

export default PrintIdentifierStickerOverflowMenuItem;
