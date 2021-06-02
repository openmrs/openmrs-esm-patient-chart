import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import { Order } from '../visit.resource';
import styles from '../visit-detail-overview.scss';
import MedicationSummary from './medications-summary.component';

interface VisitSummaryProps {
  orders: Array<Order>;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ orders }) => {
  const { t } = useTranslation();
  const [tabSelected, setSelectedTab] = useState(0);

  let tabContent = null;
  if (tabSelected == 0) {
    tabContent = 'Notes Content';
  } else if (tabSelected == 1) {
    tabContent = 'Tests Content';
  } else {
    tabContent = <MedicationSummary orders={orders} />;
  }

  return (
    <div className={styles.summaryContainer}>
      <div style={{ display: 'flex', padding: '1rem 0' }}>
        <p className={styles.productiveHeading01} style={{ width: '30%' }}>
          Diagnoses
        </p>
        <div className={styles.diagnosesList} style={{ width: '70%' }}></div>
      </div>
      <div className={styles.tabSections}>
        <Tabs className={styles.verticalTabs}>
          <Tab
            className={`${styles.tab} ${tabSelected == 0 && styles.selectedTab}`}
            onClick={() => setSelectedTab(0)}
            href="#"
            id="tab-1"
            label="Notes"></Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 1 && styles.selectedTab}`}
            onClick={() => setSelectedTab(1)}
            href="#"
            id="tab-2"
            label="Tests"></Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 2 && styles.selectedTab}`}
            onClick={() => setSelectedTab(2)}
            href="#"
            id="tab-3"
            label="Medications"></Tab>
        </Tabs>
        <div className={`${styles.tabContent} ${styles.bodyLong01}`}>{tabContent}</div>
      </div>
    </div>
  );
};

export default VisitSummary;
