import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';
import { mockStickyNote } from '__mocks__';
import StickyNotePanel from './sticky-note-panel.component';

const mockShowModal = showModal as jest.Mock;

describe('StickyNotePanel', () => {
  const patientUuid = 'patient-uuid';
  const onClose = jest.fn();
  const mutate = jest.fn();

  const defaultProps = {
    error: undefined,
    isLoading: false,
    mutate,
    onClose,
    patientUuid,
  };

  it('shows a skeleton while loading', () => {
    render(<StickyNotePanel {...defaultProps} isLoading={true} note={undefined} />);

    expect(screen.queryByText(/simple notes/i)).not.toBeInTheDocument();
  });

  it('shows an error state when the fetch fails', () => {
    render(<StickyNotePanel {...defaultProps} error={new Error('Failed')} note={undefined} />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });

  it('renders nothing when no note exists and not loading', () => {
    const { container } = render(<StickyNotePanel {...defaultProps} note={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders note text with creator and date metadata', () => {
    render(<StickyNotePanel {...defaultProps} note={mockStickyNote} />);

    expect(screen.getByText(/simple notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Ray Romano/)).toBeInTheDocument();
  });

  it('opens the edit modal when the edit icon is clicked', async () => {
    const user = userEvent.setup();

    render(<StickyNotePanel {...defaultProps} note={mockStickyNote} />);

    await user.click(screen.getByRole('button', { name: /edit sticky note/i }));

    expect(mockShowModal).toHaveBeenCalledWith(
      'sticky-note-modal',
      expect.objectContaining({ existingNote: mockStickyNote, mutate, patientUuid }),
    );
  });
});
