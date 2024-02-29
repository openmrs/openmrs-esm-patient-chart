import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { assessValue, getReferenceRangesForConcept, useVitalsConceptMetadata } from '../common';
import { isValueWithinReferenceRange } from './vitals-biometrics-form.utils';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';

const { conceptRanges, conceptMetadata: mockConceptMetadata } = useVitalsConceptMetadata();

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

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  const mockConceptMetadata = [
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
      uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Diastolic blood pressure',
      hiNormal: 90,
      hiAbsolute: 150,
      hiCritical: 120,
      lowNormal: 55,
      lowAbsolute: 0,
      lowCritical: 40,
      units: 'mmHg',
    },
    {
      uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Temperature (c)',
      hiNormal: null,
      hiAbsolute: 43,
      hiCritical: null,
      lowNormal: null,
      lowAbsolute: 25,
      lowCritical: null,
      units: 'DEG C',
    },
    {
      uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Height (cm)',
      hiNormal: null,
      hiAbsolute: 272,
      hiCritical: null,
      lowNormal: null,
      lowAbsolute: 10,
      lowCritical: null,
      units: 'cm',
    },
    {
      uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Weight (kg)',
      hiNormal: null,
      hiAbsolute: 250,
      hiCritical: null,
      lowNormal: null,
      lowAbsolute: 0,
      lowCritical: null,
      units: 'kg',
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
    {
      uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Arterial blood oxygen saturation (pulse oximeter)',
      hiNormal: null,
      hiAbsolute: 100,
      hiCritical: null,
      lowNormal: 95,
      lowAbsolute: 0,
      lowCritical: 90,
      units: '%',
    },
    {
      uuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Mid-upper arm circumference',
      hiNormal: null,
      hiAbsolute: null,
      hiCritical: null,
      lowNormal: null,
      lowAbsolute: null,
      lowCritical: null,
      units: 'cm',
    },
    {
      uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Respiratory rate',
      hiNormal: 18,
      hiAbsolute: 999,
      hiCritical: 26,
      lowNormal: 12,
      lowAbsolute: 0,
      lowCritical: 8,
      units: 'breaths/min',
    },
    {
      uuid: '5283AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Karnofsky performance score',
      hiNormal: null,
      hiAbsolute: null,
      hiCritical: null,
      lowNormal: null,
      lowAbsolute: null,
      lowCritical: null,
      units: '%',
    },
  ];
  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: new Map([
        ['5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'mmHg'],
        ['5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'mmHg'],
        ['5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'DEG C'],
        ['5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'cm'],
        ['5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'kg'],
        ['5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'beats/min'],
        ['5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '%'],
        ['1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'cm'],
        ['5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'breaths/min'],
        ['5283AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '%'],
      ]),
      conceptMetadata: mockConceptMetadata,
      conceptRanges: mockConceptMetadata?.length
        ? new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>(
            mockConceptMetadata.map((concept) => [
              concept.uuid,
              {
                lowAbsolute: concept.lowAbsolute ?? null,
                highAbsolute: concept.hiAbsolute ?? null,
              },
            ]),
          )
        : new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>([]),
    })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockReturnValue({
      concepts: {
        pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        systoleUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        diastoleUuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    }),
  };
});

const testProps = {
  control: undefined,
  isValueWithinReferenceRange: true,
  fieldProperties: [],
  interpretation: undefined,
  placeholder: '',
  label: '',
  unitSymbol: '',
  showErrorMessage: undefined,
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

  it('should validate the input based on the provided interpretation and reference range values', () => {
    const config = useConfig();
    const fieldsToTest = [
      {
        id: 'pulse',
        name: 'Heart rate',
        min: conceptRanges.get(config.concepts.pulseUuid).lowAbsolute,
        max: conceptRanges.get(config.concepts.pulseUuid).highAbsolute,
        type: 'number',
        uuid: config.concepts.pulseUuid,
        value: 300,
        unitSymbol: 'bpm',
        abnormalValueClass: 'critically-high',
      },

      {
        id: 'systole',
        name: 'Systolic blood pressure',
        min: conceptRanges.get(config.concepts.systoleUuid).lowAbsolute,
        max: conceptRanges.get(config.concepts.systoleUuid).highAbsolute,
        type: 'number',
        uuid: config.concepts.systoleUuid,
        value: -1,
        unitSymbol: 'mmHg',
        abnormalValueClass: 'critically-low',
      },
    ];

    fieldsToTest.forEach((field, index) => {
      testProps.fieldProperties = [fieldsToTest[index]];
      testProps.isValueWithinReferenceRange = isValueWithinReferenceRange(mockConceptMetadata, field.uuid, field.value);
      testProps.interpretation = assessValue(
        field.value,
        getReferenceRangesForConcept(field.uuid, mockConceptMetadata),
      );
      testProps.label = field.name;
      testProps.unitSymbol = field.unitSymbol;
      testProps.showErrorMessage = true;

      renderVitalsBiometricsInput();

      screen.findByRole('spinbutton');

      expect(screen.getByRole('spinbutton', { name: new RegExp(`${field.name}`, 'i') })).toBeInTheDocument();
      const abnormalValueFlag = screen.getByTitle(/abnormal value/i);
      expect(abnormalValueFlag).toBeInTheDocument();
      expect(abnormalValueFlag).toHaveClass(field.abnormalValueClass);
      expect(
        screen.getByText(
          new RegExp(
            `Value must be between (${fieldsToTest[index].min}|{{min}}) and (${fieldsToTest[index].max}|{{max}})`,
            'i',
          ),
        ),
      ).toBeInTheDocument();

      cleanup();
    });
  });
});

function renderVitalsBiometricsInput() {
  render(<VitalsAndBiometricsInput {...testProps} />);
}
