import React, { useMemo } from 'react';
import {
  Button,
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
} from '@carbon/react';
import { type Attachment, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './attachments-table-overview.scss';

interface AttachmentsTableOverviewProps {
  attachments: Array<Attachment>;
  isLoading: boolean;
  onDeleteAttachment: (attachment: Attachment) => void;
  onOpenAttachment: (attachment: Attachment) => void;
}

const AttachmentsTableOverview: React.FC<AttachmentsTableOverviewProps> = ({
  attachments,
  isLoading,
  onDeleteAttachment,
  onOpenAttachment,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const rows = useMemo(
    () =>
      attachments.map((attachment) => ({
        id: attachment.id,
        fileName: (
          <Button
            className={styles.link}
            kind="ghost"
            onClick={() => onOpenAttachment(attachment)}
            size={responsiveSize}
          >
            {attachment.filename}
          </Button>
        ),
        type: attachment.bytesContentFamily,
        dateUploaded: attachment.dateTime,
      })),
    [attachments, onOpenAttachment],
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
        rows={rows}
        headers={headers}
        overflowMenuOnHover={isDesktop}
        // `xs` on desktop to account for the overflow menu
        size={isTablet ? 'lg' : 'xs'}
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
                    <OverflowMenu align="left" flipped size={responsiveSize}>
                      <OverflowMenuItem
                        className={styles.menuItem}
                        itemText={t('delete', 'Delete')}
                        isDelete
                        onClick={() => onDeleteAttachment(attachments[indx])}
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
