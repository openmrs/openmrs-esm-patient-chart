import React from 'react';
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
  Tile,
} from '@carbon/react';
import styles from './forms-table.scss';
import { useTranslation } from 'react-i18next';

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
  }>;
  isTablet: boolean;
  handleSearch: (search: string) => void;
  handleFormOpen: (formUuid: string, encounterUuid: string, formName: string) => void;
}

const FormsTable = ({ tableHeaders, tableRows, isTablet, handleSearch, handleFormOpen }: FormsTableProps) => {
  const { t } = useTranslation();
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
                    onChange={(event: React.ChangeEvent<HTMLFormElement>) => handleSearch(event.target.value)}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()} className={styles.table}>
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
                          handleFormOpen(row.id, '', tableRows[i].formName);
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
          </TableContainer>
          {rows?.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noMatchingFormsToDisplay', 'No matching forms to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : null}
        </>
      )}
    </DataTable>
  );
};

export default FormsTable;
