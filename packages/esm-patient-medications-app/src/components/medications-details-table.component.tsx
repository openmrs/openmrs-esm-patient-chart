import React, { useCallback, useMemo } from 'react';
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
} from '@carbon/react';
import { useStore } from 'zustand';
import { Add, User } from '@carbon/react/icons';
import { formatDate, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { compare } from '../utils/compare';
import { getOrderItems, orderBasketStore, orderBasketStoreActions } from '../medications/order-basket-store';
import { Order } from '../types/order';
import { OrderBasketItem } from '../types/order-basket-item';
import { useLaunchOrderBasket } from '../utils/launchOrderBasket';
import styles from './medications-details-table.scss';

export interface ActiveMedicationsProps {
  isValidating?: boolean;
  title?: string;
  medications?: Array<Order> | null;
  showAddNewButton: boolean;
  showDiscontinueButton: boolean;
  showModifyButton: boolean;
  showReorderButton: boolean;
  patientUuid: string;
}

const MedicationsDetailsTable: React.FC<ActiveMedicationsProps> = ({
  isValidating,
  title,
  medications,
  showDiscontinueButton,
  showModifyButton,
  showReorderButton,
  showAddNewButton,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { launchOrderBasket } = useLaunchOrderBasket(patientUuid);

  const store = useStore(orderBasketStore);
  const setItems = useCallback((items) => orderBasketStoreActions.setOrderBasketItems(items), []);
  const patientOrderItems = useMemo(() => getOrderItems(store.items, patientUuid), [store, patientUuid]);

  const tableHeaders = [
    {
      key: 'startDate',
      header: t('startDate', 'Start date'),
      isSortable: true,
      isVisible: true,
    },
    {
      key: 'details',
      header: t('details', 'Details'),
      isSortable: true,
      isVisible: true,
    },
  ];

  const tableRows = medications?.map((medication, id) => ({
    id: `${id}`,
    details: {
      sortKey: medication.drug?.display,
      content: (
        <div className={styles.medicationRecord}>
          <div>
            <p className={styles.bodyLong01}>
              <strong>{capitalize(medication.drug?.display)}</strong>{' '}
              {medication.drug?.strength && <>&mdash; {medication.drug?.strength.toLowerCase()}</>}{' '}
              {medication.drug?.dosageForm?.display && <>&mdash; {medication.drug.dosageForm.display.toLowerCase()}</>}
            </p>
            <p className={styles.bodyLong01}>
              <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
              <span className={styles.dosage}>
                {medication.dose} {medication.doseUnits?.display.toLowerCase()}
              </span>{' '}
              {medication.route?.display && <>&mdash; {medication.route?.display.toLowerCase()}</>}{' '}
              {medication.frequency?.display && <>&mdash; {medication.frequency?.display.toLowerCase()}</>} &mdash;{' '}
              {!medication.duration
                ? t('medicationIndefiniteDuration', 'Indefinite duration').toLowerCase()
                : t('medicationDurationAndUnit', 'for {duration} {durationUnit}', {
                    duration: medication.duration,
                    durationUnit: medication.durationUnits?.display.toLowerCase(),
                  })}{' '}
              {medication.numRefills !== 0 && (
                <span>
                  <span className={styles.label01}> &mdash; {t('refills', 'Refills').toUpperCase()}</span>{' '}
                  {medication.numRefills}
                </span>
              )}
              {medication.dosingInstructions && (
                <span> &mdash; {medication.dosingInstructions.toLocaleLowerCase()}</span>
              )}
            </p>
          </div>
          <p className={styles.bodyLong01}>
            {medication.orderReasonNonCoded ? (
              <span>
                <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                {medication.orderReasonNonCoded}
              </span>
            ) : null}
            {medication.quantity ? (
              <span>
                <span className={styles.label01}> &mdash; {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
                {medication.quantity} {medication.quantityUnits.display}
              </span>
            ) : null}
            {medication.dateStopped ? (
              <span>
                <span className={styles.label01}> &mdash; {t('endDate', 'End date').toUpperCase()}</span>{' '}
                {formatDate(new Date(medication.dateStopped))}
              </span>
            ) : null}
          </p>
        </div>
      ),
    },
    startDate: {
      sortKey: dayjs(medication.dateActivated).toDate(),
      content: (
        <div className={styles.startDateColumn}>
          <p>{formatDate(new Date(medication.dateActivated))}</p>
          <InfoTooltip orderer={medication.orderer?.person?.display ?? '--'} />
        </div>
      ),
    },
  }));

  const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
    return sortDirection === sortStates.DESC
      ? compare(cellB.sortKey, cellA.sortKey)
      : compare(cellA.sortKey, cellB.sortKey);
  };

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={title}>
        {isValidating ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        {showAddNewButton && (
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Launch order basket"
            onClick={launchOrderBasket}
          >
            {t('add', 'Add')}
          </Button>
        )}
      </CardHeader>
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
                    <TableCell className="cds--table-column-menu">
                      <OrderBasketItemActions
                        showDiscontinueButton={showDiscontinueButton}
                        showModifyButton={showModifyButton}
                        showReorderButton={showReorderButton}
                        medication={medications[rowIndex]}
                        items={patientOrderItems}
                        setItems={setItems}
                        openOrderBasket={launchOrderBasket}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

function InfoTooltip({ orderer }) {
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
  showDiscontinueButton,
  showModifyButton,
  showReorderButton,
  medication,
  items,
  setItems,
  openOrderBasket,
}: {
  showDiscontinueButton: boolean;
  showModifyButton: boolean;
  showReorderButton: boolean;
  medication: Order;
  items: Array<OrderBasketItem>;
  setItems: (items: Array<OrderBasketItem>) => void;
  openOrderBasket: () => void;
}) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const alreadyInBasket = items.some((x) => x.uuid === medication.uuid);
  const handleDiscontinueClick = useCallback(() => {
    setItems([
      ...items,
      {
        uuid: medication.uuid,
        previousOrder: null,
        action: 'DISCONTINUE',
        drug: medication.drug,
        dosage: medication.dose,
        unit: {
          value: medication.doseUnits?.display,
          valueCoded: medication.doseUnits?.uuid,
        },
        frequency: {
          valueCoded: medication.frequency?.uuid,
          value: medication.frequency.display,
        },
        route: {
          valueCoded: medication.route?.uuid,
          value: medication.route?.display,
        },
        commonMedicationName: medication.drug?.display,
        isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
        freeTextDosage:
          medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        patientInstructions:
          medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        asNeeded: medication.asNeeded,
        asNeededCondition: medication.asNeededCondition,
        startDate: medication.dateActivated,
        duration: medication.duration,
        durationUnit: {
          valueCoded: medication.durationUnits?.uuid,
          value: medication.durationUnits?.display,
        },
        pillsDispensed: medication.quantity,
        numRefills: medication.numRefills,
        indication: medication.orderReasonNonCoded,
        orderer: medication.orderer.uuid,
        careSetting: medication.careSetting.uuid,
        quantityUnits: {
          value: medication.quantityUnits.display,
          valueCoded: medication.quantityUnits.uuid,
        },
      },
    ]);
    openOrderBasket();
  }, [items, setItems, medication, openOrderBasket]);

  const handleModifyClick = useCallback(() => {
    setItems([
      ...items,
      {
        uuid: medication.uuid,
        previousOrder: medication.uuid,
        startDate: new Date(),
        action: 'REVISE',
        drug: medication.drug,
        dosage: medication.dose,
        unit: {
          value: medication.doseUnits?.display,
          valueCoded: medication.doseUnits?.uuid,
        },
        frequency: {
          valueCoded: medication.frequency?.uuid,
          value: medication.frequency?.display,
        },
        route: {
          valueCoded: medication.route?.uuid,
          value: medication.route?.display,
        },
        commonMedicationName: medication.drug?.display,
        isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
        freeTextDosage:
          medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        patientInstructions:
          medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        asNeeded: medication.asNeeded,
        asNeededCondition: medication.asNeededCondition,
        duration: medication.duration,
        durationUnit: {
          valueCoded: medication.durationUnits?.uuid,
          value: medication.durationUnits?.display,
        },
        pillsDispensed: medication.quantity,
        numRefills: medication.numRefills,
        indication: medication.orderReasonNonCoded,
        orderer: medication.orderer?.uuid,
        careSetting: medication.careSetting?.uuid,
        quantityUnits: {
          value: medication.quantityUnits?.display,
          valueCoded: medication.quantityUnits?.uuid,
        },
      },
    ]);
    openOrderBasket();
  }, [items, setItems, medication, openOrderBasket]);

  const handleReorderClick = useCallback(() => {
    setItems([
      ...items,
      {
        uuid: medication.uuid,
        previousOrder: null,
        startDate: new Date(),
        action: 'RENEWED',
        drug: medication.drug,
        dosage: medication.dose,
        unit: {
          value: medication.doseUnits?.display,
          valueCoded: medication.doseUnits?.uuid,
        },
        frequency: {
          valueCoded: medication.frequency?.uuid,
          value: medication.frequency?.display,
        },
        route: {
          valueCoded: medication.route?.uuid,
          value: medication.route?.display,
        },
        commonMedicationName: medication.drug?.display,
        isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
        freeTextDosage:
          medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        patientInstructions:
          medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        asNeeded: medication.asNeeded,
        asNeededCondition: medication.asNeededCondition,
        duration: medication.duration,
        durationUnit: {
          valueCoded: medication.durationUnits?.uuid,
          value: medication.durationUnits?.display,
        },
        pillsDispensed: medication.quantity,
        numRefills: medication.numRefills,
        indication: medication.orderReasonNonCoded,
        orderer: medication.orderer?.uuid,
        careSetting: medication.careSetting?.uuid,
        quantityUnits: {
          value: medication.quantityUnits?.display,
          valueCoded: medication.quantityUnits?.uuid,
        },
      },
    ]);
    openOrderBasket();
  }, [items, setItems, medication, openOrderBasket]);

  return (
    <OverflowMenu ariaLabel="Actions menu" selectorPrimaryFocus={'#modify'} flipped size={isTablet ? 'lg' : 'md'}>
      {showModifyButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="modify"
          itemText={t('modify', 'Modify')}
          onClick={handleModifyClick}
          disabled={alreadyInBasket}
        />
      )}
      {showReorderButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="reorder"
          itemText={t('reorder', 'Reorder')}
          onClick={handleReorderClick}
          disabled={alreadyInBasket}
        />
      )}
      {showDiscontinueButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          id="discontinue"
          itemText={t('discontinue', 'Discontinue')}
          onClick={handleDiscontinueClick}
          disabled={alreadyInBasket}
          isDelete={true}
          hasDivider
        />
      )}
    </OverflowMenu>
  );
}

export default MedicationsDetailsTable;
