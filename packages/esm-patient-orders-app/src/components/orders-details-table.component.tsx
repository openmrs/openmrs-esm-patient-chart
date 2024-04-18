import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import capitalize from 'lodash-es/capitalize';
import orderBy from 'lodash-es/orderBy';
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
  Tag,
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
  launchWorkspace,
  PatientChartPagination,
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  useOrderTypes,
  usePatientOrders,
  getDrugOrderByUuid,
} from '@openmrs/esm-patient-common-lib';
import { Add, Printer } from '@carbon/react/icons';
import { age, formatDate, useConfig, useLayoutType, usePagination, usePatient } from '@openmrs/esm-framework';
import { buildLabOrder, buildMedicationOrder, compare, orderPriorityToColor, orderStatusColor } from '../utils/utils';
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
  const launchAddLabsOrder = useLaunchWorkspaceRequiringVisit('add-lab-order');
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });
  const { orders, setOrders } = useOrderBasket<MutableOrderBasketItem>();
  const { data: orderTypes } = useOrderTypes();
  const [selectedOrderTypeUuid, setSelectedOrderTypeUuid] = useState(null);

  const {
    data: allOrders,
    error: isError,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid);

  // launch respective order basket based on order type
  const openOrderForm = useCallback(
    (orderItem) => {
      switch (orderItem.type) {
        case 'drugorder':
          launchAddDrugOrder();
          break;
        case 'testorder':
          launchAddLabsOrder();
          break;
        default:
          launchOrderBasket();
      }
    },
    [launchAddDrugOrder, launchAddLabsOrder, launchOrderBasket],
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
      orderNumber: order.orderNumber,
      dateOfOrder: <div className={styles.singleLineText}>{formatDate(new Date(order.dateActivated))}</div>,
      orderType: capitalize(order.orderType?.display ?? '--'),
      order: order.display,
      priority: (
        <div style={{ background: orderPriorityToColor(order.urgency), textAlign: 'center', borderRadius: '1rem' }}>
          {capitalize(order.urgency)}
        </div>
      ),
      orderedBy: order.orderer?.display,
      status: order.fulfillerStatus ? (
        <Tag type={orderStatusColor(order.fulfillerStatus)} className={styles.singleLineText}>
          {order.fulfillerStatus}
        </Tag>
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
  }, [allOrders, isPrinting, launchOrderBasket, orders, setOrders, openOrderForm]);

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
          onChange={(e) => {
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
              : (orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid)).display + 's'
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
                  renderIcon={(props) => <Printer size={16} {...props} />}
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
                  renderIcon={(props) => <Add size={16} {...props} />}
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
              sortRow={sortRow}
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
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <React.Fragment key={row.id}>
                          <TableExpandRow className={styles.row} {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell className={styles.tableCell} key={cell.id}>
                                <FormatCellDisplay rowDisplay={cell.value?.content ?? cell.value} />
                              </TableCell>
                            ))}
                          </TableExpandRow>
                          <TableExpandedRow
                            colSpan={headers.length + 1}
                            className="demo-expanded-td"
                            {...getExpandedRowProps({
                              row,
                            })}
                          >
                            <ExpandedRowView row={row} />
                          </TableExpandedRow>
                        </React.Fragment>
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
      )}
    </>
  );
};

function FormatCellDisplay({ rowDisplay }: { readonly rowDisplay: string }) {
  return (
    <>
      {typeof rowDisplay === 'string' && rowDisplay.length > 20 ? (
        <Tooltip align="bottom" label={rowDisplay.concat(' test')}>
          <>{rowDisplay.substring(0, 20).concat('...')}</>
        </Tooltip>
      ) : (
        rowDisplay
      )}
    </>
  );
}

function ExpandedRowView({ row }: { readonly row: any }) {
  const { t } = useTranslation();
  let orderActions = row.cells.find((cell) => cell.info.header === 'actions');
  let orderItem = orderActions.value?.props?.orderItem;

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
      setOrderItems(labsOrderBasket, [...items, labItem]);
      openOrderForm({ order: labItem });
    }
  }, [orderItem, openOrderForm, items, setOrderItems]);

  const handleAddResultsClick = useCallback(() => {
    launchWorkspace('test-results-form-workspace', { order: orderItem });
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
      ariaLabel="Actions menu"
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
