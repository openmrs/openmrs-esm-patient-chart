import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { type ConfigObject } from '../config-schema';
import DeleteStickyNoteModal from './delete-sticky-note-modal';
import { deleteStickyNote } from './resources';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('./resources', () => ({
  ...jest.requireActual('./resources'),
  deleteStickyNote: jest.fn(),
}));

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    stickyNoteConceptUuid: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  } as ConfigObject);
});

const mockDeleteStickyNote = jest.mocked(deleteStickyNote);
const mockShowSnackbar = jest.mocked(showSnackbar);

const defaultProps = {
  close: jest.fn(),
  noteUuid: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  mutate: jest.fn(),
  onClose: jest.fn(),
};

describe('DeleteStickyNoteModal', () => {
  it('renders modal with correct elements', () => {
    render(<DeleteStickyNoteModal {...defaultProps} />);
    expect(screen.getByText(/confirm delete sticky note/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this sticky note/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('clicking Cancel button closes modal', async () => {
    const user = userEvent.setup();
    render(<DeleteStickyNoteModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(defaultProps.close).toHaveBeenCalled();
  });

  it('clicking Delete button deletes sticky note and shows success', async () => {
    const user = userEvent.setup();
    mockDeleteStickyNote.mockResolvedValue(undefined);
    render(<DeleteStickyNoteModal {...defaultProps} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteStickyNote).toHaveBeenCalledWith(defaultProps.noteUuid);
    expect(mockDeleteStickyNote).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'The sticky note has been deleted successfully',
      title: 'Sticky note deleted',
      kind: 'success',
    });
  });

  it('shows error when deletion fails', async () => {
    const user = userEvent.setup();
    const error = { message: 'Server error' };
    mockDeleteStickyNote.mockRejectedValue(error);

    render(<DeleteStickyNoteModal {...defaultProps} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteStickyNote).toHaveBeenCalledWith(defaultProps.noteUuid);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Error deleting sticky note',
      subtitle: 'An error occurred while deleting the sticky note',
      kind: 'error',
    });
  });
});
