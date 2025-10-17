import {
  ExtensionSlot,
  usePatient,
  useWorkspaces,
  useLeftNav,
  useVisit,
  launchWorkspaceGroup2,
  closeWorkspaceGroup2,
} from '@openmrs/esm-framework';
import { type PatientWorkspaceGroupProps, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { spaBasePath } from '../constants';
import Loader from '../loader/loader.component';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import SideMenuPanel from '../side-nav/side-menu.component';
import { type LayoutMode } from './chart-review/dashboard-view.component';
import styles from './patient-chart.scss';
import { useVisitByUuId } from './patient-chart.resources';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();

  // specify key to ensure that WrapPatientChart instance is re-created
  // when we switch patient
  return <WrappedPatientChart key={patientUuid} patientUuid={patientUuid} encodedView={encodedView} />;
};

interface WrappedPatientChartProps {
  patientUuid: string;
  encodedView: string;
}

const WrappedPatientChart: React.FC<WrappedPatientChartProps> = ({ patientUuid, encodedView }) => {
  const view = decodeURIComponent(encodedView);
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const { workspaceWindowState, active } = useWorkspaces();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>();
  const {
    patientUuid: storePatientUuid,
    setPatient,
    visitContext,
    mutateVisitContext,
    setVisitContext,
  } = usePatientChartStore(patientUuid);

  // The patient chart store sets the patient when we enter the patient chart
  // and unsets the patient when we leave. (This gives extensions and workspaces a way
  // to check whether they are rendered within the patient chart app.)
  // Note, however, that the visitContext is NOT unset when we leave the chart, as
  // we want to persist it across refreshes.
  // When we enter the chart, we want to update the visit context as follows:
  // Does the the stored visitContext exist and belong to the patient?
  // 1. If so, the visitContext should be valid but possibly stale; fetch the visit again
  //    and update the context
  // 2. If not, fetch the active visit of the patient, If it exists, set it as the
  //    visitContext; otherwise, clear it.
  const isVisitContextValid = visitContext && visitContext.patient.uuid === patientUuid;
  const {
    data: newVisitContext,
    mutate: newMutateVisitContext,
    isValidating: isValidatingVisitContext,
  } = useVisitByUuId(isVisitContextValid ? visitContext.uuid : null);
  const {
    activeVisit,
    isValidating: isValidatingActiveVisit,
    mutate: mutateActiveVisit,
  } = useVisit(isVisitContextValid ? null : patientUuid);

  const state = useMemo(
    () => ({
      patientUuid,
      patient: patient ?? {},
      visitContext,
      mutateVisitContext,
    }),
    [patient, patientUuid, visitContext, mutateVisitContext],
  );

  const isWorkspaceGroupLaunched = useRef(false);

  useEffect(() => {
    if (!isValidatingVisitContext && !isValidatingActiveVisit && patient) {
      let groupProps: PatientWorkspaceGroupProps = null;
      if (activeVisit) {
        groupProps = {
          patientUuid: patient.id,
          patient,
          visitContext: activeVisit,
          mutateVisitContext: mutateActiveVisit,
        };
      } else if (newVisitContext) {
        setVisitContext(newVisitContext.data, newMutateVisitContext);
        groupProps = {
          patientUuid: patient.id,
          patient,
          visitContext: newVisitContext.data,
          mutateVisitContext: newMutateVisitContext,
        };
      } else {
        setVisitContext(null, null);
        groupProps = {
          patientUuid: patient.id,
          patient,
          visitContext: null,
          mutateVisitContext: null,
        };
      }

      setVisitContext(groupProps.visitContext, groupProps.mutateVisitContext);

      if (!isWorkspaceGroupLaunched.current) {
        launchWorkspaceGroup2('patient-chart', groupProps);
        isWorkspaceGroupLaunched.current = true;
      }
    }
  }, [
    newVisitContext,
    isValidatingVisitContext,
    newMutateVisitContext,
    setVisitContext,
    activeVisit,
    isValidatingActiveVisit,
    storePatientUuid,
    mutateActiveVisit,
    state,
    isWorkspaceGroupLaunched,
    patient,
  ]);

  useEffect(() => {
    if (!isLoadingPatient) {
      setPatient(patient);
    }

    return () => {
      setPatient(null);
    };
  }, [patient, setPatient, isLoadingPatient]);

  useEffect(() => {
    return () => {
      closeWorkspaceGroup2();
    };
  }, []);

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
    </>
  );
};

export default PatientChart;
