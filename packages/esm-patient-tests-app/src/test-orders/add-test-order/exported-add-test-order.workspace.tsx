import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import AddLabOrder from './add-test-order.component';

export interface AddTestOrderWorkspaceProps {
  order?: OrderBasketItem;
  orderTypeUuid: string;
}

/**
 * This workspace displays the labs order form for adding or editing a labs order.
 *
 * Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
 */
export default function ExportedAddTestOrderWorkspace({
  windowProps: { patient, visitContext },
  workspaceProps: { order: initialOrder, orderTypeUuid },
  closeWorkspace,
}: Workspace2DefinitionProps<AddTestOrderWorkspaceProps, ExportedOrderBasketWindowProps, {}>) {
  return (
    <AddLabOrder
      patient={patient}
      visitContext={visitContext}
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      closeWorkspace={closeWorkspace}
    />
  );
}
