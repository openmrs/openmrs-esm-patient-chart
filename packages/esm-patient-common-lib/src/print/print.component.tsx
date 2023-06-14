import React, { useRef } from 'react';
import { Printer } from '@carbon/react/icons';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import styles from './print.scss';
import { Header, Button } from '@carbon/react';
import log from './log.png';

export function PrintComponent({ subheader, body, patientDetails, requestedBy }) {
  const componentRef = useRef(null);
  const { t } = useTranslation();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <Button kind="ghost" renderIcon={Printer} iconDescription="Add vitals" onClick={handlePrint}>
        {t('print', 'Print')}
      </Button>
      <div className={`${styles.printpage} `}>
        <div className={`${styles} `} ref={componentRef}>
          <Header>
            <img src={log} alt="logo" width={110} height={40} className={styles.img} />
          </Header>

          <div className={styles.patientDetails}>
            <p>{patientDetails?.name}</p>
            <p>{patientDetails?.age} years</p>
            <p> {patientDetails?.gender}</p>
          </div>
          <hr></hr>
          <div className={`${styles.subheader} `}>
            <h1> {subheader} </h1>
          </div>
          <hr></hr>
          {body}
          <footer className={`${styles.footer} `}>
            {' '}
            {t('RequestedBy', 'Requested by')} {requestedBy}{' '}
          </footer>
        </div>
      </div>
    </div>
  );
}

export default PrintComponent;
