import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  type OrderBasketItem,
  type OrderBasketWindowProps,
  getPatientAndVisitProps,
  type SharedWorkspaceGroupProps,
  useShowPatientBanner,
} from '@openmrs/esm-patient-common-lib';
import AddLabOrder from './add-test-order.component';

export interface AddTestOrderWorkspaceProps {
  order?: OrderBasketItem;
  orderTypeUuid?: string;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
}

/**
 * This workspace displays the labs order form for adding or editing a labs order.
 *
 * Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart.
 */
export default function AddTestOrderWorkspace({
  windowProps,
  workspaceProps: { order: initialOrder, orderTypeUuid, orderToEditOrdererUuid },
  closeWorkspace,
  groupProps,
}: Workspace2DefinitionProps<AddTestOrderWorkspaceProps, OrderBasketWindowProps, SharedWorkspaceGroupProps>) {
  const { patient, patientUuid, visitContext } = getPatientAndVisitProps(windowProps, undefined, groupProps);
  const shouldShowPatientBanner = useShowPatientBanner(groupProps);

  return (
    <AddLabOrder
      patient={patient}
      patientUuid={patientUuid}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
      visitContext={visitContext}
      initialOrder={initialOrder}
      orderTypeUuid={orderTypeUuid}
      closeWorkspace={closeWorkspace}
      showPatientBanner={shouldShowPatientBanner}
    />
  );
}
