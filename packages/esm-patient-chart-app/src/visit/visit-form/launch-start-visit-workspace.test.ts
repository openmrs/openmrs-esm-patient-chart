import { describe, expect, it, vi } from 'vitest';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { launchStartVisitWorkspace } from './launch-start-visit-workspace';

const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

const patient = { id: 'patient-uuid' } as fhir.Patient;

describe('launchStartVisitWorkspace', () => {
  it('launches the visit form with no-visit window props and group props, so the workspace group is relaunched', () => {
    launchStartVisitWorkspace({ openedFrom: 'test' }, patient.id, patient);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'start-visit-workspace-form',
      { openedFrom: 'test' },
      { patient, patientUuid: patient.id, visitContext: null },
      { patient, patientUuid: patient.id, activeVisit: null },
    );
  });
});
