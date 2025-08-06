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
} from '@carbon/react';
import { type Form } from '../types';
import styles from './forms-table.scss';

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
  handleSearch?: (search: string) => void;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  customSearchComponent?: React.ReactNode;
  totalLoaded?: number;
}

const FormsTable = ({
  tableHeaders,
  tableRows,
  isTablet,
  handleSearch,
  handleFormOpen,
  customSearchComponent,
}: FormsTableProps) => {
  const { t } = useTranslation();
  return (
    <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <>
          {customSearchComponent && <div className={styles.customSearchWrapper}>{customSearchComponent}</div>}
          <TableContainer className={styles.tableContainer}>
            {!customSearchComponent && (
              <div className={styles.toolbarWrapper}>
                <TableToolbar className={styles.tableToolbar}>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      className={styles.search}
                      expanded
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        // Call the debounced handler from parent component
                        handleSearch?.(event.target.value);
                      }}
                      placeholder={t('searchThisList', 'Search this list')}
                      size="sm"
                      labelText={t('searchForms', 'Search forms')}
                    />
                  </TableToolbarContent>
                </TableToolbar>
              </div>
            )}
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
                            handleFormOpen(tableRows[i].form, null);
                          }}
                          role="presentation"
                          className={styles.formName}
                        >
                          {tableRows[i]?.formName}
                        </Link>
                      </TableCell>
                      <TableCell className={styles.editCell}>
                        <span>{row.cells[1].value ?? t('never', 'Never')}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      )}
    </DataTable>
  );
};

export default FormsTable;
