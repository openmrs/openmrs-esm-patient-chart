import React, { FunctionComponent } from 'react';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/es/components/DataTable';
import styles from './notes-overview.scss';
import { usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from './pagination-see-all.component';
import { PatientNote } from './encounter.resource';
import { useTranslation } from 'react-i18next';
import { formatNotesDate } from './notes-helper';

interface FormsProps {
  notes: Array<PatientNote>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const NotesPagination: FunctionComponent<FormsProps> = ({ notes, pageSize, pageUrl, urlLabel }) => {
  const getRowItems = (rows: Array<PatientNote>) => {
    return rows.map((row) => ({
      ...row,
      encounterDate: formatNotesDate(row.encounterDate),
    }));
  };

  const { results, goTo, currentPage } = usePagination(notes, pageSize);
  const { t } = useTranslation();
  const headers = [
    {
      key: 'encounterDate',
      header: t('date', 'Date'),
    },
    {
      key: 'encounterType',
      header: t('encounterType', 'Encounter type'),
    },
    {
      key: 'encounterLocation',
      header: t('location', 'Location'),
    },
    {
      key: 'encounterAuthor',
      header: t('author', 'Author'),
    },
  ];

  return (
    <div>
      <TableContainer>
        <DataTable rows={getRowItems(results)} headers={headers} isSortable={true} size="short" useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={`${styles.productiveHeading01} ${styles.text02}`}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      </TableContainer>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={notes.length}
        currentItems={results.length}
        pageUrl={pageUrl}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        urlLabel={urlLabel}
      />
    </div>
  );
};

export default NotesPagination;
