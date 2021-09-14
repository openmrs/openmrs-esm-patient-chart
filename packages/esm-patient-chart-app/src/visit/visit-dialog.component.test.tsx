import React from 'react';
import { screen, render } from '@testing-library/react';
import VisitDialog from './visit-dialog.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { useVisitDialog } from '../hooks/useVisitDialog';
import { useVisit, attach, updateVisit, showToast, showNotification } from '@openmrs/esm-framework';
import { mockCurrentVisit, mockVisits } from '../../../../__mocks__/visits.mock';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject, of, throwError } from 'rxjs';

const mockUseVisit = useVisit as jest.Mock;
const mockVisitDialog = useVisitDialog as jest.Mock;
const mockUpdateVisit = updateVisit as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('../hooks/useVisitDialog', () => ({
  useVisitDialog: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  attach: jest.fn(),
  updateVisit: jest.fn(),
  showToast: jest.fn(),
  showNotification: jest.fn(),
  get getStartedVisit() {
    return mockGetStartedVisitGetter();
  },
}));

describe('VisitDialog', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display start visit prompt', () => {
    mockVisitDialog.mockReturnValue({ type: 'prompt', state: { type: 'start' } });
    mockUseVisit.mockReturnValue(mockVisits);
    render(<VisitDialog patientUuid={mockPatient.id} />);

    expect(screen.getByText(/No Active Visit/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /You can't add data to the patient chart without an active visit. Choose from one of the options below to continue/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Start New Visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Past Visit/i })).toBeInTheDocument();

    // should open start visit form

    const startNewVisit = screen.getByRole('button', { name: /Start New Visit/i });
    userEvent.click(startNewVisit);

    expect(attach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'start-visit-workspace-form');
  });

  it('should open start visit form in editing past visit', async () => {
    mockVisitDialog.mockReturnValue({ type: 'prompt', state: { type: 'pastVisit' } });
    mockUseVisit.mockReturnValue(mockVisits);
    render(<VisitDialog patientUuid={mockPatient.id} />);

    // should open start visit form in editing past visit mode
    expect(
      await screen.findByText(
        /You can add past visit, update past visit or add new past visit, Click on one of the buttons below/i,
      ),
    ).toBeInTheDocument();

    const editPastVisit = screen.getByRole('button', { name: /Edit Past Visit/i });
    userEvent.click(editPastVisit);

    expect(attach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'past-visits-overview');
  });

  it('should display end visit prompt', async () => {
    mockUseVisit.mockReturnValue({
      currentVisit: {
        uuid: mockCurrentVisit.visitData.uuid,
        display: mockCurrentVisit.visitData.location,
        encounters: mockCurrentVisit.visitData.encounters,
        patient: mockPatient,
        visitType: mockCurrentVisit.visitData.visitType,
        location: mockCurrentVisit.visitData.location,
        startDatetime: mockCurrentVisit.visitData.startDatetime,
        stopDatetime: null,
        attributes: [],
      },
    });
    mockVisitDialog.mockReturnValue({ type: 'end', state: { type: 'pastVisit' } });
    render(<VisitDialog patientUuid={mockPatient.id} />);

    expect(screen.getByText(/End Current visit/)).toBeInTheDocument();
    expect(screen.getByText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByText(/16 Mar 2021/)).toBeInTheDocument();
    expect(screen.getByText(/Visit Type/)).toBeInTheDocument();
    expect(await screen.findByText(/Facility Visit/)).toBeInTheDocument();
    expect(await screen.findByText(/Visit Location/)).toBeInTheDocument();
    expect(screen.getByText(/Registration Desk/)).toBeInTheDocument();

    // should be able to end a visit

    mockUpdateVisit.mockReturnValue(of({ status: 200 }));
    mockGetStartedVisitGetter.mockReturnValue(new BehaviorSubject(null));
    const endVisitButton = screen.getByRole('button', { name: /End Visit/ });
    userEvent.click(endVisitButton);

    expect(mockUpdateVisit).toHaveBeenCalledWith(
      '17f512b4-d264-4113-a6fe-160cb38cb46e',
      {
        location: '6351fcf4-e311-4a19-90f9-35667d99a8af',
        startDatetime: new Date('2021-03-16T08:16:00.000Z'),
        stopDatetime: expect.anything(),
        visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      },
      expect.anything(),
    );

    expect(showToast).toHaveBeenCalledWith({ description: 'Ended current visit successfully', kind: 'success' });
  });

  it('should display an error message when end visit bugs out', () => {
    mockUseVisit.mockReturnValue({
      currentVisit: {
        uuid: mockCurrentVisit.visitData.uuid,
        display: mockCurrentVisit.visitData.location,
        encounters: mockCurrentVisit.visitData.encounters,
        patient: mockPatient,
        visitType: mockCurrentVisit.visitData.visitType,
        location: mockCurrentVisit.visitData.location,
        startDatetime: mockCurrentVisit.visitData.startDatetime,
        stopDatetime: null,
        attributes: [],
      },
    });
    mockVisitDialog.mockReturnValue({ type: 'end', state: { type: 'pastVisit' } });
    render(<VisitDialog patientUuid={mockPatient.id} />);

    mockUpdateVisit.mockReturnValue(throwError({ status: 500, message: 'API is down' }));
    const endVisitButton = screen.getByRole('button', { name: /End Visit/ });
    userEvent.click(endVisitButton);

    expect(showNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'API is down',
      kind: 'error',
      title: 'Error ending current visit',
    });
  });
});
