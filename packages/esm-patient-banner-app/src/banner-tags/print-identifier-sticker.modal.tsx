import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useReactToPrint, type UseReactToPrintOptions } from 'react-to-print';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader, NumberInput, Stack } from '@carbon/react';
import { getPatientName, showSnackbar, useConfig, getCoreTranslation } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import IdentifierSticker from './print-identifier-sticker.component';
import PrintIdentifierStickerContent from './print-identifier-sticker-content.component';
import styles from './print-identifier-sticker.scss';

interface PrintIdentifierStickerModalProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

const PrintIdentifierStickerModal: React.FC<PrintIdentifierStickerModalProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { numberOfPatientIdStickers, numberOfPatientIdStickerRowsPerPage, numberOfPatientIdStickerColumns } =
    useConfig<ConfigObject>();
  const contentToPrintRef = useRef<HTMLDivElement | null>(null);
  const [numberOfLabelColumns, setNumberOfLabelColumns] = useState<number>(numberOfPatientIdStickerColumns);
  const [numberOfLabelRowsPerPage, setNumberOfLabelRowsPerPage] = useState<number>(numberOfPatientIdStickerRowsPerPage);
  const [numberOfLabels, setNumberOfLabels] = useState<number>(numberOfPatientIdStickers);
  const [isPrinting, setIsPrinting] = useState(false);
  const headerTitle = t('patientIdentifierSticker', 'Patient identifier sticker');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const labels = Array.from({ length: numberOfLabels });

  const handleBeforePrint = useCallback(() => setIsPrinting(true), []);

  const handleAfterPrint = useCallback(() => {
    setIsPrinting(false);
    closeModal();
  }, [closeModal]);

  const handlePrintError = useCallback<UseReactToPrintOptions['onPrintError']>((errorLocation, error) => {
    showSnackbar({
      isLowContrast: false,
      kind: 'error',
      title: getCoreTranslation('printError', 'Print error'),
      subtitle:
        getCoreTranslation('printErrorExplainer', 'An error occurred during "{{errorLocation}}": ', { errorLocation }) +
        error,
    });

    setIsPrinting(false);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: contentToPrintRef,
    documentTitle: `${patient ? getPatientName(patient) : ''} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onPrintError: handlePrintError,
  });

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')}
      />
      <ModalBody aria-label="Print identifier sticker modal" hasScrollingContent>
        <Stack gap={5}>
          <NumberInput
            hideSteppers
            id="numberOfColumnsInput"
            label={t('numberOfLabelColumns', 'No. of patient ID sticker columns')}
            min={1}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNumberOfLabelColumns(parseInt(event.target.value || '1'))
            }
            value={numberOfLabelColumns}
          />
          <NumberInput
            hideSteppers
            id="numberOfRowsPerPageInput"
            label={t('numberOfLabelRowsPerPage', 'No. of patient ID sticker rows per page')}
            min={1}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNumberOfLabelRowsPerPage(parseInt(event.target.value || '1'))
            }
            value={numberOfLabelRowsPerPage}
          />
          <NumberInput
            hideSteppers
            id="numberOfLabels"
            label={t('numberOfLabels', 'No. of patient ID stickers')}
            min={1}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNumberOfLabels(parseInt(event.target.value || '1'))
            }
            value={numberOfLabels}
          />
          <div className={styles.stickerContent}>
            <IdentifierSticker patient={patient} />
            <span>
              <Button kind="ghost" onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                {!isPreviewVisible ? t('showPreview', 'Show preview') : t('hidePreview', 'Hide preview')}
              </Button>
            </span>
          </div>
          <div
            className={classNames(styles.previewContainer, {
              [styles.hideResultsPreview]: !isPreviewVisible,
            })}
          >
            <div ref={contentToPrintRef}>
              <PrintIdentifierStickerContent
                labels={labels}
                numberOfLabelColumns={numberOfLabelColumns}
                numberOfLabelRowsPerPage={numberOfLabelRowsPerPage}
                patient={patient}
                ref={contentToPrintRef}
              />
            </div>
          </div>
        </Stack>
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
    </>
  );
};

export default PrintIdentifierStickerModal;
