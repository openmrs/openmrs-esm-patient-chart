import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useFeatureFlag, showSnackbar, getCoreTranslation } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patient: fhir.Patient;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({ patient }) => {
  const canPrintPatientIdentifierSticker = useFeatureFlag('print-patient-identifier-sticker');
  const { printPdf, isPrinting } = useSickerPdfPrinter();

  const getPdfUrl = useCallback(() => {
    if (!patient?.id) {
      throw new Error('Patient ID not found');
    }
    return `${window.openmrsBase}/ws/module/commonreports/patientIdSticker?patientUuid=${patient.id}`;
  }, [patient]);

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
function useSickerPdfPrinter(): { printPdf: any; isPrinting: any } {
  throw new Error('Function not implemented.');
}
