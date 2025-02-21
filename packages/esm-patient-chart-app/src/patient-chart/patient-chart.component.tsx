import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  ExtensionSlot,
  WorkspaceContainer,
  setCurrentVisit,
  setLeftNav,
  unsetLeftNav,
  usePatient,
  useWorkspaces,
} from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { spaBasePath } from '../constants';
import { type LayoutMode } from './chart-review/dashboard-view.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import Loader from '../loader/loader.component';
import styles from './patient-chart.scss';
import VisitHeader from '../visit-header/visit-header.component';
import SideMenuPanel from '../side-nav/side-menu.component';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();
  const view = decodeURIComponent(encodedView);
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const { workspaceWindowState, active } = useWorkspaces();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>();
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
  useEffect(() => {
    setLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });
    return () => unsetLeftNav('patient-chart-dashboard-slot');
  }, [leftNavBasePath]);

  return (
    <>
      <VisitHeader patient={state.patient} patientUuid={state.patientUuid} />
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
                      view={view}
                      setDashboardLayoutMode={setLayoutMode}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      </main>
      <WorkspaceContainer
        showSiderailAndBottomNav
        contextKey={`patient/${patientUuid}`}
        additionalWorkspaceProps={state}
      />
    </>
  );
};

export default PatientChart;
