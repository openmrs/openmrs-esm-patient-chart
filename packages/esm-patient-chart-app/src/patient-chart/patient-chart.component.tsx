import React, { useEffect, useMemo } from 'react';
import { ExtensionSlot, useSessionUser } from '@openmrs/esm-framework';
import { changeWorkspaceContext, useWorkspaceWindowSize } from '@openmrs/esm-patient-common-lib';
import { RouteComponentProps } from 'react-router-dom';
import { useOfflineVisitForPatient, usePatientOrOfflineRegisteredPatient } from '../offline';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import VisitDialog from '../visit/visit-dialog.component';
import ActionMenu from './action-menu/action-menu.component';
import Loader from '../loader/loader.component';
import styles from './patient-chart.scss';
import WorkspaceNotification from '../workspace/workspace-notification.component';

interface PatientChartParams {
  patientUuid: string;
  view: string;
}

const PatientChart: React.FC<RouteComponentProps<PatientChartParams>> = ({ match }) => {
  const { patientUuid, view } = match.params;
  const { isLoading, patient } = usePatientOrOfflineRegisteredPatient(patientUuid);
  const sessionUser = useSessionUser();
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const { windowSize, active } = useWorkspaceWindowSize();

  useEffect(() => {
    changeWorkspaceContext(patientUuid);
  }, [patientUuid]);

  useOfflineVisitForPatient(patientUuid, sessionUser?.sessionLocation?.uuid);

  return (
    <main className={`omrs-main-content ${styles.chartContainer}`}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div
            className={`${styles.innerChartContainer} ${
              windowSize.size === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace
            }`}
          >
            <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
            <aside>
              <ExtensionSlot extensionSlotName="patient-header-slot" state={state} />
              <ExtensionSlot extensionSlotName="patient-info-slot" state={state} />
            </aside>
            <div className={styles.grid}>
              <div className={styles.chartreview}>
                <ChartReview {...state} view={view} />
                <VisitDialog patientUuid={patientUuid} />
                <WorkspaceNotification />
              </div>
            </div>
          </div>
          <ActionMenu open={false} />
        </>
      )}
    </main>
  );
};

export default PatientChart;
