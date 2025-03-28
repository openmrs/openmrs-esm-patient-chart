import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  saveVisit,
  showSnackbar,
  updateVisit,
  useConfig,
  useEmrConfiguration,
  useLocations,
  useVisitTypes,
  type Visit,
} from '@openmrs/esm-framework';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockLocations, mockPastVisitWithEncounters, mockVisitTypes, mockVisitWithAttributes } from '__mocks__';
import dayjs from 'dayjs';
import React from 'react';
import { mockPatient } from 'tools';
import { type ChartConfig, esmPatientChartSchema } from '../../config-schema';
import { useVisitAttributeType } from '../hooks/useVisitAttributeType';
import {
  convertToDateTimeFields,
  createVisitAttribute,
  deleteVisitAttribute,
  updateVisitAttribute,
  useVisitFormCallbacks,
  useVisitFormSchemaAndDefaultValues,
} from './visit-form.resource';
import VisitForm from './visit-form.workspace';

const visitUuid = 'test_visit_uuid';
const visitAttributes = {
  punctuality: {
    uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
    name: 'Punctuality',
    display: 'Punctuality',
    datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype' as const,
    datatypeConfig: '',
    preferredHandlerClassname: 'default',
    description: '',
    retired: false,
  },
  insurancePolicyNumber: {
    uuid: 'aac48226-d143-4274-80e0-264db4e368ee',
    name: 'Insurance Policy Number',
    display: 'Insurance Policy Number',
    datatypeConfig: '',
    datatypeClassname: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
    description: '',
    preferredHandlerClassname: 'default',
    retired: false,
  },
};

const mockCloseWorkspace = jest.fn();
const mockPromptBeforeClosing = jest.fn();
const mockSetTitle = jest.fn();

const testProps = {
  openedFrom: 'test',
  patientUuid: mockPatient.id,
  patient: mockPatient,
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspace,
  promptBeforeClosing: mockPromptBeforeClosing,
  setTitle: mockSetTitle,
};

const mockSaveVisit = jest.mocked(saveVisit);
const mockUpdateVisit = jest.mocked(updateVisit);
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockUseVisitAttributeType = jest.mocked(useVisitAttributeType);
const mockUseVisitTypes = jest.mocked(useVisitTypes);
const mockUseLocations = jest.mocked(useLocations);
const mockUseEmrConfiguration = jest.mocked(useEmrConfiguration);

// from ./visit-form.resource
const mockOnVisitCreatedOrUpdatedCallback = jest.fn();
jest.mocked(useVisitFormCallbacks).mockReturnValue([
  new Map([['test-extension-id', { onVisitCreatedOrUpdated: mockOnVisitCreatedOrUpdatedCallback }]]), // visitFormCallbacks
  jest.fn(), // setVisitFormCallbacks
]);
const mockCreateVisitAttribute = jest.mocked(createVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
const mockUpdateVisitAttribute = jest.mocked(updateVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
const mockDeleteVisitAttribute = jest.mocked(deleteVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useActivePatientEnrollment: jest.fn().mockReturnValue({
    activePatientEnrollment: [],
    isLoading: false,
  }),
}));

jest.mock('../hooks/useVisitAttributeType', () => ({
  useVisitAttributeType: jest.fn((attributeUuid) => {
    if (attributeUuid === visitAttributes.punctuality.uuid) {
      return {
        isLoading: false,
        error: null,
        data: visitAttributes.punctuality,
      };
    }
    if (attributeUuid === visitAttributes.insurancePolicyNumber.uuid) {
      return {
        isLoading: false,
        error: null,
        data: visitAttributes.insurancePolicyNumber,
      };
    }
  }),
  useVisitAttributeTypes: jest.fn(() => ({
    isLoading: false,
    error: null,
    visitAttributeTypes: [visitAttributes.punctuality, visitAttributes.insurancePolicyNumber],
  })),
  useConceptAnswersForVisitAttributeType: jest.fn(() => ({
    isLoading: false,
    error: null,
    answers: [
      {
        uuid: '66cdc0a1-aa19-4676-af51-80f66d78d9eb',
        display: 'On time',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb',
            resourceAlias: 'concept',
          },
        ],
      },
      {
        uuid: '66cdc0a1-aa19-4676-af51-80f66d78d9ec',
        display: 'Late',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9ec',
            resourceAlias: 'concept',
          },
        ],
      },
    ],
  })),
}));

