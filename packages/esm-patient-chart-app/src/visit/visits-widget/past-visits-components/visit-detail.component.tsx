import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import styles from '../visit-detail-overview.scss';
import EncounterList from './encounter-list.component';
import VisitSummary from './visit-summary.component';
import { Button } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { Encounter } from '../visit.resource';
import { Visit } from '@openmrs/esm-framework';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

interface VisitDetailComponentProps {
  visit: Visit;
  patientUuid: string;
  toggleAll: boolean;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visit, patientUuid, toggleAll }) => {
  const { t } = useTranslation();
  const [listView, setListView] = useState(false);
  const encounters = useMemo(
    () =>
      visit.encounters.map((encounter: Encounter) => ({
        id: encounter.uuid,
        time: dayjs(encounter.encounterDateTime).format('hh:mm'),
        encounterType: encounter.encounterType.display,
        provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
        obs: encounter.obs,
      })),
    [visit],
  );

  useEffect(() => {
    setListView(toggleAll);
  }, [toggleAll]);

  return (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit.visitType.display}
          <br />
          <p className={`${styles.bodyLong01} ${styles.text02}`}>{formatDateTime(visit.startDatetime)}</p>
        </h4>
        <div className={styles.toggleButtons}>
          <Button
            className={`${styles.toggle} ${listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setListView(true)}
          >
            {t('visitSummary', 'Visit Summary')}
          </Button>
          <Button
            className={`${styles.toggle} ${!listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setListView(false)}
          >
            {t('allEncounters', 'All Encounters')}
          </Button>
        </div>
      </div>
      {!listView && visit?.encounters && <EncounterList visitUuid={visit.uuid} encounters={encounters} />}
      {listView && <VisitSummary encounters={visit.encounters} patientUuid={patientUuid} />}
    </div>
  );
};

export default VisitDetailComponent;
