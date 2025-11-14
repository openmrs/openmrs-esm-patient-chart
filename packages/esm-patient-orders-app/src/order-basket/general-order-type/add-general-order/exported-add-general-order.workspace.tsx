import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import AddGeneralOrder from './add-general-order.component';

interface OrderableConceptSearchWorkspaceProps {
  order: OrderBasketItem;
  orderTypeUuid: string;
}

/**
 * This workspace displays the drug order form for adding or editing a general order.
 */
const ExportedAddGeneralOrderWorkspace: React.FC<
  Workspace2DefinitionProps<OrderableConceptSearchWorkspaceProps, ExportedOrderBasketWindowProps, {}>
> = ({
  workspaceProps: { order: initialOrder, orderTypeUuid },
  windowProps: { patient, visitContext },
  closeWorkspace,
}) => {
  return (
    <AddGeneralOrder
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      patient={patient}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
    />
  );
};

export default ExportedAddGeneralOrderWorkspace;
