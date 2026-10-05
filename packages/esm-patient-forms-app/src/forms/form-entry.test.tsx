import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { ExtensionSlot, openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import FormEntry, { type FormEntryProps } from './form-entry.component';

vi.mock('../htmlformentry/html-form-entry-wrapper.component', () => ({
  default: () => <iframe title="Legacy HTML form" />,
}));

const defaultProps: FormEntryProps = {
  form: {
    uuid: 'some-form-uuid',
    name: '',
    version: '',
    published: false,
    retired: false,
    resources: [],
  },
  patientUuid: mockPatient.id,
  patient: mockPatient,
  visitContext: null,
  mutateVisitContext: null,
  closeWorkspace: vi.fn(),
};

const mockFormEntrySub = vi.fn();
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const mockExtensionSlot = vi.mocked(ExtensionSlot);

describe('FormEntry', () => {
  beforeEach(() => {
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );
    mockExtensionSlot.mockImplementation((ext) => ext.name as any);
  });

  it('renders an extension where the form entry widget plugs in', async () => {
    render(<FormEntry {...defaultProps} />);

    await screen.findByText(/form-widget-slot/);
    expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });

  it('returns to clinical forms without bypassing unsaved-change handling', () => {
    const closeWorkspace = vi.fn();
    render(<FormEntry {...defaultProps} showBackButton closeWorkspace={closeWorkspace} />);

    fireEvent.click(screen.getByRole('button', { name: /Back to clinical forms/ }));

    expect(closeWorkspace).toHaveBeenCalledExactlyOnceWith();
  });

  it('does not offer Back when opened without a parent', () => {
    render(<FormEntry {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /Back to clinical forms/ })).not.toBeInTheDocument();
  });

  it('does not offer Back for legacy HTML forms without unsaved-change tracking', () => {
    render(
      <FormEntry
        {...defaultProps}
        showBackButton
        form={{
          ...defaultProps.form,
          resources: [
            {
              uuid: 'html-form-engine-resource',
              name: 'formEngine',
              dataType: 'java.lang.String',
              valueReference: 'htmlformentry',
            },
          ],
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: /Back to clinical forms/ })).not.toBeInTheDocument();
    expect(screen.getByTitle('Legacy HTML form')).toBeInTheDocument();
  });

  it('uses the encounter visit when editing an existing encounter', async () => {
    const encounterVisit = {
      uuid: 'encounter-visit-uuid',
      startDatetime: '2026-02-22T09:00:00.000+0000',
      stopDatetime: '2026-02-22T18:00:00.000+0000',
      visitType: { uuid: 'visit-type-uuid', name: 'Facility Visit' },
    };

    mockOpenmrsFetch.mockResolvedValueOnce({
      data: { visit: encounterVisit },
    } as any);

    const activeVisitContext = {
      uuid: 'active-visit-uuid',
      startDatetime: '2026-02-24T08:00:00.000+0000',
      stopDatetime: null,
      visitType: { uuid: 'visit-type-uuid', name: 'Facility Visit' },
    };

    render(<FormEntry {...defaultProps} encounterUuid="some-encounter-uuid" visitContext={activeVisitContext} />);

    await screen.findByText(/form-widget-slot/);

    const state = mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot')?.[0].state;
    expect(state.visitUuid).toBe('encounter-visit-uuid');
    expect(state.visit).toEqual(encounterVisit);
  });

  it('does not inject the active visit for a visitless encounter edit', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: { visit: null },
    } as any);

    const activeVisitContext = {
      uuid: 'active-visit-uuid',
      startDatetime: '2026-02-24T08:00:00.000+0000',
      stopDatetime: null,
      visitType: { uuid: 'visit-type-uuid', name: 'Facility Visit' },
    };

    render(<FormEntry {...defaultProps} encounterUuid="visitless-encounter-uuid" visitContext={activeVisitContext} />);

    await screen.findByText(/form-widget-slot/);

    const state = mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot')?.[0].state;
    expect(state.visitUuid).toBeNull();
    expect(state.visit).toBeNull();
  });
});
