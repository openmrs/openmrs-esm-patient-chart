import React from 'react';
import { of, throwError } from 'rxjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, saveVisit, showSnackbar, updateVisit, useConfig, type Visit } from '@openmrs/esm-framework';
import { mockLocations, mockVisitTypes, mockVisitWithAttributes } from '__mocks__';
import { mockPatient } from 'tools';
import { useVisitAttributeType } from '../hooks/useVisitAttributeType';
import StartVisitForm from './visit-form.component';

const visitUuid = 'test_visit_uuid';

const visitAttributes = {
  punctuality: {
    uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
    name: 'Punctuality',
    display: 'Punctuality',
    datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype',
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

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspace,
  promptBeforeClosing: mockPromptBeforeClosing,
  showVisitEndDateTimeFields: false,
};

const mockSaveVisit = saveVisit as jest.Mock;
const mockUpdateVisit = updateVisit as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;
const mockedUseVisitAttributeType = useVisitAttributeType as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,

    get getStartedVisit() {
      return mockGetStartedVisitGetter();
    },
    saveVisit: jest.fn(),
    updateVisit: jest.fn(),
    openmrsFetch: jest.fn(),
    useConfig: jest.fn(() => ({
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
    })),
    toOmrsIsoString: jest.fn(),
    useLocations: jest.fn(),
    toDateObjectStrict: jest.fn(),
    useVisitTypes: jest.fn().mockImplementation(() => mockVisitTypes),
    usePatient: jest.fn().mockImplementation((patientUuid) => ({ patientUuid, patient: {} })),
  };
});

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
    data: [visitAttributes.punctuality, visitAttributes.insurancePolicyNumber],
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

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useActivePatientEnrollment: jest.fn().mockReturnValue({
      activePatientEnrollment: [],
      isLoading: false,
    }),
  };
});

jest.mock('../hooks/useDefaultLocation', () => {
  const requireActual = jest.requireActual('../hooks/useDefaultLocation');

  return {
    ...requireActual,
    useDefaultLoginLocation: jest.fn(() => ({
      defaultFacility: null,
      isLoading: false,
    })),
  };
});

jest.mock('../hooks/useLocations', () => {
  const requireActual = jest.requireActual('../hooks/useLocations');
  return {
    ...requireActual,
    useLocations: jest.fn(() => ({
      locations: mockLocations,
      isLoading: false,
      error: null,
    })),
  };
});

