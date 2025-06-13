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
} from '@carbon/react';
import { type TableHeaderType, type TableRow as TableRowType } from '../types';
import styles from './table.scss';

interface EncounterListDataTableProps {
  tableHeaders: Array<TableHeaderType>;
  tableRows: Array<TableRowType>;
}

export const EncounterListDataTable: React.FC<EncounterListDataTableProps> = ({ tableHeaders, tableRows }) => {
  return (
    <TableContainer>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="md">
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader
                    key={index}
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
              {rows.map((row) => (
                <TableRow key={row.id}>
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
  );
};
