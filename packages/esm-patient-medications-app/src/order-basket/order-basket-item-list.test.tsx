import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderBasketItemList from './order-basket-item-list.component';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';

const mockOnItemRemoved = jest.fn();

const testProps = {
  orderBasketItems: [],
  onItemClicked: jest.fn(),
  onItemRemoveClicked: mockOnItemRemoved,
};

describe('OrderBasketItemList: ', () => {
  test('renders an empty state when no items are selected in the order basket', () => {
    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /Order basket/i })).toBeInTheDocument();
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Search for an order above/i)).toBeInTheDocument();
  });

  test('renders a tile-based layout of newly added orders when available', () => {
    testProps.orderBasketItems = [
      {
        action: 'NEW',
        drug: {
          uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
          name: 'aspirin',
          strength: '81mg',
          dosageForm: {
            display: 'Tablet',
            uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
          concept: {
            uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Aspirin',
            name: {
              display: 'Aspirin',
              uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              name: 'Aspirin',
              locale: 'en',
              localePreferred: true,
              conceptNameType: null,
              resourceVersion: '1.9',
            },
            datatype: {
              uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
              display: 'N/A',
            },
            conceptClass: {
              uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Drug',
            },
            set: false,
            version: null,
            retired: false,
            descriptions: [
              {
                uuid: '2729FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                display: 'dawa ya kupunguza maumivu',
                links: [
                  {
                    rel: 'self',
                    uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/2729FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  },
                ],
              },
              {
                uuid: '16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                display: 'Name of a drug which is used as anti inflammatory and analgesic',
                links: [
                  {
                    rel: 'self',
                    uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  },
                ],
              },
            ],
            resourceVersion: '2.0',
          },
        },
        dosage: {
          dosage: '81 mg',
          numberOfPills: 1,
        },
        dosageUnit: {
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          name: 'Tablet',
          selected: true,
        },
        frequency: {
          name: 'Once daily',
          conceptUuid: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          selected: true,
        },
        route: {
          name: 'Oral',
          conceptUuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          selected: true,
        },
        encounterUuid: '8450ae45-8702-4edd-9541-4f9a75263eab',
        commonMedicationName: 'Aspirin',
        isFreeTextDosage: false,
        patientInstructions: '',
        asNeeded: false,
        asNeededCondition: '',
        startDate: '2021-09-07T17:51:25.313Z',
        duration: null,
        durationUnit: {
          uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Days',
        },
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
      },
    ];

    renderOrderBasketItemList();

    const orderBasketItem = screen.getByRole('listitem');
    expect(orderBasketItem).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /item\(s\) already in your basket/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/New\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();

    const removeFromBasketButton = screen.getByRole('button', { name: /remove from basket/i });
    expect(removeFromBasketButton).toBeInTheDocument();

    userEvent.click(removeFromBasketButton);
    expect(mockOnItemRemoved).toHaveBeenCalledTimes(1);
    expect(mockOnItemRemoved).toHaveBeenCalledWith(testProps.orderBasketItems[0]);
  });

  test('renders a tile-based layout of renewed orders when available', () => {
    testProps.orderBasketItems[0].action = 'RENEWED';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /order\(s\) being renewed/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Renew\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of revised orders when available', () => {
    testProps.orderBasketItems[0].action = 'REVISE';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /order\(s\) being modified \(revised\)/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Modify\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of discontinued orders when available', () => {
    testProps.orderBasketItems[0].action = 'DISCONTINUE';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /discontinued order\(s\)/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Discontinue\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });
});

function renderOrderBasketItemList() {
  render(<OrderBasketItemList {...testProps} />);
}
