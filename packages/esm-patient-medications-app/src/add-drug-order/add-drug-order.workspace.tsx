import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, showSnackbar, useLayoutType, useSession, Workspace2 } from '@openmrs/esm-framework';
import {
  type DrugOrderBasketItem,
  type OrderBasketWindowProps,
  type PatientWorkspace2DefinitionProps,
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

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

/**
 * This workspace displays the drug order form for adding or editing a drug order.
 * On form submission, it saves the drug order to the (frontend) order basket.
 * For a form that submits the drug order directly on submit,
 * see fill-prescription-form.workspace.tsx
 */
export default function AddDrugOrderWorkspace({
  workspaceProps: { order: initialOrder },
  windowProps: { orderBasketWorkspaceName },
  groupProps: { patient, patientUuid, visitContext },
  closeWorkspace,
  launchChildWorkspace,
}: PatientWorkspace2DefinitionProps<AddDrugOrderWorkspaceAdditionalProps, OrderBasketWindowProps>) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders, clearOrders } = useOrderBasket<DrugOrderBasketItem>(
    patient,
    'medications',
    prepMedicationOrderPostData,
  );
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const session = useSession();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
          showOrderSuccessToast(t, [finalizedOrder]);
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

  return (
    <Workspace2
      title={
        currentOrder?.action == 'REVISE'
          ? t('editDrugOrderWorkspaceTitle', 'Edit drug order')
          : t('addDrugOrderWorkspaceTitle', 'Add drug order')
      }
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {!currentOrder ? (
        <>
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
            launchOrderBasketChildWorkspace={() => {
              launchChildWorkspace(orderBasketWorkspaceName);
            }}
          />
        </>
      ) : (
        <DrugOrderForm
          initialOrderBasketItem={currentOrder}
          onSave={currentOrder?.action == 'REVISE' ? submitDrugOrderToServer : saveDrugOrderToBasket}
          onCancel={currentOrder?.action == 'REVISE' ? closeModifyOrderWorkspace : closeWorkspace}
          setHasUnsavedChanges={setHasUnsavedChanges}
          patient={patient}
          visitContext={visitContext}
          saveButtonText={t('saveOrder', 'Save order')}
          allowSelectingPrescribingClinician={false}
          allowSelectingDrug={false}
        />
      )}
    </Workspace2>
  );
}
