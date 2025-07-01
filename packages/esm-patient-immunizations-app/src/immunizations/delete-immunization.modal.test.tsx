import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { deletePatientImmunization } from '../hooks/useImmunizations';
import DeleteImmunizationModal from './delete-immunization.modal';
import type { ConfigObject } from '../config-schema';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('../hooks/useImmunizations', () => ({
  ...jest.requireActual('../hooks/useImmunizations'),
  deletePatientImmunization: jest.fn(),
  useImmunizations: jest.fn().mockReturnValue({ mutate: jest.fn() }),
}));

jest.mock('../hooks/useImmunizationsConceptSet', () => ({
  useImmunizationsConceptSet: () => ({
    immunizationsConceptSet: {
      answers: [
        {
          uuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Bacillus Calmette–Guérin vaccine',
        },
      ],
    },
  }),
}));

beforeEach(() => {
  return mockUseConfig.mockReturnValue({
    immunizationsConfig: {
      immunizationConceptSet: '',
      sequenceDefinitions: [],
    },
  });
});

const mockDeleteImmunization = jest.mocked(deletePatientImmunization);
const mockShowSnackbar = jest.mocked(showSnackbar);

const defaultProps = {
  close: jest.fn(),
  doseNumber: 1,
  immunizationId: 'de195ad6-0887-4b09-bd4a-6e37d7d8db63',
  patientUuid: mockPatient.id,
  vaccineUuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

describe('<DeleteImmunizationModal />', () => {
  it('renders modal with correct elements', () => {
    render(<DeleteImmunizationModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /delete immunization/i })).toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to delete dose 1 of Bacillus Calmette–Guérin vaccine/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('clicking Cancel button closes modal', async () => {
    const user = userEvent.setup();
    render(<DeleteImmunizationModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(defaultProps.close).toHaveBeenCalled();
  });

  it('clicking Delete button deletes immunization and shows success', async () => {
    const user = userEvent.setup();
    mockDeleteImmunization.mockResolvedValue();
    render(<DeleteImmunizationModal {...defaultProps} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteImmunization).toHaveBeenCalledWith(defaultProps.immunizationId);
    expect(mockDeleteImmunization).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'Immunization dose deleted successfully',
      title: 'Immunization dose deleted',
    });
  });

  it('shows error when deletion fails', async () => {
    const user = userEvent.setup();
    const error = { message: 'Server error' };
    mockDeleteImmunization.mockRejectedValue(error);

    render(<DeleteImmunizationModal {...defaultProps} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteImmunization).toHaveBeenCalledWith(defaultProps.immunizationId);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Error',
      subtitle: 'Failed to delete immunization: Server error',
      kind: 'error',
    });
  });
});
