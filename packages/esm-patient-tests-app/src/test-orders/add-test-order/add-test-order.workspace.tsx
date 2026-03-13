import React from 'react';
import {
  type OrderBasketWindowProps,
  type OrderBasketItem,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import AddLabOrder from './add-test-order.component';

export interface AddTestOrderWorkspaceProps {
  order?: OrderBasketItem;
  orderTypeUuid?: string;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
}

/**
 * This workspace displays the labs order form for adding or editing a labs order.
 *
 * Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
 *
 * This workspace must only be used within the patient chart.
 * @see exported-add-test-order.workspace.tsx
 */
export default function AddTestOrderWorkspace({
  groupProps: { patient, visitContext },
  workspaceProps: { order: initialOrder, orderTypeUuid, orderToEditOrdererUuid },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddTestOrderWorkspaceProps, OrderBasketWindowProps>) {
  return (
    <AddLabOrder
      patient={patient}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
      visitContext={visitContext}
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      closeWorkspace={closeWorkspace}
    />
  );
}
