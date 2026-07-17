import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  OpenmrsDatePicker,
  saveVisit,
  showSnackbar,
  updateVisit,
  useConfig,
  useEmrConfiguration,
  useLocations,
  useVisit,
  useVisitTypes,
  Workspace2,
  type Visit,
} from '@openmrs/esm-framework';
import { mockLocations, mockPastVisitWithEncounters, mockVisitTypes, mockVisitWithAttributes } from '__mocks__';
import { mockPatient } from 'tools';
import { type ChartConfig, esmPatientChartSchema } from '../../config-schema';
import { useVisitAttributeType } from '../hooks/useVisitAttributeType';
import {
  computeEarliestAllowedStartDate,
  convertToDateTimeFields,
  createVisitAttribute,
  deleteVisitAttribute,
  updateVisitAttribute,
  useAllowOverlappingVisits,
  useEarliestAllowedVisitStartDate,
  useVisitFormCallbacks,
  useVisitFormSchemaAndDefaultValues,
} from './visit-form.resource';
import VisitForm, { type VisitFormProps } from './visit-form.workspace';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib/src';

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

const mockCloseWorkspace = vi.fn();
const mockMutateVisitContext = vi.fn();
const defaultProps: PatientWorkspace2DefinitionProps<VisitFormProps, {}> = {
  closeWorkspace: mockCloseWorkspace,
  workspaceProps: {
    openedFrom: 'test',
  },
  windowProps: {},
  groupProps: {
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null,
    mutateVisitContext: mockMutateVisitContext,
  },
  workspaceName: '',
  launchChildWorkspace: vi.fn(),
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
};

const defaultVisitLocation = {
  display: 'Outpatient Clinic',
  uuid: 'location-a',
};
const mockUseDefaultVisitLocation = vi.fn().mockReturnValue(defaultVisitLocation);

const mockSaveVisit = vi.mocked(saveVisit);
const mockUpdateVisit = vi.mocked(updateVisit);
const mockWorkspace2 = vi.mocked(Workspace2);
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUseVisitAttributeType = vi.mocked(useVisitAttributeType);
const mockUseVisit = vi.mocked(useVisit);
const mockUseVisitTypes = vi.mocked(useVisitTypes);
const mockUseLocations = vi.mocked(useLocations);
const mockUseEmrConfiguration = vi.mocked(useEmrConfiguration);
const mockOpenmrsDatePicker = vi.mocked(OpenmrsDatePicker);

// from ./visit-form.resource
const mockOnVisitCreatedOrUpdatedCallback = vi.fn();
vi.mocked(useVisitFormCallbacks).mockReturnValue([
  new Map([['test-extension-id', { onVisitCreatedOrUpdated: mockOnVisitCreatedOrUpdatedCallback }]]), // visitFormCallbacks
  vi.fn(), // setVisitFormCallbacks
]);
const mockCreateVisitAttribute = vi.mocked(createVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
const mockUpdateVisitAttribute = vi.mocked(updateVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
const mockDeleteVisitAttribute = vi.mocked(deleteVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useActivePatientEnrollment: vi.fn().mockReturnValue({
    activePatientEnrollment: [],
    isLoading: false,
  }),
}));

