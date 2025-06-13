import React, { useState, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { Button, ModalBody, ModalFooter, Checkbox } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { useSession } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import PrintableReport from '../print-preview/print-preview.component';
import styles from './print-results-modal.scss';

type PrintResultsModalProps = {
  orders: Array<Order>;
  closeModal: () => void;
};

const PrintResultsModal: React.FC<PrintResultsModalProps> = ({ orders, closeModal }) => {
  const { t } = useTranslation();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set(orders.map((order) => order.uuid)));
  const contentToPrintRef = useRef<HTMLDivElement>(null);
  const setIsPrinting = useState(false)[1];
  const { sessionLocation } = useSession();
  const location = sessionLocation?.display;

  const handleOrderSelection = (orderId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedOrders);
    if (isSelected) {
      newSelection.add(orderId);
    } else {
      newSelection.delete(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => selectedOrders.has(order.uuid));
  }, [orders, selectedOrders]);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: `
      @media print {
        body {
          height: auto !important;
      }

      }
    `,
  });
  const firstOrder = filteredOrders[0];
  return (
    <>
      <ModalBody className={classNames(styles.modalBody, styles.modalContentWrapper)}>
        <div className={styles.selectionPanel}>
          <h4 className={styles.titleHeader}>{capitalize(t('selectTestsToPrint', 'Select tests to print'))}</h4>
          <div className={styles.checkboxList}>
            {orders.map((order) => (
              <Checkbox
                key={order.uuid}
                id={order.uuid}
                labelText={<span className={styles.checkboxLabel}>{capitalize(order.concept.display)}</span>}
                checked={selectedOrders.has(order.uuid)}
                onChange={(_, { checked }) => handleOrderSelection(order.uuid, checked)}
                className={styles.checkboxItem}
              />
            ))}
          </div>
        </div>

        <div className={styles.previewPanel}>
          <div ref={contentToPrintRef}>
            <div className={styles.printContent}>
              {filteredOrders.length > 0 && (
                <>
                  <div className={styles.printableHeader}>
                    <p className={styles.titleHeader}>{capitalize(t('laboratoryReport', 'Laboratory Report'))}</p>
                  </div>

                  <div className={styles.printableBody}>
                    <div className={styles.testResultDetails}>
                      <p className={styles.itemHeading}>{capitalize(t('reportSummaryTo', 'Report summary to'))}</p>
                      <p className={styles.itemLabel}>
                        {capitalize(t('name', 'Name'))}: {capitalize(firstOrder?.patient?.person?.display)}
                      </p>
                      <p className={styles.itemLabel}>
                        {capitalize(t('age', 'Age'))}: {firstOrder?.patient?.person?.age}
                      </p>
                      <p className={styles.itemLabel}>
                        {capitalize(t('gender', 'Gender'))}:
                        {capitalize(firstOrder?.patient?.person?.gender === 'M' ? 'Male' : 'Female')}
                      </p>
                    </div>

                    <div className={styles.facilityDetails}>
                      <p className={styles.itemLabel}>{capitalize(location)}</p>
                      <p className={styles.itemLabel}>{firstOrder.dateActivated}</p>
                    </div>
                  </div>
                  <p className={styles.testDoneHeader}>{capitalize(t('testDone', 'Test done'))}</p>
                </>
              )}

              {filteredOrders.map((order, index) => (
                <div key={order.uuid} className={styles.printableReport}>
                  <PrintableReport order={order} key={index} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button type="submit" onClick={handlePrint} disabled={filteredOrders.length === 0}>
          {t('print', 'Print')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default PrintResultsModal;
