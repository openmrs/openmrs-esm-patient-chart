import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import FormRenderer from './form-renderer.component';
import useFormSchema from '../hooks/useFormSchema';
import { FormEngine } from '@openmrs/esm-form-engine-lib';

const mockUseFormSchema = jest.mocked(useFormSchema);

jest.mock('@openmrs/esm-form-engine-lib', () => ({
  FormEngine: jest
    .fn()
    .mockImplementation(() => React.createElement('div', { 'data-testid': 'openmrs form' }, 'FORM ENGINE LIB')),
}));

jest.mock('../hooks/useFormSchema', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('FormRenderer', () => {
  const defaultProps = {
    formUuid: 'test-form-uuid',
    patientUuid: mockPatient.id,
    patient: mockPatient,
    closeWorkspace: jest.fn(),
    closeWorkspaceWithSavedChanges: jest.fn(),
    promptBeforeClosing: jest.fn(),
    setTitle: jest.fn(),
  };

  test('renders FormError component when there is an error', () => {
    mockUseFormSchema.mockReturnValue({ schema: null, isLoading: false, error: new Error('test error') });

    render(<FormRenderer {...defaultProps} />);

    expect(screen.getByText(/There was an error with this form/i)).toBeInTheDocument();
  });

  test('renders InlineLoading component when loading', () => {
    mockUseFormSchema.mockReturnValue({ schema: null, isLoading: true, error: null });

    render(<FormRenderer {...defaultProps} />);

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  test('renders a form preview from the engine when a schema is available', async () => {
    mockUseFormSchema.mockReturnValue({ schema: { uuid: 'test-schema' }, isLoading: false, error: null } as ReturnType<
      typeof useFormSchema
    >);

    render(<FormRenderer {...defaultProps} />);
    await expect(screen.getByText(/form engine lib/i)).toBeInTheDocument();
    expect(mockUseFormSchema).toHaveBeenCalledWith('test-form-uuid');
  });

  test('calls onFormSave when form is saved', () => {
    const onFormSaveMock = jest.fn();

    mockUseFormSchema.mockReturnValue({ schema: { uuid: 'test-schema' }, isLoading: false, error: null } as ReturnType<
      typeof useFormSchema
    >);

    const mockedFormEngine = jest.mocked(FormEngine);

    render(<FormRenderer {...defaultProps} onFormSave={onFormSaveMock} />);

    mockedFormEngine.mock.calls[0][0].onSubmit('test');

    expect(onFormSaveMock).toHaveBeenCalledTimes(1);
    expect(onFormSaveMock).toHaveBeenCalledWith('test');
  });
});
