import React from 'react';
import { screen, render } from '@testing-library/react';
import VitalsBiometricsInput from './vitals-biometrics-input.component';
import userEvent from '@testing-library/user-event';

const mockOnChange = jest.fn();

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

describe('VitalsBiometricsInput', () => {
  const mockProps = {
    title: 'Heart Rate',
    textFields: [
      {
        name: 'heartRate',
        type: 'number',
        value: 120,
      },
    ],
    unitSymbol: 'bpm',
  };

  it('should display the correct text input with correct value', async () => {
    const user = userEvent.setup();

    render(
      <VitalsBiometricsInput
        isWithinNormalRange
        title={mockProps.title}
        onInputChange={mockOnChange}
        textFields={mockProps.textFields}
        unitSymbol={mockProps.unitSymbol}
      />,
    );

    expect(screen.getByText(/Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/bpm/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();

    const inputTextBox = await screen.findByRole('spinbutton');
    await user.type(inputTextBox, '75');
  });

  it('should display the correct text area with correct value', async () => {
    render(
      <VitalsBiometricsInput
        isWithinNormalRange
        title="Notes"
        onInputChange={mockOnChange}
        textFields={[
          {
            name: 'Notes',
            type: 'textArea',
            value: '',
          },
        ]}
      />,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should disable input when the disabled prop is set to `true`', async () => {
    const user = userEvent.setup();

    render(
      <VitalsBiometricsInput
        isWithinNormalRange
        title={mockProps.title}
        onInputChange={mockOnChange}
        textFields={mockProps.textFields}
        unitSymbol={mockProps.unitSymbol}
        disabled
      />,
    );

    expect(screen.getByText(/Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/bpm/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();

    const inputTextBox = await screen.findByRole('spinbutton');

    await user.type(inputTextBox, '7');

    expect(inputTextBox).toHaveProperty('disabled');
  });
});
