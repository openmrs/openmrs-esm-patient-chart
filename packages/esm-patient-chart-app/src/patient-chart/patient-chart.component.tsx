import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import {
  ExtensionSlot,
  WorkspaceContainer,
  setCurrentVisit,
  usePatient,
  useVisit,
  useWorkspaces,
  useLeftNav,
} from '@openmrs/esm-framework';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';
import { type LayoutMode } from './chart-review/dashboard-view.component';
import { spaBasePath } from '../constants';
import Loader from '../loader/loader.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import SideMenuPanel from '../side-nav/side-menu.component';
import styles from './patient-chart.scss';

const PatientChart: React.FC = () => {
  const { workspaceWindowState, active } = useWorkspaces();
  const { patientUuid, view: encodedView } = useParams();
  const view = decodeURIComponent(encodedView);
  const visits = useVisit(patientUuid);
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>();
  const state = useMemo(() => ({ patient, patientUuid, visits }), [patient, patientUuid, visits]);

  // Keep state updated with the current patient. Anything used outside the patient
  // chart (e.g., the current visit is used by the Active Visit Tag used in the
  // patient search) must be updated in the callback, which is called when the patient
  // chart unmounts.
  useEffect(() => {
    return () => {
      setCurrentVisit(null, null);
    };
  }, [patientUuid]);

  useEffect(() => {
    getPatientChartStore().setState({ ...state });
    return () => {
      getPatientChartStore().setState({});
    };
  }, [state]);

  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);

  useLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });

  return (
    <>
      <SideMenuPanel />
      <main className={classNames('omrs-main-content', styles.chartContainer)}>
        <>
          <div
            className={classNames(
              styles.innerChartContainer,
              workspaceWindowState === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace,
            )}
          >
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
                  <div
                    className={classNames(styles.chartReview, { [styles.widthContained]: layoutMode == 'contained' })}
                  >
                    <ChartReview
                      patient={state.patient}
                      patientUuid={state.patientUuid}
                      setDashboardLayoutMode={setLayoutMode}
                      view={view}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      </main>
      <WorkspaceContainer
        additionalWorkspaceProps={state}
        contextKey={`patient/${patientUuid}`}
        showSiderailAndBottomNav
      />
    </>
  );
};

export default PatientChart;
