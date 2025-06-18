import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ModalBody, ModalFooter, ModalHeader, RadioButton, RadioButtonGroup } from '@carbon/react';
import { formatDate, launchWorkspace, useSession } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import styles from './edit-lab-results.scss';

type EditLabResultModalProps = {
  orders: Array<Order>;
  closeModal: () => void;
};

const EditLabResultModal: React.FC<EditLabResultModalProps> = ({ orders, closeModal }) => {
  const { t } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState<string>(orders?.[0]?.uuid);
  const { sessionLocation } = useSession();
  const location = sessionLocation?.display;

  const handleOrderSelection = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.uuid === selectedOrder);
  }, [orders, selectedOrder]);

  const handleLaunchWorkspace = () => {
    const orderToEdit = orders.find((order) => order.uuid === selectedOrder);
    if (orderToEdit) {
      launchWorkspace('test-results-form-workspace', { order: orderToEdit });
      closeModal();
    }
  };

  const firstOrder = filteredOrders[0];

  // Determine modal title and description based on number of orders
  const modalTitle =
    orders.length > 1 ? t('selectTestToEdit', 'Select test to edit') : t('editLabResults', 'Edit lab results');

  const confirmationText =
    orders.length > 1
      ? t('selectTestPrompt', 'Please select which test you would like to edit for the following patient:')
      : t('confirmationText', 'Do you want to edit {{test}} results for the following patient?', {
          test: orders?.[0]?.concept?.display,
        });

  return (
    <>
      <ModalHeader closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <p className={styles.titleHeader}>{confirmationText}</p>
        <div className={classNames(styles.modalBody, styles.modalContentWrapper)}>
          {/* Patient Details Panel - Now on the left */}
          <div className={styles.patientPanel}>
            <h4 className={styles.sectionHeader}>{t('patientDetails', 'Patient Details')}</h4>
            <div className={styles.patientContent}>
              {filteredOrders.length > 0 && (
                <div className={styles.patientInfo}>
                  <div className={styles.patientDetailsSection}>
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('name', 'Name')}:</span>
                      <span className={styles.labelValue}>{firstOrder?.patient?.person?.display}</span>
                    </p>
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('age', 'Age')}:</span>
                      <span className={styles.labelValue}>{firstOrder?.patient?.person?.age}</span>
                    </p>
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('gender', 'Gender')}:</span>
                      <span className={styles.labelValue}>
                        {firstOrder?.patient?.person?.gender === 'M' ? t('male', 'Male') : t('female', 'Female')}
                      </span>
                    </p>
                  </div>

                  <div className={styles.encounterDetails}>
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('location', 'Location')}:</span>
                      <span className={styles.labelValue}>{location}</span>
                    </p>
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('dateOrdered', 'Date Ordered')}:</span>
                      <span className={styles.labelValue}>{firstOrder.dateActivated}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {orders.length > 1 && (
            <div className={styles.selectionPanel}>
              <h4 className={styles.sectionHeader}>{t('selectTestToEdit', 'Select test to edit')}</h4>
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  name="order-selection-group"
                  orientation="vertical"
                  valueSelected={selectedOrder}
                  onChange={handleOrderSelection}
                  className={styles.radioGroup}
                >
                  {orders.map((order) => (
                    <RadioButton
                      key={order.uuid}
                      id={order.uuid}
                      labelText={<span className={styles.radioLabel}>{order.concept.display}</span>}
                      value={order.uuid}
                      className={styles.radioItem}
                    />
                  ))}
                </RadioButtonGroup>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleLaunchWorkspace} disabled={!selectedOrder}>
          {t('editResult', 'Edit Result')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default EditLabResultModal;
