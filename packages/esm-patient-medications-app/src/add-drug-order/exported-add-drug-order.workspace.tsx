import React, { useCallback } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps, type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import AddDrugOrder from './add-drug-order.component';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order?: DrugOrderBasketItem;
  orderToEditOrdererUuid?: string;
}

/**
 * This workspace is meant for use outside the patient chart
 * @see add-drug-order.workspace.tsx
 */
export default function ExportedAddDrugOrderWorkspace({
  workspaceProps: { order, orderToEditOrdererUuid },
  windowProps: { patient, patientUuid, visitContext, allergyFormWorkspaceName },
  closeWorkspace,
  launchChildWorkspace,
}: Workspace2DefinitionProps<AddDrugOrderWorkspaceAdditionalProps, ExportedOrderBasketWindowProps>) {
  // When the host registers an allergy form workspace in this window, launch it as a child so the
  // "+" allergy affordance opens the form in the host's workspace group rather than the chart's.
  const launchAllergyForm = useCallback(
    () => launchChildWorkspace(allergyFormWorkspaceName, { formContext: 'creating' }),
    [allergyFormWorkspaceName, launchChildWorkspace],
  );

  return (
    <AddDrugOrder
      initialOrder={order}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
      launchAllergyForm={allergyFormWorkspaceName ? launchAllergyForm : undefined}
    />
  );
}
