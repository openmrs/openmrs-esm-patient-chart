import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import {
  ArrowLeftIcon,
  showSnackbar,
  useLayoutType,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  type DrugOrderBasketItem,
  postOrder,
  showOrderSuccessToast,
  useMutatePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import { DrugOrderForm } from './drug-order-form.component';
import DrugSearch from './drug-search/drug-search.component';
import styles from './add-drug-order.scss';

export interface AddDrugOrderWorkspaceAdditionalProps {}

export interface AddDrugOrderProps {
  /**
   * The order basket item to edit. Note that this can either be an existing order that has
   * already been saved to the backend, or a new pending order in the frontend order basket.
   */
  initialOrder: DrugOrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid: string;

  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

/**
 * This workspace displays the drug order form for adding or editing a drug order.
 * On form submission, it saves the drug order to the (frontend) order basket.
 * For a form that submits the drug order directly on submit,
 * see fill-prescription-form.workspace.tsx
 */
const AddDrugOrder: React.FC<AddDrugOrderProps> = ({
  initialOrder,
  orderToEditOrdererUuid,
  patient,
  patientUuid,
  visitContext,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders, clearOrders } = useOrderBasket<DrugOrderBasketItem>(
    patient,
    'medications',
    prepMedicationOrderPostData,
  );
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);

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

  const saveDrugOrderToBasket = useCallback(
    async (finalizedOrder: DrugOrderBasketItem) => {
      finalizedOrder.action ??= 'NEW';
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
      closeWorkspace({ discardUnsavedChanges: true });
    },
    [orders, setOrders, closeWorkspace],
  );

  // If editing an existing order, on save, we directly submit the modified order to the server
  // and do not save it to the order basket.
  const submitDrugOrderToServer = useCallback(
    async (finalizedOrder: DrugOrderBasketItem) => {
      postOrder(
        prepMedicationOrderPostData(finalizedOrder, patientUuid, finalizedOrder?.encounterUuid, orderToEditOrdererUuid),
      )
        .then(() => {
          clearOrders();
          mutateOrders();

          /* Translation keys used by showOrderSuccessToast:
           * t('ordersCompleted', 'Orders completed')
           * t('orderPlaced', 'Order placed')
           * t('ordersPlaced', 'Orders placed')
           * t('orderUpdated', 'Order updated')
           * t('ordersUpdated', 'Orders updated')
           * t('orderDiscontinued', 'Order discontinued')
           * t('ordersDiscontinued', 'Orders discontinued')
           * t('orderedFor', 'Placed order for')
           * t('updated', 'Updated')
           * t('discontinued', 'Discontinued')
           */
          showOrderSuccessToast('@openmrs/esm-patient-medications-app', [finalizedOrder]);
          closeWorkspace({ discardUnsavedChanges: true });
        })
        .catch((error) => {
          showSnackbar({
            isLowContrast: false,
            kind: 'error',
            title: t('errorSavingDrugOrder', 'Error saving drug order'),
            subtitle: error.message,
          });
        });
    },
    [clearOrders, closeWorkspace, mutateOrders, patientUuid, t, orderToEditOrdererUuid],
  );

  const workspaceTitle =
    initialOrder?.action == 'REVISE'
      ? t('editDrugOrderWorkspaceTitle', 'Edit drug order')
      : t('addDrugOrderWorkspaceTitle', 'Add drug order');

  if (!currentOrder) {
    return (
      <Workspace2 title={workspaceTitle}>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={() => closeWorkspace()}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>{t('backToOrderBasket', 'Back to order basket')}</span>
            </Button>
          </div>
        )}
        <DrugSearch
          patient={patient}
          visit={visitContext}
          closeWorkspace={closeWorkspace}
          openOrderForm={openOrderForm}
        />
      </Workspace2>
    );
  } else {
    return (
      <DrugOrderForm
        initialOrderBasketItem={currentOrder}
        onSave={currentOrder?.action == 'REVISE' ? submitDrugOrderToServer : saveDrugOrderToBasket}
        onCancel={closeWorkspace}
        patient={patient}
        visitContext={visitContext}
        saveButtonText={t('saveOrder', 'Save order')}
        workspaceTitle={workspaceTitle}
      />
    );
  }
};

export default AddDrugOrder;
