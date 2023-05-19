import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import FormRenderer from './form-renderer.component';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';

jest.mock('@openmrs/openmrs-form-engine-lib', () => ({
  OHRIForm: jest
    .fn()
    .mockImplementation(() => React.createElement('div', { 'data-testid': 'openmrs form' }, 'FORM ENGINE LIB')),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
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

  beforeEach(() => {
    (useForm as jest.Mock).mockReset();
    (useSchema as jest.Mock).mockReset();
  });

  test('renders FormError component when there is an error', () => {
    (useForm as jest.Mock).mockReturnValue({ form: null, isLoadingForm: false, formLoadError: 'Error message' });
    (useSchema as jest.Mock).mockReturnValue({ schema: null, isLoadingSchema: false, schemaLoadError: null });

    render(<FormRenderer {...defaultProps} />);

    expect(screen.getByText('There was an error with this form')).toBeInTheDocument();
  });

  test('renders InlineLoading component when loading', () => {
    (useForm as jest.Mock).mockReturnValue({ form: null, isLoadingForm: true, formLoadError: null });
    (useSchema as jest.Mock).mockReturnValue({ schema: null, isLoadingSchema: true, schemaLoadError: null });

    const { getByText } = render(<FormRenderer {...defaultProps} />);
    expect(getByText('Loading ...')).toBeInTheDocument();
  });

  test('renders FORM Engine component when schema is available', async () => {
    const mockForm = {
      resources: [
        {
          name: 'JSON schema',
          valueReference: 'test-schema-uuid',
        },
      ],
    };

    (useForm as jest.Mock).mockReturnValue({ form: mockForm, isLoading: false, error: null });
    (useSchema as jest.Mock).mockReturnValue({ schema: { id: 'test-schema' }, isLoading: false, error: null });

    render(<FormRenderer {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('FORM ENGINE LIB')).toBeInTheDocument());
  });
});
