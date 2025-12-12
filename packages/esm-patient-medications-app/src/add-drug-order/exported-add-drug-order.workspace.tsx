import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps, type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import AddDrugOrder from './add-drug-order.component';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

/**
 * This workspace is meant for use outside the patient chart
 * @see add-drug-order.workspace.tsx
 */
export default function ExportedAddDrugOrderWorkspace({
  workspaceProps: { order: initialOrder },
  windowProps: { patient, patientUuid, visitContext },
  closeWorkspace,
}: Workspace2DefinitionProps<AddDrugOrderWorkspaceAdditionalProps, ExportedOrderBasketWindowProps, {}>) {
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
