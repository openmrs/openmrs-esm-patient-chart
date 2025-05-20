import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useFeatureFlag, showSnackbar, getCoreTranslation } from '@openmrs/esm-framework';
import styles from './action-button.scss';
import { useStickerPdfPrinter } from '../hooks/useStickerPdfPrinter';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patient: fhir.Patient;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const canPrintPatientIdentifierSticker = useFeatureFlag('print-patient-identifier-sticker');
  const { printPdf, isPrinting } = useStickerPdfPrinter();

  const getPdfUrl = useCallback(() => {
    if (!patient?.id) {
      throw new Error(t('patientIdNotFound', 'Patient ID not found'));
    }
    return `${window.openmrsBase}/ws/module/patientdocuments/patientIdSticker?patientUuid=${patient.id}`;
  }, [patient.id, t]);

  const handlePrint = useCallback(async () => {
    try {
      const pdfUrl = getPdfUrl();
      await printPdf(pdfUrl);
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: getCoreTranslation('printError', 'Print Error'),
        subtitle: getCoreTranslation('printErrorExplainer', '', { errorLocation: error?.message }),
      });
    }
  }, [getPdfUrl, printPdf]);

  if (!patient || !canPrintPatientIdentifierSticker) {
    return null;
  }

  return (
    <OverflowMenuItem
      className={styles.menuitem}
      itemText={
        isPrinting
          ? getCoreTranslation('printing', 'Printing...')
          : getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')
      }
      onClick={handlePrint}
      disabled={isPrinting}
    />
  );
};

export default PrintIdentifierStickerOverflowMenuItem;
