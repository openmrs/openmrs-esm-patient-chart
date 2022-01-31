import React, { useState, useMemo, useEffect } from 'react';
import styles from '../visit-detail-overview.scss';
import EncounterList from './encounter-list.component';
import VisitSummary from './visit-summary.component';
import { Button } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { Encounter } from '../visit.resource';
import { formatDatetime, formatTime, parseDate, Visit } from '@openmrs/esm-framework';

interface VisitDetailComponentProps {
  visit: Visit;
  patientUuid: string;
  listViewOverride: boolean;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visit, patientUuid, listViewOverride }) => {
  const { t } = useTranslation();
  const [listView, setListView] = useState(listViewOverride);
  const encounters = useMemo(
    () =>
      visit.encounters.map((encounter: Encounter) => ({
        id: encounter.uuid,
        time: formatTime(parseDate(encounter.encounterDatetime)),
        encounterType: encounter.encounterType.display,
        provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
        obs: encounter.obs,
        form: encounter.form,
      })),
    [visit],
  );

  useEffect(() => {
    setListView(listViewOverride);
  }, [listViewOverride]);

  return (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit.visitType.display}
          <br />
          <p className={`${styles.bodyLong01} ${styles.text02}`}>{formatDatetime(parseDate(visit.startDatetime))}</p>
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
            {t('Encounters', 'Encounters')}
          </Button>
        </div>
      </div>
      {!listView && visit?.encounters && <EncounterList visitUuid={visit.uuid} encounters={encounters} />}
      {listView && <VisitSummary encounters={visit.encounters} patientUuid={patientUuid} />}
    </div>
  );
};

export default VisitDetailComponent;
