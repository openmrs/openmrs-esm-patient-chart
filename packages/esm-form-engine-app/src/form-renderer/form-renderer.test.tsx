import React from 'react';
import { render, screen } from '@testing-library/react';
import FormRenderer from './form-renderer.component';
import useFormSchema from '../hooks/useFormSchema';

const mockUseFormSchema = jest.mocked(useFormSchema);

jest.mock('@openmrs/openmrs-form-engine-lib', () => ({
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
    patientUuid: 'test-patient-uuid',
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
});
