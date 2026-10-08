import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Encounter, ExportedWorkspace, useConfig } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import EncounterVisitNote from './encounter-visit-note.extension';

const mockExportedWorkspace = vi.mocked(ExportedWorkspace);
const visitNoteEncounterTypeUuid = 'visit-note-encounter-type-uuid';

const windowProps = { patient: mockPatient, patientUuid: mockPatient.id, visitContext: null };
const onWindowChanged = vi.fn();
const onEncounterSaved = vi.fn();

function renderExtension(state: Partial<EncounterWorkspaceSlotState>) {
  return render(<EncounterVisitNote {...{ windowProps, onWindowChanged, onEncounterSaved, ...state }} />);
}

describe('EncounterVisitNote', () => {
  beforeEach(() => {
    vi.mocked(useConfig).mockReturnValue({ visitNoteConfig: { encounterTypeUuid: visitNoteEncounterTypeUuid } });
  });

  it('hosts the visit note form for a visit note encounter', () => {
    const encounter = { uuid: 'encounter-uuid', encounterType: { uuid: visitNoteEncounterTypeUuid } } as Encounter;

    renderExtension({ encounter });

    expect(mockExportedWorkspace).toHaveBeenCalledWith(
      {
        name: 'visit-notes-form-workspace',
        workspaceProps: { encounter, formContext: 'editing', onEncounterSaved },
        windowProps,
        onWindowChanged,
      },
      expect.anything(),
    );
  });

  it('hosts the visit note form in creating mode when the workspace type asks for it', () => {
    renderExtension({ workspaceType: 'visit-note' });

    expect(mockExportedWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceProps: { encounter: undefined, formContext: 'creating', onEncounterSaved },
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

  it('renders nothing for a form encounter, even of the visit note encounter type', () => {
    const encounter = {
      uuid: 'encounter-uuid',
      encounterType: { uuid: visitNoteEncounterTypeUuid },
      form: { uuid: 'form-uuid' },
    } as Encounter;

    renderExtension({ encounter });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });

  it('renders nothing when another kind of workspace is asked for', () => {
    renderExtension({ workspaceType: 'vitals' });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });
});
