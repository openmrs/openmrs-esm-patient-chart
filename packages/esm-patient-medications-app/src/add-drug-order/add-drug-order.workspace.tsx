import React from 'react';
import {
  type DrugOrderBasketItem,
  type OrderBasketWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import AddDrugOrder from './add-drug-order.component';

export interface AddDrugOrderWorkspaceProps {
  /**
   * Optional. If provided, the form edits this order. Note that this order could either
   * be an already submitted order that the user wants to modify, or a NEW pending order in
   * the order basket. To distinguish the two, check order.action.
   */
  order?: DrugOrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
}

/**
 * This workspace displays the drug order form for:
 * 1. adding a new drug order
 * 2. editing a pending (un-submitted) drug order in the order basket
 * 3. editing an existing (submitted) order
 *
 * On form save, it either saves the order in the order basket (case 1 and 2)
 * or directly submits the modified order to the server (case 3).
 *
 *
 * This workspace must only be used within the patient chart.
 * @see exported-add-drug-order.workspace.tsx
 */
export default function AddDrugOrderWorkspace({
  workspaceProps: { order, orderToEditOrdererUuid },
  groupProps: { patient, patientUuid, visitContext },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddDrugOrderWorkspaceProps, OrderBasketWindowProps>) {
  return (
    <AddDrugOrder
      initialOrder={order}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
    />
  );
}
