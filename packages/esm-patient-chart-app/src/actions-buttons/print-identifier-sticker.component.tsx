import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal, useConfig, usePatient } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patientUuid: string;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);
  const { showPrintIdentifierStickerButton } = useConfig<{ showPrintIdentifierStickerButton: boolean }>({
    externalModuleName: '@openmrs/esm-patient-banner-app',
  });

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('print-identifier-sticker-modal', {
      closeModal: () => dispose(),
      patient,
    });
  }, [patient]);

  return (
    patient &&
    Boolean(showPrintIdentifierStickerButton) && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('printIdentifierSticker', 'Print identifier sticker')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default PrintIdentifierStickerOverflowMenuItem;
