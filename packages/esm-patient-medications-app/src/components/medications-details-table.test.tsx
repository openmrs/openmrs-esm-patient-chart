import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient, mockOrders } from '__mocks__';
import MedicationsDetailsTable from './medications-details-table.component';

const mockUseOrderBasket = vi.mocked(useOrderBasket);
const mockUseConfig = vi.mocked(useConfig);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUsePagination = vi.mocked(usePagination);
const mockUseLaunchWorkspaceRequiringVisit = vi.mocked(useLaunchWorkspaceRequiringVisit);

vi.mock('@openmrs/esm-framework', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-framework')) as object;
  return {
    ...originalModule,
    useConfig: vi.fn(),
    useLayoutType: vi.fn(),
    usePagination: vi.fn(),
  };
});

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: vi.fn(),
    useOrderBasket: vi.fn(),
  };
});

vi.mock('../print/print.component', () => ({
  __esModule: true,
  default: function MockPrintComponent() {
    return 'PrintComponent';
  },
}));

describe('MedicationsDetailsTable', () => {
  beforeEach(() => {
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      setOrders: vi.fn(),
      clearOrders: vi.fn(),
    });
    mockUseConfig.mockReturnValue({
      excludePatientIdentifierCodeTypes: { uuids: [] },
      showPrintButton: false,
    } as any);
    mockUseLayoutType.mockReturnValue('desktop' as any);
    mockUsePagination.mockImplementation(
      (items) =>
        ({
          currentPage: 1,
          goTo: vi.fn(),
          results: items,
        }) as any,
    );
    mockUseLaunchWorkspaceRequiringVisit.mockReturnValue(vi.fn());
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
