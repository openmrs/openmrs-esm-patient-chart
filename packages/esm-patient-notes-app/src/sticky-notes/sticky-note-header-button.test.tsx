import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStickyNotesData } from '__mocks__';
import { useStickyNotes } from './resources';
import StickyNoteHeaderButton from './sticky-note-header-button';

jest.mock('./resources', () => ({
  useStickyNotes: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock('./sticky-note-panel', () => () => <div data-testid="sticky-note-panel" />);

const mockUseStickyNotes = useStickyNotes as jest.Mock;

describe('StickyNoteHeaderButton', () => {
  const patientUuid = '3355bd93-3c83-414d-87b1-c87e608ca85a';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with sticky notes label', () => {
    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
    });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    expect(screen.getByRole('button', { name: /Sticky notes/i })).toBeInTheDocument();
  });

  it('shows notification badge with note count when notes exist', () => {
    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
    });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show notification badge when no notes exist', () => {
    mockUseStickyNotes.mockReturnValue({
      notes: [],
    });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows sticky note panel when clicked', async () => {
    const user = userEvent.setup();
    mockUseStickyNotes.mockReturnValue({
      notes: mockStickyNotesData,
    });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);

    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Sticky notes/i });

    await user.click(button);
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();
    await user.click(button);
    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
  });
});
