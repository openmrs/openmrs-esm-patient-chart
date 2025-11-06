import React, { useCallback } from 'react';
import {
  type ConfigObject,
  type DefaultWorkspaceProps,
  showSnackbar,
  useConfig,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import { type DrugOrderBasketItem, type EncounterPost, postEncounter } from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '../api';
import DrugOrderForm from './drug-order-form.component';
import { useTranslation } from 'react-i18next';

export interface FillPrescriptionFormProps extends DefaultWorkspaceProps {
  patient: fhir.Patient;
  onAfterSave?(patient: fhir.Patient, encounterUuid: string);
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
const FillPrescriptionForm: React.FC<FillPrescriptionFormProps> = ({
  patient,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  onAfterSave,
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
        const encounterUuid = await postEncounter(encounter);
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('orderCompleted', 'Placed orders'),
          subtitle: t('ordered', 'Placed order for {{order}}', {
            order: finalizedOrder.drug.display,
          }),
        });
        closeWorkspaceWithSavedChanges();
        onAfterSave?.(patient, encounterUuid);
      } catch (e) {
        showSnackbar({
          isLowContrast: true,
          kind: 'error',
          title: t('saveDrugOrderFailed', 'Error ordering {{orderName}}', {
            orderName: finalizedOrder.drug.display,
          }),
          subtitle: e?.responseBody?.error?.translatedMessage ?? e?.responseBody?.error?.message,
        });
      }
    },
    [
      patientUuid,
      closeWorkspaceWithSavedChanges,
      sessionLocation.uuid,
      t,
      drugOrderEncounterType,
      onAfterSave,
      patient,
    ],
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
      allowSelectingPrescribingClinician={true}
      visitContext={activeVisit}
      allowSelectingDrug={true}
      setHasUnsavedChanges={function (hasUnsavedChanges: boolean): void {
        throw new Error('Function not implemented.');
      }}
    />
  );
};

export default FillPrescriptionForm;
