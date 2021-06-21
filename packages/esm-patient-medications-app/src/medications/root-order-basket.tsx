import React from 'react';
import OrderBasket from '../order-basket/order-basket.component';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import { useLayoutType } from '@openmrs/esm-framework';

export interface RootOrderBasketProps {
  patientUuid: string;
  closeWorkspace(): void;
}

export default function RootOrderBasket({ patientUuid, closeWorkspace }: RootOrderBasketProps) {
  const layout = useLayoutType();
  const isTablet = React.useMemo(() => layout === 'tablet', [layout]);
  return (
    <Provider store={orderBasketStore}>
      <OrderBasket patientUuid={patientUuid} closeWorkspace={closeWorkspace} isTablet={isTablet} />
    </Provider>
  );
}
