import React, { useMemo } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import OrderBasket from './order-basket.component';
import { createOrderBasketExtensionProps } from './order-basket.utils';

/**
 * This workspace renders the main order basket, which contains the buttons to add a drug order and to add a lab order.
 *
 * This workspace is meant for use outside the the patient chart
 */
const ExportedOrderBasketWorkspace: React.FC<Workspace2DefinitionProps<{}, ExportedOrderBasketWindowProps, {}>> = ({
  windowProps: {
    patientUuid,
    patient,
    visitContext,
    mutateVisitContext,
    drugOrderWorkspaceName,
    labOrderWorkspaceName,
    generalOrderWorkspaceName,
    onOrderBasketSubmitted,
    visibleOrderPanels,
  },
  closeWorkspace,
  launchChildWorkspace,
}) => {
  const orderBasketExtensionProps = useMemo(
    () =>
      createOrderBasketExtensionProps({
        patient,
        drugOrderWorkspaceName,
        labOrderWorkspaceName,
        generalOrderWorkspaceName,
        launchChildWorkspace,
        visibleOrderPanels,
      }),
    [launchChildWorkspace, patient, drugOrderWorkspaceName, labOrderWorkspaceName, generalOrderWorkspaceName, visibleOrderPanels],
  );

  return (
    <OrderBasket
      patientUuid={patientUuid}
      patient={patient}
      visitContext={visitContext}
      mutateVisitContext={mutateVisitContext}
      closeWorkspace={closeWorkspace}
      orderBasketExtensionProps={orderBasketExtensionProps}
      showPatientBanner
      onOrderBasketSubmitted={onOrderBasketSubmitted}
    />
  );
};

export default ExportedOrderBasketWorkspace;
