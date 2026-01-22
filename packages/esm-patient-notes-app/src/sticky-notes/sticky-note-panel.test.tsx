import React from 'react';
import { render, screen } from '@testing-library/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';
import StickyNotePanel from './sticky-note-panel';
import { mockStickyNotesData } from '__mocks__';
import { createStickyNote, updateStickyNote, useStickyNotes } from './resources';

jest.mock('./resources', () => ({
  useStickyNotes: jest.fn(),
  createStickyNote: jest.fn(),
  updateStickyNote: jest.fn(),
}));

const mockUseStickyNotes = jest.mocked(useStickyNotes);
const mockCreateStickyNote = jest.mocked(createStickyNote);
const mockUpdateStickyNote = jest.mocked(updateStickyNote);
const mockUseConfig = jest.mocked(useConfig);
const mockShowSnackbar = jest.mocked(showSnackbar);

describe('StickyNotePanel', () => {
  const patientUuid = 'patient-uuid';
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue({
      stickyNoteConceptUuid: 'concept-uuid',
    });
  });

  it('shows skeleton when loading', () => {
    mockUseStickyNotes.mockReturnValue({
      notes: [],
      isLoading: true,
      isError: undefined,
      mutate: jest.fn(),
    });

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);
    expect(screen.queryByText('Sticky Note')).not.toBeInTheDocument();
  });

  it('renders the notes form when no data exist', async () => {
    mockUseStickyNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    expect(screen.getByLabelText('Sticky Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your sticky note here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('shows note content when notes exist', () => {
    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    expect(screen.getByText(/simple notes/i)).toBeInTheDocument();
  });

  it('render Edit notes when click on edit button ', async () => {
    const user = userEvent.setup();

    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    const editButton = screen.getByRole('button', { name: /edit sticky note/i });
    await user.click(editButton);

    expect(screen.getByLabelText(/sticky Note/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/simple notes/i)).toBeInTheDocument();
  });

  it('renders new notes form when click on add button', async () => {
    const user = userEvent.setup();

    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    const addButton = screen.getByRole('button', { name: /add sticky note/i });
    await user.click(addButton);

    expect(screen.getByLabelText(/sticky Note/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('calls createStickyNote when saving a new note', async () => {
    const user = userEvent.setup();
    mockUseStickyNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });
    mockCreateStickyNote.mockResolvedValue({} as any);

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    const textArea = screen.getByLabelText('Sticky Note');
    await user.type(textArea, 'New note content');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockCreateStickyNote).toHaveBeenCalledWith(patientUuid, 'New note content', 'concept-uuid');
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });

  it('calls updateStickyNote when saving an updated note', async () => {
    const user = userEvent.setup();
    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });
    mockUpdateStickyNote.mockResolvedValue({} as any);

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    const editButton = screen.getByRole('button', { name: /edit sticky note/i });
    await user.click(editButton);

    const textArea = screen.getByLabelText('Sticky Note');
    await user.clear(textArea);
    await user.type(textArea, 'Updated note content');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockUpdateStickyNote).toHaveBeenCalledWith(
      'cc566b65-65b0-448d-a0a8-eb1214004a8d',
      'Updated note content',
      'concept-uuid',
      patientUuid,
    );
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });

  it('shows error snackbar when save fails', async () => {
    const user = userEvent.setup();
    mockUseStickyNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      isError: undefined,
      mutate: jest.fn(),
    });
    mockCreateStickyNote.mockRejectedValue(new Error('Failed'));

    render(<StickyNotePanel patientUuid={patientUuid} onClose={onClose} />);

    const textArea = screen.getByLabelText('Sticky Note');
    await user.type(textArea, 'New note content');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
  });
});
