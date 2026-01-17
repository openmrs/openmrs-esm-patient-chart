import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGrowthChartData } from './growth-chart.resource';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  DataTableSkeleton,
  Tile,
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { transformGrowthChartData, type TableRowData } from './growth-chart.utils';
import { usePagination } from '@openmrs/esm-framework';
import styles from './growth-chart-main.scss';

interface GrowthChartProps {
  patientUuid: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGrowthChartData(patientUuid);

  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'height', header: t('height', 'Height') },
    { key: 'weight', header: t('weight', 'Weight') },
  ];

  const tableRows: TableRowData[] = useMemo(() => {
    if (!data) return [];

    const { heights, weights } = data;
    return transformGrowthChartData(heights, weights);
  }, [data]);

  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = React.useState(10);
  const { results: paginatedRows, goTo, currentPage } = usePagination(tableRows, pageSize);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.patient) {
    return <Tile>{t('errorLoadingData', 'Error loading growth chart data')}</Tile>;
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('growthChart', 'Growth Chart')}>
        <></>
      </CardHeader>
      <div style={{ marginTop: '1rem' }}>
        <DataTable rows={paginatedRows} headers={tableHeaders} isSortable>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer title={t('growthData', 'Growth Data')}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedRows.length}
          pageNumber={currentPage}
          pageSize={pageSize}
          totalItems={tableRows.length}
          onPageNumberChange={({ page, pageSize }) => {
            goTo(page);
            setPageSize(pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default GrowthChart;
