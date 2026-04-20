import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import { type AddTestOrderWorkspaceProps } from './add-test-order.workspace';
import AddLabOrder from './add-test-order.component';

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
