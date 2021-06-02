import React from 'react';
import DataTable, {
  TableContainer,
  Table,
  TableHead,
  TableExpandHeader,
  TableRow,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
} from 'carbon-components-react/es/components/DataTable';
import EncounterObservations from './encounter-observations.component';
import styles from '../visit-detail-overview.scss';

interface EncounterListProps {
  encounters: Array<{
    id: any;
    time: any;
    encounterType: string;
    provider: string;
  }>;
}

const EncounterListDataTable: React.FC<EncounterListProps> = ({ encounters }) => {
  const headerData = [
    {
      id: 1,
      header: 'Time',
      key: 'time',
    },
    {
      id: 2,
      header: 'Encounter Type',
      key: 'encounterType',
    },
    {
      id: 3,
      header: 'Provider',
      key: 'provider',
    },
  ];

  return (
    <DataTable rows={encounters} headers={headerData}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => {
        return (
          <TableContainer>
            <Table {...getTableProps()} useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                        <div style={{ width: '100%' }}>
                          <EncounterObservations encounterUuid={row.id} />
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            {encounters.length === 0 && <p className={styles.dataTableRow}>No encounters found.</p>}
          </TableContainer>
        );
      }}
    </DataTable>
  );
};

export default EncounterListDataTable;
