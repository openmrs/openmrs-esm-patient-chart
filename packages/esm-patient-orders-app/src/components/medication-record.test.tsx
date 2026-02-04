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
