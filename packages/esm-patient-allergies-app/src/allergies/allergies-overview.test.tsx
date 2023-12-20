import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch, usePagination } from '@openmrs/esm-framework';
import { mockAllergies, mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import AllergiesOverview from './allergies-overview.component';

const testProps = {
  patient: mockPatient,
  basePath: patientChartBasePath,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    attach: jest.fn(),
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

describe('AllergiesOverview: ', () => {
  it('renders an empty state view if allergy data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    renderAllergiesOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching allergies data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockOpenmrsFetch.mockRejectedValueOnce(error);
    renderAllergiesOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders an overview of the patient's allergic reactions and their manifestations", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockAllergies,
    }));
    renderAllergiesOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /reactions/];
    const expectedAllergies = [
      /ACE inhibitors Anaphylaxis \(moderate\)/,
      /Aspirin Mental status change \(severe\)/,
      /Fish Anaphylaxis, Angioedema, Fever, Hives \(mild\)/,
      /Morphine Mental status change \(severe\)/,
      /Penicillins Diarrhea, Cough, Musculoskeletal pain, Mental status change, Angioedema \(Severe\)/,
    ];

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
    expectedAllergies.forEach((allergy) => {
      expect(screen.getByRole('row', { name: new RegExp(allergy, 'i') })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });
});

function renderAllergiesOverview() {
  renderWithSwr(<AllergiesOverview {...testProps} />);
}
