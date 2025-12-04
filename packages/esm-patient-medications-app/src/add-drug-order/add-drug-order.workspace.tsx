import React from 'react';
import {
  type DrugOrderBasketItem,
  type OrderBasketWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import AddDrugOrder from './add-drug-order.component';

export interface AddDrugOrderWorkspaceProps {
  order: DrugOrderBasketItem;
}

/**
 * This workspace displays the drug order form for adding or editing a drug order.
 * On form submission, it saves the drug order to the (frontend) order basket.
 * For a form that submits the drug order directly on submit,
 * see fill-prescription-form.workspace.tsx
 *
 * This workspace must only be used within the patient chart.
 * @see exported-add-drug-order.workspace.tsx
 */
export default function AddDrugOrderWorkspace({
  workspaceProps: { order: initialOrder },
  groupProps: { patient, patientUuid, visitContext },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddDrugOrderWorkspaceProps, OrderBasketWindowProps>) {
  return (
    <AddDrugOrder
      initialOrder={initialOrder}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
    />
  );
}
