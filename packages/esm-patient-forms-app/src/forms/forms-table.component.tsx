import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
} from '@carbon/react';
import styles from './forms-table.scss';
import { type CompletedFormInfo, type Form } from '../types';
import { usePagination } from '@openmrs/esm-framework';

interface PaginationLinks {
  next?: { uri: string };
  prev?: { uri: string };
}

interface FormsTableProps {
  tableHeaders: Array<{
    header: string;
    key: string;
  }>;
  tableRows: Array<{
    id: string;
    lastCompleted: string;
    formName: string;
    formUuid: string;
    encounterUuid: string;
    form: Form;
  }>;
  isTablet: boolean;
  handleSearch: (search: string) => void;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  currentPage: number;
  totalItems: number;
  completedForms: Array<CompletedFormInfo>;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchTerm: string;
}

const FormsTable = ({
  tableHeaders,
  tableRows,
  isTablet,
  handleSearch,
  handleFormOpen,
  totalItems,
  completedForms,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: FormsTableProps) => {
  const { t } = useTranslation();
  const { goTo } = usePagination(completedForms, pageSize);
  const pageSizes = [50];

  return (
    <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <>
          <TableContainer className={styles.tableContainer}>
            <div className={styles.toolbarWrapper}>
              <TableToolbar className={styles.tableToolbar}>
                <TableToolbarContent>
                  <TableToolbarSearch
                    className={styles.search}
                    expanded
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            {rows.length > 0 && (
              <Table aria-label="forms" {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow {...getRowProps({ row })}>
                      <TableCell key={row.cells[0].id}>
                        <Link
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            handleFormOpen(tableRows[i].form, '');
                          }}
                          role="presentation"
                          className={styles.formName}
                        >
                          {tableRows[i]?.formName}
                        </Link>
                      </TableCell>
                      <TableCell className={styles.editCell}>
                        <label>{row.cells[1].value ?? t('never', 'Never')}</label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            size="sm"
            pageSizes={pageSizes}
            totalItems={totalItems}
            onChange={({ page, pageSize: newPageSize }) => {
              if (newPageSize !== pageSize) {
                onPageSizeChange(newPageSize);
              }
              onPageChange(page);
              goTo(page);
            }}
          />
        </>
      )}
    </DataTable>
  );
};

export default FormsTable;
