import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  ExtensionSlot,
  setCurrentVisit,
  setLeftNav,
  unsetLeftNav,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { changeWorkspaceContext, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { spaBasePath } from '../constants';
import { LayoutMode } from './chart-review/dashboard-view.component';
import ActionMenu from './action-menu/action-menu.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import Loader from '../loader/loader.component';
import WorkspaceNotification from '../workspace/workspace-notification.component';
import styles from './patient-chart.scss';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();
  const view = decodeURIComponent(encodedView);
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const { workspaceWindowState, active } = useWorkspaces();
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>();

  // We are responsible for creating a new offline visit while in offline mode.
  // The patient chart widgets assume that this is handled by the chart itself.
  // We are also the module that holds the offline visit type UUID config.
  // The following hook takes care of the creation.

  // Keep state updated with the current patient. Anything used outside the patient
  // chart (e.g., the current visit is used by the Active Visit Tag used in the
  // patient search) must be updated in the callback, which is called when the patient
  // chart unmounts. Workspaces are only used inside the patient chart so we just
  // need to update those when we enter a new patient chart.
  useEffect(() => {
    changeWorkspaceContext(patientUuid);
    return () => {
      setCurrentVisit(null, null);
    };
  }, [patientUuid]);

  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);
  useEffect(() => {
    setLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });
    return () => unsetLeftNav('patient-chart-dashboard-slot');
  }, [leftNavBasePath]);

  return (
    <main className={classNames('omrs-main-content', styles.chartContainer)}>
      <>
        <div
          className={classNames(
            styles.innerChartContainer,
            workspaceWindowState === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace,
          )}
        >
          <ExtensionSlot name="breadcrumbs-slot" />
          {isLoadingPatient ? (
            <Loader />
          ) : (
            <>
              <aside>
                <ExtensionSlot name="patient-header-slot" state={state} />
                <ExtensionSlot name="patient-highlights-bar-slot" state={state} />
                <ExtensionSlot name="patient-info-slot" state={state} />
              </aside>
              <div className={styles.grid}>
                <div className={classNames(styles.chartReview, { [styles.widthContained]: layoutMode == 'contained' })}>
                  <ChartReview {...state} view={view} setDashboardLayoutMode={setLayoutMode} />
                  <WorkspaceNotification />
                </div>
              </div>
            </>
          )}
        </div>
        <ActionMenu open={false} />
      </>
    </main>
  );
};

export default PatientChart;