jest.mock('../hooks/useDefaultFacilityLocation', () => {
  const requireActual = jest.requireActual('../hooks/useDefaultFacilityLocation');

  return {
    ...requireActual,
    useDefaultLoginLocation: jest.fn(() => ({
      defaultFacility: null,
      isLoading: false,
    })),
  };
});

jest.mock('./visit-form.resource', () => {
  const requireActual = jest.requireActual('./visit-form.resource');
  return {
    ...requireActual,
    useVisitFormCallbacks: jest.fn(),
    createVisitAttribute: jest.fn(),
    updateVisitAttribute: jest.fn(),
    deleteVisitAttribute: jest.fn(),
  };
});

mockSaveVisit.mockResolvedValue({
  status: 201,
  data: {
    uuid: visitUuid,
    visitType: {
      display: 'Facility Visit',
    },
  },
} as unknown as FetchResponse<Visit>);

describe('Visit form', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
        {
          uuid: visitAttributes.insurancePolicyNumber.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    });
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
    mockUseLocations.mockReturnValue(mockLocations);
    mockUseEmrConfiguration.mockReturnValue({
      emrConfiguration: {
        atFacilityVisitType: null,
      },
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      mutateEmrConfiguration: null,
    });
  });

  it('renders the Start Visit form with all the relevant fields and values', async () => {
    renderVisitForm();

    // ===================
    // Testing the visit status content switcher and how they show/hide the visit start/end fields
    const visitStatusNew = screen.getByRole('tab', { name: /new/i });
    const visitStatusOngoing = screen.getByRole('tab', { name: /ongoing/i });
    const visitStatusPast = screen.getByRole('tab', { name: /in the past/i });
    expect(visitStatusNew).toBeInTheDocument();
    expect(visitStatusOngoing).toBeInTheDocument();
    expect(visitStatusPast).toBeInTheDocument();

    const visitStartDate = () => screen.queryByLabelText(/start date/i);
    const visitStartTime = () => screen.queryByRole('textbox', { name: /start time/i });
    const visitStartTimeFormat = () => screen.queryByRole('combobox', { name: /start time format/i });
    const visitEndDate = () => screen.queryByLabelText(/end date/i);
    const visitEndTime = () => screen.queryByRole('textbox', { name: /end time/i });
    const visitEndTimeFormat = () => screen.queryByRole('combobox', { name: /end time format/i });

    // when visit status is new, no start date / end date fields
    await visitStatusNew.click();
    expect(visitStartDate()).not.toBeInTheDocument();
    expect(visitStartTime()).not.toBeInTheDocument();
    expect(visitStartTimeFormat()).not.toBeInTheDocument();
    expect(visitEndDate()).not.toBeInTheDocument();
    expect(visitEndTime()).not.toBeInTheDocument();
    expect(visitEndTimeFormat()).not.toBeInTheDocument();

    // when visit status is ongoing, should have only start date fields
    await visitStatusOngoing.click();
    expect(visitStartDate()).toBeInTheDocument();
    expect(visitStartTime()).toBeInTheDocument();
    expect(visitStartTimeFormat()).toBeInTheDocument();
    expect(visitEndDate()).not.toBeInTheDocument();
    expect(visitEndTime()).not.toBeInTheDocument();
    expect(visitEndTimeFormat()).not.toBeInTheDocument();

    // when visit status is past, should have both start date and end date fields
    await visitStatusPast.click();
    expect(visitStartDate()).toBeInTheDocument();
    expect(visitStartTime()).toBeInTheDocument();
    expect(visitStartTimeFormat()).toBeInTheDocument();
    expect(visitEndDate()).toBeInTheDocument();
    expect(visitEndTime()).toBeInTheDocument();
    expect(visitEndTimeFormat()).toBeInTheDocument();
    // ===================

    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /HIV Return Visit/ })).toBeInTheDocument();
    expect(screen.getByText(/Punctuality/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Start Visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();

    // Testing the location picker
    const combobox = screen.getByRole('combobox', { name: /Select a location/i });
    expect(screen.getByText(/Outpatient Visit/i)).toBeInTheDocument();
    await userEvent.click(combobox);
    expect(screen.getByText(/Mosoriot/i)).toBeInTheDocument();
    expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
  });

  it('does not render visit type combo box if atFacilityVisitType set', async () => {
    mockUseEmrConfiguration.mockReturnValue({
      emrConfiguration: {
        atFacilityVisitType: {
          uuid: 'some-uuid1',
        },
      },
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      mutateEmrConfiguration: null,
    });
    renderVisitForm();
    expect(screen.queryByRole('radio', { name: /HIV Return Visit/ })).not.toBeInTheDocument();
  });

  it('renders a validation error when required fields are not filled', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /start visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));
    await user.click(saveButton);

    expect(screen.getByText(/missing visit type/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a visit type/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Outpatient visit/i));
  });

  it('displays an error message when the visit start time is in the future', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));
    const dateInput = screen.queryByLabelText(/start date/i);
    const timeInput = screen.getByRole('textbox', { name: /start time/i });
    const amPmSelect = screen.getByRole('combobox', { name: /start time format/i });
    const saveButton = screen.getByRole('button', { name: /Start visit/i });
    const futureTime = dayjs().add(1, 'hour');

    expect(dateInput).toBeEnabled();
    await user.clear(dateInput);
    await user.type(dateInput, futureTime.format('DD/MM/YYYY'));
    await user.clear(timeInput);
    await user.type(timeInput, futureTime.format('hh:mm'));
    await user.selectOptions(amPmSelect, futureTime.format('A'));
    await user.tab();

    // ***
    // For some reason, DatePicker and TimePicker does not get react hook form's zod validation
    // errors with onChange events when in unit tests. Validation triggers only when
    // the required fields (Visit type and location) are filled out and the save button is pressed.

    // Set Visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));
    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(saveButton);

    expect(timeInput).toHaveValue(futureTime.format('hh:mm'));
    expect(screen.getByText(/start time cannot be in the future/i)).toBeInTheDocument();
  });

  // FIXME: Make the date input work
  xit('allows to enter start date in the past when visit status is ongoing', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));
    const dateInput = screen.queryByLabelText(/start date/i) as HTMLInputElement;
    const timeInput = screen.getByRole('textbox', { name: /start time/i }) as HTMLInputElement;
    const amPmSelect = screen.getByRole('combobox', { name: /start time format/i });
    const pastTime = dayjs().subtract(1, 'month');

    expect(dateInput).toBeEnabled();
    await user.clear(dateInput);
    await user.click(dateInput);
    await user.type(dateInput, pastTime.format('DD/MM/YYYY') + '{enter}');
    await user.tab();
    await user.type(timeInput, pastTime.format('hh:mm'));
    await user.selectOptions(amPmSelect, pastTime.format('A'));
    await user.tab();

    expect(dateInput).toHaveValue(pastTime.format('DD/MM/YYYY'));
  });

  it('create a new visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(saveButton);
    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      {
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
        startDatetime: null,
        stopDatetime: null,
      },
      expect.any(Object),
    );

    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
    });
  });

  it('starts a new visit with attributes upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'On time');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);
    await user.type(insuranceNumberInput, '183299');

    await user.click(saveButton);

    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      {
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
        startDatetime: null,
        stopDatetime: null,
      },
      expect.any(Object),
    );

    expect(mockCreateVisitAttribute).toHaveBeenCalledTimes(2);
    expect(mockCreateVisitAttribute).toHaveBeenCalledWith(
      visitUuid,
      visitAttributes.punctuality.uuid,
      '66cdc0a1-aa19-4676-af51-80f66d78d9eb',
    );
    expect(mockCreateVisitAttribute).toHaveBeenCalledWith(
      visitUuid,
      visitAttributes.insurancePolicyNumber.uuid,
      '183299',
    );

    expect(mockOnVisitCreatedOrUpdatedCallback).toHaveBeenCalled();

    expect(mockCloseWorkspace).toHaveBeenCalled();

    expect(showSnackbar).toHaveBeenCalledTimes(2);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
    });
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      title: expect.stringContaining('Additional visit information updated successfully'),
      kind: 'success',
    });
  });

  it('updates visit attributes when editing an existing visit', async () => {
    const user = userEvent.setup();

    renderVisitForm(mockVisitWithAttributes);

    const saveButton = screen.getByRole('button', { name: /Update visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'Late');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);
    await user.type(insuranceNumberInput, '1873290');

    mockUpdateVisit.mockResolvedValue({
      status: 201,
      data: {
        uuid: visitUuid,
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    await user.click(saveButton);

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockVisitWithAttributes.uuid,
      expect.objectContaining({
        location: mockLocations[1].uuid,
        visitType: 'some-uuid1',
      }),
      expect.any(Object),
    );

    expect(mockUpdateVisitAttribute).toHaveBeenCalledTimes(2);
    expect(mockUpdateVisitAttribute).toHaveBeenCalledWith(
      visitUuid,
      'c98e66d7-7db5-47ae-b46f-91a0f3b6dda1',
      '66cdc0a1-aa19-4676-af51-80f66d78d9ec',
    );
    expect(mockUpdateVisitAttribute).toHaveBeenCalledWith(visitUuid, 'd6d7d26a-5975-4f03-8abb-db073c948897', '1873290');

    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit updated successfully',
      kind: 'success',
      title: 'Visit details updated',
    });
  });

  it('deletes visit attributes if the value of the field is cleared when editing an existing visit', async () => {
    const user = userEvent.setup();

    renderVisitForm(mockVisitWithAttributes);

    const saveButton = screen.getByRole('button', { name: /Update visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'Select an option');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);

    mockUpdateVisit.mockResolvedValue({
      status: 201,
      data: {
        uuid: visitUuid,
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    await user.click(saveButton);

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockVisitWithAttributes.uuid,
      expect.objectContaining({
        location: mockLocations[1].uuid,
        visitType: 'some-uuid1',
      }),
      expect.any(Object),
    );

    expect(mockDeleteVisitAttribute).toHaveBeenCalledTimes(2);
    expect(mockDeleteVisitAttribute).toHaveBeenCalledWith(visitUuid, 'c98e66d7-7db5-47ae-b46f-91a0f3b6dda1');
    expect(mockDeleteVisitAttribute).toHaveBeenCalledWith(visitUuid, 'd6d7d26a-5975-4f03-8abb-db073c948897');

    expect(mockCloseWorkspace).toHaveBeenCalled();

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit updated successfully',
      kind: 'success',
      title: 'Visit details updated',
    });
  });

  it('renders an error message if there was a problem starting a new visit', async () => {
    const user = userEvent.setup();

    mockSaveVisit.mockRejectedValueOnce({ status: 500, statusText: 'Internal server error' });

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText(/Inpatient Ward/i));

    await user.click(saveButton);

    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error starting visit',
      }),
    );

    expect(mockOnVisitCreatedOrUpdatedCallback).not.toHaveBeenCalled();
    expect(mockCloseWorkspace).not.toHaveBeenCalled();
  });

  it('renders an error message if there was a problem updating visit attributes after starting a new visit', async () => {
    const user = userEvent.setup();

    mockCreateVisitAttribute.mockRejectedValue({ status: 500, statusText: 'Internal server error' });

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText(/Inpatient Ward/i));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'On time');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);
    await user.type(insuranceNumberInput, '183299');

    await user.click(saveButton);

    expect(showSnackbar).toHaveBeenCalledTimes(3);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
    });
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      subtitle: undefined,
      kind: 'error',
      title: 'Error creating the Punctuality visit attribute',
    });
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      subtitle: undefined,
      kind: 'error',
      title: 'Error creating the Insurance Policy Number visit attribute',
    });

    expect(mockOnVisitCreatedOrUpdatedCallback).toHaveBeenCalled();
    expect(mockCloseWorkspace).not.toHaveBeenCalled();
  });

  it('displays a warning modal if the user attempts to discard the visit form with unsaved changes', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const closeButton = screen.getByRole('button', { name: /Discard/i });

    await user.click(closeButton);

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  it('renders an inline error notification if an optional visit attribute type field fails to load', async () => {
    mockUseVisitAttributeType.mockReturnValue({
      isLoading: false,
      error: new Error('failed to load'),
      data: visitAttributes.punctuality,
    });

    renderVisitForm();

    expect(screen.getByText(/Part of the form did not load/i)).toBeInTheDocument();
    expect(screen.getByText(/Please refresh to try again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeEnabled();
  });

  it('renders an error if a required visit attribute type is not provided', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(esmPatientChartSchema) as ChartConfig),
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
      ],
    });

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));
    await user.click(saveButton);

    expect(mockSaveVisit).not.toHaveBeenCalled();
  });

  it('should disable the submit button and display an inline error notification if required visit attribute fields fail to load', async () => {
    mockUseVisitAttributeType.mockReturnValue({
      isLoading: false,
      error: new Error('failed to load'),
      data: visitAttributes.punctuality,
    });

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema,
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
      ],
    } as ChartConfig);

    renderVisitForm();

    expect(screen.getByText(/Part of the form did not load/i)).toBeInTheDocument();
    expect(screen.getByText(/Please refresh to try again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeDisabled();
  });
});

