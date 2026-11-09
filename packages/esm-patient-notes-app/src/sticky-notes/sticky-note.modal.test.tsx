import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { mockStickyNote } from '__mocks__';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../config-schema';
import { createStickyNote, updateStickyNote } from './sticky-note.resource';
import StickyNoteModal from './sticky-note.modal';

vi.mock('./sticky-note.resource', () => ({
  createStickyNote: vi.fn(),
  updateStickyNote: vi.fn(),
}));

vi.mock('./utils', () => ({
  decodeHtmlEntities: (text: string) => text,
}));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockCreateStickyNote = vi.mocked(createStickyNote);
const mockUpdateStickyNote = vi.mocked(updateStickyNote);

describe('StickyNoteModal', () => {
  const patientUuid = mockPatient.id;
  const defaultProps = {
    close: vi.fn(),
    mutate: vi.fn(),
    patientUuid,
  };

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      stickyNoteConceptUuid: 'concept-uuid',
    } as ConfigObject);
  });

  it('renders an empty create form by default', () => {
    render(<StickyNoteModal {...defaultProps} />);

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('keeps Save disabled when the input is only whitespace', async () => {
    const user = userEvent.setup();
    render(<StickyNoteModal {...defaultProps} />);

    await user.type(screen.getByRole('textbox'), '   ');

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('keeps Save disabled in edit mode when the value is cleared to whitespace', async () => {
    const user = userEvent.setup();
    render(<StickyNoteModal {...defaultProps} existingNote={mockStickyNote} />);

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '   ');

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('creates a new sticky note and shows a success snackbar', async () => {
    const user = userEvent.setup();
    mockCreateStickyNote.mockResolvedValue({} as any);

    render(<StickyNoteModal {...defaultProps} />);

    await user.type(screen.getByRole('textbox'), 'New note');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockCreateStickyNote).toHaveBeenCalledWith(patientUuid, 'New note', 'concept-uuid');
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    expect(defaultProps.close).toHaveBeenCalled();
  });

  it('prefills the textarea in edit mode and updates on save', async () => {
    const user = userEvent.setup();
    mockUpdateStickyNote.mockResolvedValue({} as any);

    render(<StickyNoteModal {...defaultProps} existingNote={mockStickyNote} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(mockStickyNote.value);

    await user.clear(textarea);
    await user.type(textarea, 'Updated note');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockUpdateStickyNote).toHaveBeenCalledWith(mockStickyNote.uuid, 'Updated note');
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });

  it('disables Save when the edit leaves the value unchanged', () => {
    render(<StickyNoteModal {...defaultProps} existingNote={mockStickyNote} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('shows an error snackbar when the save fails', async () => {
    const user = userEvent.setup();
    mockCreateStickyNote.mockRejectedValue(new Error('Server error'));

    render(<StickyNoteModal {...defaultProps} />);

    await user.type(screen.getByRole('textbox'), 'New note');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
  });
});
