import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useConfig, useOnClickOutside } from '@openmrs/esm-framework';
import { mockStickyNote } from '__mocks__';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../config-schema';
import { useStickyNote } from './sticky-note.resource';
import StickyNoteHeaderButton from './sticky-note-header-button.component';

jest.mock('./sticky-note.resource', () => ({
  useStickyNote: jest.fn(),
}));

jest.mock('./sticky-note-panel.component', () => () => <div data-testid="sticky-note-panel" />);

const mockUseStickyNote = useStickyNote as jest.Mock;
const mockShowModal = showModal as jest.Mock;
const mockUseOnClickOutside = useOnClickOutside as jest.Mock;
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

// The framework's jest mock of useOnClickOutside is a no-op. Swap in a minimal real
// implementation so the "closes on outside click" test can exercise the wiring.
const useRealOnClickOutside = <T extends HTMLElement>(handler: (e: MouseEvent) => void, active: boolean) => {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    if (!active) return;
    const listener = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return;
      handler(e);
    };
    window.addEventListener('mousedown', listener);
    return () => window.removeEventListener('mousedown', listener);
  }, [handler, active]);
  return ref;
};

describe('StickyNoteHeaderButton', () => {
  const patientUuid = mockPatient.id;

  beforeEach(() => {
    mockUseConfig.mockReturnValue({ stickyNoteConceptUuid: 'concept-uuid' } as ConfigObject);
  });

  it('does not render when stickyNoteConceptUuid is disabled via empty string', () => {
    mockUseConfig.mockReturnValue({ stickyNoteConceptUuid: '' } as ConfigObject);
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });

    const { container } = render(<StickyNoteHeaderButton patientUuid={patientUuid} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: /sticky note/i })).not.toBeInTheDocument();
  });

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

  it('opens the panel (not the create modal) while loading', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({ note: undefined, isLoading: true, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    await user.click(screen.getByRole('button', { name: /sticky note/i }));

    expect(mockShowModal).not.toHaveBeenCalled();
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();
  });

  it('opens the panel (not the create modal) when the fetch failed', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({
      note: undefined,
      isLoading: false,
      error: new Error('Failed'),
      mutate: jest.fn(),
    });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    await user.click(screen.getByRole('button', { name: /sticky note/i }));

    expect(mockShowModal).not.toHaveBeenCalled();
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();
  });

  it('closes the panel on Escape', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<StickyNoteHeaderButton patientUuid={patientUuid} />);
    await user.click(screen.getByRole('button', { name: /sticky note/i }));
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
  });

  it('closes the panel on outside click', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });
    mockUseOnClickOutside.mockImplementation(useRealOnClickOutside);

    render(
      <div>
        <StickyNoteHeaderButton patientUuid={patientUuid} />
        <button type="button">Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: /sticky note/i }));
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /outside/i }));
    expect(screen.queryByTestId('sticky-note-panel')).not.toBeInTheDocument();
  });

  it('ignores outside clicks that land inside an open modal', async () => {
    const user = userEvent.setup();
    mockUseStickyNote.mockReturnValue({ note: mockStickyNote, isLoading: false, error: undefined, mutate: jest.fn() });
    mockUseOnClickOutside.mockImplementation(useRealOnClickOutside);

    render(
      <div>
        <StickyNoteHeaderButton patientUuid={patientUuid} />
        <div role="dialog">
          <button type="button">In modal</button>
        </div>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: /sticky note/i }));
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /in modal/i }));
    expect(screen.getByTestId('sticky-note-panel')).toBeInTheDocument();
  });
});
