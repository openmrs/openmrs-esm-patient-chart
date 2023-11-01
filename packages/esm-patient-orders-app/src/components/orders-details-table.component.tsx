import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import capitalize from 'lodash-es/capitalize';
import {
  DataTable,
  Button,
  IconButton,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Dropdown,
} from '@carbon/react';
import { CardHeader, Order, OrderBasketItem, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { Add, User, Printer } from '@carbon/react/icons';
import { age, formatDate, useConfig, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib/src/useLaunchWorkspaceRequiringVisit';
import styles from './order-details-table.scss';
import { ConfigObject } from '../../../esm-patient-labs-app/src/config-schema';
import { useReactToPrint } from 'react-to-print';
import { orderPriorityToColor } from '../utils/utils';
import PrintComponent from '../print/print.component';
import { useOrderTypes } from '../api/api';

export interface OrderDetailsProps {
  tableHeaders: Array<OrderHeaderProps>;
  isValidating?: boolean;
  title?: string;
  orderItems: Array<Order> | null;
  showAddButton?: boolean;
  patientUuid: string;
  showCancelButton?: boolean;
  showViewEditButton?: boolean;
  showAddResultsButton?: boolean;
  showPrintButton?: boolean;
}

// TODO move this to types file
export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  retired: boolean;
  description: string;
}

interface OrderHeaderProps {
  key: string;
  header: string;
  isSortable: boolean;
  isVisible?: boolean; // TODO: remove this if not necessary
}

const OrderDetailsTable: React.FC<OrderDetailsProps> = ({
  tableHeaders,
  isValidating,
  title,
  orderItems,
  showAddButton,
  patientUuid,
  showCancelButton,
  showViewEditButton,
  showAddResultsButton,
  showPrintButton,
}) => {
  const { t } = useTranslation();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const config = useConfig() as ConfigObject;
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);

  const { orders, setOrders } = useOrderBasket<OrderBasketItem>('order-basket');

  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);

  const tableRows = orderItems?.map((order, id) => ({
    id: `${id}`,
    startDate: {
      sortKey: dayjs(order.dateActivated).toDate(),
      content: (
        <div className={styles.startDateColumn}>
          <span>{formatDate(new Date(order.dateActivated))}</span>
          {!isPrinting && <InfoTooltip orderer={order.orderer?.person?.display ?? '--'} />}
        </div>
      ),
    },
    orderId: order.orderNumber,
    dateOfOrder: formatDate(new Date(order.dateActivated)),
    orderType: capitalize(order.orderType?.display ?? '--'),
    order: order.display,
    priority: (
      <div style={{ background: orderPriorityToColor(order.urgency), textAlign: 'center', borderRadius: '1rem' }}>
        {capitalize(order.urgency)}
      </div>
    ),
    orderedBy: order.orderer?.display,
    // actions: 'TBD'
  }));

  const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
    return sortDirection === sortStates.DESC
      ? compare(cellB.sortKey, cellA.sortKey)
      : compare(cellA.sortKey, cellB.sortKey);
  };

  const patientDetails = useMemo(() => {
    const getGender = (gender: string): string => {
      switch (gender) {
        case 'male':
          return t('male', 'Male');
        case 'female':
          return t('female', 'Female');
        case 'other':
          return t('other', 'Other');
        case 'unknown':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    };

    const identifiers =
      patient?.patient?.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      name: `${patient?.patient?.name?.[0]?.given?.join(' ')} ${patient?.patient?.name?.[0].family}`,
      age: age(patient?.patient?.birthDate),
      gender: getGender(patient?.patient?.gender),
      location: patient?.patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value, type }) => value) : [],
    };
  }, [patient, t, excludePatientIdentifierCodeTypes?.uuids]);

  const onBeforeGetContentResolve = useRef(null);

  useEffect(() => {
    if (isPrinting && onBeforeGetContentResolve.current) {
      onBeforeGetContentResolve.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `OpenMRS - ${patientDetails.name} - ${title}`,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        if (patient && patient.patient && title) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    onAfterPrint: () => {
      onBeforeGetContentResolve.current = null;
      setIsPrinting(false);
    },
  });

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={title}>
        {isValidating ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        <div className={styles.buttons}>
          {orderTypes && orderTypes.length > 0 && (
            <Dropdown
              id="orderTypeDropdown"
              titleText="Select order type"
              label="All"
              type="inline"
              items={[...[{ display: 'All' }], ...orderTypes]}
              itemToString={(orderType: OrderType) => (orderType ? capitalize(orderType.display) : '')}
            />
          )}

          {showPrintButton && (
            <Button
              kind="ghost"
              renderIcon={Printer}
              iconDescription="Add vitals"
              className={styles.printButton}
              onClick={handlePrint}
            >
              {t('print', 'Print')}
            </Button>
          )}
          {showAddButton ?? true ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Launch order basket"
              onClick={launchOrderBasket}
            >
              {t('add', 'Add')}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <div ref={contentToPrintRef}>
        <PrintComponent subheader={title} patientDetails={patientDetails} />
        <DataTable
          data-floating-menu-container
          size="sm"
          headers={tableHeaders}
          rows={tableRows}
          isSortable
          sortRow={sortRow}
          overflowMenuOnHover={false}
          useZebraStyles
        >
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow className={styles.row} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell className={styles.tableCell} key={cell.id}>
                          {cell.value?.content ?? cell.value}
                        </TableCell>
                      ))}
                      {!isPrinting && (
                        <TableCell className="cds--table-column-menu">
                          <OrderBasketItemActions
                            showCancelButton={showCancelButton}
                            showViewEditButton={showViewEditButton}
                            showAddResultsButton={showAddResultsButton}
                            orderItem={orderItems[rowIndex]}
                            items={orders}
                            setItems={setOrders}
                            openOrderBasket={launchOrderBasket}
                            openOrderForm={launchOrderBasket}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
};

function InfoTooltip({ orderer }: { orderer: string }) {
  return (
    <IconButton
      className={styles.tooltip}
      align="top-left"
      direction="top"
      label={orderer}
      renderIcon={(props) => <User size={16} {...props} />}
      iconDescription={orderer}
      kind="ghost"
      size="sm"
    />
  );
}

function OrderBasketItemActions({
  showCancelButton,
  showViewEditButton,
  showAddResultsButton,
  orderItem,
  items,
  setItems,
  openOrderBasket,
  openOrderForm,
}: {
  showCancelButton: boolean;
  showViewEditButton: boolean;
  showAddResultsButton: boolean;
  orderItem: Order;
  items: Array<OrderBasketItem>;
  setItems: (items: Array<OrderBasketItem>) => void;
  openOrderBasket: () => void;
  openOrderForm: (additionalProps?: { order: OrderBasketItem }) => void;
}) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const alreadyInBasket = items.some((x) => x.uuid === orderItem.uuid);

  const handleViewEditClick = useCallback(() => {
    // openOrderForm({ order: orderItem });
  }, [orderItem, openOrderForm]);

  const handleAddResultsClick = useCallback(() => {
    // openOrderForm({ order: orderItem, addResults: true });
  }, [orderItem, openOrderForm]);

  const handleCancelClick = useCallback(() => {
    // setItems(items.filter((x) => x.uuid !== orderItem.uuid));
  }, [items, orderItem, setItems]);

  return (
    <OverflowMenu ariaLabel="Actions menu" selectorPrimaryFocus={'#modify'} flipped size={isTablet ? 'lg' : 'md'}>
      {showViewEditButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="modify"
          itemText={t('viewEdit', 'View/Edit Order')}
          onClick={handleViewEditClick}
          disabled={alreadyInBasket}
        />
      )}
      {showAddResultsButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="reorder"
          itemText={t('addResults', 'Add Results')}
          onClick={handleAddResultsClick}
          disabled={alreadyInBasket}
        />
      )}
      {showCancelButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="discontinue"
          itemText={t('cancelOrder', 'Cancel Order')}
          onClick={handleCancelClick}
          disabled={alreadyInBasket}
          isDelete={true}
          hasDivider
        />
      )}
    </OverflowMenu>
  );
}

/**
 * Enables a comparison of arbitrary values with support for undefined/null.
 * Requires the `<` and `>` operators to return something reasonable for the provided values.
 */
function compare<T>(x?: T, y?: T) {
  if (x == undefined && y == undefined) {
    return 0;
  } else if (x == undefined) {
    return -1;
  } else if (y == undefined) {
    return 1;
  } else if (x < y) {
    return -1;
  } else if (x > y) {
    return 1;
  } else {
    return 0;
  }
}

export default OrderDetailsTable;