vi.mock('../hooks/useVisitAttributeType', () => ({
  useVisitAttributeType: vi.fn((attributeUuid) => {
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
  useVisitAttributeTypes: vi.fn(() => ({
    isLoading: false,
    error: null,
    visitAttributeTypes: [visitAttributes.punctuality, visitAttributes.insurancePolicyNumber],
  })),
  useConceptAnswersForVisitAttributeType: vi.fn(() => ({
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

vi.mock('../hooks/useDefaultFacilityLocation', async () => {
  const requireActual = (await vi.importActual('../hooks/useDefaultFacilityLocation')) as object;

  return {
    ...requireActual,
    useDefaultFacilityLocation: vi.fn(() => ({
      defaultFacility: null,
      isLoading: false,
      error: null,
    })),
  };
});

vi.mock('../hooks/useDefaultVisitLocation', async () => {
  const requireActual = (await vi.importActual('../hooks/useDefaultVisitLocation')) as object;

  return {
    ...requireActual,
    useDefaultVisitLocation: vi.fn((...args) => mockUseDefaultVisitLocation(...args)),
  };
});

vi.mock('./visit-form.resource', async () => {
  const requireActual = (await vi.importActual('./visit-form.resource')) as object;
  return {
    ...requireActual,
    useAllowOverlappingVisits: vi.fn(),
    useVisitFormCallbacks: vi.fn(),
    useEarliestAllowedVisitStartDate: vi.fn(),
    createVisitAttribute: vi.fn(),
    updateVisitAttribute: vi.fn(),
    deleteVisitAttribute: vi.fn(),
  };
});

const mockUseEarliestAllowedVisitStartDate = vi.mocked(useEarliestAllowedVisitStartDate);
mockUseEarliestAllowedVisitStartDate.mockReturnValue({ earliestAllowedStartDate: null, isLoading: false });

const mockUseAllowOverlappingVisits = vi.mocked(useAllowOverlappingVisits);
mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: true, isLoading: false });

mockSaveVisit.mockResolvedValue({
  status: 201,
  data: {
    uuid: visitUuid,
    visitType: {
      display: 'Facility Visit',
    },
  },
} as unknown as FetchResponse<Visit>);

// mockPastVisitWithEncounters has specific (non-full-day) start/stop times so it can
// exercise manual-time validation. This variant spans the exact same calendar day
// (00:00:00.000 to 23:59:59.999) so tests can exercise the full-day-visit default.
const mockFullDayPastVisit: Visit = {
  ...mockPastVisitWithEncounters,
  startDatetime: dayjs(mockPastVisitWithEncounters.startDatetime).startOf('day').toISOString(),
  stopDatetime: dayjs(mockPastVisitWithEncounters.startDatetime).endOf('day').toISOString(),
};

// Simulates the backend truncating/rounding milliseconds on a REST API round-trip: the
// stopDatetime still falls in the last minute of the day (23:59), but isn't byte-for-byte
// the exact 23:59:59.999 that dayjs(...).endOf('day') would compute on the frontend.
const mockFullDayPastVisitWithTruncatedStopTime: Visit = {
  ...mockFullDayPastVisit,
  stopDatetime: dayjs(mockFullDayPastVisit.stopDatetime).millisecond(0).toISOString(),
};

// Spans 3 calendar days (day 0 at 00:00:00.000 to day 2 at 23:59:59.999). Both boundary
// times individually look like "full day" boundaries, but the visit does not fall on a
// single calendar day, so it must not be defaulted to the full-day checkbox.
const mockFullDayPastVisitSpanningMultipleDays: Visit = {
  ...mockPastVisitWithEncounters,
  startDatetime: dayjs(mockPastVisitWithEncounters.startDatetime).startOf('day').toISOString(),
  stopDatetime: dayjs(mockPastVisitWithEncounters.startDatetime).add(2, 'day').endOf('day').toISOString(),
};

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
    mockUseDefaultVisitLocation.mockReset();
    mockUseDefaultVisitLocation.mockReturnValue(defaultVisitLocation);
  });

  it('renders the Start Visit form with all the relevant fields and values', async () => {
    const user = userEvent.setup();
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
    await user.click(visitStatusNew);
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
    await user.click(combobox);
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

  it('keeps user selections when default values update', async () => {
    const user = userEvent.setup();
    mockUseDefaultVisitLocation.mockReturnValueOnce({}).mockReturnValue({
      display: 'Inpatient Ward',
      uuid: 'location-b',
    });

    const props: PatientWorkspace2DefinitionProps<VisitFormProps, {}> = {
      ...defaultProps,
      groupProps: {
        ...defaultProps.groupProps,
        visitContext: null,
      },
    };
    const { rerender } = render(<VisitForm {...props} />);

    const visitStatusOngoing = screen.getByRole('tab', { name: /ongoing/i });
    await user.click(visitStatusOngoing);
    const outpatientVisitRadio = screen.getByRole('radio', { name: /^Outpatient Visit$/i });
    await user.click(outpatientVisitRadio);

    expect(outpatientVisitRadio).toBeChecked();

    rerender(<VisitForm {...props} />);

    await waitFor(() => expect(screen.getByRole('radio', { name: /^Outpatient Visit$/i })).toBeChecked());
  });

  it('displays an error message when the visit start time is in the future', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));
    const dateInput = screen.getByRole('textbox', { name: /start date/i });
    const timeInput = screen.getByRole('textbox', { name: /start time/i });
    const amPmSelect = screen.getByRole('combobox', { name: /start time format/i });
    const saveButton = screen.getByRole('button', { name: /Start visit/i });
    const futureTime = dayjs().add(1, 'hour');

    expect(dateInput).toBeEnabled();
    await user.clear(dateInput);
    await user.click(dateInput);
    fireEvent.change(dateInput, { target: { value: futureTime.format('YYYY-MM-DD') } });

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
  it.skip('allows to enter start date in the past when visit status is ongoing', async () => {
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

  it('reports no unsaved changes after a successful save, even while callbacks are still pending', async () => {
    const user = userEvent.setup();

    let resolveCallback: () => void;
    const pendingCallback = new Promise<void>((resolve) => {
      resolveCallback = resolve;
    });
    mockOnVisitCreatedOrUpdatedCallback.mockReturnValueOnce(pendingCallback);

    renderVisitForm();

    await user.click(screen.getByLabelText(/Outpatient visit/i));
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(screen.getByRole('button', { name: /Start visit/i }));

    await waitFor(() => expect(mockSaveVisit).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      const lastCall = mockWorkspace2.mock.lastCall?.[0];
      expect(lastCall?.hasUnsavedChanges).toBe(false);
    });

    resolveCallback();
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
        attributes: [
          {
            attributeType: visitAttributes.punctuality.uuid,
            value: '66cdc0a1-aa19-4676-af51-80f66d78d9eb',
          },
          {
            attributeType: visitAttributes.insurancePolicyNumber.uuid,
            value: '183299',
          },
        ],
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
        startDatetime: null,
        stopDatetime: null,
      },
      expect.any(Object),
    );

    // Attributes should be included in the visit payload, not created separately
    expect(mockCreateVisitAttribute).not.toHaveBeenCalled();

    expect(mockOnVisitCreatedOrUpdatedCallback).toHaveBeenCalled();

    expect(mockCloseWorkspace).toHaveBeenCalled();

    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: expect.stringContaining('started successfully'),
      kind: 'success',
      title: 'Visit started',
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
    // Inline attributes must not be included in the update payload because the
    // backend rejects them with a maxOccurs violation. Attributes are managed
    // separately via individual create/update/delete calls for existing visits.
    expect(mockUpdateVisit.mock.calls[0][1]).not.toHaveProperty('attributes');

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

  it('does not create visit attributes separately when starting a new visit with attributes', async () => {
    const user = userEvent.setup();

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

    // Attributes should be included in the saveVisit payload, not created via separate API calls
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.arrayContaining([
          { attributeType: visitAttributes.punctuality.uuid, value: '66cdc0a1-aa19-4676-af51-80f66d78d9eb' },
          { attributeType: visitAttributes.insurancePolicyNumber.uuid, value: '183299' },
        ]),
      }),
      expect.any(Object),
    );
    expect(mockCreateVisitAttribute).not.toHaveBeenCalled();
  });

  it('does not create an orphaned visit when the server rejects a new visit with attributes', async () => {
    const user = userEvent.setup();

    mockSaveVisit.mockRejectedValueOnce({ status: 400, statusText: 'Bad Request' });

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

    // Attributes are included in the saveVisit payload, so when the visit creation
    // is rejected (e.g. due to overlapping visits), no orphaned visit is created
    // and no separate attribute creation calls are made
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.arrayContaining([
          { attributeType: visitAttributes.punctuality.uuid, value: '66cdc0a1-aa19-4676-af51-80f66d78d9eb' },
          { attributeType: visitAttributes.insurancePolicyNumber.uuid, value: '183299' },
        ]),
      }),
      expect.any(Object),
    );
    expect(mockCreateVisitAttribute).not.toHaveBeenCalled();
    expect(mockOnVisitCreatedOrUpdatedCallback).not.toHaveBeenCalled();
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
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
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

  it('shows an active visit warning, hides form fields, and disables submit when overlapping visits are disallowed and an active visit exists', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: { uuid: 'some-active-visit-uuid' } as Visit,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm();

    expect(screen.getByText(/This patient already has an active visit/i)).toBeInTheDocument();
    expect(screen.getByText(/You must end the current visit before starting a new one/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeDisabled();

    // Form fields should be hidden
    expect(screen.queryByRole('combobox', { name: /Select a location/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Outpatient Visit/i })).not.toBeInTheDocument();
  });

  it('does not show an active visit warning when overlapping visits are allowed', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: { uuid: 'some-active-visit-uuid' } as Visit,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: true, isLoading: false });

    renderVisitForm();

    expect(screen.queryByText(/This patient already has an active visit/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeEnabled();
  });

  it('shows active visit warning on the ongoing tab when overlapping visits are disallowed', async () => {
    const user = userEvent.setup();
    mockUseVisit.mockReturnValue({
      activeVisit: { uuid: 'some-active-visit-uuid' } as Visit,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));

    expect(screen.getByText(/This patient already has an active visit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeDisabled();
  });

  it('does not show active visit warning on the past tab when overlapping visits are disallowed', async () => {
    const user = userEvent.setup();
    mockUseVisit.mockReturnValue({
      activeVisit: { uuid: 'some-active-visit-uuid' } as Visit,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /in the past/i }));

    expect(screen.queryByText(/This patient already has an active visit/i)).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
  });

  it('disables submit while the active visit lookup is loading', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: null,
      isLoading: true,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm();

    expect(screen.getByRole('button', { name: /Start visit/i })).toBeDisabled();
  });

  it('does not show an active visit warning when there is no active visit', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: null,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm();

    expect(screen.queryByText(/This patient already has an active visit/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start visit/i })).toBeEnabled();
  });

  it('does not show an active visit warning when editing an existing visit', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: { uuid: 'some-active-visit-uuid' } as Visit,
    } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: false, isLoading: false });

    renderVisitForm(mockPastVisitWithEncounters);

    expect(screen.queryByText(/This patient already has an active visit/i)).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
  });

  it('defaults the full day visit checkbox to checked and hides the end date/time and start time fields when editing a past visit whose stored times genuinely span a full day', () => {
    renderVisitForm(mockFullDayPastVisit);

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    expect(fullDayVisitCheckbox).toBeChecked();

    expect(screen.getByText(/visit date/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /start time/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /start time format/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/end date/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /end time/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /end time format/i })).not.toBeInTheDocument();
  });

  it('defaults the full day visit checkbox to checked even when the stored stop time has truncated milliseconds after a REST API round-trip', () => {
    renderVisitForm(mockFullDayPastVisitWithTruncatedStopTime);

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).toBeChecked();
  });

  it('does not default the full day visit checkbox to checked for a visit that spans multiple calendar days, even though both boundary times individually look like full-day boundaries', () => {
    renderVisitForm(mockFullDayPastVisitSpanningMultipleDays);

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    expect(fullDayVisitCheckbox).not.toBeChecked();

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /start time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /start time format/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /end time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /end time format/i })).toBeInTheDocument();
  });

  it('defaults the full day visit checkbox to unchecked and shows both date/time field groups when editing a past visit with specific manual times', () => {
    renderVisitForm(mockPastVisitWithEncounters);

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    expect(fullDayVisitCheckbox).not.toBeChecked();

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /start time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /start time format/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /end time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /end time format/i })).toBeInTheDocument();
  });

  it('defaults the full day visit checkbox to checked when a new visit is switched to the "In the past" status', async () => {
    const user = userEvent.setup();
    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /in the past/i }));

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    expect(fullDayVisitCheckbox).toBeChecked();

    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /start time/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /start time format/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/end date/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /end time/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /end time format/i })).not.toBeInTheDocument();
  });

  it('re-defaults the full day visit checkbox to checked from config after the user unchecks it, switches away from "In the past", and switches back', async () => {
    const user = userEvent.setup();
    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /in the past/i }));
    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    expect(fullDayVisitCheckbox).toBeChecked();

    // Manually uncheck it, then leave "In the past" (the isFullDayVisit field is reset to its
    // non-past default of false here, even though the checkbox itself isn't rendered for
    // "ongoing") and come back.
    await user.click(fullDayVisitCheckbox);
    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));
    await user.click(screen.getByRole('tab', { name: /in the past/i }));

    // Re-entering "In the past" re-applies config.defaultToFullDayVisit rather than reflecting
    // whatever the checkbox happened to be left at during the earlier "past" session.
    expect(screen.getByRole('checkbox', { name: /full day visit/i })).toBeChecked();
  });

  it('does not default the full day visit checkbox to checked when config.defaultToFullDayVisit is false', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      defaultToFullDayVisit: false,
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

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /in the past/i }));

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();
  });

  it('reveals the end date/time and start time fields again when the full day visit checkbox is unchecked', async () => {
    const user = userEvent.setup();
    renderVisitForm(mockFullDayPastVisit);

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    await user.click(fullDayVisitCheckbox);

    expect(fullDayVisitCheckbox).not.toBeChecked();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /start time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /start time format/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /end time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /end time format/i })).toBeInTheDocument();
  });

  it('excludes today from the selectable date range for the visit date field when the full day visit checkbox is checked', () => {
    renderVisitForm(mockFullDayPastVisit);

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).toBeChecked();

    const dateFieldCalls = mockOpenmrsDatePicker.mock.calls.filter((call) => call[0]?.id === 'visitStartDateInput');
    const { maxDate } = dateFieldCalls[dateFieldCalls.length - 1][0];

    // Today must fall strictly after the allowed max date, i.e. today is not selectable.
    expect(dayjs(maxDate as dayjs.ConfigType).isBefore(dayjs().startOf('day'))).toBe(true);
  });

  it('still allows today as a selectable date for the start date field in manual (non-full-day) mode', async () => {
    const user = userEvent.setup();
    // Some earlier tests in this file leave mockUseVisit/mockUseAllowOverlappingVisits configured
    // with an active visit that hides the form fields; restore the defaults so this test isn't
    // order-dependent on that state.
    mockUseVisit.mockReturnValue({ activeVisit: null } as ReturnType<typeof useVisit>);
    mockUseAllowOverlappingVisits.mockReturnValue({ allowOverlappingVisits: true, isLoading: false });

    renderVisitForm();

    await user.click(screen.getByRole('tab', { name: /ongoing/i }));

    const dateFieldCalls = mockOpenmrsDatePicker.mock.calls.filter((call) => call[0]?.id === 'visitStartDateInput');
    const { maxDate } = dateFieldCalls[dateFieldCalls.length - 1][0];

    expect(dayjs(maxDate as dayjs.ConfigType).isSame(dayjs(), 'day')).toBe(true);
  });

  it('auto-corrects the selected date back to yesterday when the full day visit checkbox is checked while today is selected', async () => {
    const user = userEvent.setup();
    renderVisitForm(mockPastVisitWithEncounters);

    // mockPastVisitWithEncounters defaults to manual (unchecked) mode with the start date field visible.
    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: dayjs().format('YYYY-MM-DD') } });

    await user.click(screen.getByRole('checkbox', { name: /full day visit/i }));

    const dateInput = screen.getByLabelText(/^date$/i) as HTMLInputElement;
    await waitFor(() => {
      expect(dateInput.value).toBe(dayjs().subtract(1, 'day').format('DD/MM/YYYY'));
    });
  });

  it('restores today as the selected date when the full day visit checkbox is unchecked again after auto-correcting it to yesterday', async () => {
    const user = userEvent.setup();
    renderVisitForm(mockPastVisitWithEncounters);

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: dayjs().format('YYYY-MM-DD') } });

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    await user.click(fullDayVisitCheckbox);

    const dateInput = screen.getByLabelText(/^date$/i) as HTMLInputElement;
    await waitFor(() => {
      expect(dateInput.value).toBe(dayjs().subtract(1, 'day').format('DD/MM/YYYY'));
    });

    await user.click(fullDayVisitCheckbox);

    const restoredStartDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    await waitFor(() => {
      expect(restoredStartDateInput.value).toBe(dayjs().format('DD/MM/YYYY'));
    });
  });

  it('does not restore the pre-auto-correct date when the user picks a different date while full day mode is on', async () => {
    const user = userEvent.setup();
    renderVisitForm(mockPastVisitWithEncounters);

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: dayjs().format('YYYY-MM-DD') } });

    const fullDayVisitCheckbox = screen.getByRole('checkbox', { name: /full day visit/i });
    await user.click(fullDayVisitCheckbox);

    const dateInput = screen.getByLabelText(/^date$/i) as HTMLInputElement;
    await waitFor(() => {
      expect(dateInput.value).toBe(dayjs().subtract(1, 'day').format('DD/MM/YYYY'));
    });

    // Deliberately pick a different date while still in full-day mode.
    const deliberatelyChosenDate = dayjs().subtract(5, 'day');
    fireEvent.change(dateInput, { target: { value: deliberatelyChosenDate.format('YYYY-MM-DD') } });
    await waitFor(() => {
      expect((screen.getByLabelText(/^date$/i) as HTMLInputElement).value).toBe(
        deliberatelyChosenDate.format('DD/MM/YYYY'),
      );
    });

    await user.click(fullDayVisitCheckbox);

    // The user's deliberate edit must be preserved, not silently reverted to today.
    const finalStartDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    await waitFor(() => {
      expect(finalStartDateInput.value).toBe(deliberatelyChosenDate.format('DD/MM/YYYY'));
    });
  });

  it('submits a full-day start/stop datetime range when saving a past visit with the full day visit checkbox checked', async () => {
    const user = userEvent.setup();

    mockUpdateVisit.mockResolvedValue({
      status: 201,
      data: {
        uuid: visitUuid,
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    renderVisitForm(mockFullDayPastVisit);

    expect(screen.getByRole('checkbox', { name: /full day visit/i })).toBeChecked();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(screen.getByRole('button', { name: /Update visit/i }));

    const expectedStartDatetime = dayjs(mockFullDayPastVisit.startDatetime).startOf('day').toDate();
    const expectedStopDatetime = dayjs(mockFullDayPastVisit.startDatetime).endOf('day').toDate();

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockFullDayPastVisit.uuid,
      expect.objectContaining({
        startDatetime: expectedStartDatetime,
        stopDatetime: expectedStopDatetime,
      }),
      expect.any(Object),
    );
  });

  it('preserves the existing manual start/end time behavior when the full day visit checkbox is unchecked', async () => {
    const user = userEvent.setup();

    mockUpdateVisit.mockResolvedValue({
      status: 201,
      data: {
        uuid: visitUuid,
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    renderVisitForm(mockPastVisitWithEncounters);

    // mockPastVisitWithEncounters has specific (non-full-day) start/stop times, so the
    // checkbox already defaults to unchecked here — no need to click it.
    expect(screen.getByRole('checkbox', { name: /full day visit/i })).not.toBeChecked();

    await user.click(screen.getByLabelText(/Outpatient visit/i));

    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    await user.click(screen.getByRole('button', { name: /Update visit/i }));

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockPastVisitWithEncounters.uuid,
      expect.objectContaining({
        startDatetime: new Date(mockPastVisitWithEncounters.startDatetime),
        stopDatetime: new Date(mockPastVisitWithEncounters.stopDatetime),
      }),
      expect.any(Object),
    );
  });

  it('shows inline invalid time feedback in manual mode and still saves after the full day visit checkbox is checked', async () => {
    const user = userEvent.setup();

    mockUpdateVisit.mockResolvedValue({
      status: 201,
      data: {
        uuid: visitUuid,
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    // mockPastVisitWithEncounters has manual (non-full-day) times, so the time fields start visible.
    renderVisitForm(mockPastVisitWithEncounters);

    // Type an invalid time into the (still visible) start time field.
    const startTimeInput = screen.getByRole('textbox', { name: /start time/i });
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '99:99');

    await waitFor(() => {
      expect(screen.getByText(/^invalid$/i)).toBeInTheDocument();
    });

    // Set the required visit type and location.
    await user.click(screen.getByLabelText(/Outpatient visit/i));
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await user.click(locationPicker);
    await user.click(screen.getByText('Inpatient Ward'));

    // Now check the full day visit checkbox, which hides the time fields while the stale invalid
    // value remains in form state.
    await user.click(screen.getByRole('checkbox', { name: /full day visit/i }));

    await user.click(screen.getByRole('button', { name: /Update visit/i }));

    // The invalid, now-hidden time must not block the save.
    expect(screen.queryByText(/^invalid$/i)).not.toBeInTheDocument();
    const expectedStartDatetime = dayjs(mockPastVisitWithEncounters.startDatetime).startOf('day').toDate();
    const expectedStopDatetime = dayjs(mockPastVisitWithEncounters.startDatetime).endOf('day').toDate();
    expect(mockUpdateVisit).toHaveBeenCalledWith(
      mockPastVisitWithEncounters.uuid,
      expect.objectContaining({
        startDatetime: expectedStartDatetime,
        stopDatetime: expectedStopDatetime,
      }),
      expect.any(Object),
    );
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
      isFullDayVisit: false,
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

    // verify start time set past first encounter time
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
      isFullDayVisit: false,
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
      isFullDayVisit: false,
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

  it('rejects an invalid time format for manual (non-full-day) past visits', () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(mockPastVisitWithEncounters));

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      isFullDayVisit: false,
      visitStartTime: '99:99',
    });

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        message: 'Invalid',
        path: ['visitStartTime'],
      }),
    );
  });

  it('accepts cleared time fields when the full day visit checkbox is checked', () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(mockPastVisitWithEncounters));

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      isFullDayVisit: true,
      visitStartTime: undefined,
      visitStopTime: undefined,
    });

    const timeFormatIssues = (error?.issues ?? []).filter(
      (issue) => issue.path.includes('visitStartTime') || issue.path.includes('visitStopTime'),
    );
    expect(timeFormatIssues).toHaveLength(0);
  });

  it('blocks a full-day visit whose computed end-of-day time is still in the future', () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(mockPastVisitWithEncounters));

    // Picking today as the full-day date means the computed stop time (end of today)
    // is necessarily still in the future relative to "now".
    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      isFullDayVisit: true,
      visitStartDate: new Date(),
      visitStartTime: undefined,
      visitStopTime: undefined,
    });

    expect(error?.issues).toContainEqual(
      expect.objectContaining({
        message: 'End time cannot be in the future',
      }),
    );
  });

  it('blocks a full-day visit whose encounters fall outside the selected calendar day', () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(mockPastVisitWithEncounters));

    // mockPastVisitWithEncounters has its last encounter on 2022-01-01T11:30:00.000+0000.
    // Selecting the previous day as the full-day date means the computed end-of-day time
    // falls before that encounter, so the visit doesn't actually cover all its encounters.
    const dayBeforeEncounters = dayjs(mockPastVisitWithEncounters.startDatetime).subtract(1, 'day').toDate();

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      isFullDayVisit: true,
      visitStartDate: dayBeforeEncounters,
      visitStartTime: undefined,
      visitStopTime: undefined,
    });

    expect(error?.issues).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('End time must be on or after'),
      }),
    );
  });
});

