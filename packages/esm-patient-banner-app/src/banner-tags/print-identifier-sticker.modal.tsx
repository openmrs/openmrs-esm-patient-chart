import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { age, getPatientName, showSnackbar, useConfig, getCoreTranslation } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker.scss';

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
  }, [isPrinting]);

  const patientDetails = useMemo(() => {
    if (!patient) {
      return {};
    }

    const getGender = (gender: string): string => {
      switch (gender) {
        case 'male':
          return getCoreTranslation('male', 'Male');
        case 'female':
          return getCoreTranslation('female', 'Female');
        case 'other':
          return getCoreTranslation('other', 'Other');
        case 'unknown':
          return getCoreTranslation('unknown', 'Unknown');
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
      name: patient ? getPatientName(patient) : '',
      photo: patient.photo,
    };
  }, [excludePatientIdentifierCodeTypes?.uuids, patient]);

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
    documentTitle: `${patientDetails.name} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleBeforeGetContent,
    onPrintError: handlePrintError,
  } as any);

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
                size: ${printIdentifierStickerSize};
              }
            `}
          </style>
          <PrintComponent
            patientDetails={patientDetails}
            printIdentifierStickerFields={printIdentifierStickerFields}
            t={t}
          />
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

const PrintComponent = ({ patientDetails, printIdentifierStickerFields, t }: PrintComponentProps) => {
  return (
    <div className={styles.stickerContainer}>
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
          {getCoreTranslation('sex', 'Sex')}: <strong>{patientDetails.gender}</strong>
        </p>
        <p>
          {t('dob', 'DOB')}: <strong>{patientDetails.dateOfBirth}</strong>
        </p>
        <p>
          {getCoreTranslation('age', 'Age')}: <strong>{patientDetails.age}</strong>
        </p>
      </div>
    </div>
  );
};

export default PrintIdentifierSticker;
