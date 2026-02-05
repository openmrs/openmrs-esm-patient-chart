import React from 'react';
import { screen } from '@testing-library/react';
import { type Order, useDrugOrderByUuid } from '@openmrs/esm-patient-common-lib';
import { renderWithSwr } from 'tools';
import MedicationRecord from './medication-record.component';

const mockUseDrugOrderByUuid = jest.mocked(useDrugOrderByUuid);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useDrugOrderByUuid: jest.fn(),
  };
});

const baseMedication: Order = {
  uuid: '819edce3-c5e7-4342-aeba-7e406f639699',
  dateActivated: '2023-08-14T18:23:05.000+0000',
  orderer: {
    uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
    display: 'admin - Admin User',
    person: { display: 'Admin User' },
  },
} as Order;

const fullDrugOrder: Order = {
  ...baseMedication,
  drug: {
    uuid: 'a722710f-403b-451f-804b-09f8624b0838',
    display: 'Aspirin 162.5mg',
    strength: '162.5mg',
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    concept: {
      uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Aspirin',
    },
  },
  dose: 1,
  doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
  frequency: { uuid: '136ebdb7-e989-47cf-8ec2-4e8b2ffe0ab3', display: 'Once daily' },
  route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
  duration: 30,
  durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
  quantity: 30,
  quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
  numRefills: 2,
  dosingInstructions: 'Take with food',
  orderReasonNonCoded: 'Heart',
  dateStopped: null,
  dispenseAsWritten: false,
} as Order;

