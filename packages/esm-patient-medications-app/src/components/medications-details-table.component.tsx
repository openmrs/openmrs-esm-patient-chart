import React, { type ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { capitalize } from 'lodash-es';
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
  Tag,
  Tooltip,
} from '@carbon/react';
import {
  CardHeader,
  compare,
  PatientChartPagination,
  type Order,
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import {
  AddIcon,
  age,
  getPatientName,
  formatDate,
  PrinterIcon,
  useConfig,
  useLayoutType,
  usePagination,
  UserIcon,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { type AddDrugOrderWorkspaceAdditionalProps } from '../add-drug-order/add-drug-order.workspace';
import { type DrugOrderBasketItem } from '../types';
import { type ConfigObject } from '../config-schema';
import PrintComponent from '../print/print.component';
import styles from './medications-details-table.scss';

export interface MedicationsDetailsTableProps {
  isValidating?: boolean;
  title?: string;
  medications?: Array<Order> | null;
  showAddButton?: boolean;
  showDiscontinueButton: boolean;
  showModifyButton: boolean;
  showReorderButton: boolean;
  patient: fhir.Patient;
}

const MedicationsDetailsTable: React.FC<MedicationsDetailsTableProps> = ({
  isValidating,
  title,
  medications,
  showAddButton,
  showDiscontinueButton,
  showModifyButton,
  showReorderButton,
  patient,
}) => {
  const pageSize = 5;
  const { t } = useTranslation();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const launchAddDrugOrder = useLaunchWorkspaceRequiringVisit('add-drug-order');
  const config = useConfig() as ConfigObject;
  const showPrintButton = config.showPrintButton;
  const contentToPrintRef = useRef(null);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const [isPrinting, setIsPrinting] = useState(false);

  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications');
  const { results, goTo, currentPage } = usePagination(medications, pageSize);

  const tableHeaders = [
    {
      key: 'activationDate',
      header: t('activationDate', 'Activation date'),
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

  const tableRows = results?.map((medication, id) => ({
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
              {medication.dateStopped && (
                <Tooltip align="right" label={<>{formatDate(new Date(medication.dateStopped))}</>}>
                  <Tag type="gray" className={styles.tag}>
                    {t('discontinued', 'Discontinued')}
                  </Tag>
                </Tooltip>
              )}
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
                : t('medicationDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
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
            {medication.orderReasonNonCoded && (
              <span>
                <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                {medication.orderReasonNonCoded}
              </span>
            )}
            {medication.quantity && (
              <span>
                <span className={styles.label01}> &mdash; {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
                {medication.quantity} {medication?.quantityUnits?.display}
              </span>
            )}
          </p>
        </div>
      ),
    },
    activationDate: {
      sortKey: dayjs(medication.dateActivated).toDate(),
      content: (
        <div className={styles.activationDateColumn}>
          <span>{formatDate(new Date(medication.dateActivated))}</span>
          {!isPrinting && <InfoTooltip orderer={medication.orderer?.person?.display ?? '--'} />}
        </div>
      ),
    },
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
      patient?.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      name: patient ? getPatientName(patient) : '',
      age: age(patient?.birthDate),
      gender: getGender(patient?.gender),
      location: patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value }) => value) : [],
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

  return (
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
              renderIcon={PrinterIcon}
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
              renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
              iconDescription="Launch order basket"
              onClick={launchAddDrugOrder}
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
              <Table aria-label="medications" className={styles.table} {...getTableProps()}>
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
                            showDiscontinueButton={showDiscontinueButton}
                            showModifyButton={showModifyButton}
                            showReorderButton={showReorderButton}
                            medication={medications[rowIndex]}
                            items={orders}
                            setItems={setOrders}
                            openOrderBasket={launchOrderBasket}
                            openDrugOrderForm={launchAddDrugOrder}
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
        <PatientChartPagination
          pageNumber={currentPage}
          totalItems={medications.length}
          currentItems={results.length}
          pageSize={pageSize}
          onPageNumberChange={({ page }) => goTo(page)}
        />
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
      renderIcon={(props: ComponentProps<typeof UserIcon>) => <UserIcon size={16} {...props} />}
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
  openDrugOrderForm,
}: {
  showDiscontinueButton: boolean;
  showModifyButton: boolean;
  showReorderButton: boolean;
  medication: Order;
  items: Array<DrugOrderBasketItem>;
  setItems: (items: Array<DrugOrderBasketItem>) => void;
  openOrderBasket: () => void;
  openDrugOrderForm: (additionalProps?: AddDrugOrderWorkspaceAdditionalProps) => void;
}) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const alreadyInBasket = items.some((x) => x.uuid === medication.uuid);

  const handleDiscontinueClick = useCallback(() => {
    setItems([
      ...items,
      {
        action: 'DISCONTINUE',
        asNeeded: medication.asNeeded,
        asNeededCondition: medication.asNeededCondition,
        careSetting: medication.careSetting.uuid,
        commonMedicationName: medication.drug?.display,
        dateActivated: medication.dateActivated,
        display: medication.drug?.display,
        dosage: medication.dose,
        drug: medication.drug,
        duration: medication.duration,
        durationUnit: {
          value: medication.durationUnits?.display,
          valueCoded: medication.durationUnits?.uuid,
        },
        freeTextDosage:
          medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        frequency: {
          value: medication.frequency?.display,
          valueCoded: medication.frequency?.uuid,
        },
        indication: medication.orderReasonNonCoded,
        isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
        numRefills: medication.numRefills,
        orderer: medication.orderer.uuid,
        patientInstructions:
          medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        pillsDispensed: medication.quantity,
        previousOrder: null,
        quantityUnits: {
          value: medication.quantityUnits?.display,
          valueCoded: medication.quantityUnits?.uuid,
        },
        route: {
          value: medication.route?.display,
          valueCoded: medication.route?.uuid,
        },
        unit: {
          value: medication.doseUnits?.display,
          valueCoded: medication.doseUnits?.uuid,
        },
        uuid: medication.uuid,
      },
    ]);
    openOrderBasket();
  }, [items, setItems, medication, openOrderBasket]);

  const handleModifyClick = useCallback(() => {
    const newItem: DrugOrderBasketItem = {
      action: 'REVISE',
      asNeeded: medication.asNeeded,
      asNeededCondition: medication.asNeededCondition,
      careSetting: medication.careSetting?.uuid,
      commonMedicationName: medication.drug?.display,
      dateActivated: medication?.dateActivated,
      display: medication.drug?.display,
      dosage: medication.dose,
      drug: medication.drug,
      duration: medication.duration,
      durationUnit: {
        value: medication.durationUnits?.display,
        valueCoded: medication.durationUnits?.uuid,
      },
      freeTextDosage:
        medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
      frequency: {
        value: medication.frequency?.display,
        valueCoded: medication.frequency?.uuid,
      },
      indication: medication.orderReasonNonCoded,
      isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
      numRefills: medication.numRefills,
      orderer: medication.orderer?.uuid,
      patientInstructions:
        medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
      pillsDispensed: medication.quantity,
      previousOrder: medication.uuid,
      quantityUnits: {
        value: medication.quantityUnits?.display,
        valueCoded: medication.quantityUnits?.uuid,
      },
      route: {
        value: medication.route?.display,
        valueCoded: medication.route?.uuid,
      },
      unit: {
        value: medication.doseUnits?.display,
        valueCoded: medication.doseUnits?.uuid,
      },
      uuid: medication.uuid,
    };
    setItems([...items, newItem]);
    openDrugOrderForm({ order: newItem });
  }, [items, setItems, medication, openDrugOrderForm]);

  const handleReorderClick = useCallback(() => {
    setItems([
      ...items,
      {
        action: 'RENEW',
        asNeeded: medication.asNeeded,
        asNeededCondition: medication.asNeededCondition,
        careSetting: medication.careSetting?.uuid,
        commonMedicationName: medication.drug?.display,
        dateActivated: new Date(),
        display: medication.drug?.display,
        dosage: medication.dose,
        drug: medication.drug,
        duration: medication.duration,
        durationUnit: {
          value: medication.durationUnits?.display,
          valueCoded: medication.durationUnits?.uuid,
        },
        frequency: {
          value: medication.frequency?.display,
          valueCoded: medication.frequency?.uuid,
        },
        freeTextDosage:
          medication.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        indication: medication.orderReasonNonCoded,
        isFreeTextDosage: medication.dosingType === 'org.openmrs.FreeTextDosingInstructions',
        numRefills: medication.numRefills,
        orderer: medication.orderer?.uuid,
        patientInstructions:
          medication.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? medication.dosingInstructions : '',
        pillsDispensed: medication.quantity,
        previousOrder: null,
        quantityUnits: {
          value: medication.quantityUnits?.display,
          valueCoded: medication.quantityUnits?.uuid,
        },
        route: {
          value: medication.route?.display,
          valueCoded: medication.route?.uuid,
        },
        unit: {
          value: medication.doseUnits?.display,
          valueCoded: medication.doseUnits?.uuid,
        },
        uuid: medication.uuid,
      },
    ]);
    openOrderBasket();
  }, [items, setItems, medication, openOrderBasket]);

  return (
    <OverflowMenu
      align="left"
      aria-label="Actions menu"
      flipped
      selectorPrimaryFocus="#modify"
      size={isTablet ? 'lg' : 'md'}
    >
      {showModifyButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket}
          id="modify"
          itemText={t('modify', 'Modify')}
          onClick={handleModifyClick}
        />
      )}
      {showReorderButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket}
          id="reorder"
          itemText={t('reorder', 'Reorder')}
          onClick={handleReorderClick}
        />
      )}
      {showDiscontinueButton && (
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={alreadyInBasket}
          hasDivider
          id="discontinue"
          isDelete
          itemText={t('discontinue', 'Discontinue')}
          onClick={handleDiscontinueClick}
        />
      )}
    </OverflowMenu>
  );
}

export default MedicationsDetailsTable;
