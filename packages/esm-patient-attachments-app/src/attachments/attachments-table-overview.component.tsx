import { formatDate } from '@openmrs/esm-framework';
import {
  DataTable,
  Filename,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Attachment } from './attachments-types';
import styles from './attachments-table-overview.scss';

interface AttachmentsTableOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
}

const AttachmentsTableOverview: React.FC<AttachmentsTableOverviewProps> = ({ attachments, isLoading }) => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.title,
        type: attachment.bytesContentFamily,
        dateUploaded: attachment.dateTime,
      })),
    [attachments],
  );

  const headers = useMemo(
    () => [
      {
        key: 'fileName',
        header: t('fileName', 'File name'),
      },
      {
        key: 'type',
        header: t('type', 'Type'),
      },
      {
        key: 'dateUploaded',
        header: t('dateUploaded', 'Date uploaded'),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className={styles.attachmentTable}>
        <DataTableSkeleton className={styles.dataTableSkeleton} />
      </div>
    );
  }

  return (
    <TableContainer>
      <DataTable rows={rows} headers={headers} size="sm">
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
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
                <TableRow key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                  ))}
                  <TableCell>
                    <OverflowMenu>
                      <OverflowMenuItem itemText="Check" />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </TableContainer>
  );
};

export default AttachmentsTableOverview;
