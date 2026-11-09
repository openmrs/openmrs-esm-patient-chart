import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { useDrugSearch } from './drug-search.resource';
import DrugSearch from './drug-search.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseDrugSearch = vi.mocked(useDrugSearch);

vi.mock('./drug-search.resource', async () => ({
  ...((await vi.importActual('./drug-search.resource')) as object),
  useDrugSearch: vi.fn(),
}));

const defaultProps = {
  openOrderForm: vi.fn(),
  closeWorkspace: vi.fn(),
  patient: { id: 'patient-uuid' } as fhir.Patient,
  visit: null,
  searchTerm: '',
  onSearchTermChange: vi.fn(),
};

describe('DrugSearch', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      minimumCharacterLengthForDrugSearch: 3,
    });
    mockUseDrugSearch.mockReturnValue({
      drugs: [],
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('renders the search input', () => {
    render(<DrugSearch {...defaultProps} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('does not trigger a search when the search term is below the minimum character length', () => {
    render(<DrugSearch {...defaultProps} searchTerm="ab" />);
    expect(mockUseDrugSearch).toHaveBeenCalledWith('');
    expect(screen.queryByText(/no results to display/i)).not.toBeInTheDocument();
  });

  it('triggers a search when the search term meets the minimum character length', () => {
    render(<DrugSearch {...defaultProps} searchTerm="asp" />);
    expect(mockUseDrugSearch).toHaveBeenCalledWith('asp');
    expect(screen.getByText(/no results to display for "asp"/i)).toBeInTheDocument();
  });

  it('triggers a search when the search term exceeds the minimum character length', () => {
    render(<DrugSearch {...defaultProps} searchTerm="aspirin" />);
    expect(mockUseDrugSearch).toHaveBeenCalledWith('aspirin');
    expect(screen.getByText(/no results to display for "aspirin"/i)).toBeInTheDocument();
  });

  it('does not trigger a search when the search term is empty', () => {
    render(<DrugSearch {...defaultProps} searchTerm="" />);
    expect(mockUseDrugSearch).toHaveBeenCalledWith('');
    expect(screen.queryByText(/no results to display/i)).not.toBeInTheDocument();
  });

  it('respects a custom minimumCharacterLengthForDrugSearch of 1', () => {
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      minimumCharacterLengthForDrugSearch: 1,
    });

    render(<DrugSearch {...defaultProps} searchTerm="a" />);
    expect(mockUseDrugSearch).toHaveBeenCalledWith('a');
    expect(screen.getByText(/no results to display for "a"/i)).toBeInTheDocument();
  });

  it('calls onSearchTermChange when the user types in the search input', async () => {
    const user = userEvent.setup();
    const onSearchTermChange = vi.fn();

    render(<DrugSearch {...defaultProps} onSearchTermChange={onSearchTermChange} />);

    await user.type(screen.getByRole('searchbox'), 'asp');
    expect(onSearchTermChange).toHaveBeenCalled();
  });
});
