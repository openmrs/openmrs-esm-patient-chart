import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import {
  mockPatient,
  getByTextWithMarkup,
  renderWithSwr,
  waitForLoadingToFinish,
} from '../../../../tools/test-helpers';
import {
  mockConceptMetadata,
  mockFhirVitalsResponse,
  mockVitalsConfig,
  mockVitalsSignsConcept,
} from '../__mocks__/vitals.mock';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { mockCurrentVisit } from '../__mocks__/visits.mock';
import VitalsHeader from './vitals-header.component';

const testProps = {
  patientUuid: mockPatient.id,
  showRecordVitalsButton: true,
};

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockLaunchWorkspace = launchPatientWorkspace as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
    })),
    useVisitOrOfflineVisit: jest.fn().mockImplementation(() => ({ currentVisit: mockCurrentVisit })),
    useWorkspaces: jest.fn().mockImplementation(() => ({ workspaces: [] })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(() => mockVitalsConfig),
    useConnectivity: jest.fn(),
  };
});

describe('VitalsHeader: ', () => {
  it('renders an empty state view when there are no vitals data to show', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.getByText(/vitals and biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/no data has been recorded for this patient/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record vitals/i })).toBeInTheDocument();
  });

  it('renders the most recently recorded vitals in the vitals header', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValue({ data: mockFhirVitalsResponse });

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.getByText(/vitals and biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/19-May-2021/i)).toBeInTheDocument();
    expect(screen.getByText(/vitals history/i)).toBeInTheDocument();
    expect(screen.getByText(/Record vitals/i)).toBeInTheDocument();

    expect(getByTextWithMarkup(/Temp\s*37\s*DEG C/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/BP\s*121 \/ 89\s*mmHg/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Heart rate\s*76\s*beats\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/SpO2\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/R\. Rate\s*12\s*breaths\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Height\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/BMI\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Weight\s*-\s*/i)).toBeInTheDocument();

    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    expect(screen.getAllByTitle(/abnormal value/i).length).toEqual(2);
  });

  it('launches the vitals form when the `record vitals` button gets clicked', async () => {
    const user = userEvent.setup();

    renderVitalsHeader();

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await waitFor(() => user.click(recordVitalsButton));

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith(patientVitalsBiometricsFormWorkspace);
  });

  it('does not flag normal values that lie within the provided reference ranges', async () => {
    const user = userEvent.setup();

    mockFhirVitalsResponse.entry[3].resource.valueQuantity.value = 79;
    mockFhirVitalsResponse.entry[4].resource.valueQuantity.value = 119;
    mockFhirVitalsResponse.entry[0].resource.valueQuantity.value = 69;
    mockFhirVitalsResponse.entry[11].resource.valueQuantity.value = 36;
    mockOpenmrsFetch.mockReturnValue({ data: mockFhirVitalsResponse });

    renderVitalsHeader();
    await waitForLoadingToFinish();

    expect(screen.queryByTitle(/abnormal value/i)).not.toBeInTheDocument();
  });

  it('flags abnormal values that lie outside of the provided reference ranges', async () => {
    const user = userEvent.setup();

    mockVitalsSignsConcept.data.results[0].setMembers[0].lowCritical = 50;
    mockFhirVitalsResponse.entry[4].resource.valueQuantity.value = 49;
    mockOpenmrsFetch.mockReturnValue({ data: mockFhirVitalsResponse });
    mockVitalsSignsConcept.data.results[0].setMembers[1].hiCritical = 145;
    mockFhirVitalsResponse.entry[3].resource.valueQuantity.value = 150;

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.queryByTitle(/abnormal value/i)).toBeInTheDocument();
  });

  test('should launch Form Entry vitals and biometrics form', async () => {
    const user = userEvent.setup();
    const { useConfig } = require('@openmrs/esm-framework');
    const updateVitalsConfigMock = {
      ...mockVitalsConfig,
      vitals: { ...mockVitalsConfig.vitals, useFormEngine: true, formName: 'Triage' },
    };
    useConfig.mockImplementation(() => updateVitalsConfigMock);

    renderVitalsHeader();
    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await waitFor(() => user.click(recordVitalsButton));
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: { encounterUuid: '', formUuid: updateVitalsConfigMock.vitals.formUuid },
      workspaceTitle: updateVitalsConfigMock.vitals.formName,
    });
  });
});

function renderVitalsHeader() {
  renderWithSwr(<VitalsHeader {...testProps} />);
}
