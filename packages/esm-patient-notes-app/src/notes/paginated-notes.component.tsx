import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from '@carbon/react';
import { orderBy } from 'lodash-es';
import { formatDate, formatTime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import type { PatientNote } from '../types';
import styles from './notes-overview.scss';

interface PaginatedNotes {
  notes: Array<PatientNote>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const PaginatedNotes: React.FC<PaginatedNotes> = ({ notes, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';

  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const tableHeaders = [
    {
      key: 'encounterDate',
      header: t('date', 'Date'),
    },
    {
      key: 'diagnoses',
      header: t('diagnoses', 'Diagnoses'),
    },
  ];

  const sortDate = (myArray, order) =>
    order === 'ASC'
      ? orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['desc'])
      : orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['asc']);

  const { key, order } = sortParams;

  const sortedData =
    key === 'encounterDate'
      ? sortDate(notes, order)
      : order === 'DESC'
        ? orderBy(notes, [key], ['desc'])
        : orderBy(notes, [key], ['asc']);

  function customSortRow(
    cellA,
    cellB,
    {
      sortDirection,
      sortStates,
    }: {
      sortDirection: string;
      sortStates: any;
      locale: string;
    },
  ) {
    const key = Object.keys(sortStates).find((k) => sortStates[k] === sortDirection);
    setSortParams({ key: key ?? '', order: sortDirection });
    return 0;
  }

  const { results: paginatedNotes, goTo, currentPage } = usePagination(sortedData, pageSize);
  const tableRows = React.useMemo(
    () =>
      paginatedNotes?.map((note) => ({
        ...note,
        id: `${note.id}`,
        encounterDate: formatDate(parseDate(note.encounterDate), { mode: 'wide' }),
        diagnoses: note.diagnoses ? note.diagnoses : '--',
      })),
    [paginatedNotes],
  );

  return (
    <>
      <DataTable
        rows={tableRows}
        sortRow={customSortRow}
        headers={tableHeaders}
        isSortable
        size={isTablet ? 'lg' : 'sm'}
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
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      className={classNames(styles.productiveHeading01, styles.text02)}
                      {...getHeaderProps({
                        header,
                      })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
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
                        colSpan={headers.length + 1}
                        {...getExpandedRowProps({ row })}
                      >
                        <div className={styles.container} key={i}>
                          {tableRows?.[i]?.encounterNote ? (
                            <div className={styles.copy}>
                              <span className={styles.content}>{tableRows?.[i]?.encounterNote}</span>
                              <span className={styles.metadata}>
                                {formatTime(new Date(tableRows?.[i]?.encounterNoteRecordedAt))} &middot;{' '}
                                {tableRows?.[i]?.encounterProvider}, {tableRows?.[i]?.encounterProviderRole}
                              </span>
                            </div>
                          ) : (
                            <span className={styles.copy}>{t('noVisitNoteToDisplay', 'No visit note to display')}</span>
                          )}
                        </div>
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={notes.length}
        currentItems={paginatedNotes.length}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        dashboardLinkUrl={pageUrl}
        dashboardLinkLabel={urlLabel}
      />
    </>
  );
};

export default PaginatedNotes;
