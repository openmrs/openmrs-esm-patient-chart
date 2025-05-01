import React from 'react';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { getByTextWithMarkup, mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { formattedBiometrics, mockBiometricsConfig, mockVitalsSignsConcepts } from '__mocks__';
import { useVitalsAndBiometrics } from '../../common';
import WeightTile from './weight-tile.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcepts.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

jest.mock('../../common', () => {
  const originalModule = jest.requireActual('../../common');

  return {
    ...originalModule,
    useConceptUnits: jest.fn().mockImplementation(() => ({
      conceptUnits: mockConceptUnits,
      error: null,
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  mockBiometricsConfig,
} as ConfigObject);

describe('WeightTile', () => {
  it('renders an empty state when weight data is not available', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<WeightTile patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/--/i)).toBeInTheDocument();
  });

  it("renders a summary of the patient's weight data when available", async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<WeightTile patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/90 kg/i)).toBeInTheDocument();
  });
});
