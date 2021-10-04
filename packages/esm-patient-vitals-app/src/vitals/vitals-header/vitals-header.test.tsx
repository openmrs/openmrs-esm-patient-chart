import React from 'react';
import dayjs from 'dayjs';
dayjs.extend(isToday);
import isToday from 'dayjs/plugin/isToday';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { openmrsFetch } from '@openmrs/esm-framework';
import { getByTextWithMarkup, swrRender, waitForLoadingToFinish } from '../../../../../tools/test-helpers';
import { mockFhirVitalsResponse, mockVitalsConfig } from '../../../../../__mocks__/vitals.mock';
import VitalsHeader from './vitals-header.component';

const testProps = {
  patientUuid: mockPatient.id,
  showRecordVitals: true,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: {
        conceptUnits: ['mmHg', 'mmHg', 'DEG C', 'cm', 'kg', 'beats/min', '%', 'cm', 'breaths/min'],
        conceptMetadata: [
          {
            display: 'Systolic',
            hiAbsolute: 250,
            hiCritical: 180,
            hiNormal: 140,
            lowAbsolute: 0,
            lowCritical: 85,
            lowNormal: 100,
            units: 'mmHg',
            uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
        ],
      },
    })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(() => mockVitalsConfig),
  };
});

describe('VitalsHeader: ', () => {
  it('renders the vitals header', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirVitalsResponse });

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Vitals & Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Last recorded: 19 - May - 2021/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Record Vitals$/i })).toBeInTheDocument();

    const expandVitalsHeaderButton = screen.getByTitle(/ChevronDown/);
    userEvent.click(expandVitalsHeaderButton);

    expect(getByTextWithMarkup(/Temp\s*37\s*DEG C/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/BP\s*121 \/ 89\s*mmHg/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Heart Rate\s*76\s*beats\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/SpO2\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/R\. Rate\s*12\s*breaths\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Height\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/BMI\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Weight\s*-\s*/i)).toBeInTheDocument();
  });
});

function renderVitalsHeader() {
  swrRender(<VitalsHeader {...testProps} />);
}
