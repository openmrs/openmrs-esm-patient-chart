import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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

const mockUseOrderPrice = vi.mocked(useOrderPrice);
const mockUseLabEncounter = vi.mocked(useLabEncounter);
const mockUseOrderConceptByUuid = vi.mocked(useOrderConceptByUuid);
const mockUseOrderConceptsByUuids = vi.mocked(useOrderConceptsByUuids);
const mockUseReferenceRanges = vi.mocked(useReferenceRanges);

vi.mock('../hooks/useOrderPrice', () => ({
  useOrderPrice: vi.fn(),
}));

vi.mock('../lab-results/lab-results.resource', () => ({
  useLabEncounter: vi.fn(),
  useOrderConceptByUuid: vi.fn(),
  useOrderConceptsByUuids: vi.fn(),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...(await vi.importActual('@openmrs/esm-patient-common-lib')),
  useReferenceRanges: vi.fn(),
  ReferenceRangeDisplay: vi.fn(() => null),
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
    vi.resetAllMocks();

    mockUseOrderConceptByUuid.mockReturnValue({
      concept: mockConcept,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    });

    mockUseLabEncounter.mockReturnValue({
      encounter: undefined,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    });

    mockUseOrderConceptsByUuids.mockReturnValue({
      concepts: [],
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    });

    mockUseReferenceRanges.mockReturnValue({
      ranges: new Map(),
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
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
