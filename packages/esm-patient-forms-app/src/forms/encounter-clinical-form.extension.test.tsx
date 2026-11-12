import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type Encounter, ExportedWorkspace } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import EncounterClinicalForm from './encounter-clinical-form.extension';

const mockExportedWorkspace = vi.mocked(ExportedWorkspace);

const windowProps = { patient: mockPatient, patientUuid: mockPatient.id, visitContext: null };
const onWindowChanged = vi.fn();
const onEncounterSaved = vi.fn();
const encounter = { uuid: 'encounter-uuid', form: { uuid: 'form-uuid' } } as Encounter;

function renderExtension(state: Partial<EncounterWorkspaceSlotState>) {
  return render(<EncounterClinicalForm {...{ windowProps, onWindowChanged, onEncounterSaved, ...state }} />);
}

describe('EncounterClinicalForm', () => {
  it('hosts the form entry workspace for an encounter created from a form', () => {
    const additionalProps = { mode: 'edit' };

    renderExtension({ encounter, additionalProps });

    expect(mockExportedWorkspace).toHaveBeenCalledWith(
      {
        name: 'patient-form-entry-workspace',
        workspaceProps: {
          form: encounter.form,
          encounterUuid: 'encounter-uuid',
          additionalProps,
          handlePostResponse: onEncounterSaved,
        },
        windowProps,
        onWindowChanged,
      },
      expect.anything(),
    );
  });

  it('hosts the form entry workspace when the workspace type asks for it', () => {
    renderExtension({ encounter, workspaceType: 'clinical-form' });

    expect(mockExportedWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders nothing for an encounter that was not created from a form', () => {
    const { container } = renderExtension({ encounter: { uuid: 'encounter-uuid' } as Encounter });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no encounter to edit', () => {
    renderExtension({ workspaceType: 'clinical-form' });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });

  it('renders nothing when another kind of workspace is asked for', () => {
    renderExtension({ encounter, workspaceType: 'vitals' });

    expect(mockExportedWorkspace).not.toHaveBeenCalled();
  });
});
