import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Encounter, ExportedWorkspace, useConfig } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import EncounterVitals from './encounter-vitals.extension';

const mockExportedWorkspace = vi.mocked(ExportedWorkspace);
const vitalsEncounterTypeUuid = 'vitals-encounter-type-uuid';

const windowProps = { patient: mockPatient, patientUuid: mockPatient.id, visitContext: null };
const onWindowChanged = vi.fn();
const onEncounterSaved = vi.fn();

function renderExtension(state: Partial<EncounterWorkspaceSlotState>) {
  return render(<EncounterVitals {...{ windowProps, onWindowChanged, onEncounterSaved, ...state }} />);
}

describe('EncounterVitals', () => {
  beforeEach(() => {
    vi.mocked(useConfig).mockReturnValue({ vitals: { encounterTypeUuid: vitalsEncounterTypeUuid } });
  });

  it('hosts the vitals form for an encounter of the vitals encounter type', () => {
    const encounter = { uuid: 'encounter-uuid', encounterType: { uuid: vitalsEncounterTypeUuid } } as Encounter;

    renderExtension({ encounter });

    expect(mockExportedWorkspace).toHaveBeenCalledWith(
      {
        name: 'patient-vitals-biometrics-form-workspace',
        workspaceProps: { editEncounterUuid: 'encounter-uuid', formContext: 'editing', onEncounterSaved },
        windowProps,
        onWindowChanged,
      },
      expect.anything(),
    );
  });

  it('hosts the vitals form in creating mode when the workspace type asks for it', () => {
    renderExtension({ workspaceType: 'vitals' });

    expect(mockExportedWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceProps: { editEncounterUuid: undefined, formContext: 'creating', onEncounterSaved },
      }),
      expect.anything(),
    );
  });

  it('renders nothing for an encounter of another type', () => {
    const encounter = { uuid: 'encounter-uuid', encounterType: { uuid: 'another-type-uuid' } } as Encounter;

    const { container } = renderExtension({ encounter });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a form encounter, even of the vitals encounter type', () => {
    const encounter = {
      uuid: 'encounter-uuid',
      encounterType: { uuid: vitalsEncounterTypeUuid },
      form: { uuid: 'form-uuid' },
    } as Encounter;

    renderExtension({ encounter });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });

  it('renders nothing when another kind of workspace is asked for', () => {
    renderExtension({ workspaceType: 'visit-note' });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });
});
