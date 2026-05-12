import React from 'react';
import { vi, describe, it, expect, test } from 'vitest';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { assessValue, getReferenceRangesForConcept } from '../common';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockConceptUnits } from '__mocks__';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

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

vi.mock('react-hook-form', async () => ({
  ...((await vi.importActual('react-hook-form')) as object),
  useFormContext: vi.fn().mockImplementation(() => ({
    handleSubmit: () => vi.fn(),
    control: {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false,
      },
      _subjects: {
        watch: vi.fn(),
        array: vi.fn(),
        state: vi.fn(),
      },
      _getWatch: vi.fn(),
      _formValues: [],
      _defaultValues: [],
    },
    getValues: () => {
      return [];
    },
    setValue: () => vi.fn(),
    formState: () => vi.fn(),
    watch: () => vi.fn(),
  })),
  Controller: ({ render }) =>
    render({
      field: {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: '',
        ref: vi.fn(),
      },
      formState: {
        isSubmitted: false,
      },
      fieldState: {
        isTouched: false,
      },
    }),
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } },
  }),
}));

vi.mock('../common', async () => {
  const originalModule = (await vi.importActual('../common')) as object;

  return {
    ...originalModule,
    useConceptUnits: vi.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: { ...overridenMetadata },
      isLoading: false,
    })),
    useVitalsAndBiometrics: vi.fn(),
  };
});

const defaultProps = {
  control: undefined,
  isWithinNormalRange: true,
  fieldProperties: [],
  interpretation: undefined,
  placeholder: '',
  label: '',
  unitSymbol: '',
};

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  concepts: {
    pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
} as ConfigObject);

describe('VitalsAndBiometricsInput', () => {
  it('renders number inputs based correctly on the props provided', () => {
    renderVitalsBiometricsInput({
      fieldProperties: [
        {
          id: 'pulse',
          name: 'Heart rate',
          type: 'number',
        },
      ],
      label: 'Heart rate',
      unitSymbol: 'bpm',
    });

    const heartRateInput = screen.getByRole('spinbutton', { name: /heart rate/i });
    expect(heartRateInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText('--')).toBeInTheDocument();
    expect(screen.getByTitle(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByText(/bpm/i)).toBeInTheDocument();
  });

  it('renders textarea inputs correctly based on the props provided', () => {
    renderVitalsBiometricsInput({
      fieldProperties: [
        {
          id: 'generalPatientNote',
          name: 'Notes',
          type: 'textarea',
        },
      ],
      placeholder: 'Type any additional notes here',
      label: 'Notes',
    });

    const noteInput = screen.getByRole('textbox', { name: /notes/i });
    expect(noteInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type any additional notes here/i)).toBeInTheDocument();
    expect(screen.getByTitle(/notes/i)).toBeInTheDocument();
  });

  it('should validate the input based on the provided interpretation and reference range values', async () => {
    const config = useConfig();

    renderVitalsBiometricsInput({
      fieldProperties: [
        {
          id: 'pulse',
          name: 'Heart rate',
          min: 0,
          max: 230,
          type: 'number',
        },
      ],
      interpretation: assessValue(300, getReferenceRangesForConcept(config.concepts.pulseUuid, overridenMetadata)),
      label: 'Heart rate',
      unitSymbol: 'bpm',
    });

    await screen.findByRole('spinbutton');

    expect(screen.getByRole('spinbutton', { name: /heart rate/i })).toBeInTheDocument();
    const abnormalValueFlag = screen.getByTitle(/abnormal value/i);
    expect(abnormalValueFlag).toBeInTheDocument();
    expect(abnormalValueFlag).toHaveClass('critically-high');
  });
});

function renderVitalsBiometricsInput(props = {}) {
  render(<VitalsAndBiometricsInput {...defaultProps} {...props} />);
}
