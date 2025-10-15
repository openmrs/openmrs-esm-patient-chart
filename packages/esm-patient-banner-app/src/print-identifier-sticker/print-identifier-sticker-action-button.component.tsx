import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal, useFeatureFlag } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patient: fhir.Patient;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('print-identifier-sticker-modal', {
      closeModal: () => dispose(),
      patient,
    });
  }, [patient]);

  if (!patient) {
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