describe('computeEarliestAllowedStartDate', () => {
  it('returns null when birthdate is null', () => {
    expect(computeEarliestAllowedStartDate(null, false, null)).toBeNull();
  });

  it('returns birthdate at local midnight for non-estimated birthdates', () => {
    const result = computeEarliestAllowedStartDate('1990-06-15', false, 35);
    expect(result).toEqual(new Date(1990, 5, 15));
  });

  it('handles ISO datetime strings as returned by the REST API', () => {
    const result = computeEarliestAllowedStartDate('1979-12-08T00:00:00.000+0530', false, 46);
    expect(result).toEqual(new Date(1979, 11, 8));
  });

  it('applies grace period for estimated birthdate with age 10 (shifts 5 years back)', () => {
    // floor(10 * 0.5) = 5, max(1, 5) = 5
    const result = computeEarliestAllowedStartDate('2015-03-01', true, 10);
    expect(result).toEqual(new Date(2010, 2, 1));
  });

  it('applies minimum 1-year grace period for estimated birthdate with age 1', () => {
    // floor(1 * 0.5) = 0, max(1, 0) = 1
    const result = computeEarliestAllowedStartDate('2024-07-20', true, 1);
    expect(result).toEqual(new Date(2023, 6, 20));
  });

  it('does not apply grace period when birthdateEstimated is false', () => {
    const result = computeEarliestAllowedStartDate('2000-01-01', false, 25);
    expect(result).toEqual(new Date(2000, 0, 1));
  });
});

