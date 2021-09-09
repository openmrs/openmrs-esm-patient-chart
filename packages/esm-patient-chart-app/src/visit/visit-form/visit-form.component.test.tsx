import React from 'react';
import VisitForm from './visit-form.component';
import { screen, render } from '@testing-library/react';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import {
  detach,
  useSessionUser,
  useLocations,
  showToast,
  showNotification,
  useVisitTypes,
  usePagination,
  saveVisit,
} from '@openmrs/esm-framework';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { mockLocations } from '../../../../../__mocks__/location.mock';
import { mockSessionDataResponse } from '../../../../../__mocks__/session.mock';
import { mockCurrentVisit, mockVisitTypes } from '../../../../../__mocks__/visits.mock';
import userEvent from '@testing-library/user-event';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const mockUseSession = useSessionUser as jest.Mock;
const mockUseLocation = useLocations as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockUseVisitTypes = useVisitTypes as jest.Mock;
const mockSaveVisit = saveVisit as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useLocations: jest.fn(),
  useSessionUser: jest.fn(),
  detach: jest.fn(),
  showNotification: jest.fn(),
  useVisitTypes: jest.fn(),
  usePagination: jest.fn(),
  saveVisit: jest.fn(),
  get getStartedVisit() {
    return mockGetStartedVisitGetter();
  },
}));

describe('VisitForm', () => {
  const renderVisitForm = () => {
    mockUsePagination.mockReturnValue({
      results: mockVisitTypes,
      goTo: () => {},
      currentPage: 1,
    });
    mockUseLocation.mockReturnValue(mockLocations);
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
    mockVisitTypes;
    render(<VisitForm isTablet={true} patientUuid={mockPatient.id} />);
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should start a visit', () => {
    renderVisitForm();

    expect(screen.getByText('Date and time of visit')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Recommended/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Outpatient Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /HIV Return Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/ })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    const dateInput = screen.getByLabelText('Date');
    userEvent.type(dateInput, new Date('2021-12-12').toISOString());

    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    userEvent.type(timeInput, '1:30');

    const visitType = screen.getByRole('radio', { name: /Outpatient Visit/ });
    userEvent.click(visitType);

    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    userEvent.selectOptions(timeFormat, 'AM');

    const locationOptions = screen.getByRole('combobox', { name: /Select a location/i });
    userEvent.selectOptions(locationOptions, 'b1a8b05e-3542-4037-bbd3-998ee9c40574');

    const recommended = screen.getByRole('tab', { name: /Recommended/i });
    userEvent.click(recommended);

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    mockSaveVisit.mockReturnValue(of({ status: 201 }));
    mockGetStartedVisitGetter.mockReturnValue(new BehaviorSubject(mockCurrentVisit));
    userEvent.click(saveButton);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      {
        location: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        patient: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        startDatetime: expect.anything(),
        visitType: 'some-uuid1',
      },
      expect.anything(),
    );
    expect(showToast).toHaveBeenCalledWith({ description: 'Visit has been started successfully', kind: 'success' });
  });

  it('should display error when starting a visit fails', () => {
    renderVisitForm();
    const saveButton = screen.getByRole('button', { name: /Start Visit/i });
    mockSaveVisit.mockReturnValue(throwError('API Is down'));
    userEvent.click(saveButton);
    expect(showNotification).toHaveBeenCalledWith({
      critical: true,
      description: undefined,
      kind: 'error',
      title: 'Error starting current visit',
    });
  });
});
