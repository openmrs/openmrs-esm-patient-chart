import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, useLayoutType, useSession } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  launchPatientWorkspace,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { careSettingUuid, prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import type { DrugOrderBasketItem } from '../types';
import { DrugOrderForm } from './drug-order-form.component';
import DrugSearch from './drug-search/drug-search.component';
import styles from './add-drug-order.scss';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
  /**
   * Whether this workspace was launched from a workspace other than order basket.
   */
  outsideOrderBasketWorkspace?: boolean;
}

export interface AddDrugOrderWorkspace extends DefaultPatientWorkspaceProps, AddDrugOrderWorkspaceAdditionalProps {}

export default function AddDrugOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  outsideOrderBasketWorkspace,
}: AddDrugOrderWorkspace) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const session = useSession();

  const cancelDrugOrder = useCallback(() => {
    closeWorkspace({
      ...(!!outsideOrderBasketWorkspace ? {} : { onWorkspaceClose: () => launchPatientWorkspace('order-basket') }),
      closeWorkspaceGroup: false,
    });
  }, [closeWorkspace, outsideOrderBasketWorkspace]);

  const openOrderForm = useCallback(
    (searchResult: DrugOrderBasketItem) => {
      const existingOrder = orders.find((order) => ordersEqual(order, searchResult));
      if (existingOrder) {
        setCurrentOrder(existingOrder);
      } else {
        setCurrentOrder(searchResult);
      }
    },
    [orders],
  );

  const saveDrugOrder = useCallback(
    (finalizedOrder: DrugOrderBasketItem) => {
      finalizedOrder.careSetting = careSettingUuid;
      finalizedOrder.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => ordersEqual(order, finalizedOrder));
      if (existingOrder) {
        newOrders[orders.indexOf(existingOrder)] = {
          ...finalizedOrder,
          // Incomplete orders should be marked completed on saving the form
          isOrderIncomplete: false,
        };
      } else {
        newOrders.push(finalizedOrder);
      }
      setOrders(newOrders);
      closeWorkspaceWithSavedChanges({
        ...(!!outsideOrderBasketWorkspace ? {} : { onWorkspaceClose: () => launchPatientWorkspace('order-basket') }),
      });
    },
    [orders, setOrders, closeWorkspaceWithSavedChanges, session.currentProvider.uuid, outsideOrderBasketWorkspace],
  );

  if (!currentOrder) {
    return (
      <>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={cancelDrugOrder}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>
                {!!outsideOrderBasketWorkspace ? t('back', 'Back') : t('backToOrderBasket', 'Back to order basket')}
              </span>
            </Button>
          </div>
        )}
        <DrugSearch openOrderForm={openOrderForm} outsideOrderBasketWorkspace={outsideOrderBasketWorkspace} />
      </>
    );
  } else {
    return (
      <DrugOrderForm
        initialOrderBasketItem={currentOrder}
        onSave={saveDrugOrder}
        onCancel={cancelDrugOrder}
        promptBeforeClosing={promptBeforeClosing}
        outsideOrderBasketWorkspace={outsideOrderBasketWorkspace}
      />
    );
  }
}
