import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from '@carbon/react';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  getDrugOrderByUuid,
  launchPatientWorkspace,
  PatientChartPagination,
  type DrugOrderBasketItem,
  type LabOrderBasketItem,
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
  formatDate,
  getCoreTranslation,
  getPatientName,
  PrinterIcon,
  useConfig,
  useLayoutType,
  usePagination,
  usePatient,
} from '@openmrs/esm-framework';
import { buildLabOrder, buildMedicationOrder } from '../utils';
import MedicationRecord from './medication-record.component';
import PrintComponent from '../print/print.component';
import TestOrder from './test-order.component';
import styles from './order-details-table.scss';

interface OrderDetailsProps {
  patientUuid: string;
  showAddButton?: boolean;
  showPrintButton?: boolean;
  title?: string;
}

interface OrderBasketItemActionsProps {
  items: Array<MutableOrderBasketItem>;
  openOrderBasket: () => void;
  openOrderForm: (additionalProps?: { order: MutableOrderBasketItem }) => void;
  orderItem: Order;
  responsiveSize: string;
  setOrderItems: (orderType: 'labs' | 'medications', items: Array<MutableOrderBasketItem>) => void;
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

type MutableOrderBasketItem = OrderBasketItem | LabOrderBasketItem | DrugOrderBasketItem;

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
    error: error,
    isLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', selectedOrderTypeUuid);

  // launch respective order basket based on order type
  const openOrderForm = useCallback(
    (orderItem: Order) => {
      switch (orderItem.type) {
        case 'drugorder':
          launchAddDrugOrder({ order: buildMedicationOrder(orderItem, 'REVISE') });
          break;
        case 'testorder':
          launchModifyLabOrder({ order: buildLabOrder(orderItem, 'REVISE') });
          break;
        default:
          launchOrderBasket();
      }
    },
    [launchAddDrugOrder, launchModifyLabOrder, launchOrderBasket],
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
    }));
  }, [allOrders, t]);

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

  return (
    <>
      <div className={styles.dropdownContainer}>
        <Dropdown
          id="orderTypeDropdown"
          items={orderTypesToDisplay}
          itemToString={(orderType: OrderType) => (orderType ? capitalize(orderType.display) : '')}
          label={t('allOrders', 'All orders')}
          onChange={(e: { selectedItem: Order }) => {
            if (e.selectedItem.display === 'All') {
              setSelectedOrderTypeUuid(null);
              return;
            }
            setSelectedOrderTypeUuid(e.selectedItem.uuid);
          }}
          selectedItem={orderTypes?.find((x) => x.uuid === selectedOrderTypeUuid)}
          titleText={t('selectOrderType', 'Select order type')}
          type="inline"
        />
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
              {!tableRows.length ? (
                // FIXME: The displayText translation is not working as expected
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
                        rows,
                      }) => (
                        <TableContainer {...getTableContainerProps}>
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
                                          {cell.value['content'] ?? cell.value}
                                        </TableCell>
                                      ))}
                                      <TableCell className="cds--table-column-menu">
                                        <OrderBasketItemActions
                                          items={orders}
                                          openOrderBasket={launchOrderBasket}
                                          openOrderForm={() => openOrderForm(matchingOrder)}
                                          orderItem={matchingOrder}
                                          setOrderItems={setOrders}
                                          responsiveSize={responsiveSize}
                                        />
                                      </TableCell>
                                    </TableExpandRow>
                                    {row.isExpanded ? (
                                      <TableExpandedRow
                                        colSpan={headers.length + 2}
                                        {...getExpandedRowProps({
                                          row,
                                        })}
                                      >
                                        <>
                                          {(() => {
                                            if (matchingOrder?.type === 'drugorder') {
                                              return <MedicationRecord medication={matchingOrder} />;
                                            } else if (matchingOrder?.type === 'testorder') {
                                              return <TestOrder testOrder={matchingOrder} />;
                                            } else {
                                              return (
                                                <span className={styles.unknownOrderTypeText}>
                                                  {t('unknownOrderType', 'Unknown order type')}
                                                </span>
                                              );
                                            }
                                          })()}
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
  items,
  setOrderItems,
  openOrderBasket,
  openOrderForm,
  responsiveSize,
}: OrderBasketItemActionsProps) {
  const { t } = useTranslation();
  const alreadyInBasket = items.some((x) => x.uuid === orderItem.uuid);

  const handleModifyClick = useCallback(() => {
    if (orderItem.type === 'drugorder') {
      getDrugOrderByUuid(orderItem.uuid)
        .then((res) => {
          const medicationOrder = res.data;
          const medicationItem = buildMedicationOrder(medicationOrder, 'REVISE');
          setOrderItems(medicationsOrderBasket, [...items, medicationItem]);
          openOrderForm({ order: medicationItem });
        })
        .catch((e) => {
          console.error('Error modifying drug order: ', e);
        });
    } else {
      const labItem = buildLabOrder(orderItem, 'REVISE');
      setOrderItems(labsOrderBasket, [...items, labItem]);
      openOrderForm({ order: labItem });
    }
  }, [orderItem, openOrderForm, items, setOrderItems]);

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
