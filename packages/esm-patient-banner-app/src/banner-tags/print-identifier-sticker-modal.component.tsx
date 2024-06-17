import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, Column, Grid, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { age, displayName, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker-modal.scss';

interface PrintIdentifierStickerProps {
  closeModal: () => void;
  patient: fhir.Patient;
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

      document.documentElement.style.setProperty('--print-identifier-sticker-size', printIdentifierStickerSize);
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
          const printStyles = `@media print { @page { size: ${printIdentifierStickerSize}; } }`;

          const style = document.createElement('style');
          style.appendChild(document.createTextNode(printStyles));

          document.head.appendChild(style);
        }
      }),
    [headerTitle, patient, printIdentifierStickerSize],
  );

  const handleAfterPrint = useCallback(() => {
    onBeforeGetContentResolve.current = null;
    setIsPrinting(false);
    closeModal();
  }, [closeModal]);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `${patientDetails.name} - ${headerTitle}`,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleBeforeGetContent,
    onPrintError: (errorLocation, error) => {
      onBeforeGetContentResolve.current = null;

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('printError', 'Print error'),
        subtitle: t('printErrorExplainer', 'An error occurred in "{{errorLocation}}": ', { errorLocation }) + error,
      });

      setIsPrinting(false);
    },
  });

  const renderElementsInPairs = (elements) => {
    const pairs = [];
    let currentPair = [];

    const getKey = (element) => {
      if (element?.props?.children?.key?.startsWith('identifier-text')) {
        return 'identifier';
      }
      return element?.key;
    };

    const filteredElements = elements.filter((element) => {
      return printIdentifierStickerFields.includes(getKey(element));
    });

    filteredElements.forEach((element) => {
      if (element) {
        currentPair.push(element);
        if (currentPair.length === 2) {
          pairs.push(currentPair);
          currentPair = [];
        }
      }
    });

    if (currentPair.length === 1) {
      pairs.push(currentPair);
    }

    return pairs;
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('printIdentifierSticker', 'Print identifier sticker')} />
      <ModalBody>
        <div className={styles.stickerContainer} ref={contentToPrintRef}>
          {printIdentifierStickerFields.includes('name') && (
            <div key="name" className={styles.patientName}>
              {patientDetails?.name}
            </div>
          )}
          {renderElementsInPairs(
            [
              patientDetails?.identifiers?.map((identifier, index) => (
                <div key={`identifier-${index}`}>
                  <p key={`identifier-text-${index}`}>
                    {identifier?.type?.text}: <strong>{identifier?.value}</strong>
                  </p>
                </div>
              )),
              <p key="gender">
                {t('sex', 'Sex')}: <strong>{patientDetails?.gender}</strong>
              </p>,
              <p key="dateOfBirth">
                {t('dob', 'DOB')}: <strong>{patientDetails?.dateOfBirth}</strong>
              </p>,
              <p key="age">
                {t('age', 'Age')}: <strong>{patientDetails?.age}</strong>
              </p>,
            ].flat(),
          ).map((pair, index) => (
            <Grid className={styles.gridRow} key={`grid-${index}`}>
              <Column lg={8} md={4} sm={4}>
                <div key={`pair-0-${index}`}>{pair[0]}</div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div key={`pair-1-${index}`}>{pair[1] || <div />}</div>
              </Column>
            </Grid>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isPrinting} onClick={handlePrint} kind="primary">
          {isPrinting ? <InlineLoading description={t('printing', 'Printing') + '...'} /> : t('print', 'Print')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default PrintIdentifierSticker;
