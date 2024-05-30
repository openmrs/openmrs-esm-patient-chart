import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { FormEngine } from '@openmrs/openmrs-form-engine-lib';
import { age, displayName, showModal, showSnackbar, useConfig, type Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace, type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

import FormError from './form-error.component';
import PrintComponent from '../form-print/print.component';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';

interface FormRendererProps extends DefaultPatientWorkspaceProps {
  additionalProps?: Record<string, any>;
  encounterUuid?: string;
  formUuid: string;
  patient: fhir.Patient;
  patientUuid: string;
  visit?: Visit;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  additionalProps,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  encounterUuid,
  formUuid,
  patient,
  patientUuid,
  promptBeforeClosing,
  visit,
}) => {
  const { t } = useTranslation();
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef<(() => void) | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { printOptions } = useConfig<ConfigObject>();
  const { excludePatientIdentifierCodeTypes } = useConfig<{
    excludePatientIdentifierCodeTypes: {
      uuids: string[];
    };
  }>({
    externalModuleName: '@openmrs/esm-patient-banner-app',
  });

  const handleCloseForm = useCallback(() => {
    closeWorkspace();
    !encounterUuid && launchPatientWorkspace('clinical-forms-workspace');
  }, [closeWorkspace, encounterUuid]);

  const handleConfirmQuestionDeletion = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const dispose = showModal('form-engine-delete-question-confirm-modal', {
        onCancel() {
          dispose();
          reject();
        },
        onConfirm() {
          dispose();
          resolve();
        },
      });
    });
  }, []);

  const handleMarkFormAsDirty = useCallback(
    (isDirty: boolean) => promptBeforeClosing(() => isDirty),
    [promptBeforeClosing],
  );

  useEffect(() => {
    if (typeof onBeforeGetContentResolve.current === 'function') {
      onBeforeGetContentResolve.current();
    }
  }, [onBeforeGetContentResolve]);

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
      age: age(patient.birthDate),
      gender: getGender(patient.gender),
      identifiers: [...identifiers],
      location: patient.address?.[0].city,
      name: patient ? displayName(patient) : '',
    };
  }, [excludePatientIdentifierCodeTypes?.uuids, patient, t]);

  const handleOnBeforeGetContent = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (patient && schema) {
          setIsPrinting(true);
          onBeforeGetContentResolve.current = resolve;

          setTimeout(() => {
            setIsPrinting(false);
            resolve();
          }, 2000);
        }
      }),
    [patient, schema],
  );

  const handleAfterPrint = useCallback(() => {
    onBeforeGetContentResolve.current = null;
    setIsPrinting(false);
  }, []);

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
    documentTitle: schema?.name,
    onAfterPrint: handleAfterPrint,
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: handlePrintError,
  });

  useEffect(() => {
    if (typeof onBeforeGetContentResolve.current === 'function') {
      onBeforeGetContentResolve.current();
    }
  }, [onBeforeGetContentResolve]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FormError closeWorkspace={handleCloseForm} />
      </div>
    );
  }

  return (
    <>
      {printOptions?.showPrintButton && schema && additionalProps?.mode === 'view' && (
        <Button
          className={styles.printButton}
          disabled={isPrinting}
          iconDescription={t('printForm', 'Print form')}
          kind="ghost"
          onClick={handlePrint}
          renderIcon={(props) => <Printer {...props} />}
        >
          <span>{isPrinting ? t('printing', 'Printing') + '...' : t('print', 'Print')}</span>
        </Button>
      )}
      {schema && (
        <div ref={contentToPrintRef}>
          <PrintComponent key={formUuid} formName={schema?.name} patientDetails={patientDetails} />
          <FormEngine
            encounterUUID={encounterUuid}
            formJson={schema}
            formSessionIntent={additionalProps?.formSessionIntent}
            handleClose={handleCloseForm}
            handleConfirmQuestionDeletion={handleConfirmQuestionDeletion}
            markFormAsDirty={handleMarkFormAsDirty}
            mode={additionalProps?.mode}
            onSubmit={closeWorkspaceWithSavedChanges}
            patientUUID={patientUuid}
            visit={visit}
          />
        </div>
      )}
    </>
  );
};

export default FormRenderer;
