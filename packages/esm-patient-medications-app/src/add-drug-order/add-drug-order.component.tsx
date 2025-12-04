import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import {
  ArrowLeftIcon,
  showSnackbar,
  useLayoutType,
  useSession,
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
import { careSettingUuid, prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import { DrugOrderForm } from './drug-order-form.component';
import DrugSearch from './drug-search/drug-search.component';
import styles from './add-drug-order.scss';

export interface AddDrugOrderWorkspaceAdditionalProps {}

export interface AddDrugOrderProps {
  initialOrder: DrugOrderBasketItem;
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
  const session = useSession();
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
      closeWorkspace({ discardUnsavedChanges: true });
    },
    [orders, setOrders, closeWorkspace, session.currentProvider.uuid],
  );

  const submitDrugOrderToServer = useCallback(
    async (finalizedOrder: DrugOrderBasketItem) => {
      postOrder(prepMedicationOrderPostData(finalizedOrder, patientUuid, finalizedOrder?.encounterUuid))
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
    [clearOrders, closeWorkspace, mutateOrders, patientUuid, t],
  );

  const closeModifyOrderWorkspace = useCallback(() => {
    clearOrders();
    closeWorkspace();
  }, [clearOrders, closeWorkspace]);

  const workspaceTitle =
    currentOrder?.action == 'REVISE'
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
        onCancel={currentOrder?.action == 'REVISE' ? closeModifyOrderWorkspace : closeWorkspace}
        patient={patient}
        visitContext={visitContext}
        saveButtonText={t('saveOrder', 'Save order')}
        allowSelectingPrescribingClinician={false}
        allowSelectingDrug={false}
        workspaceTitle={workspaceTitle}
      />
    );
  }
};

export default AddDrugOrder;
