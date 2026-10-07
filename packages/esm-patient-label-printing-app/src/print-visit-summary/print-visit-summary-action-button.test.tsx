import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { showModal, UserHasAccess, type Visit } from '@openmrs/esm-framework';
import { mockVisit } from '__mocks__';
import { renderWithSwr } from 'tools';
import PrintVisitSummaryActionButton from './print-visit-summary-action-button.component';

const mockShowModal = vi.mocked(showModal);
const mockUserHasAccess = vi.mocked(UserHasAccess);

const mockPatient = { id: mockVisit.patient.uuid } as fhir.Patient;

describe('PrintVisitSummaryActionButton', () => {
  it('renders the print button', () => {
    renderWithSwr(<PrintVisitSummaryActionButton visit={mockVisit} patient={mockPatient} />);

    expect(screen.getByRole('button', { name: /print visit summary/i })).toBeInTheDocument();
  });

  it('renders an icon button in compact mode', () => {
    renderWithSwr(<PrintVisitSummaryActionButton visit={mockVisit} patient={mockPatient} compact />);

    expect(screen.getByRole('button', { name: /print visit summary/i })).toBeInTheDocument();
  });

  it('does not render the button when the visit UUID is missing', () => {
    const visitWithoutUuid = { ...mockVisit, uuid: undefined } as unknown as Visit;

    renderWithSwr(<PrintVisitSummaryActionButton visit={visitWithoutUuid} patient={mockPatient} />);

    expect(screen.queryByRole('button', { name: /print visit summary/i })).not.toBeInTheDocument();
  });

  it('launches the preview modal with the visit UUID when clicked', async () => {
    const user = userEvent.setup();
    renderWithSwr(<PrintVisitSummaryActionButton visit={mockVisit} patient={mockPatient} />);

    await user.click(screen.getByRole('button', { name: /print visit summary/i }));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith(
      'print-visit-summary-modal',
      expect.objectContaining({
        visitUuid: mockVisit.uuid,
        closeModal: expect.any(Function),
      }),
    );
  });

  it('checks for the correct privilege when rendering', () => {
    renderWithSwr(<PrintVisitSummaryActionButton visit={mockVisit} patient={mockPatient} />);

    expect(mockUserHasAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        privilege: 'App: Can generate a Visit Summary',
      }),
      expect.anything(),
    );
  });
});
