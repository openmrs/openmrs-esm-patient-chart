import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import AddLabOrder from './add-test-order.component';

export interface AddTestOrderWorkspaceProps {
  order?: OrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
  orderTypeUuid: string;
}

/**
 * This workspace is meant for use outside the patient chart.
 *
 * @see add-test-order.workspace.tsx
 */
export default function ExportedAddTestOrderWorkspace({
  windowProps: { patient, visitContext },
  workspaceProps: { order: initialOrder, orderTypeUuid, orderToEditOrdererUuid },
  closeWorkspace,
}: Workspace2DefinitionProps<AddTestOrderWorkspaceProps, ExportedOrderBasketWindowProps, {}>) {
  return (
    <AddLabOrder
      patient={patient}
      visitContext={visitContext}
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      closeWorkspace={closeWorkspace}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
    />
  );
}
