import React from 'react';
import { vi, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { postOrder } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { createEmptyOrder } from '../resources';
import { OrderForm } from './general-order-form.component';

const mockPostOrder = vi.mocked(postOrder);
const mockShowSnackbar = vi.mocked(showSnackbar);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  postOrder: vi.fn(),
}));

describe('OrderForm', () => {
  it("shows the backend's error message when saving a revised order fails", async () => {
    const user = userEvent.setup();
    mockPostOrder.mockRejectedValueOnce({
      message: 'Server responded with 400 (Bad Request) for url /openmrs/ws/rest/v1/order',
      responseBody: {
        error: {
          message: 'Cannot have more than one active order for the same orderable and care setting at same time',
        },
      },
    });

    render(
      <OrderForm
        patient={mockPatient}
        initialOrder={{
          ...createEmptyOrder({ uuid: 'test-concept-uuid', display: 'Chest X-ray' }, null),
          action: 'REVISE',
        }}
        orderTypeUuid="test-order-type-uuid"
        closeWorkspace={vi.fn()}
        onCancel={vi.fn()}
        setHasUnsavedChanges={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /save order/i }));

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          subtitle: 'Cannot have more than one active order for the same orderable and care setting at same time',
        }),
      ),
    );
  });
});
