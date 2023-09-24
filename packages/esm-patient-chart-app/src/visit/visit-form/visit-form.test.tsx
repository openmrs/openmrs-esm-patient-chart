import React from 'react';
import { of, throwError } from 'rxjs';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveVisit, showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { mockLocations } from '../../__mocks__/location.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { mockVisitTypes } from '../../__mocks__/visits.mock';
import StartVisitForm from './visit-form.component';
import { useVisitAttributeType } from '../hooks/useVisitAttributeType';

const mockCloseWorkspace = jest.fn();
const mockPromptBeforeClosing = jest.fn();

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: mockCloseWorkspace,
  promptBeforeClosing: mockPromptBeforeClosing,
};

const mockSaveVisit = saveVisit as jest.Mock;
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
    useConfig: jest.fn(() => ({
      visitAttributeTypes: [
        {
          uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
          required: false,
          displayInThePatientBanner: true,
        },
      ],
    })),
    toOmrsIsoString: jest.fn(),
    useLocations: jest.fn(),
    toDateObjectStrict: jest.fn(),
    useVisitTypes: jest.fn().mockImplementation(() => mockVisitTypes),
    usePagination: jest.fn().mockImplementation(() => ({
      results: mockVisitTypes,
      goTo: () => {},
      currentPage: 1,
    })),
  };
});

jest.mock('../hooks/useVisitAttributeType', () => ({
  useVisitAttributeType: jest.fn(() => ({
    isLoading: false,
    error: null,
    data: {
      uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
      name: 'Punctuality',
      display: 'Punctuality',
      datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype',
      datatypeConfig: '',
      preferredHandlerClassname: 'default',
      retired: false,
    },
  })),
  useConceptAnswersForVisitAttributeType: jest.fn(() => ({
    isLoading: false,
    error: null,
    answers: [
      {
        uuid: '66cdc0a1-aa19-4676-af51-80f66d78d9eb',
        name: 'On time',
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
        name: 'Late',
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
    await waitFor(() => userEvent.click(combobox));
    expect(screen.getByText(/Mosoriot/i)).toBeInTheDocument();
    expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
  });

  it('renders an error message when a visit type has not been selected', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /start visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await waitFor(() => userEvent.click(locationPicker));
    await waitFor(() => user.click(screen.getByText('Inpatient Ward')));

    await waitFor(() => user.click(saveButton));

    let errorAlert;

    await waitFor(() => {
      errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });
    await waitFor(() => expect(screen.getByText(/Missing visit type/i)).toBeInTheDocument());
    expect(screen.getByText(/Please select a visit type/i)).toBeInTheDocument();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    await waitFor(() => {
      expect(errorAlert).not.toBeInTheDocument();
    });
  });

  it('starts a new visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await waitFor(() => userEvent.click(locationPicker));
    await waitFor(() => user.click(screen.getByText('Inpatient Ward')));

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

    await waitFor(() => user.click(saveButton));

    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
      }),
      new AbortController(),
    );

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({
      critical: true,
      description: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
    });
  });

  it('renders an error message if there was a problem starting a new visit', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await waitFor(() => userEvent.click(locationPicker));
    await waitFor(() => user.click(screen.getByText('Inpatient Ward')));
    mockSaveVisit.mockReturnValue(throwError({ status: 500, statusText: 'Internal server error' }));

    await waitFor(() => user.click(saveButton));

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error starting visit',
      }),
    );
  });

  it('displays the `Unsaved changes` modal when a form has unsaved changes', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    const closeButton = screen.getByRole('button', { name: /Discard/i });

    await waitFor(() => user.click(closeButton));

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
          uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
          required: true,
          displayInThePatientBanner: true,
        },
      ],
    });

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await waitFor(() => userEvent.click(locationPicker));
    await waitFor(() => user.click(screen.getByText('Inpatient Ward')));

    await waitFor(() => user.click(saveButton));

    expect(mockSaveVisit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });
  });

  it('should show a banner if the not required visitAttribute fields are failed to load', async () => {
    mockedUseVisitAttributeType.mockReturnValue({
      isLoading: false,
      error: new Error('failed to load'),
      data: {
        uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
        name: 'Punctuality',
        display: 'Punctuality',
        datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype',
        datatypeConfig: '',
        preferredHandlerClassname: 'default',
        retired: false,
      },
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
      data: {
        uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
        name: 'Punctuality',
        display: 'Punctuality',
        datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype',
        datatypeConfig: '',
        preferredHandlerClassname: 'default',
        retired: false,
      },
    });
    mockedUseConfig.mockReturnValue({
      visitAttributeTypes: [
        {
          uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
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

function renderVisitForm() {
  render(<StartVisitForm {...testProps} />);
}
