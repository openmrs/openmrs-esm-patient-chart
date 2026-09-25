import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { navigate, PatientPhoto, useSession } from '@openmrs/esm-framework';
import { mockCriticalSmartNotification, mockSessionDataResponse, mockSmartNotification } from '__mocks__';
import { mockPatient } from 'tools';
import { _resetReviewStore, getReviewedNotifications, setReviewUser } from './review-store';
import NotificationDetailModal from './notification-detail.modal';

const mockNavigate = navigate as Mock;
const mockUseSession = vi.mocked(useSession);

function renderModal(props: Partial<React.ComponentProps<typeof NotificationDetailModal>> = {}) {
  const closeModal = vi.fn();
  render(
    <NotificationDetailModal
      closeModal={closeModal}
      notification={mockSmartNotification}
      patient={mockPatient}
      {...props}
    />,
  );
  return { closeModal };
}

describe('NotificationDetailModal', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetReviewStore();
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-29T09:30:30.000Z'));
  });

  it('shows the priority tag and how recent the result is', () => {
    renderModal();

    expect(screen.getByText('Routine')).toBeInTheDocument();
    expect(screen.getByText('Lab result · Just now')).toBeInTheDocument();
  });

  it('identifies the patient', () => {
    renderModal();

    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText(/OpenMRS ID 100GEJ/)).toBeInTheDocument();
  });

  it('draws the avatar and name from the same patient', () => {
    // The fixture's patientUuid deliberately disagrees with the chart patient, so this fails if the
    // name and the photo are ever sourced from different places.
    renderModal({ notification: { ...mockSmartNotification, patientUuid: 'some-other-patient-uuid' } });

    expect(vi.mocked(PatientPhoto).mock.calls[0][0]).toMatchObject({
      patientName: 'John Wilson',
      patientUuid: mockPatient.id,
    });
  });

  it('shows the test, result, ordering clinician, location and order number', () => {
    renderModal();

    expect(screen.getByText('Serum creatinine')).toBeInTheDocument();
    expect(screen.getByText('Serum chemistry panel')).toBeInTheDocument();
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getByText('mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Normal · Ref 0.6 – 1.2 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Smith')).toBeInTheDocument();
    expect(screen.getByText('Outpatient Triage')).toBeInTheDocument();
    expect(screen.getByText('Order number ORD-1001')).toBeInTheDocument();
  });

  it('shows the rejection reason instead of a range for a rejected sample', () => {
    renderModal({
      notification: { ...mockSmartNotification, tag: 'SAMPLE_REJECTED', rejectionReason: 'Haemolysed sample' },
    });

    expect(screen.getByText('Haemolysed sample')).toBeInTheDocument();
  });

  it('records the reviewer and closes when "Mark as reviewed" is used', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setReviewUser(mockSessionDataResponse.data.user.uuid);
    const { closeModal } = renderModal();

    await user.click(screen.getByRole('button', { name: /mark as reviewed/i }));

    expect(getReviewedNotifications()[mockSmartNotification.id]).toEqual(
      expect.objectContaining({
        patientUuid: mockSmartNotification.patientUuid,
        providerDisplay: mockSessionDataResponse.data.user.person.display,
        testLabel: mockSmartNotification.testLabel,
      }),
    );
    expect(closeModal).toHaveBeenCalled();
  });

  it('navigates to the Results dashboard on "View in chart" without clearing the notification', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { closeModal } = renderModal();

    await user.click(screen.getByRole('button', { name: /view in chart/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: `\${openmrsSpaBase}/patient/${mockSmartNotification.patientUuid}/chart/results`,
    });
    expect(closeModal).toHaveBeenCalled();
    // "View in chart" is a look, not a sign-off — the notification must survive it.
    expect(getReviewedNotifications()).toEqual({});
  });

  it('renders a critical notification with its critical tag and interpretation', () => {
    renderModal({ notification: mockCriticalSmartNotification });

    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Critically low · Ref 12 – 14 g/dL')).toBeInTheDocument();
  });
});
