import React from 'react';
import {
  type OrderBasketItem,
  type OrderBasketWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import AddGeneralOrder from './add-general-order.component';

interface OrderableConceptSearchWorkspaceProps {
  order: OrderBasketItem;
  orderTypeUuid: string;
}

/**
 * This workspace displays the drug order form for adding or editing a general order.
 */
const AddGeneralOrderWorkspace: React.FC<
  PatientWorkspace2DefinitionProps<OrderableConceptSearchWorkspaceProps, OrderBasketWindowProps>
> = ({
  workspaceProps: { order: initialOrder, orderTypeUuid },
  groupProps: { patient, visitContext, mutateVisitContext },
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
