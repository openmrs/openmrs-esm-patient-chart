import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import AllergyList from './allergies-list.extension';
import { patientAllergiesFormWorkspace } from '../constants';
import { type Allergy } from '../types';

const mockUseAllergies = jest.fn();
const mockLaunchWorkspace2 = launchWorkspace2 as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  launchWorkspace2: jest.fn(),
}));

jest.mock('./allergy-intolerance.resource', () => ({
  useAllergies: (...args) => mockUseAllergies(...args),
}));

const allergyFixtures: Array<Allergy> = [
  {
    id: '1',
    clinicalStatus: 'Active',
    criticality: 'high',
    display: 'Aspirin',
    recordedDate: '2024-01-01',
    recordedBy: 'Test User',
    recorderType: 'Practitioner',
    note: '',
    reactionToSubstance: 'Aspirin',
    reactionManifestations: ['Rash'],
    reactionSeverity: 'severe',
    lastUpdated: '2024-01-01',
  },
  {
    id: '2',
    clinicalStatus: 'Active',
    criticality: 'high',
    display: 'ACE inhibitors',
    recordedDate: '2024-01-01',
    recordedBy: 'Test User',
    recorderType: 'Practitioner',
    note: '',
    reactionToSubstance: 'ACE inhibitors',
    reactionManifestations: ['Swelling'],
    reactionSeverity: 'moderate',
    lastUpdated: '2024-01-02',
  },
  {
    id: '3',
    clinicalStatus: 'Active',
    criticality: 'low',
    display: 'Fish',
    recordedDate: '2024-01-01',
    recordedBy: 'Test User',
    recorderType: 'Practitioner',
    note: '',
    reactionToSubstance: 'Fish',
    reactionManifestations: ['Itching'],
    reactionSeverity: 'mild',
    lastUpdated: '2024-01-03',
  },
];

describe('AllergyList', () => {
  it('renders a loading skeleton when allergy data is being fetched', () => {
    mockUseAllergies.mockReturnValue({
      allergies: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    expect(screen.queryByText(/allergies/i)).not.toBeInTheDocument();
  });

  it('renders unknown with a quick-add action when there are no allergies', () => {
    mockUseAllergies.mockReturnValue({
      allergies: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recordnewallergy/i })).toBeInTheDocument();
  });

  it('renders allergy tags with correct severity indicators when allergies are available', () => {
    mockUseAllergies.mockReturnValue({
      allergies: allergyFixtures,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Fish')).toBeInTheDocument();
    expect(screen.getByText('ACE inhibitors')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recordnewallergy/i })).toBeInTheDocument();
  });

  it('applies correct data-severity attributes to allergy tags', () => {
    mockUseAllergies.mockReturnValue({
      allergies: allergyFixtures,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    const severeTags = screen.getAllByTestId('allergy-tag-severe');
    const moderateTags = screen.getAllByTestId('allergy-tag-moderate');
    const mildTags = screen.getAllByTestId('allergy-tag-mild');

    expect(severeTags.length).toBe(1);
    expect(moderateTags.length).toBe(1);
    expect(mildTags.length).toBe(1);
  });

  it('sorts allergies by severity (severe, moderate, mild)', () => {
    mockUseAllergies.mockReturnValue({
      allergies: [allergyFixtures[2], allergyFixtures[1], allergyFixtures[0]],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    const allergyTags = screen.getAllByTestId(/allergy-tag-/);

    expect(allergyTags.map((tag) => tag.getAttribute('data-testid'))).toEqual([
      'allergy-tag-severe',
      'allergy-tag-moderate',
      'allergy-tag-mild',
    ]);
    expect(allergyTags.map((tag) => tag.textContent)).toEqual(['Aspirin', 'ACE inhibitors', 'Fish']);
  });

  it('launches the allergy form workspace in create mode from the quick-add action', async () => {
    const user = userEvent.setup();
    mockUseAllergies.mockReturnValue({
      allergies: allergyFixtures,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<AllergyList patientUuid="patient-uuid" />);

    await user.click(screen.getByRole('button', { name: /recordnewallergy/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(patientAllergiesFormWorkspace, { formContext: 'creating' });
  });
});
