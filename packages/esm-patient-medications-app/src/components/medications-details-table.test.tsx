import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOrderBasket, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockSessionDataResponse } from '__mocks__';
import MedicationsDetailsTable from './medications-details-table.component';
import { type Order } from '@openmrs/esm-patient-common-lib';

// Mock dependencies
const mockSetOrders = jest.fn();
const mockLaunchAddDrugOrder = jest.fn();
const mockLaunchOrderBasket = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(() => mockSessionDataResponse.data),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return {
    ...originalModule,
    useOrderBasket: jest.fn(),
    useLaunchWorkspaceRequiringVisit: jest.fn(),
  };
});

const mockUseOrderBasket = useOrderBasket as jest.Mock;
const mockUseLaunchWorkspaceRequiringVisit = useLaunchWorkspaceRequiringVisit as jest.Mock;

// Mock medication order data
const mockMedicationOrder: Order = {
  uuid: '819edce3-c5e7-4342-aeba-7e406f639699',
  dosingType: 'org.openmrs.SimpleDosingInstructions',
  orderNumber: 'ORD-814',
  patient: {
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    display: '1003Y2M - John Smith',
  },
  action: 'NEW',
  careSetting: {
    uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
    display: 'Outpatient',
  },
  dateActivated: '2023-08-14T18:23:05.000+0000',
  autoExpireDate: '2023-09-13T18:23:04.000+0000',
  orderer: {
    uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
    display: 'admin - Admin User',
    person: { display: 'Admin User' },
  },
  orderReasonNonCoded: 'Heart disease',
  urgency: 'ROUTINE',
  drug: {
    uuid: 'a722710f-403b-451f-804b-09f8624b0838',
    display: 'Aspirin 162.5mg',
    strength: '162.5mg',
    concept: {
      uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Aspirin',
    },
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  dose: 1,
  doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
  frequency: {
    uuid: '136ebdb7-e989-47cf-8ec2-4e8b2ffe0ab3',
    display: 'Once daily',
  },
  asNeeded: false,
  asNeededCondition: null,
  quantity: 30,
  quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
  numRefills: 2,
  duration: 30,
  durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
  route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
  dosingInstructions: 'Take after meals',
  dispenseAsWritten: false,
  commentToFulfiller: '',
  concept: {
    uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Aspirin',
  },
  encounter: {
    uuid: 'e9337310-ae96-416a-8469-6ab4d3f2f10f',
    display: 'Vitals 08/14/2023',
  },
  orderReason: null,
  orderType: {
    uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
    display: 'Drug Order',
    name: 'Drug Order',
    javaClassName: 'org.openmrs.DrugOrder',
    retired: false,
    description: 'An order for a medication to be given to the patient',
    conceptClasses: [],
    parent: null,
  },
  previousOrder: null,
  scheduleDate: null,
  accessionNumber: '',
  scheduledDate: '',
} as any as Order;

const mockMedicationWithFreeTextDosage: Order = {
  ...mockMedicationOrder,
  uuid: 'free-text-uuid-123',
  dosingType: 'org.openmrs.FreeTextDosingInstructions',
  dosingInstructions: 'Take as directed by physician',
  drug: {
    uuid: 'drug-uuid-456',
    display: 'Ibuprofen 400mg',
    strength: '400mg',
    concept: {
      uuid: 'drug-uuid-456',
      display: 'Ibuprofen',
    },
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
};

describe('MedicationsDetailsTable - Refill Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
    });
    mockUseLaunchWorkspaceRequiringVisit.mockImplementation((workspaceName: string) => {
      if (workspaceName === 'add-drug-order') {
        return mockLaunchAddDrugOrder;
      }
      if (workspaceName === 'order-basket') {
        return mockLaunchOrderBasket;
      }
      return jest.fn();
    });
  });

  describe('Refill button visibility', () => {
    it('should render refill button when showRefillButton is true', async () => {
      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await userEvent.click(actionsButton);

      expect(await screen.findByText('Refill')).toBeInTheDocument();
    });

    it('should not render refill button when showRefillButton is false', async () => {
      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={false}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await userEvent.click(actionsButton);

      expect(screen.queryByText('Refill')).not.toBeInTheDocument();
    });
  });

  describe('Refill button click behavior', () => {
    it('should call handleRefillOrder when refill button is clicked', async () => {
      const user = userEvent.setup();

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await user.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await user.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalled();
      expect(mockLaunchAddDrugOrder).toHaveBeenCalled();
    });

    it('should add order to basket with action RENEW when refill is clicked', async () => {
      const user = userEvent.setup();

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await user.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await user.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'RENEW',
            uuid: mockMedicationOrder.uuid,
            previousOrder: mockMedicationOrder.uuid,
          }),
        ]),
      );
    });

    it('should launch drug order form with pre-populated order data when refill is clicked', async () => {
      const user = userEvent.setup();

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await user.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await user.click(refillButton);

      expect(mockLaunchAddDrugOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            action: 'RENEW',
            uuid: mockMedicationOrder.uuid,
            previousOrder: mockMedicationOrder.uuid,
          }),
        }),
      );
    });
  });

  describe('Order data extraction and population', () => {
    it('should extract all required order fields when creating refill order', async () => {
      const user = userEvent.setup();

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await user.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await user.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            // Drug information
            drug: mockMedicationOrder.drug,
            display: mockMedicationOrder.drug?.display,
            commonMedicationName: mockMedicationOrder.drug?.display,

            // Dosing information
            dosage: mockMedicationOrder.dose,
            unit: {
              value: mockMedicationOrder.doseUnits?.display,
              valueCoded: mockMedicationOrder.doseUnits?.uuid,
            },
            frequency: {
              valueCoded: mockMedicationOrder.frequency?.uuid,
              value: mockMedicationOrder.frequency?.display,
            },
            route: {
              valueCoded: mockMedicationOrder.route?.uuid,
              value: mockMedicationOrder.route?.display,
            },

            // Duration
            duration: mockMedicationOrder.duration,
            durationUnit: {
              valueCoded: mockMedicationOrder.durationUnits?.uuid,
              value: mockMedicationOrder.durationUnits?.display,
            },

            // Dispensing information
            pillsDispensed: mockMedicationOrder.quantity,
            numRefills: mockMedicationOrder.numRefills,
            quantityUnits: {
              value: mockMedicationOrder.quantityUnits?.display,
              valueCoded: mockMedicationOrder.quantityUnits?.uuid,
            },

            // Additional details
            indication: mockMedicationOrder.orderReasonNonCoded,
            orderer: mockMedicationOrder.orderer?.uuid,
            careSetting: mockMedicationOrder.careSetting?.uuid,
            asNeeded: mockMedicationOrder.asNeeded,
            asNeededCondition: mockMedicationOrder.asNeededCondition,
          }),
        ]),
      );
    });

    it('should handle free-text dosing instructions correctly', async () => {
      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationWithFreeTextDosage]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await userEvent.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await userEvent.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            isFreeTextDosage: true,
            freeTextDosage: 'Take as directed by physician',
            patientInstructions: '',
          }),
        ]),
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle medication with missing optional fields', async () => {
      const minimalOrder: Order = {
        ...mockMedicationOrder,
        orderReasonNonCoded: undefined,
        quantity: undefined,
        numRefills: 0,
        duration: undefined,
        durationUnits: undefined,
        asNeededCondition: undefined,
      };

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[minimalOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await userEvent.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await userEvent.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalled();
      expect(mockLaunchAddDrugOrder).toHaveBeenCalled();
    });
  });

  describe('Integration with order basket', () => {
    it('should maintain existing orders in basket when adding refill order', async () => {
      const existingOrder = { uuid: 'existing-order-123', action: 'NEW' };
      mockUseOrderBasket.mockReturnValue({
        orders: [existingOrder],
        setOrders: mockSetOrders,
      });

      renderWithSwr(
        <MedicationsDetailsTable
          medications={[mockMedicationOrder]}
          showDiscontinueButton={false}
          showModifyButton={false}
          showReorderButton={false}
          showRefillButton={true}
          patient={mockPatient}
        />,
      );

      await waitForLoadingToFinish();

      const actionsButton = screen.getByRole('button', { name: /options/i });
      await userEvent.click(actionsButton);

      const refillButton = await screen.findByText('Refill');
      await userEvent.click(refillButton);

      expect(mockSetOrders).toHaveBeenCalledWith(
        expect.arrayContaining([
          existingOrder,
          expect.objectContaining({
            action: 'RENEW',
            uuid: mockMedicationOrder.uuid,
          }),
        ]),
      );
    });
  });
});