describe('useVisitFormSchemaAndDefaultValues birthdate validation', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      visitAttributeTypes: [],
    });
  });

  it('rejects a start date before the patient birthdate for ongoing visits', () => {
    const earliestAllowed = new Date(1990, 0, 1);
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(null, earliestAllowed));

    const beforeBirthdate = dayjs(new Date(1989, 11, 31, 10, 0));
    const fields = convertToDateTimeFields(beforeBirthdate);

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStatus: 'ongoing',
      visitType: 'some-visit-type-uuid',
      visitStartDate: fields.date,
      visitStartTime: fields.time,
      visitStartTimeFormat: fields.timeFormat,
    });

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        message: "Start date cannot be before the patient's birth date",
      }),
    );
  });

  it('accepts a start date equal to the patient birthdate', () => {
    const earliestAllowed = new Date(1990, 0, 1);
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(null, earliestAllowed));

    const onBirthdate = dayjs(new Date(1990, 0, 1, 8, 0));
    const fields = convertToDateTimeFields(onBirthdate);

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStatus: 'ongoing',
      visitType: 'some-visit-type-uuid',
      visitStartDate: fields.date,
      visitStartTime: fields.time,
      visitStartTimeFormat: fields.timeFormat,
    });

    const birthdateIssues = (error?.issues ?? []).filter((i) => i.message.includes('birth date'));
    expect(birthdateIssues).toHaveLength(0);
  });

  it('accepts a start date within the grace period for estimated birthdates', () => {
    // Patient born 2015-03-01 estimated, age 10 → grace = 5 → earliest = 2010-03-01
    const earliestAllowed = computeEarliestAllowedStartDate('2015-03-01', true, 10);
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(null, earliestAllowed));

    const withinGrace = dayjs(new Date(2011, 0, 1, 9, 0));
    const fields = convertToDateTimeFields(withinGrace);

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStatus: 'ongoing',
      visitType: 'some-visit-type-uuid',
      visitStartDate: fields.date,
      visitStartTime: fields.time,
      visitStartTimeFormat: fields.timeFormat,
    });

    const birthdateIssues = (error?.issues ?? []).filter((i) => i.message.includes('birth date'));
    expect(birthdateIssues).toHaveLength(0);
  });

  it('does not validate birthdate when earliestAllowedStartDate is null', () => {
    const {
      result: {
        current: { visitFormSchema, defaultValues },
      },
    } = renderHook(() => useVisitFormSchemaAndDefaultValues(null, null));

    const veryOldDate = dayjs(new Date(1800, 0, 1, 8, 0));
    const fields = convertToDateTimeFields(veryOldDate);

    const { error } = visitFormSchema.safeParse({
      ...defaultValues,
      visitStatus: 'ongoing',
      visitType: 'some-visit-type-uuid',
      visitStartDate: fields.date,
      visitStartTime: fields.time,
      visitStartTimeFormat: fields.timeFormat,
    });

    const birthdateIssues = (error?.issues ?? []).filter((i) => i.message.includes('birth date'));
    expect(birthdateIssues).toHaveLength(0);
  });
});

function renderVisitForm(visitToEdit?: Visit) {
  const props: PatientWorkspace2DefinitionProps<VisitFormProps, {}> = {
    ...defaultProps,
    groupProps: {
      ...defaultProps.groupProps,
      visitContext: visitToEdit ?? null,
    },
  };
  return render(<VisitForm {...props} />);
}
