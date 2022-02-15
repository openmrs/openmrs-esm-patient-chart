import React from 'react';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import styles from './notes-overview.scss';
import { formatDatetime, parseDate, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { PatientNote } from '../types';

interface FormsProps {
  notes: Array<PatientNote>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const NotesPagination: React.FC<FormsProps> = ({ notes, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const { results: paginatedNotes, goTo, currentPage } = usePagination(notes, pageSize);

  const tableHeaders = [
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

  const tableRows = React.useMemo(
    () =>
      paginatedNotes.map((note) => ({
        ...note,
        encounterDate: formatDatetime(parseDate(note.encounterDate)),
      })),
    [paginatedNotes],
  );

  return (
    <div>
      <TableContainer>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short" useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()} useZebraStyles>
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
        currentItems={paginatedNotes.length}
        pageUrl={pageUrl}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        urlLabel={urlLabel}
      />
    </div>
  );
};

export default NotesPagination;
