import React, { useEffect, useState } from 'react';
import styles from './result-form.scss';
import { Button, InlineLoading, ModalBody, ModalFooter } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showNotification, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useGetOrderConceptByUuid, UpdateOrderResult, fetchEncounter, fetchObservation } from './result-form.resource';
import ResultFormField from './result-form-field.component';
import { useForm } from 'react-hook-form';
import { type DefaultWorkspaceProps, type Order } from '@openmrs/esm-patient-common-lib';

export interface AddResultsWorkspaceAdditionalProps {
  order: Order;
}
export interface AddResultsWorkspace extends DefaultWorkspaceProps, AddResultsWorkspaceAdditionalProps {}

const ResultForm: React.FC<AddResultsWorkspace> = ({
  order,
  patientUuid,
  closeWorkspace,
  promptBeforeClosing,
}: AddResultsWorkspace) => {
  // console.log('ResultForm order', order);
  const [inEditMode, setInEditMode] = useState(false);
  const [obsUuid, setObsUuid] = useState('');
  const [initialValues, setInitialValues] = useState(null);
  const [isLoadingInitialValues, setIsLoadingInitialValues] = useState(false);

  const config = useConfig();
  const { t } = useTranslation();
  const { concept, isLoading: isLoadingConcepts } = useGetOrderConceptByUuid(order.concept.uuid);
  // console.log('ResultForm concept', concept);
  const {
    control,
    register,
    formState: { isSubmitting, errors, isDirty },
    getValues,
    handleSubmit,
  } = useForm<{ testResult: any }>({
    defaultValues: {},
  });

  const cancelResults = () => {
    closeWorkspace();
  };
  useEffect(() => {
    fetchEncounter(order.encounter.uuid).then((data) => {
      const observation = data?.obs;
      if (observation?.length && observation.some((obs) => obs.order?.uuid === order.uuid)) {
        setInEditMode(true);
        setObsUuid(observation.find((obs) => obs.order?.uuid === order.uuid).uuid);
      }
    });
  }, []);
  useEffect(() => {
    if (inEditMode) {
      setIsLoadingInitialValues(true);
      fetchObservation(obsUuid).then((data) => {
        if (data) {
          setInitialValues(data);
        }
        setIsLoadingInitialValues(false);
      });
    }
  }, [inEditMode]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  if (isLoadingConcepts) {
    return <InlineLoading iconDescription="Loading" description="Loading test details" status="active" />;
  }

  const onSubmit = (data, e) => {
    e.preventDefault();

    let obsValue = [];
    if (concept.set && concept.setMembers.length > 0) {
      let groupMembers = [];
      concept.setMembers.forEach((member) => {
        let value;
        if (member.datatype.display === 'Numeric' || member.datatype.display === 'Text') {
          value = getValues()[`${member.uuid}`];
        } else if (member.datatype.display === 'Coded') {
          value = {
            uuid: getValues()[`${member.uuid}`],
          };
        }
        const groupMember = {
          concept: { uuid: member.uuid },
          value: value,
          status: inEditMode ? config.obsStatuses.amended : config.obsStatuses.preliminary,
          order: { uuid: order.uuid },
        };
        groupMembers.push(groupMember);
      });

      obsValue.push({
        concept: { uuid: order.concept.uuid },
        status: inEditMode ? config.obsStatuses.amended : config.obsStatuses.preliminary,
        order: { uuid: order.uuid },
        groupMembers: groupMembers,
      });
    } else if (!concept.set && concept.setMembers.length === 0) {
      let value;
      if (concept.datatype.display === 'Numeric' || concept.datatype.display === 'Text') {
        value = getValues()[`${concept.uuid}`];
      } else if (concept.datatype.display === 'Coded') {
        value = {
          uuid: getValues()[`${concept.uuid}`],
        };
      }

      obsValue.push({
        concept: { uuid: order.concept.uuid },
        status: inEditMode ? config.obsStatuses.amended : config.obsStatuses.preliminary,
        order: { uuid: order.uuid },
        value: value,
      });
    }

    const obsPayload = inEditMode
      ? obsValue[0]
      : {
          obs: obsValue,
        };

    const resultsStatusPayload = {
      fulfillerStatus: config.fulfillerStatuses.completed,
      fulfillerComment: 'Test Results Entered',
    };

    UpdateOrderResult(order.uuid, order.encounter.uuid, obsUuid, obsPayload, resultsStatusPayload).then(
      () => {
        showSnackbar({
          isLowContrast: true,
          title: t('updateEncounter', 'Update lab results'),
          kind: 'success',
          subtitle: t('generateSuccessfully', 'You have successfully updated test results'),
        });
        closeWorkspace();
      },
      (err) => {
        showNotification({
          title: t(`errorUpdatingEncounter', 'Error occurred while updating test results`),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
  };
  return (
    <>
      <ModalBody>
        {/* // we need to display test name for test panels */}
        {concept.setMembers.length > 0 && <div>{concept.display}</div>}
        {concept && (
          <section className={styles.section}>
            {!isLoadingInitialValues ? (
              <form>
                <ResultFormField
                  defaultValue={initialValues}
                  register={register}
                  concept={concept}
                  control={control}
                  errors={errors}
                />
              </form>
            ) : (
              <InlineLoading description={t('loadingInitialValues', 'Loading Initial Values') + '...'} />
            )}
          </section>
        )}
      </ModalBody>

      <ModalFooter>
        <Button disabled={isSubmitting} onClick={cancelResults} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Test Results</Button>
      </ModalFooter>
    </>
  );
};

export default ResultForm;
