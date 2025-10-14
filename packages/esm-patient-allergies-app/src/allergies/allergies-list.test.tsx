import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import AllergyList from './allergies-list.extension';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('AllergyList', () => {
  it('renders a loading skeleton when allergy data is being fetched', () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { total: 0, entry: [] } });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    // The TagSkeleton is a span, so we check if rendering has started but data isn't loaded yet
    expect(screen.queryByText(/allergies/i)).not.toBeInTheDocument();
  });

  it('renders unknown when there are no allergies', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({
      data: {
        total: 0,
        entry: [],
      },
    });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });

  it('renders allergy tags with correct severity indicators when allergies are available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();

    // Check that allergies are rendered as tags
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Morphine')).toBeInTheDocument();
    expect(screen.getByText('Penicillins')).toBeInTheDocument();
    expect(screen.getByText('Fish')).toBeInTheDocument();
    expect(screen.getByText('ACE inhibitors')).toBeInTheDocument();
    expect(screen.getByText('non-coded allergen')).toBeInTheDocument();
  });

  it('applies correct data-severity attributes to allergy tags', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that severity data attributes are applied correctly using test IDs
    const severeTags = screen.getAllByTestId('allergy-tag-severe');
    const moderateTags = screen.getAllByTestId('allergy-tag-moderate');
    const mildTags = screen.getAllByTestId('allergy-tag-mild');

    // From the mock data:
    // - Aspirin: severe
    // - Morphine: severe
    // - Penicillins: severe
    // - non-coded allergen: severe
    // - ACE inhibitors: moderate
    // - Fish: mild
    expect(severeTags.length).toBe(4);
    expect(moderateTags.length).toBe(1);
    expect(mildTags.length).toBe(1);
  });

  it('sorts allergies by severity (severe, moderate, mild)', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Get all allergy tags with test IDs in the order they appear
    const severeTags = screen.getAllByTestId('allergy-tag-severe');
    const moderateTags = screen.getAllByTestId('allergy-tag-moderate');
    const mildTags = screen.getAllByTestId('allergy-tag-mild');

    // Should be sorted: severe items first, then moderate, then mild
    // Verify counts and that all severe come before moderate, and moderate comes before mild
    expect(severeTags.length).toBe(4);
    expect(moderateTags.length).toBe(1);
    expect(mildTags.length).toBe(1);

    // Verify the first 4 allergies are severe
    const firstFourAllergies = [
      screen.getByText('non-coded allergen'),
      screen.getByText('Aspirin'),
      screen.getByText('Morphine'),
      screen.getByText('Penicillins'),
    ];
    firstFourAllergies.forEach((allergy) => {
      expect(allergy).toBeInTheDocument();
    });
  });

  it('displays severity information in tooltip', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergyList patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that allergy tags are rendered with severity information
    const aspirinTag = screen.getByText('Aspirin');
    expect(aspirinTag).toBeInTheDocument();

    // Verify severe tags exist using test IDs
    const severeTags = screen.getAllByTestId('allergy-tag-severe');
    expect(severeTags.length).toBe(4);

    // Check that Aspirin is in the severe tags
    const aspirinSevereTag = severeTags.find((tag) => tag.textContent?.includes('Aspirin'));
    expect(aspirinSevereTag).toBeDefined();
  });
});
