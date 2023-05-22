import React from 'react';
import OrderBasket from '../order-basket/order-basket.component';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

export default function RootOrderBasket({ patientUuid, closeWorkspace }: DefaultWorkspaceProps) {
  return <OrderBasket patientUuid={patientUuid} closeWorkspace={closeWorkspace} />;
}
