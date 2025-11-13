import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { ExtensionSlot, WorkspaceContainer, useWorkspaces, useLeftNav } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import { usePatientChartPatientAndVisit } from './patient-chart.resources';
import { type LayoutMode } from './chart-review/dashboard-view.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import Loader from '../loader/loader.component';
import SideMenuPanel from '../side-nav/side-menu.component';
import styles from './patient-chart.scss';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();
  const { workspaceWindowState, active } = useWorkspaces();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>();
  const state = usePatientChartPatientAndVisit(patientUuid);
  const view = decodeURIComponent(encodedView);

  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);

  useLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });

  return (
    <>
      <SideMenuPanel />
      <main className={classNames('omrs-main-content', styles.chartContainer)}>
        <div
          className={classNames(
            styles.innerChartContainer,
            workspaceWindowState === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace,
          )}
        >
          {state.isLoadingPatient ? (
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
                  className={classNames(styles.chartReview, { [styles.widthContained]: layoutMode === 'contained' })}
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
      </main>
      <WorkspaceContainer
        actionMenuProps={state}
        additionalWorkspaceProps={state}
        contextKey={`patient/${patientUuid}`}
        showSiderailAndBottomNav
      />
    </>
  );
};

export default PatientChart;
