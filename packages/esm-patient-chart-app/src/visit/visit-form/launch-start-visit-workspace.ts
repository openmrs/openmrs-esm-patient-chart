import { launchWorkspace2 } from '@openmrs/esm-framework';
import { getPatientChartWindowProps, type PatientWorkspaceGroupProps } from '@openmrs/esm-patient-common-lib';
import { type VisitFormProps, type VisitFormWindowProps } from './visit-form.workspace';

/**
 * Opens the visit form to start a new visit.
 *
 * The workspace is launched with window and group props that have no visit. Since the chart's workspace
 * group was launched with the current visit (if any), the group props differ and launching relaunches the
 * group, which closes all other windows and workspaces. Starting a visit is therefore only possible without
 * an active visit: an active visit must be ended first. Use the visit form's edit launch to edit a visit.
 *
 * @param patientUuid The patient to start a visit for. If undefined, the patient the chart has open is used.
 * @param patient The patient's FHIR resource, if at hand. Otherwise it is taken from the chart.
 */
export function launchStartVisitWorkspace<T extends VisitFormProps>(
  workspaceProps: T,
  patientUuid: string | undefined,
  patient?: fhir.Patient,
) {
  const chartProps = getPatientChartWindowProps(patientUuid);
  const windowProps = {
    patient: patient ?? chartProps.patient,
    patientUuid: patientUuid ?? chartProps.patientUuid,
    visitContext: null,
  };
  return launchWorkspace2<T, VisitFormWindowProps, PatientWorkspaceGroupProps>(
    'start-visit-workspace-form',
    workspaceProps,
    windowProps,
    { ...windowProps, mutateVisitContext: null },
  );
}
