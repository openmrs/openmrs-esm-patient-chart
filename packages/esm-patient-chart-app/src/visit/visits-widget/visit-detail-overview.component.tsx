import React, { useEffect, useState } from 'react';
import styles from './visit-detail-overview.scss';
import { Visit, getVisitsForPatient, createErrorHandler } from '@openmrs/esm-framework';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import VisitDetailComponent from './past-visits-components/visit-detail.component';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const [visits, setVisits] = useState<Array<Visit> | null>(null);

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
        'concept,display,groupMembers:(uuid,' +
        'concept:(uuid,display),value:(uuid,display)),value),' +
        'encounterType:(uuid,display),encounterProviders:(uuid,' +
        'display,encounterRole:(uuid,display),provider:(uuid,' +
        'person:(uuid,display)))),visitType:(uuid,name,display),startDatetime';
      const sub = getVisitsForPatient(patientUuid, abortController, custom).subscribe(({ data }) => {
        setVisits(data.results);
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
        <h2 className={`${styles.productiveHeading03} ${styles.encounterHeading}`}>Encounters</h2>
        {visits.map((visit, ind) => (
          <VisitDetailComponent key={ind} visit={visit} />
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
