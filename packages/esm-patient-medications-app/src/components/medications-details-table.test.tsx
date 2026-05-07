import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient, mockOrders } from '__mocks__';
import MedicationsDetailsTable from './medications-details-table.component';

const mockUseOrderBasket = jest.mocked(useOrderBasket);
const mockUseConfig = jest.mocked(useConfig);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUsePagination = jest.mocked(usePagination);
const mockUseLaunchWorkspaceRequiringVisit = jest.mocked(useLaunchWorkspaceRequiringVisit);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
  useLayoutType: jest.fn(),
  usePagination: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: jest.fn(),
    useOrderBasket: jest.fn(),
  };
});

jest.mock('../print/print.component', () => ({
  __esModule: true,
  default: function MockPrintComponent() {
    return 'PrintComponent';
  },
}));

describe('MedicationsDetailsTable', () => {
  beforeEach(() => {
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      setOrders: jest.fn(),
      clearOrders: jest.fn(),
    });
    mockUseConfig.mockReturnValue({
      excludePatientIdentifierCodeTypes: { uuids: [] },
      showPrintButton: false,
    } as any);
    mockUseLayoutType.mockReturnValue('desktop');
    mockUsePagination.mockImplementation((items) => ({
      currentPage: 1,
      goTo: jest.fn(),
      results: items,
    }));
    mockUseLaunchWorkspaceRequiringVisit.mockReturnValue(jest.fn());
  });

  it('disables modify, renew, and discontinue actions when a medication has no visit context', async () => {
    const user = userEvent.setup();
    const medicationWithoutVisitContext = {
      ...mockOrders[0],
      encounter: null,
    };

    render(
      <MedicationsDetailsTable
        patient={mockFhirPatient}
        medications={[medicationWithoutVisitContext] as any}
        showAddButton={false}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    await user.click(screen.getByRole('button', { name: /options/i }));

    expect(screen.getByText(/modify/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/renew/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/discontinue/i).closest('button')).toBeDisabled();
  });
});
