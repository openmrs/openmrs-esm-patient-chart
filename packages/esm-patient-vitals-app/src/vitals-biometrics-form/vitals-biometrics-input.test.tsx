import React from 'react';
import { screen, render } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { assessValue, getReferenceRangesForConcept } from '../common';
import { mockConceptUnits } from '__mocks__';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';

const overridenMetadata = [
  {
    uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Systolic blood pressure',
    hiNormal: 140,
    hiAbsolute: 250,
    hiCritical: 180,
    lowNormal: 100,
    lowAbsolute: 0,
    lowCritical: 85,
    units: 'mmHg',
  },
  {
    uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Pulse',
    hiNormal: 100,
    hiAbsolute: 230,
    hiCritical: 130,
    lowNormal: 55,
    lowAbsolute: 0,
    lowCritical: 49,
    units: 'beats/min',
  },
];

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn().mockImplementation(() => ({
    handleSubmit: () => jest.fn(),
    control: {
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false,
      },
      _subjects: {
        watch: jest.fn(),
        array: jest.fn(),
        state: jest.fn(),
      },
      _getWatch: jest.fn(),
      _formValues: [],
      _defaultValues: [],
    },
    getValues: () => {
      return [];
    },
    setValue: () => jest.fn(),
    formState: () => jest.fn(),
    watch: () => jest.fn(),
  })),
  Controller: ({ render }) =>
    render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        ref: jest.fn(),
      },
      formState: {
        isSubmitted: false,
      },
      fieldState: {
        isTouched: false,
      },
    }),
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => jest.fn() } } },
  }),
}));

jest.mock('../common', () => {
  const originalModule = jest.requireActual('../common');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: { ...overridenMetadata },
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockReturnValue({
      concepts: {
        pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    }),
  };
});

const testProps = {
  control: undefined,
  isWithinNormalRange: true,
  fieldProperties: [],
  interpretation: undefined,
  placeholder: '',
  label: '',
  unitSymbol: '',
};

describe('VitalsAndBiometricsInput', () => {
  it('renders number inputs based correctly on the props provided', () => {
    testProps.fieldProperties = [
      {
        id: 'pulse',
        name: 'Heart rate',
        type: 'number',
      },
    ];
    testProps.label = 'Heart rate';
    testProps.unitSymbol = 'bpm';

    renderVitalsBiometricsInput();

    const heartRateInput = screen.getByRole('spinbutton', { name: /heart rate/i });
    expect(heartRateInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText('--')).toBeInTheDocument();
    expect(screen.getByTitle(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByText(/bpm/i)).toBeInTheDocument();
  });

  it('renders textarea inputs correctly based on the props provided', () => {
    testProps.fieldProperties = [
      {
        id: 'generalPatientNote',
        name: 'Notes',
        type: 'textarea',
      },
    ];
    testProps.placeholder = 'Type any additional notes here';
    testProps.label = 'Notes';

    renderVitalsBiometricsInput();

    const noteInput = screen.getByRole('textbox', { name: /notes/i });
    expect(noteInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type any additional notes here/i)).toBeInTheDocument();
    expect(screen.getByTitle(/notes/i)).toBeInTheDocument();
  });

  it('should validate the input based on the provided interpretation and reference range values', async () => {
    const config = useConfig();

    testProps.fieldProperties = [
      {
        id: 'pulse',
        name: 'Heart rate',
        min: 0,
        max: 230,
        type: 'number',
      },
    ];
    testProps.interpretation = assessValue(
      300,
      getReferenceRangesForConcept(config.concepts.pulseUuid, overridenMetadata),
    );
    testProps.label = 'Heart rate';
    testProps.unitSymbol = 'bpm';

    renderVitalsBiometricsInput();

    await screen.findByRole('spinbutton');

    expect(screen.getByRole('spinbutton', { name: /heart rate/i })).toBeInTheDocument();
    const abnormalValueFlag = screen.getByTitle(/abnormal value/i);
    expect(abnormalValueFlag).toBeInTheDocument();
    expect(abnormalValueFlag).toHaveClass('critically-high');
  });
});

function renderVitalsBiometricsInput() {
  render(<VitalsAndBiometricsInput {...testProps} />);
}
