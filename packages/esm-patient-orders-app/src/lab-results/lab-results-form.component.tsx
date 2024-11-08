import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import { type DefaultPatientWorkspaceProps, type Order } from '@openmrs/esm-patient-common-lib';
import { restBaseUrl, showSnackbar, useAbortController, useLayoutType } from '@openmrs/esm-framework';
import {
  useOrderConceptByUuid,
  updateOrderResult,
  useLabEncounter,
  useObservation,
  createObservationPayload,
  LabOrderConcept,
  updateObservation,
  useCompletedLabResults,
  isCoded,
  isNumeric,
  isText,
  isPanel,
} from './lab-results.resource';
import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';
import { useLabResultsFormSchema } from './useLabResultsFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export interface LabResultsFormProps extends DefaultPatientWorkspaceProps {
  order: Order;
}

const LabResultsForm: React.FC<LabResultsFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  order,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const abortController = useAbortController();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingConcepts } = useOrderConceptByUuid(order.concept.uuid);
  const [showEmptyFormErrorNotification, setShowEmptyFormErrorNotification] = useState(false);
  const schema = useLabResultsFormSchema(order.concept.uuid);
  const { completeLabResult, error, isLoading, mutate: mutateResults } = useCompletedLabResults(order);
  const mutateOrderData = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${order.patient.uuid}`),
      undefined,
      { revalidate: true },
    );
  }, [order.patient.uuid]);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<{ testResult: Record<string, unknown> }>({
    defaultValues: {},
    resolver: zodResolver(schema),
    mode: 'all',
  });

  useEffect(() => {
    if (concept && completeLabResult && order?.fulfillerStatus === 'COMPLETED') {
      if (isCoded(concept) && completeLabResult?.value?.uuid) {
        setValue(concept.uuid as any, completeLabResult?.value?.uuid);
      } else if (isNumeric(concept) && completeLabResult?.value) {
        setValue(concept.uuid as any, parseFloat(completeLabResult?.value as any));
      } else if (isText(concept) && completeLabResult?.value) {
        setValue(concept.uuid as any, completeLabResult?.value);
      } else if (isPanel(concept)) {
        concept.setMembers.forEach((member) => {
          const obs = completeLabResult.groupMembers.find((v) => v.concept.uuid === member.uuid);
          let value: any;
          if (isCoded(member)) {
            value = obs?.value?.uuid;
          } else if (isNumeric(member)) {
            value = obs?.value ? parseFloat(obs?.value as any) : undefined;
          } else if (isText(member)) {
            value = obs?.value;
          }
          if (value) setValue(member.uuid as any, value);
        });
      }
    }
  }, [concept, completeLabResult, order, setValue]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  if (isLoadingConcepts) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading
          className={styles.loader}
          description={t('loadingTestDetails', 'Loading test details') + '...'}
          iconDescription={t('loading', 'Loading')}
          status="active"
        />
      </div>
    );
  }

  const saveLabResults = async (formValues: Record<string, unknown>) => {
    const isEmptyForm = Object.values(formValues).every(
      (value) => value === '' || value === null || value === undefined,
    );
    if (isEmptyForm) {
      setShowEmptyFormErrorNotification(true);
      return;
    }

    const showNotification = (kind: 'error' | 'success', message: string) => {
      showSnackbar({
        title:
          kind === 'success'
            ? t('saveLabResults', 'Save lab results')
            : t('errorSavingLabResults', 'Error saving lab results'),
        kind: kind,
        subtitle: message,
      });
    };

    // Handle update operation for completed lab order results
    if (order.fulfillerStatus === 'COMPLETED') {
      const updateTasks = Object.entries(formValues).map(([conceptUuid, value]) => {
        const obs = completeLabResult?.groupMembers?.find((v) => v.concept.uuid === conceptUuid) ?? completeLabResult;
        return updateObservation(obs?.uuid, { value });
      });
      const updateResults = await Promise.allSettled(updateTasks);
      const failedObsconceptUuids = updateResults.reduce((prev, curr, index) => {
        if (curr.status === 'rejected') {
          return [...prev, Object.keys(formValues).at(index)];
        }
        return prev;
      }, []);

      if (failedObsconceptUuids.length) {
        showNotification('error', 'Could not save obs with concept uuids ' + failedObsconceptUuids.join(', '));
      } else {
        closeWorkspaceWithSavedChanges();
        showNotification(
          'success',
          t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
            orderNumber: order?.orderNumber,
          }),
        );
      }
      mutateResults();
      return setShowEmptyFormErrorNotification(false);
    }

    // Handle Creation logic

    // Set the observation status to 'FINAL' as we're not capturing it in the form
    const obsPayload = createObservationPayload(concept, order, formValues, 'FINAL');
    const orderDiscontinuationPayload = {
      previousOrder: order.uuid,
      type: 'testorder',
      action: 'DISCONTINUE',
      careSetting: order.careSetting.uuid,
      encounter: order.encounter.uuid,
      patient: order.patient.uuid,
      concept: order.concept.uuid,
      orderer: order.orderer,
    };
    const resultsStatusPayload = {
      fulfillerStatus: 'COMPLETED',
      fulfillerComment: 'Test Results Entered',
    };

    try {
      await updateOrderResult(
        order.uuid,
        order.encounter.uuid,
        obsPayload,
        resultsStatusPayload,
        orderDiscontinuationPayload,
        abortController,
      );
      closeWorkspaceWithSavedChanges();
      mutateResults();
      mutateOrderData();
      showNotification(
        'success',
        t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
          orderNumber: order?.orderNumber,
        }),
      );
    } catch (err) {
      showNotification('error', err?.message);
    } finally {
      setShowEmptyFormErrorNotification(false);
    }
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(saveLabResults)}>
      <div className={styles.grid}>
        {concept.setMembers.length > 0 && <p className={styles.heading}>{concept.display}</p>}
        {concept && (
          <Stack gap={5}>
            {!isLoading ? (
              <ResultFormField defaultValue={completeLabResult} concept={concept} control={control} errors={errors} />
            ) : (
              <InlineLoading description={t('loadingInitialValues', 'Loading initial values') + '...'} />
            )}
          </Stack>
        )}
        {showEmptyFormErrorNotification && (
          <InlineNotification
            className={styles.emptyFormError}
            lowContrast
            title={t('error', 'Error')}
            subtitle={t('pleaseFillField', 'Please fill at least one field') + '.'}
          />
        )}
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" disabled={isSubmitting} onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          type="submit"
        >
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            t('saveAndClose', 'Save and close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default LabResultsForm;
