import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Tag,
  type DataTableHeader,
  type DataTableSortState,
} from '@carbon/react';
import {
  formatDate,
  isDesktop as isDesktopLayout,
  parseDate,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useAllEncounters } from '../visit/visits-widget/past-visits-components/encounters-table/encounters-table.resource';
import styles from './diagnosis-overview.scss';

interface DiagnosisTableRow {
  id: string;
  display: string;
  rank: string;
  certainty: string;
  date: string;
  dateRender: string;
  encounterType: string;
  provider: string;
}

interface DiagnosisTableHeader {
  key: keyof DiagnosisTableRow;
  header: string;
  isSortable?: boolean;
  sortFunc?: (valueA: DiagnosisTableRow, valueB: DiagnosisTableRow) => number;
}

interface DiagnosisOverviewProps {
  patientUuid: string;
}

function useDiagnosisSorting(tableHeaders: Array<DiagnosisTableHeader>, tableRows: Array<DiagnosisTableRow>) {
  const [sortParams, setSortParams] = useState<{
    key: string;
    sortDirection: DataTableSortState;
  }>({ key: '', sortDirection: 'NONE' });

  const sortRow = (cellA: any, cellB: any, { key, sortDirection }: { key: string; sortDirection: DataTableSortState }) => {
    setSortParams({ key, sortDirection });
    return 0;
  };

  const sortedRows = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    const { key, sortDirection } = sortParams;
    const tableHeader = tableHeaders.find((h) => h.key === key);

    if (!tableHeader || !tableHeader.sortFunc) {
      return tableRows;
    }

    return tableRows?.slice().sort((a, b) => {
      const sortingNum = tableHeader.sortFunc(a, b);
      return sortDirection === 'DESC' ? sortingNum : -sortingNum;
    });
  }, [sortParams, tableRows, tableHeaders]);

  return {
    sortedRows,
    sortRow,
  };
}

const DiagnosisOverview: React.FC<DiagnosisOverviewProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('diagnoses', 'Diagnoses');
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;

  const { data: allEncounters, isLoading, error } = useAllEncounters(patientUuid);

  const headers: Array<DiagnosisTableHeader> = useMemo(
    () => [
      {
        key: 'display',
        header: t('diagnosis', 'Diagnosis'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'rank',
        header: t('rank', 'Rank'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.rank?.localeCompare(valueB.rank),
      },
      {
        key: 'certainty',
        header: t('certainty', 'Certainty'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.certainty?.localeCompare(valueB.certainty),
      },
      {
        key: 'dateRender',
        header: t('date', 'Date'),
        isSortable: true,
        sortFunc: (valueA, valueB) => new Date(valueA.date).getTime() - new Date(valueB.date).getTime(),
      },
      {
        key: 'provider',
        header: t('provider', 'Provider'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.provider?.localeCompare(valueB.provider),
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    if (!allEncounters) {
      return [];
    }

    const extractedDiagnoses: Array<DiagnosisTableRow> = [];

    allEncounters.forEach((encounter) => {
      if (encounter.diagnoses && encounter.diagnoses.length > 0) {
        encounter.diagnoses.forEach((diag) => {
          if (!diag.voided) {
            extractedDiagnoses.push({
              id: diag.uuid,
              display: diag.display || diag.diagnosis?.coded?.display || '--',
              rank:
                diag.rank === 1
                  ? t('primary', 'Primary')
                  : diag.rank === 2
                  ? t('secondary', 'Secondary')
                  : String(diag.rank || '--'),
              certainty: diag.certainty
                ? diag.certainty.charAt(0).toUpperCase() + diag.certainty.slice(1).toLowerCase()
                : '--',
              date: encounter.encounterDatetime,
              dateRender: encounter.encounterDatetime
                ? formatDate(parseDate(encounter.encounterDatetime), { mode: 'wide', time: 'for today' })
                : '--',
              encounterType: encounter.encounterType?.display || '--',
              provider:
                encounter.encounterProviders && encounter.encounterProviders.length > 0
                  ? encounter.encounterProviders[0].provider?.person?.display || '--'
                  : '--',
            });
          }
        });
      }
    });

    // Default sorting: Newest encounters first
    return extractedDiagnoses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEncounters, t]);

  const { sortedRows, sortRow } = useDiagnosisSorting(headers, tableRows);
  const pageSize = 10;
  const { results: paginatedDiagnoses, goTo, currentPage } = usePagination(sortedRows, pageSize);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (tableRows.length === 0) {
    return <EmptyState displayText={t('diagnoses_lower', 'diagnoses')} headerTitle={headerTitle} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span />
      </CardHeader>
      <DataTable
        aria-label="diagnoses overview"
        headers={headers}
        isSortable
        overflowMenuOnHover={isDesktop}
        rows={paginatedDiagnoses}
        size={isTablet ? 'lg' : 'sm'}
        sortRow={sortRow}
        useZebraStyles
      >
        {({ rows, headers: renderedHeaders, getHeaderProps, getTableProps }) => (
          <>
            <TableContainer className={styles.tableContainer}>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {(renderedHeaders as Array<DataTableHeader & DiagnosisTableHeader>).map((header) => (
                      <TableHeader
                        key={header.key}
                        className={styles.productiveHeading01}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'rank') {
                          const isPrimary = cell.value === t('primary', 'Primary');
                          return (
                            <TableCell key={cell.id}>
                              <Tag type={isPrimary ? 'teal' : 'cool-gray'} size="sm">
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        if (cell.info.header === 'certainty') {
                          const isConfirmed = cell.value?.toLowerCase() === 'confirmed';
                          return (
                            <TableCell key={cell.id}>
                              <Tag type={isConfirmed ? 'green' : 'blue'} size="sm">
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noDiagnosesToDisplay', 'No diagnoses to display')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedDiagnoses.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
        totalItems={sortedRows.length}
      />
    </div>
  );
};

export default DiagnosisOverview;
