import React from 'react';
import dayjs from 'dayjs';
import { vi, describe, test, expect, beforeEach, type Mock } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2, useSession } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import MedicationsDetailsTable from './medications-details-table.component';

const mockLaunchWorkspace2 = launchWorkspace2 as Mock;
const mockUseSession = vi.mocked(useSession);
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

const mockStartVisitIfNeeded = vi.fn();
const mockUseStartVisitIfNeeded = vi.fn().mockReturnValue(mockStartVisitIfNeeded);

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useStartVisitIfNeeded: (...args: unknown[]) => mockUseStartVisitIfNeeded(...args),
  };
});

// The original order's encounter belongs to an old, closed visit. Renewing it must not
// leave the patient renewing against that stale visit (O3-5953).
const oldClosedVisit = {
  uuid: 'a1b2c3d4-old-closed-visit',
  startDatetime: dayjs().subtract(120, 'day').toISOString(),
  stopDatetime: dayjs().subtract(119, 'day').toISOString(),
};

// An original activation date older than dispensing's default 90-day cutoff, so this fixture
// mirrors the "stale prescription" a clinician would actually be renewing.
const originalActivationDate = dayjs().subtract(100, 'day').toISOString();

const medicationFixture = {
  uuid: 'd9d2ea62-order-under-test',
  action: 'NEW',
  dosingType: 'org.openmrs.SimpleDosingInstructions',
  dateActivated: originalActivationDate,
  autoExpireDate: dayjs().add(1, 'year').toISOString(),
  careSetting: { uuid: '6f0c9a92-6f24-11e3-af88-005056821db0', display: 'Outpatient' },
  orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
  encounter: {
    uuid: 'e335c92f-old-encounter',
    display: 'Vitals',
    visit: oldClosedVisit,
  },
  orderer: {
    uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
    display: 'admin - Admin User',
    person: { display: 'Admin User' },
  },
  drug: {
    uuid: 'a722710f-403b-451f-804b-09f8624b0838',
    display: 'Aspirin 162.5mg',
    strength: '162.5mg',
    dosageForm: { display: 'Tablet', uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  },
  dose: 1,
  doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
  route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
  frequency: { uuid: '160858AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Once daily' },
  numRefills: 0,
  orderReasonNonCoded: 'Heart',
} as unknown as Order;

function renderMedicationsDetailsTable() {
  renderWithSwr(
    <MedicationsDetailsTable
      title="Active Medications"
      medications={[medicationFixture]}
      showAddButton={false}
      showDiscontinueButton
      showModifyButton
      showRenewButton
      patient={mockPatient}
    />,
  );
}

function getActionsMenuButton() {
  const [actionsMenuButton] = screen.getAllByRole('button', { name: /actions menu/i });
  return actionsMenuButton;
}

async function openActionsMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getActionsMenuButton());
  return screen.getByRole('menu', { hidden: true });
}

function getRenewMenuItem(menu: HTMLElement) {
  return within(menu).getByRole('menuitem', {
    hidden: true,
    name: (_, element) => element.textContent === 'Renew',
  });
}

async function clickRenew(user: ReturnType<typeof userEvent.setup>) {
  const menu = await openActionsMenu(user);
  await user.click(getRenewMenuItem(menu));
}

describe('MedicationsDetailsTable - Renew', () => {
  beforeEach(() => {
    _resetOrderBasketStore();
    mockUseStartVisitIfNeeded.mockReturnValue(mockStartVisitIfNeeded);
  });

  test('renews a medication against whatever visit is currently active, even though the original order was written in an old, closed visit', async () => {
    const user = userEvent.setup();
    // A current visit is already open, so the clinician is never asked to start one --
    // this is the "old closed visit + a current visit" scenario.
    mockStartVisitIfNeeded.mockResolvedValue(true);
    renderMedicationsDetailsTable();

    await clickRenew(user);

    // The clinician sees the order-basket workspace open to finish the renewal, and it opens
    // plain -- nothing pins it back to the stale visit the original order was written in, so
    // it lands in whatever visit is current.
    await waitFor(() => expect(mockLaunchWorkspace2).toHaveBeenCalledWith('order-basket'));

    // Back on the medications table, the row now reads as already queued for action: a
    // clinician can no longer pick Renew/Modify/Discontinue on it a second time.
    const reopenedMenu = await openActionsMenu(user);
    expect(getRenewMenuItem(reopenedMenu)).toBeDisabled();
  });

  test('cancelling the visit prompt during Renew leaves the medication untouched', async () => {
    const user = userEvent.setup();
    mockStartVisitIfNeeded.mockResolvedValue(false);
    renderMedicationsDetailsTable();

    await clickRenew(user);

    // No order-basket workspace opens for the clinician...
    await waitFor(() => expect(mockStartVisitIfNeeded).toHaveBeenCalled());
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();

    // ...and the medication is exactly as renewable as before: Renew is still enabled, not
    // silently left in a "queued" state.
    const reopenedMenu = await openActionsMenu(user);
    expect(getRenewMenuItem(reopenedMenu)).toBeEnabled();
  });
});
