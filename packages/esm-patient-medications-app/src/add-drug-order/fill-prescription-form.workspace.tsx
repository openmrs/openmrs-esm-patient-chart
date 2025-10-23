import React, { useCallback } from 'react';
import { type DrugOrderBasketItem } from '../types';
import {
  type ConfigObject,
  type DefaultWorkspaceProps,
  showSnackbar,
  useConfig,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import { type EncounterPost, postEncounter } from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '../api';
import DrugOrderForm from './drug-order-form.component';
import { useTranslation } from 'react-i18next';

export interface OrderBasketDrugOrderFormProps extends DefaultWorkspaceProps {
  patient: fhir.Patient;
}

/**
 * This form is meant for backfilling prescriptions from paper forms, and is similar to the drug order form in the
 * order basket, except:
 * - it contains additional fields select the drug (inline), the prescribing clinician and the prescribing date.
 * - when submitting the form, it directly submits the order instead of saving to the order basket
 *
 * This component is not used in the medications app itself, but is intended to be used in other apps
 * (like dispensing).
 */
const FillPrescriptionForm: React.FC<OrderBasketDrugOrderFormProps> = ({
  patient,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { sessionLocation } = useSession();
  const { t } = useTranslation();
  const { drugOrderEncounterType } = useConfig<ConfigObject>();
  const patientUuid = patient.id;
  const { activeVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);

  const submitDrugOrder = useCallback(
    async (finalizedOrder: DrugOrderBasketItem) => {
      const drugOrderPost = prepMedicationOrderPostData(finalizedOrder, patientUuid, null);
      const encounter: EncounterPost = {
        patient: patientUuid,
        location: sessionLocation.uuid,
        encounterType: drugOrderEncounterType,
        encounterDatetime: new Date(),
        visit: null, // let the server's logic associate the encounter with a visit
        obs: [],
        orders: [drugOrderPost],
      };
      try {
        await postEncounter(encounter);
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('orderCompleted', 'Placed orders'),
          subtitle: t('ordered', 'Placed order for {{order}}', {
            order: finalizedOrder.drug.display,
          }),
        });
        closeWorkspaceWithSavedChanges();
      } catch (e) {
        showSnackbar({
          isLowContrast: true,
          kind: 'error',
          title: t('saveDrugOrderFailed', 'Error ordering {{orderName}}', {
            orderName: finalizedOrder.drug.display,
          }),
          subtitle: e?.message,
        });
      }
    },
    [patientUuid, closeWorkspaceWithSavedChanges, sessionLocation.uuid, t, drugOrderEncounterType],
  );

  if (!isLoadingVisit && !activeVisit) {
    return (
      <div>
        {t('visitRequiredForFillingPrescription', 'Patient is required to have an active visit to fill prescription')}
      </div>
    );
  }
  return (
    <DrugOrderForm
      initialOrderBasketItem={{ action: 'NEW' } as DrugOrderBasketItem}
      patient={patient}
      onSave={submitDrugOrder}
      saveButtonText={t('fillPrescription', 'Fill prescription')}
      onCancel={closeWorkspace}
      promptBeforeClosing={promptBeforeClosing}
      allowSelectingPrescribingClinician={true}
      allowSelectingDrug={true}
    />
  );
};

export default FillPrescriptionForm;
