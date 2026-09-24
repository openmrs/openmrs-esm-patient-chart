import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import {
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  useSystemVisitSetting,
} from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient, mockOrders } from '__mocks__';
import MedicationsDetailsTable from './medications-details-table.component';

const mockUseOrderBasket = vi.mocked(useOrderBasket);
const mockUseConfig = vi.mocked(useConfig);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUsePagination = vi.mocked(usePagination);
const mockUseLaunchWorkspaceRequiringVisit = vi.mocked(useLaunchWorkspaceRequiringVisit);
const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);

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
    useSystemVisitSetting: vi.fn(),
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
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      isLoadingSystemVisitSetting: false,
      errorFetchingSystemVisitSetting: null,
    });
  });

  it('disables renew and discontinue actions while keeping modify enabled when visits are required and a medication has no visit context', async () => {
    const user = userEvent.setup();
    const medicationWithoutVisitContext = {
      ...mockOrders[0],
      encounter: {
        ...mockOrders[0].encounter,
        visit: null,
      },
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

    await user.click(screen.getByRole('button', { name: /actions menu/i }));

    const actionsMenu = await screen.findByRole('menu', { hidden: true });
    const modifyItem = findMenuItemByText(actionsMenu, /modify/i);
    const renewItem = findMenuItemByText(actionsMenu, /renew/i);
    const discontinueItem = findMenuItemByText(actionsMenu, /discontinue/i);

    expect(modifyItem).toBeEnabled();
    expect(renewItem).toBeDisabled();
    expect(discontinueItem).toBeDisabled();
  });

  it('keeps modify, renew, and discontinue actions enabled when visits are not required and a medication has no visit', async () => {
    const user = userEvent.setup();
    const medicationWithoutVisitContext = {
      ...mockOrders[0],
      encounter: {
        ...mockOrders[0].encounter,
        visit: null,
      },
    };

    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: false,
      isLoadingSystemVisitSetting: false,
      errorFetchingSystemVisitSetting: null,
    });

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

    await user.click(screen.getByRole('button', { name: /actions menu/i }));

    const actionsMenu = await screen.findByRole('menu', { hidden: true });
    const modifyItem = findMenuItemByText(actionsMenu, /modify/i);
    const renewItem = findMenuItemByText(actionsMenu, /renew/i);
    const discontinueItem = findMenuItemByText(actionsMenu, /discontinue/i);

    expect(modifyItem).toBeEnabled();
    expect(renewItem).toBeEnabled();
    expect(discontinueItem).toBeEnabled();
  });
});

function findMenuItemByText(menu: HTMLElement, textRegex: RegExp) {
  return within(menu)
    .getAllByRole('menuitem', { hidden: true })
    .find((item) => textRegex.test(item.textContent));
}
