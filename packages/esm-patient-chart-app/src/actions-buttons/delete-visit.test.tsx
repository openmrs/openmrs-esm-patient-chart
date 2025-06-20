import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import DeleteVisitOverflowMenuItem from './delete-visit.component';

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    usePatientChartStore: () => ({ visits: { activeVisit: mockCurrentVisit } }),
  };
});

const mockShowModal = jest.mocked(showModal);

describe('DeleteVisitOverflowMenuItem', () => {
  it('should launch delete visit dialog modal', async () => {
    const user = userEvent.setup();

    render(<DeleteVisitOverflowMenuItem patientUuid="some-uuid" />);

    const deleteVisitButton = screen.getByRole('menuitem', { name: /delete active visit/i });
    expect(deleteVisitButton).toBeInTheDocument();

    await user.click(deleteVisitButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
