import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { type AllergiesConfigObject, configSchema } from '../config-schema';
import AllergiesDetailedSummary from './allergies-detailed-summary.component';
import styles from './allergies-detailed-summary.scss';

const mockOpenmrsFetch = openmrsFetch as Mock;
const mockUseConfig = vi.mocked(useConfig<AllergiesConfigObject>);
mockOpenmrsFetch.mockImplementation(vi.fn());

describe('AllergiesDetailedSummary', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  });

  it('renders an empty state view if allergy data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { entry: [] } });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
  });

  it('renders an error state view if there was a problem fetching allergies data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockOpenmrsFetch.mockRejectedValueOnce(error);
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(ErrorState).toHaveBeenCalledWith(expect.objectContaining({ error, headerTitle: 'Allergies' }), {});
  });

  it("renders a detailed summary of the patient's allergic reactions and their manifestations", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/allergen/i, /severity/i, /reaction/i, /comments/i];
    const expectedAllergies = [
      /ace inhibitors moderate anaphylaxis/i,
      /fish mild anaphylaxis, angioedema, fever, hives some comments/i,
      /penicillins severe angioedema, cough, diarrhea, mental status change, musculoskeletal pain patient allergies have been noted down/i,
      /morphine severe mental status change comments/i,
      /aspirin severe mental status change comments/i,
    ];

    expectedColumnHeaders.forEach((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header) })).toBeInTheDocument(),
    );

    expectedAllergies.forEach((allergy) =>
      expect(screen.getByRole('row', { name: new RegExp(allergy) })).toBeInTheDocument(),
    );
  });

  it("renders non-coded allergen name and non-coded allergic reaction name in the detailed summary of the patient's allergies", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedNonCodedAllergy = /non-coded allergen severe non-coded allergic reaction non coded allergic note/i;
    expect(screen.getByRole('row', { name: new RegExp(expectedNonCodedAllergy) })).toBeInTheDocument();
  });

  it('uses configured severity-style mapping for allergen styling', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      severityStyleMap: {
        severe: 'low',
        moderate: 'moderate',
        mild: 'high',
      },
    });
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    const severeAllergen = screen.getByText(/penicillins/i);
    expect(severeAllergen).toHaveClass(styles.allergySeverityLow);
  });

  it('uses default severity-style mapping when config is not overridden', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    const severeAllergen = screen.getByText(/penicillins/i);
    expect(severeAllergen).toHaveClass(styles.allergySeverityHigh);
  });

  it('does not apply severity class for unknown severities', async () => {
    const customResponse = structuredClone(mockFhirAllergyIntoleranceResponse);
    customResponse.entry[2].resource.reaction[0].severity = 'unknown';

    mockOpenmrsFetch.mockReturnValueOnce({ data: customResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    const unknownSeverityAllergen = screen.getByText(/penicillins/i);
    expect(unknownSeverityAllergen).not.toHaveClass(styles.allergySeverityHigh);
    expect(unknownSeverityAllergen).not.toHaveClass(styles.allergySeverityModerate);
    expect(unknownSeverityAllergen).not.toHaveClass(styles.allergySeverityLow);
  });

  it('does not apply background severity class by default', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    const severeAllergen = screen.getByText(/penicillins/i);
    expect(severeAllergen).not.toHaveClass(styles.withSeverityBackground);
  });

  it('applies background severity class when enabled via config', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      enableSeverityBackgroundColoring: true,
    });
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    const severeAllergen = screen.getByText(/penicillins/i);
    expect(severeAllergen).toHaveClass(styles.withSeverityBackground);
  });
});
