import React from 'react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { usePatient, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ExportedOrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { type AddTestOrderWorkspaceProps } from './add-test-order.workspace';
import ExportedAddTestOrderWorkspace from './exported-add-test-order.workspace';
import AddLabOrder from './add-test-order.component';

const mockUsePatient = vi.mocked(usePatient);
const mockAddLabOrder = vi.mocked(AddLabOrder);

vi.mock('./add-test-order.component', () => ({
  default: vi.fn(() => null),
}));

const mockCloseWorkspace = vi.fn();
const mockVisitContext = { uuid: 'visit-uuid' } as Visit;

const baseProps: Workspace2DefinitionProps<AddTestOrderWorkspaceProps, ExportedOrderBasketWindowProps, {}> = {
  closeWorkspace: mockCloseWorkspace,
  workspaceProps: {
    orderTypeUuid: 'test-order-type-uuid',
    orderToEditOrdererUuid: 'test-orderer-uuid',
  },
  windowProps: {
    patient: mockPatient,
    patientUuid: mockPatient.id,
    visitContext: mockVisitContext,
    encounterUuid: 'test-encounter-uuid',
    drugOrderWorkspaceName: '',
    labOrderWorkspaceName: '',
    generalOrderWorkspaceName: '',
    mutateVisitContext: vi.fn(),
  },
  windowName: '',
  workspaceName: '',
  isRootWorkspace: false,
  showActionMenu: true,
  launchChildWorkspace: vi.fn(),
  groupProps: {},
};

describe('ExportedAddTestOrderWorkspace', () => {
  beforeEach(() => {
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
      isLoading: false,
      error: null,
    });
  });

  test('derives patientUuid from REST patient object and passes loaded FHIR patient to AddLabOrder', () => {
    const restPatient = { uuid: 'rest-patient-uuid' } as unknown as fhir.Patient;

    render(
      <ExportedAddTestOrderWorkspace
        {...baseProps}
        windowProps={{
          ...baseProps.windowProps,
          patient: restPatient,
        }}
      />,
    );

    expect(mockUsePatient).toHaveBeenCalledWith('rest-patient-uuid');
    expect(mockAddLabOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        patient: mockPatient,
        visitContext: mockVisitContext,
        orderTypeUuid: 'test-order-type-uuid',
        closeWorkspace: mockCloseWorkspace,
        orderToEditOrdererUuid: 'test-orderer-uuid',
      }),
      expect.anything(),
    );
  });

  test('derives patientUuid from FHIR patient object and passes loaded FHIR patient to AddLabOrder', () => {
    render(<ExportedAddTestOrderWorkspace {...baseProps} />);

    expect(mockUsePatient).toHaveBeenCalledWith(mockPatient.id);
    expect(mockAddLabOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        patient: mockPatient,
      }),
      expect.anything(),
    );
  });

  test('does not render AddLabOrder while patient is loading', () => {
    mockUsePatient.mockReturnValue({
      patient: null,
      patientUuid: null,
      isLoading: true,
      error: null,
    });

    render(<ExportedAddTestOrderWorkspace {...baseProps} />);

    expect(mockAddLabOrder).not.toHaveBeenCalled();
  });
});
