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
  DataTableSkeleton,
} from '@carbon/react';
import {
  CardHeader,
  type Order,
  type OrderBasketItem,
  PatientChartPagination,
  useOrderBasket,
  useLaunchWorkspaceRequiringVisit,
  type OrderType,
  EmptyState,
  ErrorState,
} from '@openmrs/esm-patient-common-lib';
import { Add, User, Printer } from '@carbon/react/icons';
import { age, formatDate, useConfig, useLayoutType, usePagination, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './order-details-table.scss';
import { useReactToPrint } from 'react-to-print';
import { compare, orderPriorityToColor } from '../utils/utils';
import PrintComponent from '../print/print.component';
import { useOrderTypes, usePatientOrders } from '../api/api';
import { orderBy } from 'lodash-es';
import { Tooltip } from '@carbon/react';

interface OrderDetailsProps {
  title?: string;
  patientUuid: string;
  showAddButton?: boolean;
  showPrintButton?: boolean;
}

interface OrderHeaderProps {
  key: string;
  header: string;
  isSortable: boolean;
  isVisible?: boolean;
}

const OrderDetailsTable: React.FC<OrderDetailsProps> = ({ title, patientUuid, showAddButton, showPrintButton }) => {
  const { t } = useTranslation();
  const defaultPageSize = 5;
  const headerTitle = t('orders', 'Orders');
  const isTablet = useLayoutType() === 'tablet';
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const { orders, setOrders } = useOrderBasket<OrderBasketItem>('order-basket');
  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderTypeUuid, setSelectedOrderTypeUuid] = useState(null);

  const {
    data: allOrders,
    error: isError,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid);

  const tableHeaders: Array<OrderHeaderProps> = [
    {
      key: 'orderId',
      header: t('orderId', 'Order ID'),
      isSortable: true,
    },
    {
      key: 'dateOfOrder',
      header: t('dateOfOrder', 'Date of order'),
      isSortable: true,
    },
    {
      key: 'orderType',
      header: t('orderType', 'Order type'),
      isSortable: true,
    },
    {
      key: 'order',
      header: t('order', 'Order'),
      isSortable: true,
    },
    {
      key: 'priority',
      header: t('priority', 'Priority'),
      isSortable: true,
    },
    {
      key: 'orderedBy',
      header: t('orderedBy', 'Ordered by'),
      isSortable: false,
    },
    {
      key: 'status',
      header: t('status', 'Status'),
      isSortable: true,
    },
  ];

  const tableRows = allOrders?.map((order, id) => ({
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
    order: <div>{order.display.length > 20 ? order.display.substring(0, 20).concat('...') : order.display}</div>,
    priority: (
      <div style={{ background: orderPriorityToColor(order.urgency), textAlign: 'center', borderRadius: '1rem' }}>
        {capitalize(order.urgency)}
      </div>
    ),
    orderedBy: order.orderer?.display,
    status: capitalize(order.fulfillerStatus ?? '--'),
  }));

  const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
    return sortDirection === sortStates.DESC
      ? compare(cellB.sortKey, cellA.sortKey)
      : compare(cellA.sortKey, cellB.sortKey);
  };

  const sortDate = (myArray, order) =>
    order === 'ASC'
      ? orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['desc'])
      : orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['asc']);

  const { key, order } = sortParams;
  const sortedData =
    key === 'dateOfOrder'
      ? sortDate(tableRows, order)
      : order === 'DESC'
      ? orderBy(tableRows, [key], ['desc'])
      : orderBy(tableRows, [key], ['asc']);

  const { results: paginatedOrders, goTo, currentPage } = usePagination(sortedData, defaultPageSize);

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

  // trigger a refetch to parent component if selectedOrderType changes
  useEffect(() => {
    // TODO: this is a hack to trigger a refetch of the parent component
  }, [selectedOrderTypeUuid]);

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
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
        if (isError) return <ErrorState error={isError} headerTitle={title} />;
        if (tableRows?.length) {
          return (
            <div className={styles.widgetCard}>
              <CardHeader title={title}>
                {isValidating ? (
                  <span>
                    <InlineLoading />
                  </span>
                ) : null}
                <div className={styles.buttons}>
                  {orderTypes && orderTypes?.length > 0 && (
                    <Dropdown
                      id="orderTypeDropdown"
                      titleText="Select order type"
                      label="All"
                      type="inline"
                      items={[...[{ display: 'All' }], ...orderTypes]}
                      selectedItem={orderTypes.find((x) => x.uuid === selectedOrderTypeUuid)}
                      itemToString={(orderType: OrderType) => (orderType ? capitalize(orderType.display) : '')}
                      onChange={(e) => {
                        if (e.selectedItem.display === 'All') {
                          setSelectedOrderTypeUuid(null);
                          return;
                        }
                        setSelectedOrderTypeUuid(e.selectedItem.uuid);
                      }}
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
                  rows={paginatedOrders}
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
                                    orderItem={sortedData[rowIndex]}
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
                {!isPrinting && (
                  <PatientChartPagination
                    pageNumber={currentPage}
                    totalItems={tableRows?.length}
                    currentItems={paginatedOrders?.length}
                    pageSize={defaultPageSize}
                    onPageNumberChange={({ page }) => goTo(page)}
                  />
                )}
              </div>
            </div>
          );
        } else {
          return <EmptyState displayText={headerTitle} headerTitle={headerTitle} launchForm={launchOrderBasket} />;
        }
      })()}
    </>
  );
};

function OrderDisplayTooltip({ orderDisplay }: { orderDisplay: string }) {
  return (
    <>
      <Tooltip align="bottom" label={orderDisplay}>
        {orderDisplay.substring(0, 20).concat('...')}
      </Tooltip>
    </>
  );
}

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
  orderItem,
  items,
  setItems,
  openOrderBasket,
  openOrderForm,
}: {
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
      <OverflowMenuItem
        className={styles.menuItem}
        id="modify"
        itemText={t('viewEdit', 'View/Edit Order')}
        onClick={handleViewEditClick}
        disabled={alreadyInBasket}
      />
      {!orderItem.fulfillerStatus && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="reorder"
          itemText={t('addResults', 'Add Results')}
          onClick={handleAddResultsClick}
          disabled={alreadyInBasket}
        />
      )}
      {true && (
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

export default OrderDetailsTable;
