import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { capitalize, lowerCase } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
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
  launchPatientWorkspace,
  PatientChartPagination,
  type Order,
  type OrderBasketItem,
  type OrderType,
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  useOrderTypes,
  usePatientOrders,
} from '@openmrs/esm-patient-common-lib';
import {
  AddIcon,
  age,
  ExtensionSlot,
  formatDate,
  getCoreTranslation,
  getPatientName,
  PrinterIcon,
  useConfig,
  useLayoutType,
  usePagination,
  usePatient,
} from '@openmrs/esm-framework';
import { buildGeneralOrder, buildLabOrder, buildMedicationOrder } from '../utils';
import MedicationRecord from './medication-record.component';
import PrintComponent from '../print/print.component';
import TestOrder from './test-order.component';
import styles from './order-details-table.scss';
import GeneralOrderTable from './general-order-table.component';

interface OrderDetailsProps {
  patientUuid: string;
  showAddButton?: boolean;
  showPrintButton?: boolean;
  title?: string;
}

interface OrderBasketItemActionsProps {
  openOrderBasket: () => void;
  openOrderForm: (additionalProps?: { order: MutableOrderBasketItem }) => void;
  orderItem: Order;
  responsiveSize: string;
}

interface OrderHeaderProps {
  key: string;
  header: string;
  isSortable: boolean;
  isVisible?: boolean;
}

interface DataTableRow {
  id: string;
  cells: Array<{
    id: number;
    info: { header: string };
    value: ReactNode | { props: { orderItem: Order }; content: string };
  }>;
  isExpanded: boolean;
}

type MutableOrderBasketItem = OrderBasketItem;

const medicationsOrderBasket = 'medications';
const labsOrderBasket = 'labs';

