import React, { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import {
  AddIcon,
  closeWorkspace,
  ChevronDownIcon,
  ChevronUpIcon,
  useLayoutType,
  useConfig,
  MaybeIcon,
  launchWorkspace,
  useWorkspaces,
  type Visit,
} from '@openmrs/esm-framework';
import { type OrderBasketItem, useOrderBasket, useOrderType } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../../config-schema';
import type { TestOrderBasketItem } from '../../types';
import { LabOrderBasketItemTile } from './lab-order-basket-item-tile.component';
import { prepTestOrderPostData } from '../api';
import LabIcon from './lab-icon.component';
import styles from './lab-order-basket-panel.scss';

interface OrderBasketSlotProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
}

/**
 * Designs: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/648c44d9d4052c613e7f23da
 * Slotted into order-basket-slot by default
 */
const LabOrderBasketPanelExtension: React.FC<OrderBasketSlotProps> = ({ patient }) => {
  const { orders, additionalTestOrderTypes } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const allOrderTypes: ConfigObject['additionalTestOrderTypes'] = [
    {
      label: t('labOrders', 'Lab orders'),
      orderTypeUuid: orders.labOrderTypeUuid,
      orderableConceptSets: orders.labOrderableConcepts,
      icon: 'omrs-icon-lab-order',
    },
    ...additionalTestOrderTypes,
  ];

  return (
    <>
      {allOrderTypes.map((orderTypeConfig) => (
        <LabOrderBasketPanel patient={patient} key={orderTypeConfig.orderTypeUuid} {...orderTypeConfig} />
      ))}
    </>
  );
};

export const WORKSPACES = {
  TEST_RESULTS_FORM: 'test-results-form-workspace',
  ORDER_BASKET: 'order-basket',
};

type OrderTypeConfig = ConfigObject['additionalTestOrderTypes'][0];

interface LabOrderBasketPanelProps extends OrderTypeConfig {
  patient: fhir.Patient;
}

