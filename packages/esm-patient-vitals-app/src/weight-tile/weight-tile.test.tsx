import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { getByTextWithMarkup, mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockBiometricsResponse, mockConceptMetadata } from '__mocks__';
import WeightTile from './weight-tile.component';

const mockVitalsSignsConcepts = {
  data: {
    results: [
      {
        setMembers: [
          {
            uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Systolic blood pressure',
            hiNormal: 120,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: 80,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Diastolic blood pressure',
            hiNormal: 80,
            hiAbsolute: 150.0,
            hiCritical: null,
            lowNormal: 70,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Temperature (C)',
            hiNormal: 37.5,
            hiAbsolute: 43.0,
            hiCritical: null,
            lowNormal: 36.5,
            lowAbsolute: 25.0,
            lowCritical: null,
            units: 'DEG C',
          },
          {
            uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Height (cm)',
            hiNormal: null,
            hiAbsolute: 272.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 10.0,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Weight (kg)',
            hiNormal: null,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'kg',
          },
          {
            uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Pulse',
            hiNormal: 70,
            hiAbsolute: 230.0,
            hiCritical: null,
            lowNormal: 30,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'beats/min',
          },
          {
            uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Blood oxygen saturation',
            hiNormal: 100,
            hiAbsolute: 100.0,
            hiCritical: null,
            lowNormal: 95,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: '%',
          },
          {
            uuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'MID-UPPER ARM CIRCUMFERENCE',
            hiNormal: 25,
            hiAbsolute: null,
            hiCritical: null,
            lowNormal: 23,
            lowAbsolute: null,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Respiratory rate',
            hiNormal: 70.0,
            hiAbsolute: 999.0,
            hiCritical: 120.0,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'breaths/min',
          },
        ],
      },
    ],
  },
};

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcepts.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

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
      conceptUnits: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
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
    expect(getByTextWithMarkup(/75 kg/i)).toBeInTheDocument();
  });
});

function renderWeightTile() {
  renderWithSwr(<WeightTile {...testProps} />);
}
