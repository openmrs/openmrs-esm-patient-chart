import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import {
  Button,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Stack,
  Grid,
  Column,
  Toggle,
} from '@carbon/react';
import { getPatientName, showSnackbar, useConfig, getCoreTranslation } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker.scss';
import classNames from 'classnames';
import PrintComponent from './print-identifier-sticker.component';

interface PrintIdentifierStickerProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

interface PrintMultipleStickersComponentProps extends Partial<ConfigObject> {
  pageSize: string;
  multipleStickers: {
    enabled: boolean;
    totalStickers: number;
    stickerColumnsPerPage: number;
    stickerRowsPerPage: number;
  };
  stickerSize: {
    height: string;
    width: string;
  };
  patient: fhir.Patient;
}

const PrintIdentifierSticker: React.FC<PrintIdentifierStickerProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { printPatientSticker } = useConfig<ConfigObject>();
  const { pageSize, multipleStickers, stickerSize } = printPatientSticker ?? {};
  const [isPrinting, setIsPrinting] = useState(false);
  const headerTitle = t('patientIdentifierSticker', 'Patient identifier sticker');

  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef<() => void | null>(null);

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
    documentTitle: `${getPatientName(patient)} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleBeforeGetContent,
    onPrintError: handlePrintError,
    copyStyles: true,
  });

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')}
      />
      <ModalBody aria-label="Print identifier sticker modal" hasScrollingContent>
        <PrintMultipleStickersComponent
          pageSize={pageSize}
          multipleStickers={multipleStickers}
          stickerSize={stickerSize}
          patient={patient}
          ref={contentToPrintRef}
        />
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

const PrintMultipleStickersComponent = forwardRef<HTMLDivElement, PrintMultipleStickersComponentProps>(
  ({ pageSize, multipleStickers, stickerSize, patient }, ref) => {
    const divRef = useRef<HTMLDivElement>();
    const { t } = useTranslation();

    const { height: printIdentifierStickerHeight, width: printIdentifierStickerWidth } = stickerSize ?? {};
    const [numberOfLabelColumnsPage, setNumberOfLabelColumnsPage] = useState<number>(
      multipleStickers.stickerColumnsPerPage,
    );
    const [numberOfLabelRowsPerPage, setNumberOfLabelRowsPerPage] = useState<number>(
      multipleStickers.stickerRowsPerPage,
    );
    const [numberOfLabels, setNumberOfLabels] = useState<number>(multipleStickers.totalStickers);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isMultipleStickersEnabled, setIsMultipleStickersEnabled] = useState(multipleStickers.enabled);

    const labels = Array.from({ length: numberOfLabels });

    useImperativeHandle(ref, () => divRef.current, []);

    useEffect(() => {
      if (divRef.current) {
        const style = divRef.current.style;
        style.setProperty('--omrs-print-label-paper-size', pageSize);
        style.setProperty('--omrs-print-label-colums', numberOfLabelColumnsPage.toString());
        style.setProperty('--omrs-print-label-rows', numberOfLabelRowsPerPage.toString());
        style.setProperty('--omrs-print-label-sticker-height', printIdentifierStickerHeight.toString());
        style.setProperty('--omrs-print-label-sticker-width', printIdentifierStickerWidth.toString());
      }
    }, [
      numberOfLabelColumnsPage,
      numberOfLabelRowsPerPage,
      printIdentifierStickerHeight,
      pageSize,
      printIdentifierStickerWidth,
    ]);

    const maxLabelsPerPage = numberOfLabelRowsPerPage * numberOfLabelColumnsPage;
    const pages: Array<typeof labels> = [];

    for (let i = 0; i < labels.length; i += maxLabelsPerPage) {
      pages.push(labels.slice(i, i + maxLabelsPerPage));
    }

    if (numberOfLabelColumnsPage < 1 || numberOfLabelRowsPerPage < 1 || labels.length < 1) {
      return;
    }

    const handleOnToggle = (value: boolean) => {
      const FormCollapseToggleEvent = new CustomEvent('openmrs:form-collapse-toggle', { detail: { value } });
      window.dispatchEvent(FormCollapseToggleEvent);
    };

    return (
      <Stack gap={5}>
        <PrintComponent patient={patient} />
        <Grid className={styles.gridContainer}>
          <Column lg={6} md={8} sm={4}>
            <Toggle
              className={styles.multipleStickerToggle}
              size="sm"
              labelText={t('printMultipleStickers', 'Print multiple stickers')}
              id="print-multiple-stickers-toggle"
              labelA=""
              labelB=""
              onToggle={() => setIsMultipleStickersEnabled(!isMultipleStickersEnabled)}
            />
          </Column>
          <Column lg={10} md={8} sm={4} className={!isMultipleStickersEnabled ? styles.hidePreviewContainer : ''}>
            <div className={styles.multipleStickerInputs}>
              <NumberInput
                hideSteppers
                id="columnsPerPageInput"
                label={t('columnsPerPage', 'Columns per page')}
                min={1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setNumberOfLabelColumnsPage(parseInt(event.target.value || '1'))
                }
                value={numberOfLabelColumnsPage}
              />
              <NumberInput
                hideSteppers
                id="rowsPerPageInput"
                label={t('rowsPerPage', 'Rows per page')}
                min={1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setNumberOfLabelRowsPerPage(parseInt(event.target.value || '1'))
                }
                value={numberOfLabelRowsPerPage}
              />
              <NumberInput
                hideSteppers
                id="totalNumberInput"
                label={t('totalNumber', 'Total number')}
                min={1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setNumberOfLabels(parseInt(event.target.value || '1'))
                }
                value={numberOfLabels}
              />
            </div>
            <Button
              className={styles.previewButton}
              kind="ghost"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              {!isPreviewVisible ? t('showPreview', 'Show preview') : t('hidePreview', 'Hide preview')}
            </Button>
          </Column>
        </Grid>
        <div className={classNames(styles.previewContainer, !isPreviewVisible ? styles.hidePreviewContainer : '')}>
          <div ref={divRef} className={styles.printRoot}>
            {pages.map((pageLabels, pageIndex) => (
              <div key={pageIndex} className={pageIndex < pages.length - 1 ? styles.pageBreak : ''}>
                <div className={styles.labelsContainer}>
                  {pageLabels.map((label, index) => (
                    <div key={index} className={styles.printContainer}>
                      <PrintComponent patient={patient} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Stack>
    );
  },
);

export default PrintIdentifierSticker;
