import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Tile,
} from '@carbon/react';
import { type Attachment, ResponsiveWrapper, useLayoutType } from '@openmrs/esm-framework';
import { compare, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { type AttachmentTableData } from '../utils';
import styles from './attachments-table-overview.scss';

interface AttachmentsTableOverviewProps {
  attachments: Array<AttachmentTableData>;
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
        dateUploaded: {
          content: attachment.dateTime,
          sortKey: new Date(attachment.dateTimeValue).getTime(),
        },
      })),
    [attachments, onOpenAttachment, responsiveSize],
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
        isSortable: true,
      },
    ],
    [t],
  );

  const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
    if (sortDirection === sortStates.DESC) {
      return compare(cellA?.sortKey, cellB?.sortKey);
    }
    return compare(cellB?.sortKey, cellA?.sortKey);
  };

  if (!rows.length) {
    return (
      <ResponsiveWrapper>
        <Tile className={styles.emptyState}>
          <EmptyDataIllustration />
          <p className={styles.emptyStateContent}>
            {t('noAttachmentsToDisplay', 'There are no attachments to display for this patient')}
          </p>
        </Tile>
      </ResponsiveWrapper>
    );
  }

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
        sortRow={sortRow}
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
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
              {rows.map((row, indx) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                  ))}
                  <TableCell className="cds--table-column-menu">
                    <OverflowMenu flipped size={responsiveSize}>
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
