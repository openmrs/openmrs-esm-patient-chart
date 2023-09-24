import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockFhirAllergyIntoleranceResponse } from '../__mocks__/allergies.mock';
import AllergiesTile from './allergies-tile.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('AllergiesTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a summary of the patient's allergy data when available", async () => {
    mockOpenmrsFetch.mockReturnValue({ data: mockFhirAllergyIntoleranceResponse });
    renderAllergiesTile();

    expect(screen.queryAllByText(/ACE inhibitors, Fish, Penicillins, Morphine, Aspirin/i)).not.toBe([]);
  });

  it('renders an empty state when allergy data is not available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    renderAllergiesTile();

    expect(screen.queryAllByText('ACE inhibitors')).toStrictEqual([]);
  });
});

function renderAllergiesTile() {
  renderWithSwr(<AllergiesTile {...testProps} />);
}
