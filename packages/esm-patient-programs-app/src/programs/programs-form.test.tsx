import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  type FetchResponse,
  showSnackbar,
  useLocations,
  useConfig,
  getDefaultsFromConfigSchema,
} from '@openmrs/esm-framework';
import { mockCareProgramsResponse, mockEnrolledProgramsResponse, mockLocationsResponse } from '__mocks__';
import { mockPatient } from 'tools';
import {
  createProgramEnrollment,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
} from './programs.resource';
import ProgramsForm, { type ProgramsFormProps } from './programs-form.workspace';
import { type ConfigObject, configSchema } from '../config-schema';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';

const mockUseAvailablePrograms = jest.mocked(useAvailablePrograms);
const mockUseEnrollments = jest.mocked(useEnrollments);
const mockCreateProgramEnrollment = jest.mocked(createProgramEnrollment);
const mockUpdateProgramEnrollment = jest.mocked(updateProgramEnrollment);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseLocations = jest.mocked(useLocations);
const mockCloseWorkspace = jest.fn();
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

const testProps: PatientWorkspace2DefinitionProps<ProgramsFormProps, {}> = {
  closeWorkspace: mockCloseWorkspace,
  groupProps: {
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null,
    mutateVisitContext: null,
  },
  workspaceName: '',
  launchChildWorkspace: jest.fn(),
  workspaceProps: {},
  windowProps: {},
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
};

jest.mock('./programs.resource', () => ({
  createProgramEnrollment: jest.fn(),
  updateProgramEnrollment: jest.fn(),
  useAvailablePrograms: jest.fn(),
  useEnrollments: jest.fn(),
  findLastState: jest.fn(),
}));

mockUseLocations.mockReturnValue(mockLocationsResponse);

mockUseAvailablePrograms.mockReturnValue({
  data: mockCareProgramsResponse,
  eligiblePrograms: [],
  error: null,
  isLoading: false,
});

mockUseEnrollments.mockReturnValue({
  data: mockEnrolledProgramsResponse,
  error: null,
  isLoading: false,
  isValidating: false,
  activeEnrollments: [],
  mutateEnrollments: jest.fn(),
});

mockCreateProgramEnrollment.mockResolvedValue({
  status: 201,
  statusText: 'Created',
} as unknown as FetchResponse);

describe('ProgramsForm', () => {
  it('renders a success toast notification upon successfully recording a program enrollment', async () => {
    const user = userEvent.setup();

    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';
    const mockLocation = {
      uuid: 'uuid_2',
      name: 'location_2',
    };

    renderProgramsForm();

    const programNameInput = screen.getByRole('combobox', { name: /program name/i });
    const enrollmentDateInput = screen.getByRole('textbox', { name: /date enrolled/i });
    const enrollmentLocationInput = screen.getByRole('radio', { name: mockLocation.name });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(enrollButton);
    expect(screen.getByText(/program is required/i)).toBeInTheDocument();

    fireEvent.change(enrollmentDateInput, { target: { value: '2020-05-05' } });
    await user.selectOptions(programNameInput, [oncologyScreeningProgramUuid]);
    await user.click(enrollmentLocationInput);
    expect(screen.getByRole('radio', { name: mockLocation.name })).toBeInTheDocument();

    await user.click(enrollButton);

    expect(mockCreateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockCreateProgramEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        dateCompleted: null,
        location: mockLocation.uuid,
        patient: mockPatient.id,
        program: oncologyScreeningProgramUuid,
        dateEnrolled: expect.stringMatching(/^2020-05-05/),
      }),
      new AbortController(),
    );

    expect(mockCloseWorkspace).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'It is now visible in the Programs table',
      kind: 'success',
      title: 'Program enrollment saved',
    });
  });

  it('updates a program enrollment', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

    const enrollButton = screen.getByRole('button', { name: /save and close/i });

    const completionDateInput = screen.getByRole('textbox', { name: /date completed/i });

    mockUpdateProgramEnrollment.mockResolvedValue({
      status: 200,
      statusText: 'OK',
    } as unknown as FetchResponse);

    await user.click(completionDateInput);
    await user.paste('2020-05-05');
    await user.tab();
    await user.click(enrollButton);

    expect(mockUpdateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockUpdateProgramEnrollment).toHaveBeenCalledWith(
      mockEnrolledProgramsResponse[0].uuid,
      expect.objectContaining({
        dateCompleted: expect.stringMatching(/^2020-05-05/),
        dateEnrolled: expect.stringMatching(/^2020-01-16/),
        location: mockEnrolledProgramsResponse[0].location.uuid,
        patient: mockPatient.id,
        program: mockEnrolledProgramsResponse[0].program.uuid,
      }),
      new AbortController(),
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'Changes to the program are now visible in the Programs table',
        kind: 'success',
        title: 'Program enrollment updated',
      }),
    );
  });

  it('does not submit the form when completion date is before enrollment date', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

    const completionDateInput = screen.getByRole('textbox', { name: /date completed/i });
    const saveButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(completionDateInput);
    await user.paste('2019-12-01');
    await user.tab();

    await user.click(saveButton);

    expect(mockCreateProgramEnrollment).not.toHaveBeenCalled();
    expect(mockUpdateProgramEnrollment).not.toHaveBeenCalled();
  });

  it('renders the programs status field if the config property is set to true', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showProgramStatusField: true,
    });

    renderProgramsForm();

    expect(screen.getByLabelText(/program status/i)).toBeInTheDocument();
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  const props = {
    ...testProps,
    workspaceProps: { programEnrollmentId: programEnrollmentUuidToEdit },
  };
  render(<ProgramsForm {...props} />);
}