function LabOrderBasketPanel({ orderTypeUuid, label, icon, patient }: LabOrderBasketPanelProps) {
  const { t } = useTranslation();
  type WorkSpaceType = (typeof WORKSPACES)[keyof typeof WORKSPACES];
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'md' : 'sm';
  const isDefaultLabOrder = icon === 'omrs-icon-lab-order';
  const { orderType, isLoadingOrderType } = useOrderType(orderTypeUuid);
  const { workspaces = [{ name: WORKSPACES.ORDER_BASKET, additionalProps: {} }] } = useWorkspaces();
  const [prevWorkSpace, setPrevWorkSpace] = useState(workspaces[0]?.name);
  const [prevOrder, setPrevOrder] = useState(
    workspaces[0]?.name === WORKSPACES.TEST_RESULTS_FORM ? workspaces[0].additionalProps['order'] : null,
  );
  const { orders, setOrders } = useOrderBasket<TestOrderBasketItem>(patient, orderTypeUuid, prepTestOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const {
    incompleteOrderBasketItems,
    newOrderBasketItems,
    renewedOrderBasketItems,
    revisedOrderBasketItems,
    discontinuedOrderBasketItems,
  } = useMemo(() => {
    const incompleteOrderBasketItems: Array<TestOrderBasketItem> = [];
    const newOrderBasketItems: Array<TestOrderBasketItem> = [];
    const renewedOrderBasketItems: Array<TestOrderBasketItem> = [];
    const revisedOrderBasketItems: Array<TestOrderBasketItem> = [];
    const discontinuedOrderBasketItems: Array<TestOrderBasketItem> = [];

    orders.forEach((order) => {
      if (order?.isOrderIncomplete) {
        incompleteOrderBasketItems.push(order);
      } else if (order.action === 'NEW') {
        newOrderBasketItems.push(order);
      } else if (order.action === 'RENEW') {
        renewedOrderBasketItems.push(order);
      } else if (order.action === 'REVISE') {
        revisedOrderBasketItems.push(order);
      } else if (order.action === 'DISCONTINUE') {
        discontinuedOrderBasketItems.push(order);
      }
    });

    return {
      incompleteOrderBasketItems,
      newOrderBasketItems,
      renewedOrderBasketItems,
      revisedOrderBasketItems,
      discontinuedOrderBasketItems,
    };
  }, [orders]);
  const isWorkSpaceType = useCallback((value: string): value is WorkSpaceType => {
    return Object.values(WORKSPACES).includes(value as WorkSpaceType);
  }, []);

  const openNewLabForm = useCallback(() => {
    closeWorkspace(isWorkSpaceType(prevWorkSpace) ? prevWorkSpace : WORKSPACES.ORDER_BASKET, {
      ignoreChanges: true,
      onWorkspaceClose: () =>
        launchWorkspace('add-lab-order', {
          orderTypeUuid: orderTypeUuid,
          prevWorkSpace: prevWorkSpace,
          isWorkSpaceType: isWorkSpaceType,
          prevOrder: prevOrder,
        }),
      closeWorkspaceGroup: false,
    });
  }, [orderTypeUuid, isWorkSpaceType, prevOrder, prevWorkSpace]);

  const openEditLabForm = useCallback(
    (order: OrderBasketItem) => {
      closeWorkspace(isWorkSpaceType(prevWorkSpace) ? prevWorkSpace : WORKSPACES.ORDER_BASKET, {
        ignoreChanges: true,
        onWorkspaceClose: () =>
          launchWorkspace('add-lab-order', {
            order,
            orderTypeUuid: orderTypeUuid,
            prevWorkSpace: prevWorkSpace,
            isWorkSpaceType: isWorkSpaceType,
            prevOrder: prevOrder,
          }),
        closeWorkspaceGroup: false,
      });
    },
    [orderTypeUuid, isWorkSpaceType, prevOrder, prevWorkSpace],
  );

  const removeLabOrder = useCallback(
    (order: TestOrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  useEffect(() => {
    setIsExpanded(orders.length > 0);
  }, [orders]);

  if (isLoadingOrderType || orderType?.javaClassName !== 'org.openmrs.TestOrder') {
    return null;
  }

  return (
    <Tile
      className={classNames(styles.tile, isTablet ? styles.tabletTile : styles.desktopTile, {
        [styles.collapsedTile]: !isExpanded,
      })}
    >
      <div className={classNames()}>
        <div className={styles.iconAndLabel}>
          {isDefaultLabOrder ? (
            <LabIcon isTablet={isTablet} />
          ) : (
            <MaybeIcon icon={icon ? icon : 'omrs-icon-generic-order-type'} size={isTablet ? 40 : 24} />
          )}
          <h4 className={styles.heading}>{`${
            isWorkSpaceType(prevWorkSpace) && prevWorkSpace === WORKSPACES.ORDER_BASKET
              ? label
                ? t(label)
                : orderType?.display
              : t('tests', 'Tests')
          } (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            className={styles.addButton}
            iconDescription="Add lab order"
            kind="ghost"
            onClick={openNewLabForm}
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            size={responsiveSize}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            className={styles.chevron}
            disabled={orders.length === 0}
            hasIconOnly
            iconDescription="View"
            kind="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            renderIcon={(props: ComponentProps<typeof ChevronUpIcon>) =>
              isExpanded ? <ChevronUpIcon size={16} {...props} /> : <ChevronDownIcon size={16} {...props} />
            }
            size={responsiveSize}
          >
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <>
          {orders.length > 0 && (
            <>
              {incompleteOrderBasketItems.length > 0 && (
                <>
                  {incompleteOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}
              {newOrderBasketItems.length > 0 && (
                <>
                  {newOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {renewedOrderBasketItems.length > 0 && (
                <>
                  {renewedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {revisedOrderBasketItems.length > 0 && (
                <>
                  {revisedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}

              {discontinuedOrderBasketItems.length > 0 && (
                <>
                  {discontinuedOrderBasketItems.map((order) => (
                    <LabOrderBasketItemTile
                      key={order.uuid}
                      onItemClick={() => openEditLabForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                      orderBasketItem={order}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </Tile>
  );
}

export default LabOrderBasketPanelExtension;
