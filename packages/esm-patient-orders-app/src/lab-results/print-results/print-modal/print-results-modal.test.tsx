import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/react';
import { useSession } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { mockSessionDataResponse } from '__mocks__';
import { capturePrintJobs } from 'tools';
import PrintResultsModal from './print-results-modal';

vi.mock('../print-preview/print-preview.component', () => ({
  default: ({ order }: { order: Order }) => <p>Report for {order.orderNumber}</p>,
}));

vi.mocked(useSession).mockReturnValue(mockSessionDataResponse.data);

const makeOrder = (uuid: string, orderNumber: string, display: string) =>
  ({
    uuid,
    orderNumber,
    dateActivated: '2024-11-22T10:00:00.000+0000',
    concept: { uuid: `${uuid}-concept`, display },
    patient: { person: { display: 'John Wilson', age: 52, gender: 'M' } },
  }) as unknown as Order;

const orders = [makeOrder('order-1', 'ORD-1', 'Serum chloride'), makeOrder('order-2', 'ORD-2', 'Haemoglobin')];

describe('PrintResultsModal', () => {
  it('prints the lab report for the selected tests only', async () => {
    const user = userEvent.setup();
    const printJobs = capturePrintJobs();
    const titleBeforePrint = document.title;

    render(<PrintResultsModal orders={orders} closeModal={vi.fn()} />);

    await user.click(screen.getByRole('checkbox', { name: /haemoglobin/i }));
    await user.click(screen.getByRole('button', { name: /print/i }));
    await waitFor(() => expect(printJobs).toHaveLength(1));

    const [{ content, documentTitle, styles }] = printJobs;
    expect(documentTitle).toBe(titleBeforePrint);
    expect(content).toHaveTextContent(/laboratory report/i);
    expect(content).toHaveTextContent(/name: john wilson/i);
    expect(content).toHaveTextContent(/inpatient ward/i);
    expect(content).toHaveTextContent('Report for ORD-1');
    expect(content).not.toHaveTextContent('Report for ORD-2');
    expect(within(content).queryAllByRole('checkbox')).toHaveLength(0);
    expect(styles.join('\n')).toMatch(/height: auto !important/);

    await waitFor(() => expect(screen.getByRole('button', { name: /print/i })).toBeEnabled());
    expect(screen.getByRole('checkbox', { name: /serum chloride/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /haemoglobin/i })).not.toBeChecked();
  });

  it('disables printing when no tests are selected', async () => {
    const user = userEvent.setup();

    render(<PrintResultsModal orders={orders} closeModal={vi.fn()} />);

    await user.click(screen.getByRole('checkbox', { name: /serum chloride/i }));
    await user.click(screen.getByRole('checkbox', { name: /haemoglobin/i }));

    expect(screen.getByRole('button', { name: /print/i })).toBeDisabled();
  });
});
