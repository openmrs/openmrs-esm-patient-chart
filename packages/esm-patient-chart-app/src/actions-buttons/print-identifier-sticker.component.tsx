import React, { useCallback } from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal, useConfig, usePatient } from '@openmrs/esm-framework';

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

  const launchModal = useCallback(() => {
    const dispose = showModal('print-identifier-sticker-modal', {
      closeModal: () => dispose(),
      patient,
    });
  }, [patient]);

  return (
    Boolean(showPrintIdentifierStickerButton) && (
      <OverflowMenuItem
        itemText={t('printIdentifierSticker', 'Print identifier sticker')}
        onClick={launchModal}
        style={{
          maxWidth: '100vw',
        }}
      />
    )
  );
};

export default PrintIdentifierStickerOverflowMenuItem;
