import React, { type ReactElement, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { capitalize, lowerCase } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
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
  Tooltip,
} from '@carbon/react';
import {
  type DrugOrderBasketItem,
  type LabOrderBasketItem,
  type Order,
  type OrderBasketItem,
  type OrderType,
  CardHeader,
  EmptyState,
  ErrorState,
  PatientChartPagination,
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  useOrderTypes,
  usePatientOrders,
  getDrugOrderByUuid,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import {
  age,
  getCoreTranslation,
  getPatientName,
  formatDate,
  useConfig,
  useLayoutType,
  usePagination,
  usePatient,
  PrinterIcon,
  AddIcon,
} from '@openmrs/esm-framework';
import { buildLabOrder, buildMedicationOrder } from '../utils';
import MedicationRecord from './medication-record.component';
import PrintComponent from '../print/print.component';
import TestOrder from './test-order.component';
import styles from './order-details-table.scss';

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

type MutableOrderBasketItem = OrderBasketItem | LabOrderBasketItem | DrugOrderBasketItem;

const medicationsOrderBasket = 'medications';
const labsOrderBasket = 'labs';

const OrderDetailsTable: React.FC<OrderDetailsProps> = ({ title, patientUuid, showAddButton, showPrintButton }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const headerTitle = t('orders', 'Orders');
  const isTablet = useLayoutType() === 'tablet';
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const launchAddDrugOrder = useLaunchWorkspaceRequiringVisit('add-drug-order');
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const { orders, setOrders } = useOrderBasket<MutableOrderBasketItem>();
  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderTypeUuid, setSelectedOrderTypeUuid] = useState(null);
  const selectedOrderName = orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid)?.name;

  const {
    data: allOrders,
    error: isError,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid);

  // launch respective order basket based on order type
  const openOrderForm = useCallback(
    (orderItem: Order) => {
      switch (orderItem.type) {
        case 'drugorder':
          launchAddDrugOrder();
          break;
        default:
          launchOrderBasket();
      }
    },
    [launchAddDrugOrder, launchOrderBasket],
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
    {
      key: 'actions',
      header: '',
      isSortable: false,
    },
  ];

  const tableRows = useMemo(() => {
    return allOrders?.map((order) => ({
      id: order.uuid,
      dateActivated: order.dateActivated,
      orderNumber: order.orderNumber,
      dateOfOrder: <div className={styles.singleLineText}>{formatDate(new Date(order.dateActivated))}</div>,
      orderType: capitalize(order.orderType?.display ?? '--'),
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
      actions: !isPrinting && (
        <OrderBasketItemActions
          orderItem={allOrders.find((x) => x.uuid === order.uuid)}
          items={orders}
          setOrderItems={setOrders}
          openOrderBasket={launchOrderBasket}
          openOrderForm={() => openOrderForm(order)}
        />
      ),
    }));
  }, [allOrders, isPrinting, launchOrderBasket, orders, setOrders, openOrderForm, t]);

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
  }, [isPrinting, onBeforeGetContentResolve]);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `OpenMRS - ${patientDetails.name} - ${title}`,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        if (patient && patient?.patient && title) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    onAfterPrint: () => {
      onBeforeGetContentResolve.current = null;
      setIsPrinting(false);
    },
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  }

  if (isError) {
    return <ErrorState error={isError} headerTitle={title} />;
  }

  return (
    <>
      {orderTypes && orderTypes?.length > 0 && (
        <Dropdown
          id="orderTypeDropdown"
          titleText={t('selectOrderType', 'Select order type')}
          label={t('all', 'All')}
          type="inline"
          items={[...[{ display: 'All' }], ...orderTypes]}
          selectedItem={orderTypes.find((x) => x.uuid === selectedOrderTypeUuid)}
          itemToString={(orderType: OrderType) => (orderType ? capitalize(orderType.display) : '')}
          onChange={(e: { selectedItem: Order }) => {
            if (e.selectedItem.display === 'All') {
              setSelectedOrderTypeUuid(null);
              return;
            }
            setSelectedOrderTypeUuid(e.selectedItem.uuid);
          }}
        />
      )}
      {!tableRows.length ? (
        <EmptyState
          headerTitle={headerTitle}
          displayText={
            selectedOrderTypeUuid === null
              ? t('orders', 'Orders')
              : // t('Drug Order_few', 'Drug Orders')
                // t('Test Order_few', 'Test Orders')
                t(selectedOrderName, {
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
                  kind="ghost"
                  renderIcon={(props) => <PrinterIcon {...props} size={16} />}
                  iconDescription={t('print', 'Print')}
                  className={styles.printButton}
                  onClick={handlePrint}
                >
                  {t('print', 'Print')}
                </Button>
              )}
              {showAddButton && (
                <Button
                  kind="ghost"
                  renderIcon={(props) => <AddIcon {...props} size={16} />}
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
              size="sm"
              headers={tableHeaders}
              rows={paginatedOrders}
              isSortable
              overflowMenuOnHover={false}
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
                rows,
              }) => (
                <TableContainer {...getTableContainerProps}>
                  <Table className={styles.table} {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                        {headers.map((header: { header: string }) => (
                          <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(
                        (row: {
                          id: number;
                          cells: Array<{
                            id: number;
                            info: { header: string };
                            value: ReactNode | { props: { orderItem: Order }; content: string };
                          }>;
                        }) => (
                          <React.Fragment key={row.id}>
                            <TableExpandRow className={styles.row} {...getRowProps({ row })}>
                              {row.cells.map((cell) => (
                                <TableCell className={styles.tableCell} key={cell.id}>
                                  <FormatCellDisplay
                                    rowDisplay={
                                      typeof cell.value === 'object' && Object.hasOwn(cell.value, 'content')
                                        ? cell.value['content']
                                        : cell.value
                                    }
                                  />
                                </TableCell>
                              ))}
                            </TableExpandRow>
                            <TableExpandedRow
                              colSpan={headers.length + 1}
                              {...getExpandedRowProps({
                                row,
                              })}
                            >
                              <ExpandedRowView row={row} />
                            </TableExpandedRow>
                          </React.Fragment>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            {!isPrinting && (
              <PatientChartPagination
                pageNumber={currentPage}
                totalItems={tableRows.length}
                currentItems={paginatedOrders.length}
                pageSize={defaultPageSize}
                onPageNumberChange={({ page }) => goTo(page)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

function FormatCellDisplay({ rowDisplay }: { readonly rowDisplay: string | ReactElement }) {
  return typeof rowDisplay === 'string' && rowDisplay.length > 20 ? (
    <Tooltip align="bottom" label={rowDisplay.concat(' test')}>
      <>{rowDisplay.substring(0, 20).concat('...')}</>
    </Tooltip>
  ) : (
    <>{rowDisplay}</>
  );
}

function ExpandedRowView({
  row,
}: {
  readonly row: { cells: Array<{ info: { header: string }; value: ReactNode | { props: { orderItem: Order } } }> };
}) {
  const { t } = useTranslation();
  let orderActions = row.cells.find((cell) => cell.info.header === 'actions');
  let orderItem =
    typeof orderActions.value === 'object' && Object.hasOwn(orderActions.value, 'props')
      ? orderActions.value?.['props']?.orderItem
      : undefined;

  if (orderItem.type == 'drugorder') {
    return <MedicationRecord medication={orderItem} />;
  } else if (orderItem.type == 'testorder') {
    return <TestOrder testOrder={orderItem} />;
  } else {
    return (
      <div>
        <p>{t('unknownOrderType', 'Unknown order type')}</p>
      </div>
    );
  }
}

function OrderBasketItemActions({
  orderItem,
  items,
  setOrderItems,
  openOrderBasket,
  openOrderForm,
}: {
  orderItem: Order;
  items: Array<MutableOrderBasketItem>;
  setOrderItems: (orderType: 'labs' | 'medications', items: Array<MutableOrderBasketItem>) => void;
  openOrderBasket: () => void;
  openOrderForm: (additionalProps?: { order: MutableOrderBasketItem }) => void;
}) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const alreadyInBasket = items.some((x) => x.uuid === orderItem.uuid);

  const openLabOrderForm = useCallback((order: OrderBasketItem) => {
    launchPatientWorkspace('add-lab-order', { order });
  }, []);

  const handleModifyClick = useCallback(() => {
    if (orderItem.type === 'drugorder') {
      getDrugOrderByUuid(orderItem.uuid).then((res) => {
        let medicationOrder = res.data;
        const medicationItem = buildMedicationOrder(medicationOrder, 'REVISE');
        setOrderItems(medicationsOrderBasket, [...items, medicationItem]);
        openOrderForm({ order: medicationItem });
      });
    } else {
      const labItem = buildLabOrder(orderItem, 'REVISE');
      openLabOrderForm(labItem);
    }
  }, [orderItem, openOrderForm, openLabOrderForm, items, setOrderItems]);

  const handleAddResultsClick = useCallback(() => {
    launchPatientWorkspace('test-results-form-workspace', { order: orderItem });
  }, [orderItem]);

  const handleCancelClick = useCallback(() => {
    if (orderItem.type === 'drugorder') {
      getDrugOrderByUuid(orderItem.uuid).then((res) => {
        let medicationOrder = res.data;
        setOrderItems(medicationsOrderBasket, [...items, buildMedicationOrder(medicationOrder, 'DISCONTINUE')]);
        openOrderBasket();
      });
    } else {
      setOrderItems(labsOrderBasket, [...items, buildLabOrder(orderItem, 'DISCONTINUE')]);
      openOrderBasket();
    }
  }, [orderItem, items, setOrderItems, openOrderBasket]);

  return (
    <OverflowMenu
      ariaLabel={t('actionsMenu', 'Actions Menu')}
      selectorPrimaryFocus={'#modify'}
      flipped
      size={isTablet ? 'lg' : 'md'}
      align="left"
    >
      <OverflowMenuItem
        className={styles.menuItem}
        id="modify"
        itemText={t('modifyOrder', 'Modify order')}
        onClick={handleModifyClick}
        disabled={alreadyInBasket}
      />
      {orderItem.type === 'testorder' && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="reorder"
          itemText={
            orderItem.fulfillerStatus === 'COMPLETED'
              ? t('editResults', 'Edit results')
              : t('addResults', 'Add results')
          }
          onClick={handleAddResultsClick}
          disabled={alreadyInBasket}
        />
      )}
      <OverflowMenuItem
        className={styles.menuItem}
        id="discontinue"
        itemText={t('cancelOrder', 'Cancel order')}
        onClick={handleCancelClick}
        disabled={alreadyInBasket || orderItem.action === 'DISCONTINUE'}
        isDelete={true}
        hasDivider
      />
    </OverflowMenu>
  );
}

export default OrderDetailsTable;
