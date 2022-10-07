import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableHeader,
  Dropdown,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { formatDatetime, formatTime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './encounters-table.scss';
import EncounterObservations from '../encounter-observations';

interface Encounter {
  datetime?: string;
  [key: string]: any;
}

interface EncountersTableProps {
  encounters: Array<Encounter>;
  showAllEncounters?: boolean;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

const transformEncounters = (inData) => {
  if (!inData) return [];
  return inData.map((item) => ({ ...item, id: item.uuid, datetime: formatDatetime(parseDate(item?.datetime)) }));
};

const EncountersTable: React.FC<EncountersTableProps> = ({ showAllEncounters, encounters }) => {
  const encountersCount = 20;
  const { t } = useTranslation();
  const encounterTypes = [...new Set(encounters?.map((encounter) => encounter.encounterType))]?.sort();
  const { results: paginatedEncounters, goTo, currentPage } = usePagination(encounters ?? [], encountersCount);
  const isTablet = useLayoutType() === 'tablet';

  const tableHeaders = [
    {
      id: 1,
      header: t('dateAndTime', 'Date & time'),
      key: 'encounterDatetime',
    },
    {
      id: 5,
      header: t('name', 'Name'),
      key: 'display',
    },
    {
      id: 3,
      header: t('encounterType', 'Encounter type'),
      key: 'encounterType.display',
    },
  ];

  if (!encounters?.length) {
    return <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noEncountersFound', 'No encounters found')}</p>;
  }

  const tableRows = transformEncounters(encounters);

  return (
    <DataTable
      data-floating-menu-container
      headers={tableHeaders}
      rows={tableRows}
      overflowMenuOnHover={!isTablet}
      size={isTablet ? 'lg' : 'xs'}
      useZebraStyles={true}
    >
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getToolbarProps, onInputChange }) => (
        <>
          <TableContainer className={styles.tableContainer}>
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                  size={isTablet ? 'lg' : 'sm'}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header, i) => (
                    <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  {showAllEncounters ? <TableExpandHeader /> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableExpandedRow
                        className={styles.expandedRow}
                        style={{ paddingLeft: isTablet ? '4rem' : '3rem' }}
                        colSpan={headers.length + 2}
                      >
                        <EncounterObservations observations={encounters[i].obs} />
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : null}
          {showAllEncounters ? (
            <PatientChartPagination
              currentItems={paginatedEncounters.length}
              onPageNumberChange={({ page }) => goTo(page)}
              pageNumber={currentPage}
              pageSize={encountersCount}
              totalItems={encounters.length}
            />
          ) : null}
        </>
      )}
    </DataTable>
  );
};

export default EncountersTable;
