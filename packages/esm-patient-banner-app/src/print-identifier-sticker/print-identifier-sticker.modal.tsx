import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import {
  Button,
  Column,
  Grid,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Stack,
  Toggle,
} from '@carbon/react';
import { getPatientName, getCoreTranslation, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import PrintComponent from './print-identifier-sticker.component';
import styles from './print-identifier-sticker.scss';
import { toSvg } from 'html-to-image';
import PrintSizeWrapper from './print-size-wrapper.component';
interface PrintIdentifierStickerProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

interface PrintMultipleStickersComponentProps
  extends Pick<ConfigObject['printPatientSticker'], 'pageSize' | 'printMultipleStickers' | 'stickerSize'> {
  pageSize: string;
  patient: fhir.Patient;
  printMultipleStickers: {
    numberOfStickers: number;
    stickerColumnsPerPage: number;
    stickerRowsPerPage: number;
  };
  stickerSize: {
    height: string;
    width: string;
  };
}

const PrintIdentifierSticker: React.FC<PrintIdentifierStickerProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { printPatientSticker } = useConfig<ConfigObject>();
  const { pageSize, printMultipleStickers, stickerSize } = printPatientSticker ?? {};
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

  const handlePrintWindow = useCallback((printWindow: HTMLIFrameElement | null): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (printWindow) {
        const printContent = printWindow.contentDocument || printWindow.contentWindow?.document;
        if (printContent) {
          printContent.body.style.overflow = 'initial !important';
          printWindow.contentWindow?.print();
        }
      }
      resolve();
    });
  }, []);

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
    print: handlePrintWindow,
    copyStyles: true,
  });

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')}
      />
      <ModalBody aria-label={t('printIdentifierStickerModal', 'Print identifier sticker modal')} hasScrollingContent>
        <PrintMultipleStickersComponent
          pageSize={pageSize}
          printMultipleStickers={printMultipleStickers}
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
  ({ pageSize, printMultipleStickers, stickerSize, patient }, ref) => {
    const svgDivRef = useRef<HTMLDivElement>();

    const divRef = useRef<HTMLDivElement>();
    const { t } = useTranslation();

    const { height: printIdentifierStickerHeight, width: printIdentifierStickerWidth } = stickerSize ?? {};
    const [numberOfLabelColumnsPage, setNumberOfLabelColumnsPage] = useState<number>(
      printMultipleStickers.stickerColumnsPerPage,
    );
    const [numberOfLabelRowsPerPage, setNumberOfLabelRowsPerPage] = useState<number>(
      printMultipleStickers.stickerRowsPerPage,
    );
    const [numberOfLabels, setNumberOfLabels] = useState<number>(printMultipleStickers.numberOfStickers);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isMultipleStickersEnabled, setIsMultipleStickersEnabled] = useState(
      printMultipleStickers.numberOfStickers > 1,
    );

    const [svgDataSource, setSvgDataSource] = useState('');

    const labels = Array.from({ length: numberOfLabels });

    useImperativeHandle(ref, () => divRef.current, []);

    useEffect(() => {
      if (divRef.current) {
        const style = divRef.current.style;
        style.setProperty('--omrs-print-label-paper-size', pageSize);
        style.setProperty('--omrs-print-label-columns', numberOfLabelColumnsPage.toString());
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

    useEffect(() => {
      if (svgDivRef.current) {
        toSvg(svgDivRef.current, { cacheBust: true })
          .then((dataUrl) => {
            setSvgDataSource(dataUrl);
          })
          .catch((err) => {
            showSnackbar({
              isLowContrast: false,
              kind: 'error',
              title: getCoreTranslation('printError', 'Print error'),
              subtitle: err,
            });
          });
      }
    }, [svgDivRef]);

    const maxLabelsPerPage = numberOfLabelRowsPerPage * numberOfLabelColumnsPage;
    const pages: Array<typeof labels> = [];

    for (let i = 0; i < labels.length; i += maxLabelsPerPage) {
      pages.push(labels.slice(i, i + maxLabelsPerPage));
    }

    if (numberOfLabelColumnsPage < 1 || numberOfLabelRowsPerPage < 1 || labels.length < 1) {
      return;
    }

    return (
      <Stack gap={5}>
        <div ref={svgDivRef}>
          <PrintComponent patient={patient} />
        </div>
        <Grid className={styles.gridContainer}>
          <Column lg={6} md={8} sm={4}>
            <Toggle
              className={styles.multipleStickerToggle}
              defaultToggled={isMultipleStickersEnabled}
              size="sm"
              labelText={t('printMultipleStickers', 'Print multiple stickers')}
              id="print-multiple-stickers-toggle"
              labelA=""
              labelB=""
              onToggle={() => setIsMultipleStickersEnabled(!isMultipleStickersEnabled)}
            />
          </Column>

          {isMultipleStickersEnabled ? (
            <Column lg={10} md={8} sm={4}>
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
          ) : null}
        </Grid>
        <div className={classNames(styles.previewContainer, !isPreviewVisible ? styles.hidePreviewContainer : '')}>
          <div ref={divRef} className={styles.printRoot}>
            {pages.map((pageLabels, pageIndex) => (
              <div key={pageIndex} className={pageIndex < pages.length - 1 ? styles.pageBreak : ''}>
                <div className={styles.labelsContainer}>
                  {pageLabels.map((_label, index) => (
                    <div key={index} className={styles.printContainer}>
                      <PrintSizeWrapper>
                        <img id="svg-sample" src={svgDataSource} />
                      </PrintSizeWrapper>
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
