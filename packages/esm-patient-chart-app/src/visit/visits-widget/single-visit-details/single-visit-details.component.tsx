import React from 'react';
import { Button } from '@carbon/react';
import { ArrowLeft, Location } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { EditIcon, formatDate, launchWorkspace, navigate, type Visit } from '@openmrs/esm-framework';
import styles from './single-visit-details.scss';
import VisitTimeLine from './visit-timeline/visit-timeline.component';

interface SingleVisitDetailsOverviewComponentProps {
  patientUuid: string;
  visit: Visit;
}

function SingleVisitDetailsOverview({ patientUuid, visit }: SingleVisitDetailsOverviewComponentProps) {
  const { t } = useTranslation();
  const handleNavigateBackToAllVisits = () => {
    navigate({
      to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/Visits`,
    });
  };

  const editVisitDetails = () => {
    launchWorkspace('start-visit-workspace-form', {
      workspaceTitle: t('editVisitDetails', 'Edit visit details'),
      visitToEdit: visit,
      openedFrom: 'patient-chart-edit-visit',
    });
  };

  return (
    <div className={styles.wrapper}>
      <Button kind="ghost" onClick={handleNavigateBackToAllVisits} size="sm" className={styles.backButton}>
        <ArrowLeft size={16} />
        {t('backToAllVisits', 'Back to all visits')}
      </Button>
      <div>
        <p className={styles.visitType}>{visit.visitType.display}</p>
        <div className={styles.visitDetails}>
          {formatDate(new Date(visit.startDatetime))}
          <span>&middot;</span>
          <span className={styles.location}>
            <Location size={16} />
            <p>{visit.location.display}</p>
          </span>
          <span>&middot;</span>
          <Button kind="ghost" onClick={editVisitDetails} size="sm" className={styles.editButton}>
            {t('editVisitDetails', 'Edit visit details')}
            <EditIcon size={16} />
          </Button>
        </div>
      </div>
      <VisitTimeLine visitUuid={visit.uuid} patientUuid={patientUuid} />
    </div>
  );
}

export default SingleVisitDetailsOverview;
