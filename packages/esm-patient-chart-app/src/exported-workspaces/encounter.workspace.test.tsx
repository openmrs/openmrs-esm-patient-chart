import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Encounter, ExtensionSlot, useWorkspace2Context, userHasAccess, type Visit } from '@openmrs/esm-framework';
import {
  encounterWorkspaceSlotName,
  type EncounterWorkspaceSlotState,
  PRIVILEGE_EDIT_PAST_VISITS,
} from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit } from '__mocks__';
import { mockPatient } from 'tools';
import EncounterWorkspace from './encounter.workspace';

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...(await vi.importActual<object>('@openmrs/esm-patient-common-lib')),
  useSystemVisitSetting: vi.fn(() => ({
    systemVisitEnabled: true,
    errorFetchingSystemVisitSetting: null,
    isLoadingSystemVisitSetting: false,
  })),
}));

const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockUseWorkspace2Context = vi.mocked(useWorkspace2Context);
const closeWorkspace = vi.fn();

const encounter = { uuid: 'encounter-uuid', encounterType: { uuid: 'type-uuid' } } as Encounter;

function mockWorkspaceContext(workspaceMeta: Record<string, unknown>) {
  return { workspaceMeta } as unknown as ReturnType<typeof useWorkspace2Context>;
}

function renderEncounterWorkspace(windowProps: Record<string, unknown> = {}) {
  const props: any = {
    windowProps: {
      patient: mockPatient,
      patientUuid: mockPatient.id,
      visitContext: mockCurrentVisit,
      ...windowProps,
    },
    workspaceProps: {},
    groupProps: {},
    closeWorkspace,
  };
  return render(<EncounterWorkspace {...props} />);
}

function getSlotState(): EncounterWorkspaceSlotState {
  return mockExtensionSlot.mock.lastCall[0].state as EncounterWorkspaceSlotState;
}

describe('EncounterWorkspace', () => {
  beforeEach(() => {
    closeWorkspace.mockClear();
    mockUseWorkspace2Context.mockReturnValue(mockWorkspaceContext({}));
  });

  it('renders the encounter workspace slot', () => {
    renderEncounterWorkspace();

    expect(mockExtensionSlot).toHaveBeenCalledWith(
      expect.objectContaining({ name: encounterWorkspaceSlotName }),
      expect.anything(),
    );
  });

  describe('editing past visits', () => {
    const pastVisit = { ...mockCurrentVisit, stopDatetime: '2021-05-01T10:00:00.000+0000' } as Visit;

    it('does not render the encounter workspace slot without the edit past visits privilege', () => {
      vi.mocked(userHasAccess).mockReturnValue(false);
      mockExtensionSlot.mockClear();

      renderEncounterWorkspace({ visitContext: pastVisit });

      expect(screen.getByText(/you cannot edit past visits/i)).toBeInTheDocument();
      expect(mockExtensionSlot).not.toHaveBeenCalled();
    });

    it('renders the encounter workspace slot with the edit past visits privilege', () => {
      vi.mocked(userHasAccess).mockImplementation((privilege) => privilege === PRIVILEGE_EDIT_PAST_VISITS);

      renderEncounterWorkspace({ visitContext: pastVisit });

      expect(screen.queryByText(/you cannot edit past visits/i)).not.toBeInTheDocument();
      expect(mockExtensionSlot).toHaveBeenCalledWith(
        expect.objectContaining({ name: encounterWorkspaceSlotName }),
        expect.anything(),
      );
    });
  });

  it('hands the patient and the visit of its window props to the hosted workspaces as window props', () => {
    renderEncounterWorkspace({ encounter });

    expect(getSlotState().windowProps).toEqual({
      patient: mockPatient,
      patientUuid: mockPatient.id,
      visitContext: mockCurrentVisit,
    });
  });

  it('passes the encounter, the additional props and onEncounterSaved to the slot', () => {
    const onEncounterSaved = vi.fn();
    const additionalProps = { mode: 'edit' };

    renderEncounterWorkspace({ encounter, onEncounterSaved, additionalProps });

    expect(getSlotState()).toEqual(expect.objectContaining({ encounter, additionalProps, onEncounterSaved }));
  });

  it('passes the workspace type from the workspace meta to the slot', () => {
    mockUseWorkspace2Context.mockReturnValue(mockWorkspaceContext({ type: 'vitals' }));

    renderEncounterWorkspace();

    expect(getSlotState().workspaceType).toBe('vitals');
  });

  it('keeps the window props it hands to the hosted workspaces referentially stable across renders', () => {
    const { rerender } = renderEncounterWorkspace({ encounter });
    const firstWindowProps = getSlotState().windowProps;

    rerender(
      <EncounterWorkspace
        {...({
          windowProps: {
            patient: mockPatient,
            patientUuid: mockPatient.id,
            visitContext: mockCurrentVisit,
            encounter,
          },
          workspaceProps: {},
          groupProps: {},
          closeWorkspace,
        } as any)}
      />,
    );

    expect(getSlotState().windowProps).toBe(firstWindowProps);
  });

  it('shows the visit the encounter belongs to, rather than the active visit, in the header', () => {
    const encounterVisit = {
      ...mockCurrentVisit,
      uuid: 'past-visit-uuid',
      visitType: { uuid: 'past-visit-type-uuid', display: 'Past inpatient visit' },
      stopDatetime: '2023-01-01T10:00:00.000+0000',
    };
    renderEncounterWorkspace({ encounter, visitContext: encounterVisit });

    expect(screen.getByText(/editing/i)).toBeInTheDocument();
    expect(screen.getByText('Past inpatient visit')).toBeInTheDocument();
    expect(screen.queryByText(mockCurrentVisit.visitType.display)).not.toBeInTheDocument();
  });

  it('shows that it is adding to the visit when there is no encounter yet', () => {
    renderEncounterWorkspace();

    expect(screen.getByText(/adding to/i)).toBeInTheDocument();
  });

  it('shows the title of the hosted workspace', () => {
    renderEncounterWorkspace({ encounter });

    act(() =>
      getSlotState().onWindowChanged({
        workspaceName: 'visit-notes-form-workspace',
        windowWidth: 'narrow',
        title: 'Edit visit note',
        hasUnsavedChanges: false,
      }),
    );

    expect(screen.getByRole('heading', { name: 'Edit visit note' })).toBeInTheDocument();
    expect(closeWorkspace).not.toHaveBeenCalled();
  });

  it('closes itself once the hosted workspace has closed', () => {
    renderEncounterWorkspace({ encounter });

    act(() =>
      getSlotState().onWindowChanged({
        workspaceName: null,
        windowWidth: 'narrow',
        title: '',
        hasUnsavedChanges: false,
      }),
    );

    expect(closeWorkspace).toHaveBeenCalledTimes(1);
  });
});
