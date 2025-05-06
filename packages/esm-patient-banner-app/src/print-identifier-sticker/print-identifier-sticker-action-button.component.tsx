import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useFeatureFlag } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patient: fhir.Patient;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const canPrintPatientIdentifierSticker = useFeatureFlag('print-patient-identifier-sticker');

  const handleLaunchModal = useCallback(() => {
    if (patient?.id) {
      const url = `${window.openmrsBase}/ws/module/commonreports/patientIdSticker?patientUuid=${patient?.id}`;
      const anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.click();
      anchor.remove();
    }
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
