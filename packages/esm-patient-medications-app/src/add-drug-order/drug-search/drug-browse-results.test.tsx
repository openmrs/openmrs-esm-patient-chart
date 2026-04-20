import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { mockDrugSearchResultApiData } from '__mocks__';
import DrugBrowseResults from './drug-browse-results.component';

const mockCloseWorkspace = jest.fn();
const mockOpenOrderForm = jest.fn();

jest.mock('./order-basket-search-results.component', () => ({
  DrugSearchResultItem: ({ drug }) => <div data-testid={`drug-item-${drug.uuid}`}>{drug.display}</div>,
}));

describe('DrugBrowseResults', () => {
  test('renders skeleton tiles when loading', () => {
    render(
      <DrugBrowseResults
        drugs={[]}
        isLoading={true}
        hasSelection={false}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.queryByText(/choose a category/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no drugs found/i)).not.toBeInTheDocument();
  });

  test('renders error tile when all fetches fail and no drugs are available', () => {
    render(
      <DrugBrowseResults
        drugs={[]}
        isLoading={false}
        errors={[new Error('Network error')]}
        hasSelection={true}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.getByText(/error fetching drugs/i)).toBeInTheDocument();
  });

  test('renders "Choose a category" empty state when no category is selected', () => {
    render(
      <DrugBrowseResults
        drugs={[]}
        isLoading={false}
        hasSelection={false}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.getByText(/choose a category to get started/i)).toBeInTheDocument();
    expect(screen.getByText(/select a category to see available drugs/i)).toBeInTheDocument();
  });

  test('renders "No drugs in category" empty state when a category is selected but has no drugs', () => {
    render(
      <DrugBrowseResults
        drugs={[]}
        isLoading={false}
        hasSelection={true}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.getByText(/no drugs found in this category/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a different category/i)).toBeInTheDocument();
  });

  test('renders drug items when drugs are available', () => {
    render(
      <DrugBrowseResults
        drugs={mockDrugSearchResultApiData}
        isLoading={false}
        hasSelection={true}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.getByTestId(`drug-item-${mockDrugSearchResultApiData[0].uuid}`)).toBeInTheDocument();
    expect(screen.getByTestId(`drug-item-${mockDrugSearchResultApiData[1].uuid}`)).toBeInTheDocument();
    expect(screen.getByTestId(`drug-item-${mockDrugSearchResultApiData[2].uuid}`)).toBeInTheDocument();
    expect(screen.getByText(/aspirin 81mg/i)).toBeInTheDocument();
    expect(screen.getByText(/aspirin 162.5mg/i)).toBeInTheDocument();
    expect(screen.getByText(/aspirin 325mg/i)).toBeInTheDocument();
  });

  test('renders an inline notification when there are partial errors alongside results', () => {
    render(
      <DrugBrowseResults
        drugs={mockDrugSearchResultApiData}
        isLoading={false}
        errors={[new Error('Partial failure')]}
        hasSelection={true}
        patient={mockPatient}
        visit={null}
        closeWorkspace={mockCloseWorkspace}
        openOrderForm={mockOpenOrderForm}
      />,
    );

    expect(screen.getByText(/some drugs could not be loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/aspirin 81mg/i)).toBeInTheDocument();
  });
});
