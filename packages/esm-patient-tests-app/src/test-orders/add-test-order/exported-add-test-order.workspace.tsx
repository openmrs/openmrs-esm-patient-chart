import React from 'react';
import { usePatient, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import { type AddTestOrderWorkspaceProps } from './add-test-order.workspace';
import AddLabOrder from './add-test-order.component';

/**
 * This workspace is meant for use outside the patient chart.
 *
 * @see add-test-order.workspace.tsx
 */
export default function ExportedAddTestOrderWorkspace({
  windowProps: { patient: windowPatient, visitContext },
  workspaceProps: { order: initialOrder, orderTypeUuid, orderToEditOrdererUuid },
  closeWorkspace,
}: Workspace2DefinitionProps<AddTestOrderWorkspaceProps, ExportedOrderBasketWindowProps, {}>) {
  const patientUuid = (windowPatient as { uuid?: string })?.uuid ?? windowPatient?.id;
  const { patient, isLoading } = usePatient(patientUuid);

  if (isLoading || !patient) {
    return null;
  }

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