const OrderDetailsTable: React.FC<OrderDetailsProps> = ({ patientUuid, showAddButton, showPrintButton, title }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const headerTitle = t('orders', 'Orders');
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const launchAddDrugOrder = useLaunchWorkspaceRequiringVisit('add-drug-order');
  const launchModifyLabOrder = useLaunchWorkspaceRequiringVisit('add-lab-order');
  const launchModifyGeneralOrder = useLaunchWorkspaceRequiringVisit('orderable-concept-workspace');
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderTypeUuid, setSelectedOrderTypeUuid] = useState(null);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const selectedOrderName = orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid)?.name;
  const {
    data: allOrders,
    error: error,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid, selectedFromDate, selectedToDate);

  // launch respective order basket based on order type
  const openOrderForm = useCallback(
    (orderItem: Order) => {
      switch (orderItem.type) {
        case 'drugorder':
          launchAddDrugOrder({ order: buildMedicationOrder(orderItem, 'REVISE') });
          break;
        case 'testorder':
          launchModifyLabOrder({
            order: buildLabOrder(orderItem, 'REVISE'),
            orderTypeUuid: orderItem.orderType.uuid,
          });
          break;
        case 'order':
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

  if (isPrinting) {
    tableHeaders.push({
      key: 'dosage',
      header: t('dosage', 'Dosage'),
      isSortable: true,
    });
  }

  const tableRows = useMemo(
    () =>
      allOrders?.map((order) => ({
        id: order.uuid,
        dateActivated: order.dateActivated,
        orderNumber: order.orderNumber,
        dateOfOrder: <div className={styles.singleLineText}>{formatDate(new Date(order.dateActivated))}</div>,
        orderType: capitalize(order.orderType?.display ?? '-'),
        dosage:
          order.type === 'drugorder' ? (
            <div className={styles.singleLineText}>{`${t('indication', 'Indication').toUpperCase()}
            ${order.orderReasonNonCoded} ${'-'} ${t('quantity', 'Quantity').toUpperCase()} ${order.quantity} ${order
              ?.quantityUnits?.display} `}</div>
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
          <div className={styles.statusPill} data-status={lowerCase(order.fulfillerStatus.replace('_', ' '))}>
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
    [allOrders, t],
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
      patient?.patient?.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      name: patient?.patient ? getPatientName(patient?.patient) : '',
      age: age(patient?.patient?.birthDate),
      gender: getGender(patient?.patient?.gender),
      location: patient?.patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value, type }) => value) : [],
    };
  }, [patient, excludePatientIdentifierCodeTypes?.uuids]);

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

  const handleDateFilterChange = ([startDate, endDate]) => {
    if (startDate) {
      const isoStartDate = startDate.toISOString();
      setSelectedFromDate(isoStartDate);
      if (selectedToDate && selectedToDate < startDate) {
        setSelectedToDate(isoStartDate);
      }
    }
    if (endDate) {
      const isoEndDate = endDate.toISOString();
      setSelectedToDate(isoEndDate);
      if (selectedFromDate && selectedFromDate > endDate) {
        setSelectedFromDate(isoEndDate);
      }
    }
  };

  const isOmrsOrder = useCallback(
    (orderItem: Order) => ['order', 'testorder', 'drugorder'].includes(orderItem.type),
    [],
  );

  return (
    <>
      <div className={styles.filterContainer}>
        <div className={styles.dropdownContainer}>
          <Dropdown
            id="orderTypeDropdown"
            items={orderTypesToDisplay}
            itemToString={(orderType: OrderType) => (orderType ? capitalize(orderType.display) : '')}
            label={t('allOrders', 'All orders')}
            onChange={(e: { selectedItem: OrderType }) => {
              if (e.selectedItem.display === 'All') {
                setSelectedOrderTypeUuid(null);
                return;
              }
              setSelectedOrderTypeUuid(e.selectedItem.uuid);
            }}
            selectedItem={orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid)}
            titleText={t('selectOrderType', 'Select order type') + ':'}
            type="inline"
          />
        </div>
        <span className={styles.rangeLabel}>{t('dateRange', 'Date range')}:</span>
        <DatePicker
          datePickerType="range"
          dateFormat={'d/m/Y'}
          value={''}
          onChange={([startDate, endDate]) => {
            handleDateFilterChange([startDate, endDate]);
          }}
        >
          <DatePickerInput
            id="startDatePickerInput"
            data-testid="startDatePickerInput"
            labelText=""
            placeholder="dd/mm/yyyy"
          />
          <DatePickerInput
            id="endDatePickerInput"
            data-testid="endDatePickerInput"
            labelText=""
            placeholder="dd/mm/yyyy"
          />
        </DatePicker>
      </div>

      {(() => {
        if (isLoading) {
          return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
        }

        if (error) {
          return <ErrorState error={error} headerTitle={title} />;
        }

        if (orderTypes && orderTypes?.length > 0) {
          return (
            <>
              {!tableRows?.length ? (
                <EmptyState
                  headerTitle={headerTitle}
                  displayText={
                    selectedOrderTypeUuid === null
                      ? t('orders', 'Orders')
                      : // t('Drug Order_few', 'Drug Orders')
                        // t('Test Order_few', 'Test Orders')
                        t(selectedOrderName?.toLowerCase() ?? 'orders', {
                          count: 3,
                          default: selectedOrderName,
                        })
                  }
                  launchForm={launchOrderBasket}
                />
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
                          <TableContainer {...getTableContainerProps}>
                            {!isPrinting && (
                              <div className={styles.toolBarContent}>
                                <TableToolbarContent>
                                  <Layer>
                                    <Search
                                      expanded
                                      labelText=""
                                      onChange={onInputChange}
                                      placeholder={t('searchTable', 'Search table')}
                                      size="lg"
                                    />
                                  </Layer>
                                </TableToolbarContent>
                              </div>
                            )}
                            <Table className={styles.table} {...getTableProps()}>
                              <TableHead>
                                <TableRow>
                                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                                  {headers.map((header: { header: string }) => (
                                    <TableHeader key={header.header} {...getHeaderProps({ header })}>
                                      {header.header}
                                    </TableHeader>
                                  ))}
                                  <TableExpandHeader />
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {rows.map((row: DataTableRow) => {
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
                                            {isOmrsOrder(matchingOrder) ? (
                                              <OrderBasketItemActions
                                                openOrderBasket={launchOrderBasket}
                                                openOrderForm={() => openOrderForm(matchingOrder)}
                                                orderItem={matchingOrder}
                                                responsiveSize={responsiveSize}
                                              />
                                            ) : (
                                              <ExtensionSlot
                                                name={`${matchingOrder.type}-action-menu-items-slot`}
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
                                            {matchingOrder?.type === 'drugorder' ? (
                                              <MedicationRecord medication={matchingOrder} />
                                            ) : matchingOrder?.type === 'testorder' ? (
                                              <TestOrder testOrder={matchingOrder} />
                                            ) : matchingOrder?.type === 'order' ? (
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
                          pageNumber={currentPage}
                          totalItems={tableRows.length}
                          currentItems={paginatedOrders.length}
                          pageSize={defaultPageSize}
                          onPageNumberChange={({ page }) => goTo(page)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          );
        }
      })()}
    </>
  );
};

function OrderBasketItemActions({
  orderItem,
  openOrderBasket,
  openOrderForm,
  responsiveSize,
}: OrderBasketItemActionsProps) {
  const { t } = useTranslation();
  const { orders, setOrders } = useOrderBasket<MutableOrderBasketItem>(orderItem.orderType.uuid);
  const alreadyInBasket = orders.some((x) => x.uuid === orderItem.uuid);

  const handleModifyClick = useCallback(() => {
    if (orderItem.type === 'drugorder') {
      getDrugOrderByUuid(orderItem.uuid)
        .then((res) => {
          const medicationOrder = res.data;
          const medicationItem = buildMedicationOrder(medicationOrder, 'REVISE');
          setOrders([...orders, medicationItem]);
          openOrderForm({ order: medicationItem });
        })
        .catch((e) => {
          console.error('Error modifying drug order: ', e);
        });
    } else if (orderItem.type === 'testorder') {
      const labItem = buildLabOrder(orderItem, 'REVISE');
      setOrders([...orders, labItem]);
      openOrderForm({ order: labItem });
    } else if (orderItem.type === 'order') {
      const order = buildGeneralOrder(orderItem, 'REVISE');
      setOrders([...orders, order]);
      openOrderForm({ order });
    }
  }, [orderItem, openOrderForm, orders, setOrders]);

  const handleAddResultsClick = useCallback(() => {
    launchPatientWorkspace('test-results-form-workspace', { order: orderItem });
  }, [orderItem]);

  const handleCancelClick = useCallback(() => {
    if (orderItem.type === 'drugorder') {
      getDrugOrderByUuid(orderItem.uuid).then((res) => {
        let medicationOrder = res.data;
        setOrders([...orders, buildMedicationOrder(medicationOrder, 'DISCONTINUE')]);
        openOrderBasket();
      });
    } else if (orderItem.type === 'testorder') {
      const labItem = buildLabOrder(orderItem, 'DISCONTINUE');
      setOrders([...orders, labItem]);
      openOrderBasket();
    } else {
      const order = buildGeneralOrder(orderItem, 'DISCONTINUE');
      setOrders([...orders, order]);
      openOrderBasket();
    }
  }, [orderItem, setOrders, orders, openOrderBasket]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        align="left"
        aria-label={t('actionsMenu', 'Actions menu')}
        flipped
        selectorPrimaryFocus={'#modify'}
        size={responsiveSize}
      >
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket}
          id="modify"
          itemText={t('modifyOrder', 'Modify order')}
          onClick={handleModifyClick}
        />
        {orderItem?.type === 'testorder' && (
          <OverflowMenuItem
            className={styles.menuItem}
            disabled={alreadyInBasket}
            id="reorder"
            itemText={
              orderItem.fulfillerStatus === 'COMPLETED'
                ? t('editResults', 'Edit results')
                : t('addResults', 'Add results')
            }
            onClick={handleAddResultsClick}
          />
        )}
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket || orderItem?.action === 'DISCONTINUE'}
          hasDivider
          id="discontinue"
          isDelete
          itemText={t('cancelOrder', 'Cancel order')}
          onClick={handleCancelClick}
        />
      </OverflowMenu>
    </Layer>
  );
}

export default OrderDetailsTable;
