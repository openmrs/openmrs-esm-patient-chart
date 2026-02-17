import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, RadioButton, RadioButtonGroup } from '@carbon/react';
import { launchWorkspace2, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { type Order, useFocusTrap } from '@openmrs/esm-patient-common-lib';
import styles from './edit-lab-results.scss';

type EditLabResultModalProps = {
  orders: Array<Order>;
  closeModal: () => void;
  patient: fhir.Patient;
  /** The workspace name to launch. Defaults to 'test-results-form-workspace' for patient chart context.
   * Use 'lab-app-test-results-form-workspace' when opening from outside the patient chart (e.g., Laboratory app). */
  workspaceName?: string;
};

/**
 * This modal is meant for use outside the patient chart (e.g., Laboratory app).
 * The props passed to launchWorkspace2 are only compatible with the exported test results form.
 */
const EditLabResultModal: React.FC<EditLabResultModalProps> = ({
  orders,
  closeModal,
  patient,
  workspaceName = 'test-results-form-workspace',
}) => {
  const { t } = useTranslation();
  const containerRef = useFocusTrap();
  const [selectedOrder, setSelectedOrder] = useState<Order>(orders?.[0]);
  const getGender = (gender: string): string => {
    switch (gender) {
      case 'M':
      case 'male':
        return t('male', 'Male');
      case 'F':
      case 'female':
        return t('female', 'Female');
      case 'O':
      case 'other':
        return t('other', 'Other');
      case 'U':
      case 'unknown':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  const handleOrderSelection = (orderId: string) => {
    const order = orders.find((order) => order.uuid === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleLaunchWorkspace = () => {
    if (selectedOrder) {
      launchWorkspace2(workspaceName, { order: selectedOrder, patient });
      closeModal();
    }
  };

  const confirmationText =
    orders.length > 1
      ? t('selectTestPrompt', 'Please select which test you would like to edit for the following patient:')
      : t('confirmEditResults', 'Do you want to edit test results for the following patient?');

  return (
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <ModalHeader closeModal={closeModal} title={t('editLabResults', 'Edit lab results')} />
      <ModalBody>
        <p className={styles.titleHeader}>{confirmationText}</p>
        <div className={classNames(styles.modalBody, styles.modalContentWrapper)}>
          {selectedOrder && (
            <>
              <div className={styles.patientPanel}>
                <h4 className={styles.sectionHeader}>{t('patientDetails', 'Patient details')}</h4>
                <div className={styles.patientDetailsSection}>
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('name', 'Name')}:</span>
                    <span className={styles.labelValue}>{selectedOrder.patient?.person?.display}</span>
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('age', 'Age')}:</span>
                    <span className={styles.labelValue}>{selectedOrder.patient?.person?.age}</span>
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('gender', 'Gender')}:</span>
                    <span className={styles.labelValue}>{getGender(selectedOrder.patient?.person?.gender)}</span>
                  </p>
                </div>
              </div>

              <div className={styles.patientPanel}>
                <h4 className={styles.sectionHeader}>{t('orderDetails', 'Order details')}</h4>
                <div className={styles.encounterDetails}>
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('testName', 'Test name')}:</span>
                    <span className={styles.labelValue}>
                      {selectedOrder.concept?.display || selectedOrder.concept?.name?.display || '--'}
                    </span>
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('orderNumber', 'Order number')}:</span>
                    <span className={styles.labelValue}>{selectedOrder.orderNumber}</span>
                  </p>
                  {selectedOrder.encounter?.location?.display && (
                    <p className={styles.itemLabel}>
                      <span className={styles.labelKey}>{t('location', 'Location')}:</span>
                      <span className={styles.labelValue}>{selectedOrder.encounter.location.display}</span>
                    </p>
                  )}
                  <p className={styles.itemLabel}>
                    <span className={styles.labelKey}>{t('dateOrdered', 'Date ordered')}:</span>
                    <span className={styles.labelValue}>
                      {formatDatetime(parseDate(selectedOrder.dateActivated), { mode: 'standard', noToday: true })}
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}

          {orders.length > 1 && (
            <div className={styles.selectionPanel}>
              <h4 className={styles.sectionHeader}>{t('selectTestToEdit', 'Select test to edit')}</h4>
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  name="order-selection-group"
                  orientation="vertical"
                  valueSelected={selectedOrder?.uuid}
                  onChange={handleOrderSelection}
                  className={styles.radioGroup}
                >
                  {orders.map((order) => (
                    <RadioButton
                      key={order.uuid}
                      id={order.uuid}
                      labelText={
                        <span className={styles.radioLabel}>
                          {order.concept.display || order.concept.name?.display || '--'}
                        </span>
                      }
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
          {t('editTestResults', 'Edit test results')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EditLabResultModal;
