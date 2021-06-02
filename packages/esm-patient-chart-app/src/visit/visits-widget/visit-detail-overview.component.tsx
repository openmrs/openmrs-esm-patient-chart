import React, { useEffect, useState, useMemo } from 'react';
import styles from './visit-detail-overview.scss';
import { Visit, getVisitsForPatient, createErrorHandler } from '@openmrs/esm-framework';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import EncounterListDataTable from './past-visits-components/encounter-list.component';
import VisitSummary from './past-visits-components/visit-summary.component';
import { Encounter } from './visit.resource';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

interface SingleVisitDetailComponentProps {
  visit: Visit;
}

const SingleVisitDetailComponent: React.FC<SingleVisitDetailComponentProps> = ({ visit }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState<boolean>(true);
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

  return (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit.visitType.display}
          <br />
          <p className={styles.bodyLong01}>{formatDateTime(visit.startDatetime)}</p>
        </h4>
        <div className={styles.toggleButtons}>
          <Button
            className={`${styles.toggle} ${listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setView(true)}>
            {t('All Encounters', 'All Encounters')}
          </Button>
          <Button
            className={`${styles.toggle} ${!listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setView(false)}>
            {t('Visit Summary', 'Visit Summary')}
          </Button>
        </div>
      </div>
      {listView && visit?.encounters && <EncounterListDataTable encounters={encounters} />}
      {!listView && <VisitSummary encounters={visit.encounters} />}
    </div>
  );
};

// Base VisitsOverviewComponent

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const [visits, setvisits] = useState<Array<Visit> | null>(null);

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      const custom =
        'custom:(uuid,encounters:(uuid,encounterDatetime,' +
        'orders:(uuid,dateActivated,' +
        'drug:(uuid,name,strength),doseUnits:(uuid,display),' +
        'dose,route:(uuid,display),frequency:(uuid,display),' +
        'duration,durationUnits:(uuid,display),numRefills,' +
        'orderer:(uuid,person:(uuid,display))),obs:(uuid,' +
        'concept:(uuid,display),display,groupMembers:(uuid,' +
        'concept:(uuid,display),value:(uuid,display)),value),' +
        'encounterType:(uuid,display),encounterProviders:(uuid,' +
        'display,encounterRole:(uuid,display),provider:(uuid,' +
        'person:(uuid,display)))),visitType:(uuid,name,display),startDatetime';
      const sub = getVisitsForPatient(patientUuid, abortController, custom).subscribe(({ data }) => {
        setvisits(data.results);
      }, createErrorHandler());
      return () => {
        abortController.abort();
        sub.unsubscribe();
      };
    }
  }, [patientUuid]);

  return visits ? (
    visits.length > 0 ? (
      <div className={styles.container}>
        {visits.map((visit, ind) => (
          <SingleVisitDetailComponent key={ind} visit={visit} />
        ))}
      </div>
    ) : (
      <p>No Visit Found</p>
    )
  ) : (
    <SkeletonText heading />
  );
}

export default VisitDetailOverviewComponent;
