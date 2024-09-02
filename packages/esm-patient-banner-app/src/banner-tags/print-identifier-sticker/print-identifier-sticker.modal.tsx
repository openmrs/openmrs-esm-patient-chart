import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { age, getPatientName, showSnackbar, useConfig, getCoreTranslation, usePatient } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import styles from './print-identifier-sticker.scss';
import Barcode from 'react-barcode';
import { defaultBarcodeParams, getPatientField } from './print-identifier-sticker.resource';

interface PrintIdentifierStickerProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

const PrintIdentifierSticker: React.FC<PrintIdentifierStickerProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { printPatientSticker } = useConfig<ConfigObject>();
  const { pageSize } = printPatientSticker ?? {};
  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef<() => void | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const headerTitle = t('patientIdentifierSticker', 'Patient identifier sticker');

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
    // closeModal();
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
    copyStyles: true,
  });

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={getCoreTranslation('printIdentifierSticker', 'Print identifier sticker')}
      />
      <ModalBody>
        <div ref={contentToPrintRef}>
          <style type="text/css" media="print">
            {`
              @page {
                size: ${pageSize};
              }
            `}
          </style>
          <PrintComponent patient={patient} />
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
    </>
  );
};

interface PrintComponentProps extends Partial<ConfigObject> {
  patient: fhir.Patient;
}

const PrintComponent = ({ patient }: PrintComponentProps) => {
  const { t } = useTranslation();
  const { printPatientSticker } = useConfig<ConfigObject>();
  return (
    <div className={styles.stickerContainer}>
      <div className={styles.documentHeader}>
        <Barcode value={'100001'} {...defaultBarcodeParams} />
        <ImplementationLogo />
      </div>
      {printPatientSticker.fields.map((field) => {
        const Component = getPatientField(field);
        return <Component key={field} patient={patient} />;
      })}
    </div>
  );
};

const ImplementationLogo: React.FC = () => {
  const { t } = useTranslation();
  const { printPatientSticker } = useConfig<ConfigObject>();
  return printPatientSticker.logo ? (
    <span>{printPatientSticker.logo}</span>
  ) : (
    <svg role="img">
      <title>{t('openmrsLogo', 'OpenMRS logo')}</title>
      <use href="#omrs-logo-full-color"></use>
    </svg>
  );
};

export default PrintIdentifierSticker;
