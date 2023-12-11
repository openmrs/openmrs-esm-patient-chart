import { ModalHeader, Button, ModalFooter, ModalBody } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pay-bill-dialog.scss';

interface PayBillDialogProps {
  patientUuid: string;
  closeModal: () => void;
  launchPatientChart?: boolean;
}

const PayBillDialog: React.FC<PayBillDialogProps> = ({ patientUuid, closeModal, launchPatientChart }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader closeModal={closeModal}>
        <span className={styles.header}>{t('payBill', 'Pay pending bill')}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.body}>{t('payBillText', "You can't add data for the patient without paying your bill")}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={closeModal}>
          {t('pay', 'Pay')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default PayBillDialog;
