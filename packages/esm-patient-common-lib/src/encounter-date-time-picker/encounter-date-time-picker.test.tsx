import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { userHasAccess, type Visit } from '@openmrs/esm-framework';
import { PRIVILEGE_EDIT_PAST_VISITS } from '../privileges';
import { EncounterDateTimePicker } from './encounter-date-time-picker.component';

const mockUserHasAccess = vi.mocked(userHasAccess);

const activeVisit = { uuid: 'active', startDatetime: '2020-01-01T08:00:00.000+0000', stopDatetime: null } as Visit;
const pastVisit = {
  uuid: 'past',
  startDatetime: '2026-06-01T08:00:00.000+0000',
  stopDatetime: '2026-06-03T17:00:00.000+0000',
} as Visit;

describe('EncounterDateTimePicker', () => {
  beforeEach(() => {
    mockUserHasAccess.mockImplementation((privilege) => privilege === PRIVILEGE_EDIT_PAST_VISITS);
  });

  it('is shown for the active visit without the edit past visits privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={activeVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('This visit note is')).toBeInTheDocument();
  });

  it('is hidden for a past visit without the edit past visits privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={pastVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Visit note date', { selector: 'input' })).not.toBeInTheDocument();
  });

  it('is shown for a past visit with the edit past visits privilege', () => {
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={pastVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Visit note date')).toBeInTheDocument();
  });

  it('reports a datetime outside the visit window', () => {
    const onValidityChange = vi.fn();
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={pastVisit}
        value={new Date('2026-06-04T10:00:00.000Z')}
        onChange={vi.fn()}
        onValidityChange={onValidityChange}
      />,
    );

    expect(onValidityChange).toHaveBeenLastCalledWith('afterVisitEnd');
    expect(screen.getAllByText(/cannot be after the end of the visit/i).length).toBeGreaterThan(0);
  });

  it('shows only the "Now" choice, and no inputs, for a new encounter of an active visit', () => {
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={activeVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: /^now$/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByLabelText('Visit note date', { selector: 'input' })).not.toBeInTheDocument();
  });

  it('chooses "now" by clearing the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={activeVisit}
        value={new Date('2026-01-02T10:00:00.000Z')}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('tab', { name: /^now$/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('chooses a specific datetime by setting a value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={activeVisit}
        value={null}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('tab', { name: /in the past/i }));

    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does not offer "now" when disallowed or for a past visit', () => {
    const { rerender } = render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={activeVisit}
        value={new Date('2026-01-02T10:00:00.000Z')}
        onChange={vi.fn()}
        allowNow={false}
      />,
    );
    expect(screen.queryByRole('tab', { name: /^now$/i })).not.toBeInTheDocument();

    rerender(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        visit={pastVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('tab', { name: /^now$/i })).not.toBeInTheDocument();
  });

  it('uses the given time label', () => {
    render(
      <EncounterDateTimePicker
        dateLabel="Visit note date"
        timingLabel="This visit note is"
        timeLabel="Visit note time"
        visit={pastVisit}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Visit note time')).toBeInTheDocument();
  });
});
