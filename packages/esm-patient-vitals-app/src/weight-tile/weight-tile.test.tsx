import React from 'react';
import { screen } from '@testing-library/react';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { getByTextWithMarkup, mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { formattedBiometrics, mockBiometricsConfig, mockConceptMetadata, mockVitalsSignsConcepts } from '__mocks__';
import { useVitalsAndBiometrics } from '../common';
import WeightTile from './weight-tile.component';

defineConfigSchema('@openmrs/esm-patient-vitals-app', configSchema);

const mockedUseConfig = jest.mocked(useConfig);
const mockedUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcepts.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

jest.mock('../common', () => {
  const originalModule = jest.requireActual('../common');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

describe('WeightTile', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      mockBiometricsConfig,
    });
    jest.clearAllMocks();
  });

  it('renders an empty state when weight data is not available', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWeightTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/--/i)).toBeInTheDocument();
  });

  it("renders a summary of the patient's weight data when available", async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWeightTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/90 kg/i)).toBeInTheDocument();
  });
});

function renderWeightTile() {
  const testProps = {
    patientUuid: mockPatient.id,
  };

  renderWithSwr(<WeightTile {...testProps} />);
}
