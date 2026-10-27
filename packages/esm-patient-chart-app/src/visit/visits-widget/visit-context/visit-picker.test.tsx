import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type Visit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import VisitPickerList from './visit-picker.component';

const activeVisit = {
  ...mockCurrentVisit,
  uuid: 'active-visit-uuid',
  visitType: { uuid: 'type-1', display: 'Facility Visit' },
  stopDatetime: null,
} as unknown as Visit;
const pastVisit = {
  ...mockCurrentVisit,
  uuid: 'past-visit-uuid',
  visitType: { uuid: 'type-2', display: 'Home Visit' },
  stopDatetime: '2023-01-02T10:00:00.000+0000',
} as unknown as Visit;

function renderPicker(props = {}) {
  const defaultProps = {
    visits: [activeVisit, pastVisit],
    isLoading: false,
    error: undefined,
    hasMore: false,
    loadMore: vi.fn(),
    maxStartDate: new Date(),
    onChangeMaxStartDate: vi.fn(),
    selectedVisitUuid: null,
    onSelectVisit: vi.fn(),
  };
  render(<VisitPickerList {...defaultProps} {...props} />);
  return defaultProps;
}

describe('VisitPickerList', () => {
  it('lists the visits, tagging the active one', () => {
    renderPicker();

    expect(screen.getByRole('button', { name: /Facility Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Home Visit/ })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('selects a visit when its card is clicked, and marks the selected card', async () => {
    const user = userEvent.setup();
    const { onSelectVisit } = renderPicker({ selectedVisitUuid: pastVisit.uuid });

    expect(screen.getByRole('button', { name: /Home Visit/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Facility Visit/ })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: /Facility Visit/ }));
    expect(onSelectVisit).toHaveBeenCalledWith(activeVisit);
  });

  it('shows an empty state when there are no visits', () => {
    renderPicker({ visits: [] });

    expect(screen.getByText('No visits to display')).toBeInTheDocument();
  });

  it('only offers to create a visit when a handler is given', async () => {
    const user = userEvent.setup();
    const onClickCreateNewVisit = vi.fn();
    const { rerender } = render(
      <VisitPickerList
        visits={[]}
        isLoading={false}
        error={undefined}
        hasMore={false}
        loadMore={vi.fn()}
        maxStartDate={new Date()}
        onChangeMaxStartDate={vi.fn()}
        selectedVisitUuid={null}
        onSelectVisit={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /create new visit/i })).not.toBeInTheDocument();

    rerender(
      <VisitPickerList
        visits={[]}
        isLoading={false}
        error={undefined}
        hasMore={false}
        loadMore={vi.fn()}
        maxStartDate={new Date()}
        onChangeMaxStartDate={vi.fn()}
        selectedVisitUuid={null}
        onSelectVisit={vi.fn()}
        onClickCreateNewVisit={onClickCreateNewVisit}
      />,
    );
    await user.click(screen.getByRole('button', { name: /create new visit/i }));
    expect(onClickCreateNewVisit).toHaveBeenCalled();
  });
});
