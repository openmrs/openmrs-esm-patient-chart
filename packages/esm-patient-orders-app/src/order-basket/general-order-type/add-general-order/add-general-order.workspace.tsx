import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  type OrderBasketItem,
  type OrderBasketWindowProps,
  getPatientAndVisitProps,
  type SharedWorkspaceGroupProps,
  useShowPatientBanner,
} from '@openmrs/esm-patient-common-lib';
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
  Workspace2DefinitionProps<OrderableConceptSearchWorkspaceProps, OrderBasketWindowProps, SharedWorkspaceGroupProps>
> = ({ workspaceProps: { order: initialOrder, orderTypeUuid }, windowProps, closeWorkspace, groupProps }) => {
  const { patient, patientUuid, visitContext } = getPatientAndVisitProps(windowProps, undefined, groupProps);
  const shouldShowPatientBanner = useShowPatientBanner(groupProps);

  return (
    <AddGeneralOrder
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
      showPatientBanner={shouldShowPatientBanner}
    />
  );
};

export default AddGeneralOrderWorkspace;
