import {
  DataTable,
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
  deleteAttachment: (attachment: Attachment) => void;
  onAttachmentSelect: (attachment: Attachment) => void;
}

const AttachmentsTableOverview: React.FC<AttachmentsTableOverviewProps> = ({
  attachments,
  isLoading,
  deleteAttachment,
  onAttachmentSelect,
}) => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      attachments.map((attachment) => ({
        id: attachment.id,
        fileName: (
          <span
            role="button"
            tabIndex={0}
            className={styles.link}
            onClick={() => {
              if (attachment.bytesContentFamily === 'IMAGE') {
                onAttachmentSelect(attachment);
              } else {
                window.open(attachment.src, '_blank');
              }
            }}
          >
            {attachment.title}
          </span>
        ),
        type: attachment.bytesContentFamily,
        dateUploaded: attachment.dateTime,
      })),
    [attachments, onAttachmentSelect],
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
                    <OverflowMenu size="sm" flipped>
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
