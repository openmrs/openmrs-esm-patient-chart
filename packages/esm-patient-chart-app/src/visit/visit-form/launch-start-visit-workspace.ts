import { launchWorkspace2 } from '@openmrs/esm-framework';
import { getPatientChartWindowProps } from '@openmrs/esm-patient-common-lib';
import { type VisitFormProps, type VisitFormWindowProps } from './visit-form.workspace';

/**
 * Opens the visit form to start a new visit.
 *
 * The workspace is launched with window props that have no visit. No group props are passed: the chart's
 * workspace group is relaunched by `usePatientChartPatientAndVisit` once the visit has started, and only then.
 * Starting a visit is only possible without an active visit: an active visit must be ended first. Use the
 * visit form's edit launch to edit a visit.
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
  return launchWorkspace2<T, VisitFormWindowProps, {}>('start-visit-workspace-form', workspaceProps, windowProps);
}
