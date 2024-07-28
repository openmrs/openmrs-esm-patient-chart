import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { getPatientName, showSnackbar, useConfig, getCoreTranslation } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker.scss';
import { NumberInput } from '@carbon/react';
import IdentifierSticker from './print-identifier-sticker.component';
import PrintIdentifierStickerContent from './print-identifier-sticker-content.component';

interface PrintIdentifierStickerModalProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

const PrintIdentifierStickerModal: React.FC<PrintIdentifierStickerModalProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { numberOfPatientIdStickers, numberOfPatientIdStickerRowsPerPage, numberOfPatientIdStickerColumns } =
    useConfig<ConfigObject>();
  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef<() => void | null>(null);
  const [numberOfLabelColumns, setNumberOfLabelColumns] = useState<number>(numberOfPatientIdStickerColumns);
  const [numberOfLabelRowsPerPage, setNumberOfLabelRowsPerPage] = useState<number>(numberOfPatientIdStickerRowsPerPage);
  const [numberOfLabels, setNumberOfLabels] = useState<number>(numberOfPatientIdStickers);
  const [isPrinting, setIsPrinting] = useState(false);
  const headerTitle = t('patientIdentifierSticker', 'Patient identifier sticker');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const labels = Array.from({ length: numberOfLabels });

  useEffect(() => {
    if (isPrinting && onBeforeGetContentResolve.current) {
      onBeforeGetContentResolve.current();
    }
  }, [isPrinting]);

  const handleBeforeGetContent = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (patient && headerTitle) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    [headerTitle, patient],
  );

  const handleAfterPrint = useCallback(() => {
    onBeforeGetContentResolve.current = null;
    setIsPrinting(false);
    closeModal();
  }, [closeModal]);

  const handlePrintError = useCallback((errorLocation, error) => {
    onBeforeGetContentResolve.current = null;

    showSnackbar({
      isLowContrast: false,
      kind: 'error',
      title: getCoreTranslation('printError', 'Print error'),
      subtitle:
        getCoreTranslation('printErrorExplainer', 'An error occurred in "{{errorLocation}}": ', { errorLocation }) +
        error,
    });

    setIsPrinting(false);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `${patient ? getPatientName(patient) : ''} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleBeforeGetContent,
    onPrintError: handlePrintError,
  });

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')}
      />
      <ModalBody>
        <NumberInput
          id="numberOfColumnsInput"
          label={t('numberOfLabelColumns', 'Number of patient Id sticker columns')}
          min={1}
          onChange={(event) => setNumberOfLabelColumns(parseInt(event.target.value || 1))}
          value={numberOfLabelColumns}
          hideSteppers={true}
        />
        <NumberInput
          id="numberOfRowsPerPageInput"
          label={t('numberOfLabelRowsPerPage', 'Number of patient Id sticker rows per page')}
          min={1}
          onChange={(event) => setNumberOfLabelRowsPerPage(parseInt(event.target.value || 1))}
          value={numberOfLabelRowsPerPage}
          hideSteppers={true}
        />
        <NumberInput
          id="numberOfLabels"
          label={t('numberOfLabels', 'Number of Patient Id Stickers')}
          min={1}
          onChange={(event) => setNumberOfLabels(parseInt(event.target.value || 1))}
          value={numberOfLabels}
          hideSteppers={true}
        />
        <div className={styles.stickerContent}>
          <IdentifierSticker patient={patient} />
          <span>
            <Button kind="ghost" onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
              {!isPreviewVisible ? t('preview', 'Preview') : t('hidePreview', 'Hide Preview')}
            </Button>
          </span>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isPrinting} onClick={handlePrint} kind="primary">
          {isPrinting ? (
            <InlineLoading className={styles.loader} description={getCoreTranslation('printing', 'Printing') + '...'} />
          ) : (
            getCoreTranslation('print', 'Print')
          )}
        </Button>
      </ModalFooter>
      <div className={`${styles.previewContainer} ${!isPreviewVisible ? styles.hideResultsPreview : ''}`}>
        <div ref={contentToPrintRef}>
          <PrintIdentifierStickerContent
            numberOfLabelRowsPerPage={numberOfLabelRowsPerPage}
            numberOfLabelColumns={numberOfLabelColumns}
            labels={labels}
            patient={patient}
          />
        </div>
      </div>
    </>
  );
};

export default PrintIdentifierStickerModal;