// Note: For some reason, DatePicker and TimePicker don't get validated properly
// by react hook form + zod when in test. Here, we test validation of
// start / end time fields through the useVisitFormSchemaAndDefaultValues hook instead
describe('useVisitFormSchemaAndDefaultValues', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
        {
          uuid: visitAttributes.insurancePolicyNumber.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    });
  });
  it('should validate start and end times', async () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(mockPastVisitWithEncounters));

    // verify start time set to past end time
    const stopDateTime = dayjs(mockPastVisitWithEncounters.stopDatetime);
    const badStartTimePastStopTime = stopDateTime.add(1, 'hour');
    const badStartTimePastStopTimeFields = convertToDateTimeFields(badStartTimePastStopTime);
    const {
      error: { issues: badStartTimePastStopTimeIssues },
    } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStartDate: badStartTimePastStopTimeFields.date,
      visitStartTime: badStartTimePastStopTimeFields.time,
      visitStartTimeFormat: badStartTimePastStopTimeFields.timeFormat,
    });
    expect(badStartTimePastStopTimeIssues).toContainEqual(
      expect.objectContaining({
        message: 'End time must be after start time', //'Visit start time cannot be in the future'
      }),
    );

    // verify start time set to future
    const badStartTimeInFuture = dayjs().add(1, 'hour');
    const badStartTimeInFutureFields = convertToDateTimeFields(badStartTimeInFuture);
    const {
      error: { issues: badStartTimeInFutureIssues },
    } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStartDate: badStartTimeInFutureFields.date,
      visitStartTime: badStartTimeInFutureFields.time,
      visitStartTimeFormat: badStartTimeInFutureFields.timeFormat,
    });
    expect(badStartTimeInFutureIssues).toContainEqual(
      expect.objectContaining({
        message: 'Start time cannot be in the future',
      }),
    );

    // verity start time set past first encounter time
    const firstEncounterDatetime = dayjs(mockPastVisitWithEncounters.encounters[0].encounterDatetime);
    const badStartTimeAfterEncounterTime = firstEncounterDatetime.add(1, 'minute');
    const badStartTimeAfterEncounterTimeFields = convertToDateTimeFields(badStartTimeAfterEncounterTime);
    const {
      error: { issues: badStartTimeAfterEncounterTimeIssues },
    } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStartDate: badStartTimeAfterEncounterTimeFields.date,
      visitStartTime: badStartTimeAfterEncounterTimeFields.time,
      visitStartTimeFormat: badStartTimeAfterEncounterTimeFields.timeFormat,
    });
    expect(badStartTimeAfterEncounterTimeIssues).toContainEqual(
      expect.objectContaining({
        message: 'Start time must be on or before ' + firstEncounterDatetime.toDate().toLocaleString(),
      }),
    );

    // verify stop time set to future
    const badStopTimeInFuture = dayjs().add(1, 'hour');
    const badStopTimeInFutureFields = convertToDateTimeFields(badStopTimeInFuture);
    const {
      error: { issues: badStopTimeInFutureIssues },
    } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStopDate: badStopTimeInFutureFields.date,
      visitStopTime: badStopTimeInFutureFields.time,
      visitStopTimeFormat: badStopTimeInFutureFields.timeFormat,
    });
    expect(badStopTimeInFutureIssues).toContainEqual(
      expect.objectContaining({
        message: 'End time cannot be in the future',
      }),
    );

    // verify stop time set to before last encounter
    const lastEncounterDatetime = dayjs(mockPastVisitWithEncounters.encounters[1].encounterDatetime);
    const badStopTimeBeforeLastEncounter = lastEncounterDatetime.subtract(1, 'minute');
    const badStopTimeBeforeLastEncounterFields = convertToDateTimeFields(badStopTimeBeforeLastEncounter);
    const {
      error: { issues: badStopTimeBeforeLastEncounterIssues },
    } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStopDate: badStopTimeBeforeLastEncounterFields.date,
      visitStopTime: badStopTimeBeforeLastEncounterFields.time,
      visitStopTimeFormat: badStopTimeBeforeLastEncounterFields.timeFormat,
    });
    expect(badStopTimeBeforeLastEncounterIssues).toContainEqual(
      expect.objectContaining({
        message: 'End time must be on or after ' + lastEncounterDatetime.toDate().toLocaleString(),
      }),
    );
  });
});

function renderVisitForm(visitToEdit?: Visit) {
  return render(<VisitForm {...{ ...testProps, visitToEdit }} />);
}
