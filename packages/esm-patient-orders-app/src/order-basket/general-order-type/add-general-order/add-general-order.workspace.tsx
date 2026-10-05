import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type OrderBasketItem, type OrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import AddGeneralOrder from './add-general-order.component';

interface OrderableConceptSearchWorkspaceProps {
  order: OrderBasketItem;
  orderTypeUuid: string;
}

/**
 * This workspace displays the order form for adding or editing a general order.
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart.
 */
const AddGeneralOrderWorkspace: React.FC<
  Workspace2DefinitionProps<OrderableConceptSearchWorkspaceProps, OrderBasketWindowProps, object>
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

export default AddGeneralOrderWorkspace;
