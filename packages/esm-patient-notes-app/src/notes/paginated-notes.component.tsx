import React, { useState } from 'react';
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
import { formatDate, formatTime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import orderBy from 'lodash-es/orderBy';
import { PatientNote } from '../types';
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

  function customSortRow(noteA, noteB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
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
          rows,
          headers,
          getExpandHeaderProps,
          getTableProps,
          getTableContainerProps,
          getHeaderProps,
          getRowProps,
        }) => (
          <TableContainer {...getTableContainerProps}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      className={`${styles.productiveHeading01} ${styles.text02}`}
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
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
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
