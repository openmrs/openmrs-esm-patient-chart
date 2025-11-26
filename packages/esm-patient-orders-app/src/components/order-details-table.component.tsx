import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { capitalize, lowerCase } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarContent,
  Tile,
} from '@carbon/react';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  getDrugOrderByUuid,
  PatientChartPagination,
  type Order,
  type OrderBasketItem,
  type OrderType,
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  useOrderTypes,
  usePatientOrders,
} from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '@openmrs/esm-patient-medications-app/src/api/api';
import { prepTestOrderPostData } from '@openmrs/esm-patient-tests-app/src/test-orders/api';
import { prepOrderPostData } from '../order-basket/general-order-type/resources';
import {
  AddIcon,
  age,
  ExtensionSlot,
  formatDate,
  getCoreTranslation,
  getPatientName,
  launchWorkspace,
  OpenmrsDateRangePicker,
  parseDate,
  PrinterIcon,
  useConfig,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { buildGeneralOrder, buildLabOrder, buildMedicationOrder } from '../utils';
import { ORDER_TYPES, getOrderGrouping, isValidOmrsOrderType } from '../constants/order-types';
import GeneralOrderTable from './general-order-table.component';
import MedicationRecord from './medication-record.component';
import PrintComponent from '../print/print.component';
import TestOrder from './test-order.component';
import styles from './order-details-table.scss';

interface OrderDetailsProps {
  patientUuid: string;
  patient: fhir.Patient;
  showAddButton?: boolean;
  showPrintButton?: boolean;
  title?: string;
}

interface OrderBasketItemActionsProps {
  openOrderBasket: () => void;
  launchOrderForm: (additionalProps?: { order: MutableOrderBasketItem }) => void;
  orderItem: Order;
  responsiveSize: 'lg' | 'md' | 'sm';
  patient: fhir.Patient;
}

interface OrderHeaderProps {
  key: string;
  header: string;
  isSortable: boolean;
  isVisible?: boolean;
}

type MutableOrderBasketItem = OrderBasketItem;

const OrderDetailsTable: React.FC<OrderDetailsProps> = ({
  patientUuid,
  patient,
  showAddButton,
  showPrintButton,
  title,
}) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const headerTitle = t('orders', 'Orders');
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit(patientUuid, 'order-basket');
  const launchAddDrugOrder = useLaunchWorkspaceRequiringVisit(patientUuid, 'add-drug-order');
  const launchModifyLabOrder = useLaunchWorkspaceRequiringVisit(patientUuid, 'add-lab-order');
  const launchModifyGeneralOrder = useLaunchWorkspaceRequiringVisit(patientUuid, 'orderable-concept-workspace');
  const contentToPrintRef = useRef<HTMLDivElement | null>(null);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderTypeUuid, setSelectedOrderTypeUuid] = useState(null);
  // UI-controlled date range
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // Derived API filter dates (ISO strings)
  const [startDate, endDate] = dateRange;
  const selectedFromDate = useMemo(
    () => (startDate ? dayjs(startDate).startOf('day').toISOString() : null),
    [startDate],
  );
  const selectedToDate = useMemo(() => (endDate ? dayjs(endDate).endOf('day').toISOString() : null), [endDate]);

  const selectedOrderType = orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid);

  const getOrderTypeDisplayText = useCallback(
    (orderType: OrderType | undefined) => {
      if (!orderType) {
        return t('ordersLower', 'orders');
      }

      const label = (orderType.display || orderType.name || '').toLowerCase();
      if (label.includes('test')) {
        return t('testOrders', 'test orders');
      }
      if (label.includes('drug')) {
        return t('drugOrders', 'drug orders');
      }
      return t('ordersLower', 'orders');
    },
    [t],
  );

  const emptyStateDisplayText = useMemo(() => {
    return getOrderTypeDisplayText(selectedOrderType);
  }, [selectedOrderType, getOrderTypeDisplayText]);

  const getOrderTypeLabel = useCallback(
    (orderType: OrderType) => {
      if (!orderType) {
        return '';
      }
      if (!orderType.uuid) {
        return t('allOrders', 'All orders');
      }

      const label = (orderType.display || orderType.name || '').toLowerCase();
      if (label.includes('drug')) {
        const value = t('drugOrders', 'Drug orders');
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
      }
      if (label.includes('test')) {
        const value = t('testOrders', 'Test orders');
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
      }
      return orderType.display || orderType.name || '';
    },
    [t],
  );
  const {
    data: allOrders,
    error,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid, selectedFromDate, selectedToDate);

  const displayedOrders = useMemo(() => {
    if (!allOrders) {
      return [];
    }
    if (!selectedOrderTypeUuid) {
      return allOrders;
    }
    return allOrders.filter((order) => order.orderType?.uuid === selectedOrderTypeUuid);
  }, [allOrders, selectedOrderTypeUuid]);

  // launch respective order basket based on order type
  const launchOrderForm = useCallback(
    (orderItem: Order) => {
      switch (orderItem.type) {
        case ORDER_TYPES.DRUG_ORDER:
          launchAddDrugOrder({ order: buildMedicationOrder(orderItem, 'REVISE') });
          break;
        case ORDER_TYPES.TEST_ORDER:
          launchModifyLabOrder({
            order: buildLabOrder(orderItem, 'REVISE'),
            orderTypeUuid: orderItem.orderType.uuid,
          });
          break;
        case ORDER_TYPES.GENERAL_ORDER:
          launchModifyGeneralOrder({
            order: buildGeneralOrder(orderItem, 'REVISE'),
            orderTypeUuid: orderItem.orderType.uuid,
          });
          break;
        default:
          launchOrderBasket();
      }
    },
    [launchAddDrugOrder, launchModifyGeneralOrder, launchModifyLabOrder, launchOrderBasket],
  );

  const tableHeaders: Array<OrderHeaderProps> = [
    {
      key: 'orderNumber',
      header: t('orderNumber', 'Order number'),
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
      isSortable: false,
    },
    {
      key: 'orderedBy',
      header: t('orderedBy', 'Ordered by'),
      isSortable: false,
    },
    {
      key: 'status',
      header: t('status', 'Status'),
      isSortable: false,
    },
  ];

  if (isPrinting) {
    tableHeaders.push({
      key: 'dosage',
      header: t('dosage', 'Dosage'),
      isSortable: true,
    });
  }

  const tableRows = useMemo(
    () =>
      displayedOrders?.map((order) => ({
        id: order.uuid,
        dateActivated: order.dateActivated,
        orderNumber: order.orderNumber,
        dateOfOrder: <div className={styles.singleLineText}>{formatDate(parseDate(order.dateActivated))}</div>,
        orderType: capitalize(order.orderType?.display ?? '-'),
        dosage:
          order.type === ORDER_TYPES.DRUG_ORDER ? (
            <div className={styles.singleLineText}>{`${t('indication', 'Indication').toUpperCase()}
            ${order.orderReasonNonCoded ?? t('noIndicationProvided', 'No indication provided')} ${'-'} ${t(
              'quantity',
              'Quantity',
            ).toUpperCase()} ${order.quantity} ${order?.quantityUnits?.display} `}</div>
          ) : (
            '--'
          ),
        order: order.display,
        priority: (
          <div className={styles.priorityPill} data-priority={lowerCase(order.urgency)}>
            {
              // t('ON_SCHEDULED_DATE', 'On scheduled date')
              // t('ROUTINE', 'Routine')
              // t('STAT', 'STAT')
            }
            {t(order.urgency, capitalize(order.urgency.replace('_', ' ')))}
          </div>
        ),
        orderedBy: order.orderer?.display,
        status: order.fulfillerStatus ? (
          <div className={styles.statusPill} data-status={lowerCase(order.fulfillerStatus)}>
            {
              // t('RECEIVED', 'Received')
              // t('IN_PROGRESS', 'In progress')
              // t('EXCEPTION', 'Exception')
              // t('ON_HOLD', 'On hold')
              // t('DECLINED', 'Declined')
              // t('COMPLETED', 'Completed')
              // t('DISCONTINUED', 'Discontinued')
            }
            {t(order.fulfillerStatus, capitalize(order.fulfillerStatus.replace('_', ' ')))}
          </div>
        ) : (
          '--'
        ),
      })) ?? [],
    [displayedOrders, t],
  );

  const { results: paginatedOrders, goTo, currentPage } = usePagination(tableRows, defaultPageSize);

  const patientDetails = useMemo(() => {
    const getGender = (gender: string): string => {
      switch (gender) {
        case 'male':
          return getCoreTranslation('male');
        case 'female':
          return getCoreTranslation('female');
        case 'other':
          return getCoreTranslation('other');
        case 'unknown':
          return getCoreTranslation('unknown');
        default:
          return gender;
      }
    };

    const identifiers =
      patient?.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids?.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      name: patient ? getPatientName(patient) : '',
      age: age(patient?.birthDate),
      gender: getGender(patient?.gender),
      location: patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value }) => value) : [],
    };
  }, [patient, excludePatientIdentifierCodeTypes?.uuids]);

  const onBeforeGetContentResolve = useRef<null | ((value?: unknown) => void)>(null);

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
        if (patient && title) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    onAfterPrint: () => {
      onBeforeGetContentResolve.current = null;
      setIsPrinting(false);
    },
  });

  const orderTypesToDisplay = useMemo(
    () => [
      {
        display: t('allOrders', 'All orders'),
        uuid: null,
      },
      ...(orderTypes?.map((orderType) => ({
        display: orderType.display,
        uuid: orderType.uuid,
      })) ?? []),
    ],
    [orderTypes, t],
  );

  const handleDateFilterChange = useCallback(
    ([startDate, endDate]: [Date | null | undefined, Date | null | undefined]) => {
      setDateRange([startDate ?? null, endDate ?? null]);
    },
    [],
  );

  const isOmrsOrder = useCallback((orderItem: Order) => isValidOmrsOrderType(orderItem.type), []);

  return (
    <>
      <div className={styles.filterContainer}>
        <div className={styles.dropdownContainer}>
          <Dropdown
            id="orderTypeDropdown"
            items={orderTypesToDisplay}
            itemToString={(orderType: OrderType) => getOrderTypeLabel(orderType)}
            label={t('allOrders', 'All orders')}
            onChange={(e: { selectedItem: OrderType }) => {
              const selected = e.selectedItem;
              setSelectedOrderTypeUuid(selected?.uuid ?? null);
            }}
            selectedItem={orderTypesToDisplay.find((x) => x.uuid === selectedOrderTypeUuid)}
            titleText={t('selectOrderType', 'Select order type') + ':'}
            type="inline"
          />
        </div>
        <OpenmrsDateRangePicker
          className={styles.inlineDateRange}
          labelText={t('dateRange', 'Date range') + ':'}
          maxDate={new Date()}
          onChange={handleDateFilterChange}
          value={dateRange}
        />
      </div>

      {isLoading ? (
        <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />
      ) : error ? (
        <ErrorState error={error} headerTitle={title} />
      ) : orderTypes && orderTypes?.length > 0 ? (
        <>
          {!tableRows?.length ? (
            <EmptyState headerTitle={headerTitle} displayText={emptyStateDisplayText} launchForm={launchOrderBasket} />
          ) : (
            <div className={styles.widgetCard}>
              <CardHeader title={title}>
                {isValidating ? (
                  <span>
                    <InlineLoading />
                  </span>
                ) : null}
                <div className={styles.buttons}>
                  {showPrintButton && (
                    <Button
                      className={styles.printButton}
                      iconDescription={t('printOrder', 'Print order')}
                      kind="ghost"
                      onClick={handlePrint}
                      renderIcon={PrinterIcon}
                    >
                      {t('print', 'Print')}
                    </Button>
                  )}
                  {showAddButton && (
                    <Button
                      className={styles.addButton}
                      kind="ghost"
                      renderIcon={AddIcon}
                      iconDescription={t('launchOrderBasket', 'Launch order basket')}
                      onClick={launchOrderBasket}
                    >
                      {t('add', 'Add')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <div ref={contentToPrintRef}>
                <PrintComponent subheader={title} patientDetails={patientDetails} />
                <DataTable
                  aria-label={t('orderDetails', 'Order details')}
                  data-floating-menu-container
                  headers={tableHeaders}
                  isSortable
                  overflowMenuOnHover={!isTablet}
                  rows={paginatedOrders}
                  size={responsiveSize}
                  useZebraStyles
                >
                  {({
                    getExpandedRowProps,
                    getExpandHeaderProps,
                    getHeaderProps,
                    getRowProps,
                    getTableContainerProps,
                    getTableProps,
                    headers,
                    onInputChange,
                    rows,
                  }) => (
                    <>
                      <TableContainer {...getTableContainerProps()}>
                        {!isPrinting && (
                          <div className={styles.toolBarContent}>
                            <TableToolbarContent>
                              <Search
                                isExpanded
                                labelText={t('searchTable', 'Search table')}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e)}
                                placeholder={t('searchTable', 'Search table')}
                              />
                            </TableToolbarContent>
                          </div>
                        )}
                        <Table className={styles.table} {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                              {headers.map((header) => (
                                <TableHeader
                                  {...getHeaderProps({ header })}
                                  isSortable={(header as unknown as OrderHeaderProps).isSortable}
                                >
                                  {header.header}
                                </TableHeader>
                              ))}
                              <TableExpandHeader />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => {
                              const matchingOrder = allOrders?.find((order) => order.uuid === row.id);

                              return (
                                <React.Fragment key={row.id}>
                                  <TableExpandRow className={styles.row} {...getRowProps({ row })}>
                                    {row.cells.map((cell) => (
                                      <TableCell className={styles.tableCell} key={cell.id}>
                                        {cell.value?.['content'] ?? cell.value}
                                      </TableCell>
                                    ))}
                                    {!isPrinting && (
                                      <TableCell className="cds--table-column-menu">
                                        {matchingOrder && isOmrsOrder(matchingOrder) ? (
                                          <OrderBasketItemActions
                                            launchOrderForm={() => launchOrderForm(matchingOrder)}
                                            openOrderBasket={launchOrderBasket}
                                            orderItem={matchingOrder}
                                            responsiveSize={responsiveSize}
                                            patient={patient}
                                          />
                                        ) : (
                                          <ExtensionSlot
                                            name={`${matchingOrder?.type}-action-menu-items-slot`}
                                            state={{
                                              className: styles.menuItem,
                                              orderItem: matchingOrder,
                                              responsiveSize,
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                    )}
                                  </TableExpandRow>
                                  {row.isExpanded ? (
                                    <TableExpandedRow
                                      colSpan={headers.length + 2}
                                      {...getExpandedRowProps({
                                        row,
                                      })}
                                    >
                                      <>
                                        {matchingOrder?.type === ORDER_TYPES.DRUG_ORDER ? (
                                          <MedicationRecord medication={matchingOrder} />
                                        ) : matchingOrder?.type === ORDER_TYPES.TEST_ORDER ? (
                                          <TestOrder testOrder={matchingOrder} />
                                        ) : matchingOrder?.type === ORDER_TYPES.GENERAL_ORDER ? (
                                          <GeneralOrderTable order={matchingOrder} />
                                        ) : (
                                          <ExtensionSlot
                                            name={`${matchingOrder.type}-detail-slot`}
                                            state={{
                                              orderItem: matchingOrder,
                                            }}
                                          />
                                        )}
                                      </>
                                    </TableExpandedRow>
                                  ) : (
                                    <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {rows.length === 0 ? (
                        <div className={styles.tileContainer}>
                          <Tile className={styles.emptyStateTile}>
                            <div className={styles.tileContent}>
                              <p className={styles.content}>
                                {t('noMatchingOrdersToDisplay', 'No matching orders to display')}
                              </p>
                              <p className={styles.helperText}>{t('checkFilters', 'Check the filters above')}</p>
                            </div>
                          </Tile>
                        </div>
                      ) : null}
                    </>
                  )}
                </DataTable>
                {!isPrinting && (
                  <div className={styles.paginationContainer}>
                    <PatientChartPagination
                      currentItems={paginatedOrders.length}
                      onPageNumberChange={({ page }) => goTo(page)}
                      pageNumber={currentPage}
                      pageSize={defaultPageSize}
                      totalItems={tableRows.length}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </>
  );
};

function OrderBasketItemActions({
  orderItem,
  openOrderBasket,
  launchOrderForm,
  responsiveSize,
  patient,
}: OrderBasketItemActionsProps) {
  const { t } = useTranslation();

  // Use the appropriate grouping key and postDataPrepFunction based on order type
  const getOrderBasketConfig = useCallback(() => {
    if (orderItem.type === ORDER_TYPES.DRUG_ORDER) {
      return {
        grouping: getOrderGrouping(ORDER_TYPES.DRUG_ORDER),
        postDataPrepFn: prepMedicationOrderPostData,
      };
    } else if (orderItem.type === ORDER_TYPES.TEST_ORDER) {
      return {
        grouping: getOrderGrouping(ORDER_TYPES.TEST_ORDER, orderItem.orderType.uuid),
        postDataPrepFn: prepTestOrderPostData,
      };
    } else {
      return {
        grouping: getOrderGrouping(ORDER_TYPES.GENERAL_ORDER, orderItem.orderType.uuid),
        postDataPrepFn: prepOrderPostData,
      };
    }
  }, [orderItem.type, orderItem.orderType.uuid]);

  const { grouping, postDataPrepFn } = getOrderBasketConfig();
  const { orders, setOrders } = useOrderBasket<MutableOrderBasketItem>(patient, grouping, postDataPrepFn);
  const alreadyInBasket = orders.some((x) => x.uuid === orderItem.uuid);

  const handleAddOrEditTestResults = useCallback(() => {
    launchWorkspace('test-results-form-workspace', { order: orderItem });
  }, [orderItem]);

  const handleCancelOrder = useCallback(() => {
    if (orderItem.type === ORDER_TYPES.DRUG_ORDER) {
      getDrugOrderByUuid(orderItem.uuid).then((res) => {
        const medicationOrder = res.data;
        const discontinueItem = buildMedicationOrder(medicationOrder, 'DISCONTINUE');
        openOrderBasket();
        setOrders([...orders, discontinueItem]);
      });
    } else if (orderItem.type === ORDER_TYPES.TEST_ORDER) {
      const labItem = buildLabOrder(orderItem, 'DISCONTINUE');
      openOrderBasket();
      setOrders([...orders, labItem]);
    } else {
      const order = buildGeneralOrder(orderItem, 'DISCONTINUE');
      openOrderBasket();
      setOrders([...orders, order]);
    }
  }, [orderItem, setOrders, orders, openOrderBasket]);

  const handleModifyOrder = useCallback(() => {
    if (orderItem.type === ORDER_TYPES.DRUG_ORDER) {
      getDrugOrderByUuid(orderItem.uuid)
        .then((res) => {
          const medicationOrder = res.data;
          const medicationItem = buildMedicationOrder(medicationOrder, 'REVISE');
          setOrders([...orders, medicationItem]);
          launchOrderForm({ order: medicationItem });
        })
        .catch((e) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error modifying drug order: ', e);
          }
        });
    } else if (orderItem.type === ORDER_TYPES.TEST_ORDER) {
      const labItem = buildLabOrder(orderItem, 'REVISE');
      setOrders([...orders, labItem]);
      launchOrderForm({ order: labItem });
    } else if (orderItem.type === ORDER_TYPES.GENERAL_ORDER) {
      const order = buildGeneralOrder(orderItem, 'REVISE');
      setOrders([...orders, order]);
      launchOrderForm({ order });
    }
  }, [orderItem, launchOrderForm, orders, setOrders]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label={t('actionsMenu', 'Actions menu')} flipped selectorPrimaryFocus={'#modify'} size={'md'}>
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket}
          id="modify"
          itemText={t('modifyOrder', 'Modify order')}
          onClick={handleModifyOrder}
        />
        {orderItem?.type === ORDER_TYPES.TEST_ORDER && (
          <OverflowMenuItem
            className={styles.menuItem}
            disabled={alreadyInBasket}
            id="reorder"
            itemText={
              orderItem.fulfillerStatus === 'COMPLETED'
                ? t('editResults', 'Edit results')
                : t('addResults', 'Add results')
            }
            onClick={handleAddOrEditTestResults}
          />
        )}
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket || orderItem?.action === 'DISCONTINUE'}
          hasDivider
          id="discontinue"
          isDelete
          itemText={t('cancelOrder', 'Cancel order')}
          onClick={handleCancelOrder}
        />
      </OverflowMenu>
    </Layer>
  );
}

export default OrderDetailsTable;
