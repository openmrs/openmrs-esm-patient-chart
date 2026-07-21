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
  Tag,
} from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import type { FormEntryConfigSchema } from '../config-schema';
import { type Form } from '../types';
import FormPinButton from './form-pin-button.component';
import styles from './forms-table.scss';

/*
 * For automated translations:
 * t('formContextTags', 'Form context')
 */

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
    contextTags?: string[];
  }>;
  isTablet: boolean;
  handleSearch: (search: string) => void;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
}

const FormsTable = ({ tableHeaders, tableRows, isTablet, handleSearch, handleFormOpen }: FormsTableProps) => {
  const { t } = useTranslation();
  const { enableFormFavorites } = useConfig<FormEntryConfigSchema>();

  const allHeaders = [
    ...tableHeaders,
    ...(enableFormFavorites ? [{ header: '', key: 'pin' }] : []),
  ];

  return (
    <DataTable rows={tableRows} headers={allHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
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
                      <TableHeader
                        key={header.key}
                        {...getHeaderProps({ header })}
                        className={header.key === 'pin' ? styles.pinHeader : undefined}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow {...getRowProps({ row })}>
                      <TableCell key={row.cells[0].id}>
                        <div className={styles.formNameCell}>
                          <div className={styles.formNameRow}>
                            <Link
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleFormOpen(tableRows[i].form, '')}
                              role="presentation"
                              className={styles.formName}
                            >
                              {tableRows[i]?.formName}
                            </Link>
                            {(tableRows[i]?.contextTags?.length ?? 0) > 0 && (
                              <div className={styles.contextTags} aria-label={t('formContextTags', 'Form context')}>
                                {(tableRows[i]?.contextTags ?? []).map((tag, idx) => (
                                  <Tag key={`${tag}-${idx}`} type="blue" size="sm">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={styles.editCell}>
                        <span>{row.cells[1].value ?? t('never', 'Never')}</span>
                      </TableCell>
                      {enableFormFavorites && (
                        <TableCell className={styles.pinCell}>
                          <FormPinButton form={tableRows[i].form} isTablet={isTablet} />
                        </TableCell>
                      )}
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
