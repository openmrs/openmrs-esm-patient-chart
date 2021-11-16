import React, { useMemo, useEffect } from 'react';
import styles from './patient-chart.component.scss';
import Loader from './loader.component';
import WorkspaceWrapper from '../workspace/workspace-wrapper.component';
import ChartReview from '../view-components/chart-review.component';
import VisitDialog from '../visit/visit-dialog.component';
import { RouteComponentProps } from 'react-router-dom';
import { detachAll, ExtensionSlot, useCurrentPatient, useSessionUser } from '@openmrs/esm-framework';
import ActionMenu from './action-menu.component';
import { useOfflineVisitForPatient } from '../offline';
import { ScreenModeTypes } from '../types';
import WorkspaceNotification from './workspace-notification.component';
import { useWorkspaceStore } from '@openmrs/esm-patient-common-lib';

interface PatientChartParams {
  patientUuid: string;
  view: string;
  subview: string;
}

const PatientChart: React.FC<RouteComponentProps<PatientChartParams>> = ({ match }) => {
  const { patientUuid, view, subview } = match.params;
  const [loading, patient] = useCurrentPatient(patientUuid);
  const sessionUser = useSessionUser();
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const { workspaceStore, active, updateWindowSize } = useWorkspaceStore();

  const { windowSize } = workspaceStore;

  useEffect(() => {
    detachAll('patient-chart-workspace-slot');
  }, [patientUuid]);

  const mainClassName = `omrs-main-content ${styles.chartContainer}`;

  useOfflineVisitForPatient(patientUuid, sessionUser?.sessionLocation?.uuid);

  return (
    <main className={mainClassName}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div
            className={`${styles.innerChartContainer} ${
              windowSize.size === ScreenModeTypes.normal && active ? styles.closeWorkspace : styles.activeWorkspace
            }`}
          >
            <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
            <aside>
              <ExtensionSlot extensionSlotName="patient-header-slot" state={state} />
              <ExtensionSlot extensionSlotName="patient-info-slot" state={state} />
            </aside>
            <div className={styles.grid}>
              <div className={styles.chartreview}>
                <ChartReview {...state} view={view} subview={subview} />
                <VisitDialog patientUuid={patientUuid} />
                <WorkspaceNotification />
              </div>
              <div className={styles.workspace}>
                <WorkspaceWrapper {...state} />
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
