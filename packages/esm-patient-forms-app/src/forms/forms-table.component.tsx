import React, { useMemo } from 'react';
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

interface TableRowData {
  id: string;
  lastCompleted: string;
  formName: string;
  formUuid: string;
  encounterUuid: string;
  form: Form;
  contextTags?: string[];
}

interface FormsTableProps {
  tableHeaders: Array<{
    header: string;
    key: string;
  }>;
  tableRows: Array<TableRowData>;
  isTablet: boolean;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
}

const FormsTable = ({ tableHeaders, tableRows, isTablet, handleFormOpen }: FormsTableProps) => {
  const { t } = useTranslation();
  const { enableFormFavorites } = useConfig<FormEntryConfigSchema>();

  // Build a lookup map so we can find row data by id regardless of how
  // Carbon DataTable re-orders its internal rows array.
  const rowDataById = useMemo(
    () => new Map<string, TableRowData>(tableRows.map((r) => [r.id, r])),
    [tableRows],
  );

  const allHeaders = [
    ...tableHeaders,
    ...(enableFormFavorites ? [{ header: '', key: 'pin' }] : []),
  ];

  return (
    <DataTable rows={tableRows} headers={allHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <TableContainer className={styles.tableContainer}>
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
                {rows.map((row) => {
                  const rowData = rowDataById.get(row.id);
                  if (!rowData) return null;

                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableCell>
                        <div className={styles.formNameCell}>
                          <div className={styles.formNameRow}>
                            <Link
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleFormOpen(rowData.form, rowData.encounterUuid ?? '')}
                              role="presentation"
                              className={styles.formName}
                            >
                              {rowData.formName}
                            </Link>
                            {(rowData.contextTags?.length ?? 0) > 0 && (
                              <div className={styles.contextTags} aria-label={t('formContextTags', 'Form context')}>
                                {rowData.contextTags.map((tag, idx) => (
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
                        <span>{rowData.lastCompleted ?? t('never', 'Never')}</span>
                      </TableCell>
                      {enableFormFavorites && (
                        <TableCell className={styles.pinCell}>
                          <FormPinButton form={rowData.form} isTablet={isTablet} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
    </DataTable>
  );
};

export default FormsTable;
