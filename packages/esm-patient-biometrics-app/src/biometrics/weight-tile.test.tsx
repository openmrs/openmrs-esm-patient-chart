import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { getByTextWithMarkup, swrRender, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockBiometricsResponse, mockConceptMetadata, mockConceptUnits } from '../../../../__mocks__/biometrics.mock';
import WeightTile from './weight-tile.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockBiometricsConfig = {
  biometrics: { bmiUnit: 'kg / m²' },
  concepts: { heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockImplementation(() => mockBiometricsConfig),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: {
        conceptUnits: mockConceptUnits,
        conceptMetadata: mockConceptMetadata,
      },
    })),
  };
});

describe('WeightTile', () => {
  it('renders an empty state when weight data is not available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    renderWeightTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/--/i)).toBeInTheDocument();
  });

  it("renders a summary of the patient's weight data when available", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockBiometricsResponse });
    renderWeightTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/198 kg/i)).toBeInTheDocument();
  });
});

function renderWeightTile() {
  swrRender(<WeightTile {...testProps} />);
}