describe('MedicationRecord', () => {
  it('renders a loading state while fetching the drug order', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: null,
      error: undefined,
      isLoading: true,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders drug order details after fetching', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: fullDrugOrder,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText(/aspirin 162.5mg/i)).toBeInTheDocument();
    expect(screen.getByText('DOSE')).toBeInTheDocument();
    expect(screen.getByText(/1 tablet/i)).toBeInTheDocument();
    expect(screen.getByText(/oral/i)).toBeInTheDocument();
    expect(screen.getByText(/once daily/i)).toBeInTheDocument();
    expect(screen.getByText(/for 30 days/i)).toBeInTheDocument();
    expect(screen.getByText(/REFILLS/)).toBeInTheDocument();
    expect(screen.getByText(/take with food/i)).toBeInTheDocument();
    expect(screen.getByText('INDICATION')).toBeInTheDocument();
    expect(screen.getByText('Heart')).toBeInTheDocument();
    expect(screen.getByText(/QUANTITY/)).toBeInTheDocument();
  });

  it('does not render dose section when dose is null', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, dose: null, doseUnits: null } as unknown as Order,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText('DOSE')).not.toBeInTheDocument();
  });

  it('does not render duration section when duration is null', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, duration: null, durationUnits: null } as unknown as Order,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText(/for 30 days/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/indefinite duration/i)).not.toBeInTheDocument();
  });

  it('does not render refills section when numRefills is null', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, numRefills: null } as unknown as Order,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText('REFILLS')).not.toBeInTheDocument();
  });

  it('does not render refills section when numRefills is 0', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, numRefills: 0 },
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText('REFILLS')).not.toBeInTheDocument();
  });

  it('does not render indication when orderReasonNonCoded is null', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, orderReasonNonCoded: null },
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText('INDICATION')).not.toBeInTheDocument();
  });

  it('renders end date when dateStopped is set', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: { ...fullDrugOrder, dateStopped: '2023-09-14T18:23:05.000+0000' },
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText(/END DATE/)).toBeInTheDocument();
  });

  it('does not render end date when dateStopped is null', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: fullDrugOrder,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.queryByText('END DATE')).not.toBeInTheDocument();
  });

  it('renders a free text dosing order without orphaned em-dashes', () => {
    const freeTextOrder: Order = {
      ...baseMedication,
      drug: {
        uuid: '5360f695-a3e2-4593-9426-69ef43781877',
        display: 'Losartan Co 5mg',
        strength: '5mg',
        dosageForm: {
          display: 'Tablet',
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        concept: {
          uuid: '502a66e9-2eb3-4e13-926f-57fe9d393a94',
          display: 'Losartan',
        },
      },
      dose: null,
      doseUnits: null,
      frequency: null,
      route: null,
      duration: null,
      durationUnits: null,
      quantity: 1,
      quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
      numRefills: 1,
      dosingInstructions: '50mg',
      orderReasonNonCoded: null,
      dateStopped: null,
      dispenseAsWritten: false,
    } as unknown as Order;

    mockUseDrugOrderByUuid.mockReturnValue({
      data: freeTextOrder,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText(/losartan co 5mg/i)).toBeInTheDocument();
    expect(screen.getByText('REFILLS')).toBeInTheDocument();
    expect(screen.getByText(/50mg/)).toBeInTheDocument();

    // Verify no orphaned em-dashes: DOSE, route, frequency, and duration should not render
    expect(screen.queryByText('DOSE')).not.toBeInTheDocument();
    expect(screen.queryByText(/indefinite duration/i)).not.toBeInTheDocument();
  });

  it('renders a free text dosing order with a duration but without a leading em-dash', () => {
    const freeTextOrderWithDuration: Order = {
      ...baseMedication,
      drug: {
        uuid: '5360f695-a3e2-4593-9426-69ef43781877',
        display: 'Losartan Co 5mg',
        strength: '5mg',
        dosageForm: {
          display: 'Tablet',
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        concept: {
          uuid: '502a66e9-2eb3-4e13-926f-57fe9d393a94',
          display: 'Losartan',
        },
      },
      dose: null,
      doseUnits: null,
      frequency: null,
      route: null,
      duration: 5,
      durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
      quantity: null,
      quantityUnits: null,
      numRefills: 0,
      dosingInstructions: '50mg',
      orderReasonNonCoded: null,
      dateStopped: null,
      dispenseAsWritten: false,
    } as unknown as Order;

    mockUseDrugOrderByUuid.mockReturnValue({
      data: freeTextOrderWithDuration,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText(/for 5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/50mg/)).toBeInTheDocument();
    expect(screen.queryByText('DOSE')).not.toBeInTheDocument();
  });

  it('renders only dosing instructions without any em-dashes when no other fields are set', () => {
    const freeTextOnlyOrder: Order = {
      ...baseMedication,
      drug: {
        uuid: '5360f695-a3e2-4593-9426-69ef43781877',
        display: 'Losartan Co 5mg',
        strength: '5mg',
        dosageForm: {
          display: 'Tablet',
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        concept: {
          uuid: '502a66e9-2eb3-4e13-926f-57fe9d393a94',
          display: 'Losartan',
        },
      },
      dose: null,
      doseUnits: null,
      frequency: null,
      route: null,
      duration: null,
      durationUnits: null,
      quantity: null,
      quantityUnits: null,
      numRefills: 0,
      dosingInstructions: 'Take 50mg once daily',
      orderReasonNonCoded: null,
      dateStopped: null,
      dispenseAsWritten: false,
    } as unknown as Order;

    mockUseDrugOrderByUuid.mockReturnValue({
      data: freeTextOnlyOrder,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByText(/take 50mg once daily/i)).toBeInTheDocument();
    expect(screen.queryByText('DOSE')).not.toBeInTheDocument();
    expect(screen.queryByText('REFILLS')).not.toBeInTheDocument();
    expect(screen.queryByText('QUANTITY')).not.toBeInTheDocument();
  });

  it('falls back to the medication prop when the fetch returns null', () => {
    const medicationWithDrug = {
      ...baseMedication,
      drug: {
        uuid: 'a722710f-403b-451f-804b-09f8624b0838',
        display: 'Aspirin 162.5mg',
        strength: '162.5mg',
      },
    } as Order;

    mockUseDrugOrderByUuid.mockReturnValue({
      data: null,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={medicationWithDrug} />);

    expect(screen.getByText(/aspirin 162.5mg/i)).toBeInTheDocument();
  });

  it('renders the orderer information tooltip', () => {
    mockUseDrugOrderByUuid.mockReturnValue({
      data: fullDrugOrder,
      error: undefined,
      isLoading: false,
    });

    renderWithSwr(<MedicationRecord medication={baseMedication} />);

    expect(screen.getByRole('button', { name: /orderer information/i })).toBeInTheDocument();
  });
});