describe('Visit Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Start Visit form with all the relevant fields and values', async () => {
    renderVisitForm();

    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /HIV Return Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
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

  it('renders an error message when a visit type has not been selected', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /start visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(saveButton);

    expect(screen.getByText(/Missing visit type/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select a visit type/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Outpatient visit/i));
  });

  it('starts a new visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    mockSaveVisit.mockReturnValue(
      of({
        status: 201,
        data: {
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    await user.click(saveButton);

    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
      }),
      expect.any(Function),
    );

    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
      timeoutInMs: 5000,
    });
  });

  it('starts a new visit with attributes upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    mockOpenmrsFetch.mockResolvedValue({});
    mockedUseConfig.mockReturnValueOnce({
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
        {
          uuid: visitAttributes.insurancePolicyNumber.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    });

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'On time');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);
    await user.type(insuranceNumberInput, '183299');

    mockSaveVisit.mockReturnValue(
      of({
        status: 201,
        data: {
          uuid: visitUuid,
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    await user.click(saveButton);

    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
      }),
      expect.any(Function),
    );

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${visitUuid}/attribute`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: { attributeType: visitAttributes.punctuality.uuid, value: '66cdc0a1-aa19-4676-af51-80f66d78d9eb' },
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${visitUuid}/attribute`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: { attributeType: visitAttributes.insurancePolicyNumber.uuid, value: '183299' },
    });

    expect(mockCloseWorkspace).toHaveBeenCalled();

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
      timeoutInMs: 5000,
    });
  });

  it('Updates visit attributes on an existing visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm(mockVisitWithAttributes);

    mockOpenmrsFetch.mockResolvedValue({});
    mockedUseConfig.mockReturnValueOnce({
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
        {
          uuid: visitAttributes.insurancePolicyNumber.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    });

    const saveButton = screen.getByRole('button', { name: /Update visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'Late');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);
    await user.type(insuranceNumberInput, '1873290');

    mockUpdateVisit.mockReturnValue(
      of({
        status: 201,
        data: {
          uuid: visitUuid,
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    await user.click(saveButton);

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockVisitWithAttributes.uuid,
      expect.objectContaining({
        location: mockLocations[1].uuid,
        visitType: 'some-uuid1',
      }),
      expect.any(Function),
    );

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `/ws/rest/v1/visit/${visitUuid}/attribute/c98e66d7-7db5-47ae-b46f-91a0f3b6dda1`,
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: { value: '66cdc0a1-aa19-4676-af51-80f66d78d9ec' },
      },
    );

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `/ws/rest/v1/visit/${visitUuid}/attribute/d6d7d26a-5975-4f03-8abb-db073c948897`,
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: { value: '1873290' },
      },
    );

    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit updated successfully',
      kind: 'success',
      title: 'Visit details updated',
      timeoutInMs: 5000,
    });
  });

  it('deletes visit attributes on an existing visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm(mockVisitWithAttributes);

    mockOpenmrsFetch.mockResolvedValue({});
    mockedUseConfig.mockReturnValueOnce({
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
        {
          uuid: visitAttributes.insurancePolicyNumber.uuid,
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    });

    const saveButton = screen.getByRole('button', { name: /Update visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    const punctualityPicker = screen.getByRole('combobox', { name: 'Punctuality (optional)' });
    await user.selectOptions(punctualityPicker, 'Select an option');

    const insuranceNumberInput = screen.getByRole('textbox', { name: 'Insurance Policy Number (optional)' });
    await user.clear(insuranceNumberInput);

    mockUpdateVisit.mockReturnValue(
      of({
        status: 201,
        data: {
          uuid: visitUuid,
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    await user.click(saveButton);

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockVisitWithAttributes.uuid,
      expect.objectContaining({
        location: mockLocations[1].uuid,
        visitType: 'some-uuid1',
      }),
      expect.any(Function),
    );

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `/ws/rest/v1/visit/${visitUuid}/attribute/c98e66d7-7db5-47ae-b46f-91a0f3b6dda1`,
      { method: 'DELETE' },
    );

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `/ws/rest/v1/visit/${visitUuid}/attribute/d6d7d26a-5975-4f03-8abb-db073c948897`,
      { method: 'DELETE' },
    );

    expect(mockCloseWorkspace).toHaveBeenCalled();

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit updated successfully',
      kind: 'success',
      title: 'Visit details updated',
      timeoutInMs: 5000,
    });
  });

  it('renders an error message if there was a problem starting a new visit', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));
    mockSaveVisit.mockReturnValue(throwError({ status: 500, statusText: 'Internal server error' }));

    await user.click(saveButton);

    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error starting visit',
      }),
    );
  });

  it('displays the `Unsaved changes` modal when a form has unsaved changes', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const closeButton = screen.getByRole('button', { name: /Discard/i });

    await user.click(closeButton);

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  it('should not submit the form if the visit attributes type is required and throw the error', async () => {
    const user = userEvent.setup();

    mockSaveVisit.mockReturnValue(
      of({
        status: 201,
        data: {
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    renderVisitForm();

    mockedUseConfig.mockReturnValueOnce({
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
      ],
    });

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await user.click(screen.getByLabelText(/Outpatient visit/i));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await userEvent.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(saveButton);

    expect(mockSaveVisit).not.toHaveBeenCalled();
    expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
  });

  it('should show a banner if the not required visitAttribute fields are failed to load', async () => {
    mockedUseVisitAttributeType.mockReturnValue({
      isLoading: false,
      error: new Error('failed to load'),
      data: visitAttributes.punctuality,
    });
    renderVisitForm();
    expect(screen.getByText(/Part of the form did not load/i)).toBeInTheDocument();
    expect(screen.getByText(/Please refresh to try again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).not.toBeDisabled();
  });

  it('should show a banner if the required visitAttribute fields are failed to load and block the submit button', async () => {
    mockedUseVisitAttributeType.mockReturnValue({
      isLoading: false,
      error: new Error('failed to load'),
      data: visitAttributes.punctuality,
    });
    mockedUseConfig.mockReturnValue({
      visitAttributeTypes: [
        {
          uuid: visitAttributes.punctuality.uuid,
          required: true,
          displayInThePatientBanner: true,
        },
      ],
    });
    renderVisitForm();

    expect(screen.getByText(/Part of the form did not load/i)).toBeInTheDocument();
    expect(screen.getByText(/Please refresh to try again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeDisabled();
  });
});

function renderVisitForm(visitToEdit?: Visit) {
  render(<StartVisitForm {...{ ...testProps, visitToEdit }} />);
}
