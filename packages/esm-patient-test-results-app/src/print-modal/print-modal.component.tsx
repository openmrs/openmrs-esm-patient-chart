import { useTranslation } from 'react-i18next';
import React, { useMemo, useRef, useState } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  DatePickerInput,
  DatePicker,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { age, formatDate, useConfig, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';
import usePanelData from '../panel-view/usePanelData';
import { useReactToPrint } from 'react-to-print';
import styles from './print-modal.scss';

function PrintModal({ patientUuid, closeDialog }) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { panels } = usePanelData();
  const printContainerRef = useRef(null);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const headerTitle = t('testResults_title', 'Test Results');
  const datePickerFormat = 'm/d/y';

  const tableHeaders = [
    { key: 'testType', header: 'Test Type' },
    { key: 'date', header: 'Date' },
    { key: 'result', header: 'Result' },
    { key: 'normalRange', header: 'Normal Range' },
  ];

  const handlePrint = useReactToPrint({
    content: () => printContainerRef.current,
  });

  const patient = usePatient(patientUuid);

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

  const testResults = useMemo(() => {
    if (selectedFromDate && selectedToDate) {
      return panels
        .filter((panel) => {
          const panelDate = new Date(panel.effectiveDateTime);
          return panelDate >= new Date(selectedFromDate) && panelDate <= new Date(selectedToDate);
        })
        .map((panel) => formatPanelForDisplay(panel));
    }
    return panels.map((panel) => formatPanelForDisplay(panel));
  }, [panels, selectedFromDate, selectedToDate]);

  return (
    <div>
      <ModalHeader closeModal={closeDialog} title={t('printTestResults', 'Print test results')} />
      <ModalBody className={styles.modalBody}>
        <DatePicker
          className={styles.datePickers}
          datePickerType="range"
          light={isTablet}
          dateFormat={datePickerFormat}
          value={[selectedFromDate, selectedToDate]}
          onChange={([startDate, endDate]) => {
            setSelectedFromDate(startDate);
            setSelectedToDate(endDate);
          }}
        >
          <DatePickerInput labelText={t('startDate', 'Start date')} placeholder={datePickerFormat} />
          <DatePickerInput labelText={t('endDate', 'End date')} placeholder={datePickerFormat} />
        </DatePicker>
        <div ref={printContainerRef}>
          <div className={styles.printPage}>
            <header className={styles.header}>
              {/* OpenMRS Logo */}
              <svg role="img" width={110} height={40} viewBox="0 0 380 119" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M40.29 40.328a27.755 27.755 0 0 1 19.688-8.154c7.669 0 14.613 3.102 19.647 8.116l.02-18.54A42.835 42.835 0 0 0 59.978 17c-7.089 0-13.813 1.93-19.709 4.968l.021 18.36ZM79.645 79.671a27.744 27.744 0 0 1-19.684 8.154c-7.67 0-14.614-3.101-19.651-8.116l-.02 18.54A42.857 42.857 0 0 0 59.96 103a42.833 42.833 0 0 0 19.672-4.751l.013-18.578ZM40.328 79.696c-5.038-5.037-8.154-11.995-8.154-19.685 0-7.669 3.102-14.612 8.116-19.65l-18.54-.02A42.85 42.85 0 0 0 17 60.012a42.819 42.819 0 0 0 4.752 19.672l18.576.013ZM79.634 40.289a27.753 27.753 0 0 1 8.154 19.688 27.744 27.744 0 0 1-8.117 19.646l18.542.02a42.842 42.842 0 0 0 4.749-19.666c0-7.09-1.714-13.779-4.751-19.675l-18.577-.013ZM156.184 60.002c0-8.748-6.118-15.776-15.025-15.776-8.909 0-15.025 7.028-15.025 15.776 0 8.749 6.116 15.78 15.025 15.78 8.907 0 15.025-7.031 15.025-15.78Zm-34.881 0c0-11.482 8.318-19.958 19.856-19.958 11.536 0 19.855 8.477 19.855 19.959 0 11.484-8.319 19.964-19.855 19.964-11.538 0-19.856-8.48-19.856-19.965ZM179.514 75.54c5.507 0 9.05-4.14 9.05-9.482 0-5.341-3.543-9.483-9.05-9.483-5.505 0-9.046 4.142-9.046 9.483 0 5.342 3.541 9.482 9.046 9.482ZM166.22 53.306h4.248v3.704h.11c2.344-2.725 5.449-4.36 9.154-4.36 8.014 0 13.408 5.67 13.408 13.408 0 7.63-5.613 13.406-12.752 13.406-4.58 0-8.231-2.29-9.81-5.178h-.11V90.87h-4.248V53.306ZM217.773 63.768c-.163-4.305-3-7.193-7.686-7.193-4.685 0-7.79 2.888-8.335 7.193h16.021Zm3.653 10.412c-3.001 3.868-6.596 5.284-11.339 5.284-8.01 0-12.914-5.993-12.914-13.406 0-7.901 5.559-13.407 13.08-13.407 7.196 0 12.096 4.906 12.096 13.354v1.362h-20.597c.325 4.413 3.704 8.173 8.335 8.173 3.65 0 6.105-1.307 8.12-3.868l3.219 2.508ZM227.854 59.356c0-2.346-.216-4.36-.216-6.05h4.031c0 1.363.11 2.777.11 4.195h.11c1.144-2.505 4.306-4.85 8.5-4.85 6.705 0 9.699 4.252 9.699 10.41v15.748h-4.248v-15.31c0-4.253-1.856-6.924-5.833-6.924-5.503 0-7.903 3.979-7.903 9.811V78.81h-4.25V59.356ZM259.211 41.008h6.708L278.8 70.791h.107l12.982-29.782h6.549v37.99h-4.506V47.124h-.106L280.192 79h-2.738l-13.629-31.875h-.107V79h-4.507V41.01ZM312.392 57.752h4.023c4.992 0 11.487 0 11.487-6.282 0-5.47-4.776-6.276-9.177-6.276h-6.333v12.558Zm-4.506-16.744h9.711c7.352 0 15.132 1.072 15.132 10.462 0 5.527-3.594 9.125-9.495 10.037L334.018 79h-5.525l-10.304-17.063h-5.797V79h-4.506V41.01ZM358.123 47.712c-1.506-2.413-4.187-3.486-6.926-3.486-3.973 0-8.1 1.88-8.1 6.385 0 3.49 1.931 5.047 7.994 6.98 5.903 1.878 11.377 3.809 11.377 11.267 0 7.567-6.495 11.11-13.36 11.11-4.402 0-9.125-1.45-11.7-5.262l3.862-3.165c1.61 2.794 4.83 4.24 8.105 4.24 3.862 0 8.263-2.253 8.263-6.601 0-4.669-3.165-5.474-9.928-7.728-5.366-1.771-9.442-4.134-9.442-10.463 0-7.298 6.277-10.945 12.929-10.945 4.241 0 7.836 1.178 10.625 4.45l-3.699 3.218Z"
                />
              </svg>

              <div className={styles.patientDetails}>
                <span className={styles.name}>{patientDetails?.name}</span>
                <span className={styles.patientInfo}>
                  {patientDetails?.gender}, {patientDetails?.age}, {patientDetails?.identifiers}{' '}
                </span>
              </div>

              <div className={styles.printedBy}>
                {t('printedBy', 'Printed by')}
                <span className={styles.printedBy}>
                  {session.user.display} {t('onDate', 'on')} {formatDate(new Date(), { noToday: true })}
                </span>
              </div>
            </header>

            <div className={styles.subheader}>
              <h4>{headerTitle}</h4>
            </div>
          </div>
          {testResults?.length ? (
            <DataTable
              rows={testResults}
              headers={tableHeaders}
              isSortable
              size={isTablet ? 'lg' : 'sm'}
              useZebraStyles
            >
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <TableContainer>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          ) : (
            <p className={styles.emptyState}>
              {t('thereAreNoTestResultsFound', 'There are no test results found within the specified date range')}
            </p>
          )}
        </div>
      </ModalBody>
      {testResults?.length ? (
        <ModalFooter>
          <Button kind="secondary" onClick={closeDialog}>
            {t('cancel', 'Cancel')}
          </Button>

          <Button kind="primary" onClick={handlePrint}>
            {t('print', 'Print')}
          </Button>
        </ModalFooter>
      ) : null}
    </div>
  );
}
export default PrintModal;

const formatPanelForDisplay = (panel) => {
  return {
    id: panel.id,
    testType: panel.name,
    date: formatDate(new Date(panel.effectiveDateTime)),
    result: panel.value,
    normalRange: panel?.meta?.range ?? '--',
  };
};
