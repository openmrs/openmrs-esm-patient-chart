import {
  DataTable,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Popover,
} from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type Attachment } from '../attachments-types';
import styles from './attachments-table-overview.scss';

interface AttachmentsTableOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
  deleteAttachment: (attachment: Attachment) => void;
  openAttachment: (attachment: Attachment) => void;
}

const AttachmentsTableOverview: React.FC<AttachmentsTableOverviewProps> = ({
  attachments,
  isLoading,
  deleteAttachment,
  openAttachment,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const rows = useMemo(
    () =>
      attachments.map((attachment) => ({
        id: attachment.id,
        fileName: (
          <span role="button" tabIndex={0} className={styles.link} onClick={() => openAttachment(attachment)}>
            {attachment.title}
          </span>
        ),
        type: attachment.bytesContentFamily,
        dateUploaded: attachment.dateTime,
      })),
    [attachments, openAttachment],
  );

  const headers = useMemo(
    () => [
      {
        key: 'fileName',
        header: t('fileName', 'File name'),
        colSpan: 1,
      },
      {
        key: 'type',
        header: t('type', 'Type'),
        colSpan: 1,
      },
      {
        key: 'dateUploaded',
        header: t('dateUploaded', 'Date uploaded'),
        colSpan: 2,
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className={styles.attachmentTable}>
        <DataTableSkeleton className={styles.dataTableSkeleton} compact={isDesktop} zebra />
      </div>
    );
  }

  return (
    <TableContainer>
      <DataTable
        className={styles.attachmentTable}
        rows={rows}
        headers={headers}
        size={isTablet ? 'lg' : 'sm'}
        overflowMenuOnHover={isDesktop}
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    {...getHeaderProps({
                      header,
                      isSortable: header.isSortable,
                      colSpan: header.colSpan,
                    })}
                  >
                    {header.header?.content ?? header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, indx) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                  ))}
                  <TableCell className="cds--table-column-menu">
                    <OverflowMenu size={isTablet ? 'lg' : 'sm'} flipped enterDelayMs={1000000}>
                      <OverflowMenuItem
                        itemText={t('delete', 'Delete')}
                        isDelete
                        onClick={() => deleteAttachment(attachments[indx])}
                      />
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
