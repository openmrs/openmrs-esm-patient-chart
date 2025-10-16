import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showSnackbar, getCoreTranslation, useConfig } from '@openmrs/esm-framework';
import styles from './action-button.scss';
import { useStickerPdfPrinter } from '../hooks/useStickerPdfPrinter';
import type { ConfigObject } from '../config-schema';

interface PrintIdentifierStickerOverflowMenuItemProps {
  patient: fhir.Patient;
}

const PrintIdentifierStickerOverflowMenuItem: React.FC<PrintIdentifierStickerOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const { showPrintIdentifierStickerButton } = useConfig<ConfigObject>();
  const { printPdf, isPrinting } = useStickerPdfPrinter();

  const isVisible = useMemo(() => {
    if (!patient?.id) return false;
    return showPrintIdentifierStickerButton;
  }, [showPrintIdentifierStickerButton, patient?.id]);

  const getPdfUrl = useCallback(() => {
    if (!patient?.id) {
      throw new Error(t('patientIdNotFound', 'Patient ID not found'));
    }
    return `${window.openmrsBase}/ws/rest/v1/patientdocuments/patientIdSticker?patientUuid=${patient.id}`;
  }, [patient?.id, t]);

  const handlePrint = useCallback(async () => {
    if (isPrinting) return;

    try {
      await printPdf(getPdfUrl());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showSnackbar({
        kind: 'error',
        title: getCoreTranslation('printError', 'Print Error'),
        subtitle: getCoreTranslation('printErrorExplainer', '', { errorLocation: errorMessage }),
      });
    }
  }, [getPdfUrl, printPdf, isPrinting]);

  const buttonText = useMemo(() => {
    return isPrinting
      ? getCoreTranslation('printing', 'Printing...')
      : getCoreTranslation('printIdentifierSticker', 'Print identifier sticker');
  }, [isPrinting]);

  if (!isVisible) {
    return null;
  }

  return (
    <OverflowMenuItem className={styles.menuitem} itemText={buttonText} onClick={handlePrint} disabled={isPrinting} />
  );
};

export default PrintIdentifierStickerOverflowMenuItem;
