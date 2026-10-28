import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExtensionSlot,
  useLayoutType,
  useConfig,
  Workspace2,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  useOrderType,
  type OrderBasketItem,
  type TestOrderBasketItem,
  WorkspaceBackButton,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../../config-schema';
import { LabOrderForm } from './test-order-form.component';
import { TestTypeSearch } from './test-type-search.component';
import styles from './add-test-order.scss';

export interface AddLabOrderProps {
  initialOrder?: OrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
  orderTypeUuid?: string;
  patient: fhir.Patient;
  patientUuid?: string;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  showPatientBanner?: boolean;
}

const AddLabOrder: React.FC<AddLabOrderProps> = ({
  patient,
  patientUuid,
  orderToEditOrdererUuid,
  visitContext,
  initialOrder,
  orderTypeUuid,
  closeWorkspace,
  showPatientBanner: showPatientBannerProp,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const showPatientBanner = showPatientBannerProp ?? isTablet;
  const bannerPatientUuid = patientUuid ?? patient?.id;
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as TestOrderBasketItem);
  const [searchTerm, setSearchTerm] = useState('');
  const { additionalTestOrderTypes, orders } = useConfig<ConfigObject>();
  const resolvedOrderTypeUuid = orderTypeUuid ?? orders.labOrderTypeUuid;
  const { orderType } = useOrderType(resolvedOrderTypeUuid);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isEditingExistingOrder = currentLabOrder?.action === 'REVISE' || initialOrder != null;

  const title = useMemo(() => {
    if (orderType) {
      if (initialOrder?.action === 'REVISE') {
        return t(`editOrderableForOrderType`, 'Edit {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      } else {
        return t(`addOrderableForOrderType`, 'Add {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      }
    } else {
      return '';
    }
  }, [orderType, t, initialOrder?.action]);

  const orderableConceptSets = useMemo(() => {
    const allOrderTypes: ConfigObject['additionalTestOrderTypes'] = [
      {
        label: t('labOrders', 'Lab orders'),
        orderTypeUuid: orders.labOrderTypeUuid,
        orderableConceptSets: orders.labOrderableConcepts,
      },
      ...additionalTestOrderTypes,
    ];
    return (
      allOrderTypes.find((orderType) => orderType.orderTypeUuid === resolvedOrderTypeUuid)?.orderableConceptSets ?? []
    );
  }, [additionalTestOrderTypes, resolvedOrderTypeUuid, orders.labOrderTypeUuid, orders.labOrderableConcepts, t]);

  return (
    <Workspace2 title={title} hasUnsavedChanges={hasUnsavedChanges}>
      {showPatientBanner && patient && bannerPatientUuid && (
        <ExtensionSlot
          name="patient-header-slot"
          state={{ patient, patientUuid: bannerPatientUuid, hideActionsOverflow: true }}
        />
      )}
      <div className={styles.container}>
        {!isTablet && (
          <WorkspaceBackButton
            label={t('backToOrderBasket', 'Back to order basket')}
            onClick={() => closeWorkspace()}
          />
        )}
        {currentLabOrder ? (
          <LabOrderForm
            initialOrder={currentLabOrder}
            orderToEditOrdererUuid={orderToEditOrdererUuid}
            closeWorkspace={closeWorkspace}
            onCancel={
              isEditingExistingOrder
                ? closeWorkspace
                : () => {
                    setCurrentLabOrder(undefined);
                    setHasUnsavedChanges(false);
                  }
            }
            setHasUnsavedChanges={setHasUnsavedChanges}
            orderTypeUuid={resolvedOrderTypeUuid}
            orderableConceptSets={orderableConceptSets}
            patient={patient}
          />
        ) : (
          <TestTypeSearch
            orderTypeUuid={resolvedOrderTypeUuid}
            orderableConceptSets={orderableConceptSets}
            openLabForm={setCurrentLabOrder}
            closeWorkspace={closeWorkspace}
            patient={patient}
            visit={visitContext}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />
        )}
      </div>
    </Workspace2>
  );
};

export default AddLabOrder;
