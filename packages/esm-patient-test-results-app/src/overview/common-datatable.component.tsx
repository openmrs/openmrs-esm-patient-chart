import * as React from 'react';
import {
  DataTable,
  Table,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from 'carbon-components-react';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { OverviewPanelData } from '../overview/useOverviewData';
import styles from './common-datatable.scss';

interface CommonDataTableProps {
  data: Array<OverviewPanelData>;
  tableHeaders: Array<{
    key: string;
    header: string;
  }>;
  title?: string;
  toolbar?: React.ReactNode;
  description?: React.ReactNode;
}

const CommonDataTable: React.FC<CommonDataTableProps> = ({ title, data, description, toolbar, tableHeaders }) => (
  <DataTable rows={data} headers={tableHeaders} size="short">
    {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
      <TableContainer
        className={styles.tableContainer}
        title={title}
        description={description}
        {...getTableContainerProps()}
      >
        {toolbar}
        <Table {...getTableProps()} isSortable useZebraStyles>
          <colgroup className={styles.columns}>
            <col span={1} />
            <col span={1} />
            <col span={1} />
          </colgroup>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader key={header.key} {...getHeaderProps({ header })} isSortable>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TypedTableRow key={row.id} interpretation={data[i]?.interpretation} {...getRowProps({ row })}>
                {row.cells.map((cell) => (
                  <TableCell key={cell.id}>{cell.value}</TableCell>
                ))}
              </TypedTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DataTable>
);

const TypedTableRow: React.FC<{
  interpretation: OBSERVATION_INTERPRETATION;
}> = ({ interpretation, ...props }) => {
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return <TableRow {...props} className={styles['off-scale-high']} />;

    case 'CRITICALLY_HIGH':
      return <TableRow {...props} className={styles['critically-high']} />;

    case 'HIGH':
      return <TableRow {...props} className={styles['high']} />;

    case 'OFF_SCALE_LOW':
      return <TableRow {...props} className={styles['off-scale-low']} />;

    case 'CRITICALLY_LOW':
      return <TableRow {...props} className={styles['critically-low']} />;

    case 'LOW':
      return <TableRow {...props} className={styles['low']} />;

    case 'NORMAL':
    default:
      return <TableRow {...props} />;
  }
};

export default CommonDataTable;
