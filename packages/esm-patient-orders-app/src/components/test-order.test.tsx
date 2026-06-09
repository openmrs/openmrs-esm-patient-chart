import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithSwr } from 'tools';
import { mockOrders, mockOrderPriceData } from '__mocks__';
import { useOrderPrice } from '../hooks/useOrderPrice';
import {
  useLabEncounter,
  useOrderConceptByUuid,
  useOrderConceptsByUuids,
  type LabOrderConcept,
} from '../lab-results/lab-results.resource';
import { useReferenceRanges, type Order } from '@openmrs/esm-patient-common-lib';
import TestOrder from './test-order.component';

const mockUseOrderPrice = jest.mocked(useOrderPrice);
const mockUseLabEncounter = jest.mocked(useLabEncounter);
const mockUseOrderConceptByUuid = jest.mocked(useOrderConceptByUuid);
const mockUseOrderConceptsByUuids = jest.mocked(useOrderConceptsByUuids);
const mockUseReferenceRanges = jest.mocked(useReferenceRanges);

jest.mock('../hooks/useOrderPrice', () => ({
  useOrderPrice: jest.fn(),
}));

jest.mock('../lab-results/lab-results.resource', () => ({
  useLabEncounter: jest.fn(),
  useOrderConceptByUuid: jest.fn(),
  useOrderConceptsByUuids: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useReferenceRanges: jest.fn(),
  ReferenceRangeDisplay: jest.fn(() => null),
}));

const mockTestOrder = mockOrders[1] as unknown as Order;

const mockConcept: LabOrderConcept = {
  uuid: mockOrders[1].concept.uuid,
  display: mockOrders[1].concept.display,
  datatype: {
    uuid: 'datatype-uuid',
    display: 'Numeric',
    name: 'Numeric',
    description: 'Numeric datatype',
    hl7Abbreviation: 'NM',
    retired: false,
    resourceVersion: '1.0',
  },
  set: false,
  version: '1.0',
  retired: false,
  descriptions: [],
  setMembers: [],
  hiNormal: undefined,
  hiAbsolute: undefined,
  hiCritical: undefined,
  lowNormal: undefined,
  lowAbsolute: undefined,
  lowCritical: undefined,
  units: undefined,
};

describe('TestOrder', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockUseOrderConceptByUuid.mockReturnValue({
      concept: mockConcept,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });

    mockUseLabEncounter.mockReturnValue({
      encounter: undefined,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });

    mockUseOrderConceptsByUuids.mockReturnValue({
      concepts: [],
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });

    mockUseReferenceRanges.mockReturnValue({
      ranges: new Map(),
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });
  });

  it('renders the price tag when price data is available', () => {
    mockUseOrderPrice.mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
      error: undefined,
    });

    renderWithSwr(<TestOrder testOrder={mockTestOrder} />);

    expect(screen.getByText('Price:')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('renders nothing for price when price data is unavailable', () => {
    mockUseOrderPrice.mockReturnValue({
      data: null,
      isLoading: false,
      error: undefined,
    });

    renderWithSwr(<TestOrder testOrder={mockTestOrder} />);

    expect(screen.queryByText('Price:')).not.toBeInTheDocument();
  });

  it('renders a loading skeleton while price data is loading', () => {
    mockUseOrderPrice.mockReturnValue({
      data: null,
      isLoading: true,
      error: undefined,
    });

    renderWithSwr(<TestOrder testOrder={mockTestOrder} />);

    expect(screen.getByRole('paragraph')).toBeInTheDocument();
  });

  it('renders the price disclaimer tooltip', () => {
    mockUseOrderPrice.mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
      error: undefined,
    });

    renderWithSwr(<TestOrder testOrder={mockTestOrder} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/This price is indicative/)).toBeInTheDocument();
  });
});
