import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from 'tools';
import { showSnackbar } from '@openmrs/esm-framework';
import DrugBrowse from './drug-browse.component';
import { useConceptTree, useDrugsByConcepts } from './drug-search.resource';
import { type ConceptSet } from './drug-search.resource';

const mockUseConceptTree = jest.mocked(useConceptTree);
const mockUseDrugsByConcepts = jest.mocked(useDrugsByConcepts);
const mockShowSnackbar = jest.mocked(showSnackbar);

jest.mock('./drug-search.resource', () => ({
  ...jest.requireActual('./drug-search.resource'),
  useConceptTree: jest.fn(),
  useDrugsByConcepts: jest.fn(),
}));

jest.mock('./order-basket-search-results.component', () => ({
  DrugSearchResultItem: ({ drug }) => <div data-testid={`drug-item-${drug.uuid}`}>{drug.display}</div>,
}));

const mockCloseWorkspace = jest.fn();
const mockOpenOrderForm = jest.fn();

const mockConceptSets: ConceptSet[] = [
  { uuid: 'set-1-uuid', display: 'Analgesics' },
  { uuid: 'set-2-uuid', display: 'Antibiotics' },
];

describe('DrugBrowse', () => {
  beforeEach(() => {
    mockUseConceptTree.mockReturnValue({
      tree: null,
      isLoading: false,
      error: undefined,
    });

    mockUseDrugsByConcepts.mockReturnValue({
      drugs: [],
      errors: [],
      isLoading: false,
    });
  });

  test('renders the category combobox', () => {
    renderDrugBrowse();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/browse drugs by category/i)).toBeInTheDocument();
  });

  test('shows the "Choose a category" empty state before any selection', () => {
    renderDrugBrowse();

    expect(screen.getByText(/choose a category to get started/i)).toBeInTheDocument();
  });

  test('shows a loading indicator when the concept tree is loading', async () => {
    mockUseConceptTree.mockReturnValue({
      tree: null,
      isLoading: true,
      error: undefined,
    });

    renderDrugBrowse();

    expect(screen.getByText(/loading category tree/i)).toBeInTheDocument();
  });

  test('shows an error tile when the concept tree fails to load', () => {
    mockUseConceptTree.mockReturnValue({
      tree: null,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderDrugBrowse();

    expect(screen.getByText(/error loading category structure/i)).toBeInTheDocument();
  });

  test('shows an error snackbar when concept sets fail to load', () => {
    const error = new Error('Failed to fetch concept sets');

    renderDrugBrowse({ conceptSetsError: error });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/error loading drug categories/i),
        kind: 'error',
      }),
    );
  });

  test('renders subcategories when the selected node has nested concept sets', async () => {
    const user = userEvent.setup();

    mockUseConceptTree.mockReturnValue({
      tree: {
        uuid: 'set-1-uuid',
        display: 'Analgesics',
        isSet: true,
        setMembers: [
          { uuid: 'sub-1-uuid', display: 'NSAIDs', isSet: true, setMembers: [] },
          { uuid: 'sub-2-uuid', display: 'Opioids', isSet: true, setMembers: [] },
        ],
      },
      isLoading: false,
      error: undefined,
    });

    renderDrugBrowse();

    // Select "Analgesics" from combobox
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByText('Analgesics'));

    expect(screen.getByText('NSAIDs')).toBeInTheDocument();
    expect(screen.getByText('Opioids')).toBeInTheDocument();
  });

  test('renders drugs when the selected node has drug concepts', async () => {
    const user = userEvent.setup();

    mockUseConceptTree.mockReturnValue({
      tree: {
        uuid: 'set-1-uuid',
        display: 'Analgesics',
        isSet: true,
        setMembers: [
          { uuid: 'concept-1-uuid', display: 'Aspirin', isSet: false },
          { uuid: 'concept-2-uuid', display: 'Ibuprofen', isSet: false },
        ],
      },
      isLoading: false,
      error: undefined,
    });

    mockUseDrugsByConcepts.mockReturnValue({
      drugs: [
        {
          uuid: 'drug-1-uuid',
          display: 'Aspirin 81mg',
          name: 'Aspirin 81mg',
          strength: '81mg',
          dosageForm: { display: 'Tablet', uuid: 'form-uuid' },
          concept: { display: 'Aspirin', uuid: 'concept-1-uuid' },
        },
      ],
      errors: [],
      isLoading: false,
    });

    renderDrugBrowse();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByText('Analgesics'));

    expect(screen.getByRole('heading', { name: /drugs/i })).toBeInTheDocument();
    expect(screen.getByTestId('drug-item-drug-1-uuid')).toBeInTheDocument();
  });

  test('does not show the "Drugs" heading when the node has only subcategories', async () => {
    const user = userEvent.setup();

    mockUseConceptTree.mockReturnValue({
      tree: {
        uuid: 'set-1-uuid',
        display: 'Analgesics',
        isSet: true,
        setMembers: [{ uuid: 'sub-1-uuid', display: 'NSAIDs', isSet: true, setMembers: [] }],
      },
      isLoading: false,
      error: undefined,
    });

    renderDrugBrowse();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByText('Analgesics'));

    expect(screen.getByText('NSAIDs')).toBeInTheDocument();
    expect(screen.queryByText('Drugs')).not.toBeInTheDocument();
  });

  test('shows breadcrumbs after drilling down into a subcategory', async () => {
    const user = userEvent.setup();

    mockUseConceptTree.mockReturnValue({
      tree: {
        uuid: 'set-1-uuid',
        display: 'Analgesics',
        isSet: true,
        setMembers: [
          {
            uuid: 'sub-1-uuid',
            display: 'NSAIDs',
            isSet: true,
            setMembers: [{ uuid: 'concept-1-uuid', display: 'Aspirin', isSet: false }],
          },
        ],
      },
      isLoading: false,
      error: undefined,
    });

    renderDrugBrowse();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByText('Analgesics'));

    // Drill down into NSAIDs
    await user.click(screen.getByText('NSAIDs'));

    // Breadcrumbs should show Analgesics > NSAIDs
    const breadcrumbs = screen.getAllByRole('listitem');
    expect(breadcrumbs).toHaveLength(2);
    expect(screen.getByText('Analgesics')).toBeInTheDocument();
    expect(screen.getByText('NSAIDs')).toBeInTheDocument();
  });

  test('disables the combobox while concept sets are loading', () => {
    renderDrugBrowse({ isLoadingConceptSets: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

function renderDrugBrowse(overrides = {}) {
  const defaultProps = {
    conceptSets: mockConceptSets,
    isLoadingConceptSets: false,
    conceptSetsError: undefined,
    patient: mockPatient,
    visit: null,
    closeWorkspace: mockCloseWorkspace,
    openOrderForm: mockOpenOrderForm,
  };

  return render(<DrugBrowse {...defaultProps} {...overrides} />);
}
