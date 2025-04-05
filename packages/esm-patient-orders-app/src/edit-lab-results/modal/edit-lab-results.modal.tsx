import { Button, ModalBody, ModalFooter, ModalHeader, RadioButton, RadioButtonGroup } from '@carbon/react';
import { launchWorkspace, useSession } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import lowerCase from 'lodash/lowerCase';
import upperCase from 'lodash/upperCase';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('editLabResults', 'Edit laboratory tests')} />
      <ModalBody>
        <p className={styles.titleHeader}>
          {t('confirmationText', 'Do you want to edit {{test}} results for the following patient?', {
            test: lowerCase(orders?.find((order) => order?.uuid === selectedOrder)?.concept?.display),
          })}
        </p>
        <div className={classNames(styles.modalBody, styles.modalContentWrapper)}>
          <div className={styles.selectionPanel}>
            <h4 className={styles.titleHeader}>{upperCase(t('selectTestToEdit', 'Select test to edit'))}</h4>
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
                    labelText={<span className={styles.radioLabel}>{upperCase(order.concept.display)}</span>}
                    value={order.uuid}
                    className={styles.radioItem}
                  />
                ))}
              </RadioButtonGroup>
            </div>
          </div>

          <div className={styles.previewPanel}>
            <div>
              <div className={styles.printContent}>
                {filteredOrders.length > 0 && (
                  <>
                    <div className={styles.patientHeader}></div>

                    <div className={styles.patientDetailsBody}>
                      <div>
                        <p className={styles.itemHeading}>{upperCase(t('patientDetails', 'Patient Details'))}</p>
                        <p className={styles.itemLabel}>
                          {upperCase(t('name', 'Name'))}: {upperCase(firstOrder?.patient?.person?.display)}
                        </p>
                        <p className={styles.itemLabel}>
                          {upperCase(t('age', 'Age'))}: {firstOrder?.patient?.person?.age}
                        </p>
                        <p className={styles.itemLabel}>
                          {upperCase(t('gender', 'Gender'))}:
                          {upperCase(firstOrder?.patient?.person?.gender === 'M' ? 'Male' : 'Female')}
                        </p>
                      </div>

                      <div className={styles.facilityDetails}>
                        <p className={styles.itemLabel}>{upperCase(location)}</p>
                        <p className={styles.itemLabel}>{firstOrder.dateActivated}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button type="submit" onClick={handleLaunchWorkspace} disabled={!selectedOrder}>
          {t('yes', 'Yes')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default EditLabResultModal;
