import React, { useState } from 'react';
import styles from './visit-detail-overview.scss';
import VisitDetailComponent from './past-visits-components/visit-detail.component';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ContentSwitcher, SkeletonText, Switch, Toggle } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { useVisits } from './visit.resource';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const { t } = useTranslation();
  const { data: visits, isError, isLoading } = useVisits(patientUuid);
  const [toggleAll, setToggleAll] = useState<boolean>(true);
  if (isLoading) {
    return <SkeletonText heading role="progressbar" />;
  }
  if (isError) {
    return <ErrorState headerTitle={t('encounters', 'encounters')} error={isError} />;
  }
  if (visits?.length) {
    return (
      <>
        <div className={styles.toggleSwitch}>
          <ContentSwitcher onChange={() => setToggleAll((prevState) => !prevState)}>
            <Switch name={'first'} text={t('visitSummary', 'Visit summary')} />
            <Switch name={'second'} text={t('encounters', 'Encounters')} />
          </ContentSwitcher>
        </div>
        <div className={styles.container}>
          {visits.map((visit, index) => (
            <VisitDetailComponent toggleAll={toggleAll} key={index} visit={visit} patientUuid={patientUuid} />
          ))}
        </div>
      </>
    );
  }
  return <EmptyState headerTitle={t('encounters', 'Encounters')} displayText={t('encounters', 'encounters')} />;
}

export default VisitDetailOverviewComponent;
