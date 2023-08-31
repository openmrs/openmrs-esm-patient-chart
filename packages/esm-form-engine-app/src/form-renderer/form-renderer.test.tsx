import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import FormRenderer from './form-renderer.component';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';

const mockedUseForm = useForm as jest.Mock;
const mockedUseSchema = useSchema as jest.Mock;

jest.mock('@openmrs/openmrs-form-engine-lib', () => ({
  OHRIForm: jest
    .fn()
    .mockImplementation(() => React.createElement('div', { 'data-testid': 'openmrs form' }, 'FORM ENGINE LIB')),
}));

jest.mock('../hooks/useForm');
jest.mock('../hooks/useSchema', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('FormRenderer', () => {
  const defaultProps = {
    formUuid: 'test-form-uuid',
    patientUuid: 'test-patient-uuid',
    closeWorkspace: jest.fn(),
  };

  test('renders FormError component when there is an error', () => {
    mockedUseForm.mockReturnValue({ form: null, isLoadingForm: false, formLoadError: 'Error message' });
    mockedUseSchema.mockReturnValue({ schema: null, isLoadingSchema: false, schemaLoadError: null });

    render(<FormRenderer {...defaultProps} />);

    expect(screen.getByText(/There was an error with this form/i)).toBeInTheDocument();
  });

  test('renders InlineLoading component when loading', () => {
    mockedUseForm.mockReturnValue({ form: null, isLoadingForm: true, formLoadError: null });
    mockedUseSchema.mockReturnValue({ schema: null, isLoadingSchema: true, schemaLoadError: null });

    render(<FormRenderer {...defaultProps} />);

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  test('renders a form preview from the engine when a schema is available', async () => {
    const mockForm = {
      resources: [
        {
          name: 'JSON schema',
          valueReference: 'test-schema-uuid',
        },
      ],
    };

    mockedUseForm.mockReturnValue({ form: mockForm, isLoading: false, error: null });
    mockedUseSchema.mockReturnValue({ schema: { id: 'test-schema' }, isLoading: false, error: null });

    render(<FormRenderer {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/form engine lib/i)).toBeInTheDocument());
  });
});
