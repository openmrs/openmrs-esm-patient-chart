import React from 'react';
import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { ExtensionSlot, openmrsFetch, useConnectivity } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import FormEntry, { type FormEntryProps } from './form-entry.component';

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
  closeWorkspace: jest.fn(),
};

const mockFormEntrySub = jest.fn();
const mockUseConnectivity = jest.mocked(useConnectivity);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);

const mockExtensionSlot = jest.mocked(ExtensionSlot);

describe('FormEntry', () => {
  beforeEach(() => {
    mockUseConnectivity.mockReturnValue(true);
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
