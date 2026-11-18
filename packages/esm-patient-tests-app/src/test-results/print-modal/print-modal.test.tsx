import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useSession } from '@openmrs/esm-framework';
import { mockSessionDataResponse } from '__mocks__';
import { capturePrintJobs, mockPatient } from 'tools';
import usePanelData from '../individual-results-table-tablet/usePanelData';
import PrintModal from './print-modal.extension';

vi.mock('../individual-results-table-tablet/usePanelData', () => ({ default: vi.fn() }));

vi.mocked(useSession).mockReturnValue(mockSessionDataResponse.data);
vi.mocked(usePanelData).mockReturnValue({
  panels: [
    {
      id: 'panel-1',
      name: 'Serum chloride',
      effectiveDateTime: '2024-03-10T09:00:00.000Z',
      value: '101',
      meta: { range: '96 – 106' },
    },
    { id: 'panel-2', name: 'Haemoglobin', effectiveDateTime: '2024-06-15T09:00:00.000Z', value: '13.5' },
  ],
} as unknown as ReturnType<typeof usePanelData>);

describe('PrintModal', () => {
  it('prints the test results within the selected date range', async () => {
    const user = userEvent.setup();
    const printJobs = capturePrintJobs();
    const titleBeforePrint = document.title;

    render(<PrintModal patientUuid={mockPatient.id} patient={mockPatient} closeDialog={vi.fn()} />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeDisabled();

    const [startDateInput, endDateInput] = screen.getAllByRole('textbox');
    fireEvent.change(startDateInput, { target: { value: '2024-03-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-03-31' } });

    await user.click(printButton);
    await waitFor(() => expect(printJobs).toHaveLength(1));

    const [{ content, documentTitle }] = printJobs;
    expect(documentTitle).toBe(titleBeforePrint);
    expect(content).toHaveTextContent('John Wilson');
    expect(content).toHaveTextContent(`Printed by${mockSessionDataResponse.data.user.display} on`);
    expect(within(content).getAllByRole('heading', { name: 'Test Results' })).toHaveLength(1);
    expect(within(content).getAllByRole('row', { name: /serum chloride .* 101 96 – 106/i })).toHaveLength(1);
    expect(content).not.toHaveTextContent(/haemoglobin/i);
    expect(within(content).queryAllByRole('textbox')).toHaveLength(0);
  });
});
