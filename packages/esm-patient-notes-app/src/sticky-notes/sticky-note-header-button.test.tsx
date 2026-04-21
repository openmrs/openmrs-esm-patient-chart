import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';
import { mockStickyNote } from '__mocks__';
import { useStickyNote } from './resources';
import StickyNoteHeaderButton from './sticky-note-header-button.component';

jest.mock('./resources', () => ({
  useStickyNote: jest.fn(),
}));

jest.mock('./sticky-note-panel.component', () => () => <div data-testid="sticky-note-panel" />);

const mockUseStickyNote = useStickyNote as jest.Mock;
const mockShowModal = showModal as jest.Mock;

describe('StickyNoteHeaderButton', () => {
  const patientUuid = '3355bd93-3c83-414d-87b1-c87e608ca85a';

  it('renders a button labelled "Sticky note"', () => {
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);

    expect(screen.getByRole('button', { name: /sticky note/i })).toBeInTheDocument();
  });

  it('shows a "1" badge when a note exists', () => {
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show a badge when no note exists', () => {
    mockUseStickyNote.mockReturnValue({ note: undefined, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('toggles the panel on click when a note exists', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    const button = screen.getByRole('button', { name: /sticky note/i });

    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
    await user.click(button);
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();
    await user.click(button);
    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
  });

  it('opens the create modal on click when no note exists', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockUseStickyNote.mockReturnValue({ note: undefined, isLoading: false, error: undefined, mutate });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    await user.click(screen.getByRole('button', { name: /sticky note/i }));

    expect(mockShowModal).toHaveBeenCalledWith('sticky-note-modal', expect.objectContaining({ patientUuid, mutate }));
    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
  });
});
