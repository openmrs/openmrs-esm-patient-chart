import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import { Order } from '../visit.resource';
import styles from '../visit-detail-overview.scss';
import MedicationSummary from './medications-summary.component';

interface VisitSummaryProps {
  encounters: any;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ encounters }) => {
  const { t } = useTranslation();
  const [tabSelected, setSelectedTab] = useState(0);

  const [diagnoses, orders] = useMemo(() => {
    let orders: Array<Order> = [];
    let diagnoses = [];
    encounters.forEach((enc) => {
      orders = [...orders, ...enc.orders];
      if (enc.encounterType.display == 'Visit Note') {
        enc.obs.forEach((obs) => {
          if (obs.concept.display == 'Visit Diagnoses') {
            diagnoses.push({
              diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
              order: obs.groupMembers.find((mem) => mem.concept.display === 'Diagnosis order').value.display,
            });
          }
        });
      }
    });
    return [diagnoses, orders];
  }, [encounters]);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.flexSections}>
        <p className={styles.productiveHeading01} style={{ width: '30%' }}>
          Diagnoses
        </p>
        <div className={`${styles.caption01} ${styles.diagnosesList}`} style={{ width: '70%' }}>
          {diagnoses.length > 0 ? (
            diagnoses.map((d) => (
              <span
                className={`${styles.diagnosis} ${
                  d.order === 'Primary' ? styles.primaryDiagnose : styles.secondaryDiagnose
                }`}>
                {d.diagnosis}
              </span>
            ))
          ) : (
            <span style={{ marginBottom: '0.5rem' }}>No Diagnoses found.</span>
          )}
        </div>
      </div>
      <div className={`${styles.flexSections} ${styles.bodyLong01}`}>
        <Tabs className={styles.verticalTabs}>
          <Tab
            className={`${styles.tab} ${styles.bodyLong01} ${tabSelected == 0 && styles.selectedTab}`}
            onClick={() => setSelectedTab(0)}
            href="#"
            id="tab-1"
            label={t('Notes', 'Notes')}>
            Notes Content
          </Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 1 && styles.selectedTab}`}
            onClick={() => setSelectedTab(1)}
            href="#"
            id="tab-2"
            label={t('Tests', 'Tests')}>
            Tests Content
          </Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 2 && styles.selectedTab}`}
            onClick={() => setSelectedTab(2)}
            href="#"
            id="tab-3"
            label={t('Medications', 'Medications')}>
            <MedicationSummary orders={orders} />
          </Tab>
        </Tabs>
        {/* <div className={`${styles.tabContent} ${styles.bodyLong01}`}>{tabContent}</div> */}
      </div>
    </div>
  );
};

export default VisitSummary;
