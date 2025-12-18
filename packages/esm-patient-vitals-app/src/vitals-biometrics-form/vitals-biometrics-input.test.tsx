import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { assessValue, getReferenceRangesForConcept } from '../common';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockConceptUnits } from '__mocks__';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';
import { validateClinicalNotes, containsEmoji } from './notes-validation';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

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
    useConceptUnits: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: { ...overridenMetadata },
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
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

  describe('Clinical Notes Validation Integration', () => {
    it('should reject notes containing emoji characters', () => {
      expect(containsEmoji('Patient 😊 doing well')).toBe(true);
      const validation = validateClinicalNotes('Patient 😊 doing well');
      expect(validation.isValid).toBe(false);
      expect(validation.errorMessage).toBe('notes.emojiNotAllowed');
    });

    it('should accept valid clinical notes without emoji', () => {
      const validation = validateClinicalNotes('Patient is stable and doing well. No complaints at this time.');
      expect(validation.isValid).toBe(true);
      expect(validation.errorMessage).toBeUndefined();
    });

    it('should accept notes with common medical notation', () => {
      const validation = validateClinicalNotes('BP: 120/80 mmHg, Temp: 37.5°C ± 0.2, HR: 72 bpm. Patient well.');
      expect(validation.isValid).toBe(true);
    });

    it('should accept notes with special punctuation used in clinical documentation', () => {
      const validation = validateClinicalNotes(
        'Follow-up: [Scheduled for 2024-12-20]. (Normal results). Patient alert and oriented.',
      );
      expect(validation.isValid).toBe(true);
    });

    it('should reject notes with heart emoji', () => {
      const validation = validateClinicalNotes('Patient ❤️ is doing great');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with fire emoji', () => {
      const validation = validateClinicalNotes('Response was excellent 🔥');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with warning emoji', () => {
      const validation = validateClinicalNotes('Alert ⚠️ patient about medication');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with emoji variation selectors', () => {
      // Testing with emoji that have variation selectors
      const validation = validateClinicalNotes('Patient improving ❤️‍🔥');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with flag emoji', () => {
      const validation = validateClinicalNotes('Visit location 🇺🇸 was good');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with keycap emoji', () => {
      const validation = validateClinicalNotes('Priority 1️⃣ follow-up needed');
      expect(validation.isValid).toBe(false);
    });

    it('should reject notes with zero-width joiners', () => {
      const validation = validateClinicalNotes('Healthcare 👨‍⚕️ provider assessment');
      expect(validation.isValid).toBe(false);
    });

    it('should accept multiline clinical notes', () => {
      const multilineNote = `Vital Signs:
- BP: 120/80 mmHg
- Temp: 37.5°C
- HR: 72 bpm

Observations:
Patient appears well, alert and oriented.`;

      const validation = validateClinicalNotes(multilineNote);
      expect(validation.isValid).toBe(true);
    });

    it('should reject notes with mixed valid and invalid content', () => {
      const validation = validateClinicalNotes('Patient is stable 😊 and vitals are normal. Follow-up scheduled.');
      expect(validation.isValid).toBe(false);
    });

    it('should handle empty or null notes gracefully', () => {
      expect(validateClinicalNotes('').isValid).toBe(true);
      expect(validateClinicalNotes(null as any).isValid).toBe(true);
      expect(validateClinicalNotes(undefined as any).isValid).toBe(true);
    });
  });
});

function renderVitalsBiometricsInput(props = {}) {
  render(<VitalsAndBiometricsInput {...defaultProps} {...props} />);
}
