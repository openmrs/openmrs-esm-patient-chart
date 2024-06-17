import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { age, displayName, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker-modal.scss';

interface PrintIdentifierStickerProps {
  closeModal: () => void;
  patient: fhir.Patient;
}

interface PrintComponentProps extends Partial<ConfigObject> {
  patientDetails: {
    address?: fhir.Address[];
    age?: string;
    dateOfBirth?: string;
    gender?: string;
    id?: string;
    identifiers?: fhir.Identifier[];
    name?: string;
    photo?: fhir.Attachment[];
  };
  printRef: React.RefObject<HTMLDivElement>;
  t: TFunction;
}

const PrintIdentifierSticker: React.FC<PrintIdentifierStickerProps> = ({ closeModal, patient }) => {
  const { t } = useTranslation();
  const { printIdentifierStickerFields, printIdentifierStickerSize, excludePatientIdentifierCodeTypes } =
    useConfig<ConfigObject>();
  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef<() => void | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const headerTitle = t('patientIdentifierSticker', 'Patient identifier sticker');

  useEffect(() => {
    if (isPrinting && onBeforeGetContentResolve.current) {
      onBeforeGetContentResolve.current();
    }
  }, [isPrinting, printIdentifierStickerSize]);

  const patientDetails = useMemo(() => {
    if (!patient) {
      return {};
    }

    const getGender = (gender: string): string => {
      switch (gender) {
        case 'male':
          return t('male', 'Male');
        case 'female':
          return t('female', 'Female');
        case 'other':
          return t('other', 'Other');
        case 'unknown':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    };

    const identifiers =
      patient.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      address: patient.address,
      age: age(patient.birthDate),
      dateOfBirth: patient.birthDate,
      gender: getGender(patient.gender),
      id: patient.id,
      identifiers: [...identifiers],
      name: patient ? displayName(patient) : '',
      photo: patient.photo,
    };
  }, [excludePatientIdentifierCodeTypes?.uuids, patient, t]);

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

  const handlePrintError = useCallback(
    (errorLocation, error) => {
      onBeforeGetContentResolve.current = null;

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('printError', 'Print error'),
        subtitle: t('printErrorExplainer', 'An error occurred in "{{errorLocation}}": ', { errorLocation }) + error,
      });

      setIsPrinting(false);
    },
    [t],
  );

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `${patientDetails.name} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleBeforeGetContent,
    onPrintError: handlePrintError,
  });

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('printIdentifierSticker', 'Print identifier sticker')} />
      <ModalBody>
        <PrintComponent
          patientDetails={patientDetails}
          printIdentifierStickerFields={printIdentifierStickerFields}
          printIdentifierStickerSize={printIdentifierStickerSize}
          printRef={contentToPrintRef}
          t={t}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isPrinting} onClick={handlePrint} kind="primary">
          {isPrinting ? (
            <InlineLoading className={styles.loader} description={t('printing', 'Printing') + '...'} />
          ) : (
            t('print', 'Print')
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

const PrintComponent = ({
  patientDetails,
  printIdentifierStickerFields,
  printIdentifierStickerSize,
  printRef,
  t,
}: PrintComponentProps) => {
  return (
    <div className={styles.stickerContainer} ref={printRef}>
      <style type="text/css" media="print">
        {`
          @page {
            size: ${printIdentifierStickerSize};
          }
        `}
      </style>
      {printIdentifierStickerFields.includes('name') && <div className={styles.patientName}>{patientDetails.name}</div>}
      <div className={styles.detailsGrid}>
        {patientDetails.identifiers.map((identifier) => {
          return (
            <p key={identifier?.id}>
              {identifier?.type?.text}: <strong>{identifier?.value}</strong>
            </p>
          );
        })}
        <p>
          {t('sex', 'Sex')}: <strong>{patientDetails.gender}</strong>
        </p>
        <p>
          {t('dob', 'DOB')}: <strong>{patientDetails.dateOfBirth}</strong>
        </p>
        <p>
          {t('age', 'Age')}: <strong>{patientDetails.age}</strong>
        </p>
      </div>
    </div>
  );
};

export default PrintIdentifierSticker;
