import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ConceptSearchField } from './concept-search-field.component';
import type { ConceptReference } from '../../types';

const createMockField = (overrides = {}) => ({
  searchTerm: '',
  setSearchTerm: vi.fn(),
  searchResults: [] as Array<ConceptReference>,
  isSearching: false,
  error: undefined as Error | undefined,
  clear: vi.fn(),
  ...overrides,
});

const defaultProps = {
  label: 'Procedure',
  placeholder: 'Search for a procedure',
  selectedConcept: null as ConceptReference | null,
  onChange: vi.fn(),
};

describe('Concept Search Field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with label and placeholder', () => {
    const field = createMockField();
    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.getByRole('searchbox', { name: /procedure/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for a procedure')).toBeInTheDocument();
  });

  it('typing calls setSearchTerm', async () => {
    const user = userEvent.setup();
    const field = createMockField();

    render(<ConceptSearchField {...defaultProps} field={field} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'App');

    expect(field.setSearchTerm).toHaveBeenCalled();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('typing after a concept is selected fires onChange(null)', async () => {
    const user = userEvent.setup();
    const field = createMockField();
    const selectedConcept: ConceptReference = { uuid: '1', display: 'Appendectomy' };

    render(<ConceptSearchField {...defaultProps} field={field} selectedConcept={selectedConcept} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'a');

    expect(field.setSearchTerm).toHaveBeenCalled();
    expect(defaultProps.onChange).toHaveBeenCalledWith(null);
  });

  it('clearing the search input calls field.clear and fires onChange(null)', async () => {
    const user = userEvent.setup();
    const field = createMockField({ searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    const clearButton = screen.getByRole('button', { name: /clear search input/i });
    await user.click(clearButton);

    expect(field.clear).toHaveBeenCalled();
    expect(defaultProps.onChange).toHaveBeenCalledWith(null);
  });

  it('displays selected concept display name in the search input', () => {
    const selectedConcept: ConceptReference = { uuid: '1', display: 'Appendectomy' };
    const field = createMockField({ searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} selectedConcept={selectedConcept} />);

    expect(screen.getByDisplayValue('Appendectomy')).toBeInTheDocument();
  });

  it('shows loading spinner while searching', () => {
    const field = createMockField({ isSearching: true, searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.getByText(/searching\.\.\./i)).toBeInTheDocument();
  });

  it('renders search results as a listbox', () => {
    const searchResults: Array<ConceptReference> = [
      { uuid: '1', display: 'Appendectomy' },
      { uuid: '2', display: 'Appendix removal' },
    ];
    const field = createMockField({ searchResults, searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Appendectomy' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Appendix removal' })).toBeInTheDocument();
  });

  it('clicking a result selects it and fires onChange', async () => {
    const user = userEvent.setup();
    const result: ConceptReference = { uuid: '1', display: 'Appendectomy' };
    const field = createMockField({ searchResults: [result], searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    await user.click(screen.getByRole('option', { name: 'Appendectomy' }));

    expect(field.setSearchTerm).toHaveBeenCalledWith('');
    expect(defaultProps.onChange).toHaveBeenCalledWith(result);
  });

  it('pressing Enter on a result selects it', async () => {
    const user = userEvent.setup();
    const result: ConceptReference = { uuid: '1', display: 'Appendectomy' };
    const field = createMockField({ searchResults: [result], searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    const option = screen.getByRole('option', { name: 'Appendectomy' });
    option.focus();
    await user.keyboard('{Enter}');

    expect(field.setSearchTerm).toHaveBeenCalledWith('');
    expect(defaultProps.onChange).toHaveBeenCalledWith(result);
  });

  it('pressing Space on a result selects it', async () => {
    const user = userEvent.setup();
    const result: ConceptReference = { uuid: '1', display: 'Appendectomy' };
    const field = createMockField({ searchResults: [result], searchTerm: 'App' });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    const option = screen.getByRole('option', { name: 'Appendectomy' });
    option.focus();
    await user.keyboard(' ');

    expect(field.setSearchTerm).toHaveBeenCalledWith('');
    expect(defaultProps.onChange).toHaveBeenCalledWith(result);
  });

  it('shows empty-state tile when no results match', () => {
    const field = createMockField({ searchTerm: 'xyz', searchResults: [], isSearching: false });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
    expect(screen.getByText(/"xyz"/i)).toBeInTheDocument();
  });

  it('hides results when there is no search term', () => {
    const field = createMockField({ searchTerm: '', searchResults: [] });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/no results for/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
  });

  it('shows error notification when concept search fails', () => {
    const error = new Error('Network error');
    const field = createMockField({ searchTerm: 'App', error });

    render(<ConceptSearchField {...defaultProps} field={field} />);

    expect(screen.getByText(/error fetching concepts/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('hides results when a concept is already selected', () => {
    const selectedConcept: ConceptReference = { uuid: '1', display: 'Appendectomy' };
    const field = createMockField({
      searchTerm: 'App',
      searchResults: [selectedConcept],
    });

    render(<ConceptSearchField {...defaultProps} field={field} selectedConcept={selectedConcept} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
  });
});
