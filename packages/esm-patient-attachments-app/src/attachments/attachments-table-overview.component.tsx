import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import {
  type Attachment,
  getCoreTranslation,
  ResponsiveWrapper,
  TrashCanIcon,
  useLayoutType,
} from '@openmrs/esm-framework';
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
  const responsiveSize = isTablet ? 'lg' : 'md';

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
        actions: (
          <IconButton
            align="top-end"
            kind="ghost"
            label={getCoreTranslation('delete')}
            onClick={() => onDeleteAttachment(attachment)}
            size={responsiveSize}
          >
            <TrashCanIcon size={16} />
          </IconButton>
        ),
      })),
    [attachments, onDeleteAttachment, onOpenAttachment, responsiveSize],
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
        isSortable: true,
      },
      {
        key: 'actions',
        header: '',
      },
    ],
    [t],
  );

  const sortRow = (
    cellA: { sortKey?: number },
    cellB: { sortKey?: number },
    { sortDirection, sortStates }: { sortDirection: string; sortStates: { DESC: string } },
  ) => {
    if (sortDirection === sortStates.DESC) {
      return compare(cellA?.sortKey, cellB?.sortKey);
    }
    return compare(cellB?.sortKey, cellA?.sortKey);
  };

  if (isLoading) {
    return (
      <div className={styles.attachmentTable}>
        <DataTableSkeleton className={styles.dataTableSkeleton} compact={isDesktop} zebra />
      </div>
    );
  }

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

  return (
    <DataTable rows={rows} headers={headers} overflowMenuOnHover={isDesktop} size={responsiveSize} sortRow={sortRow}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
        <TableContainer>
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    key={header.key}
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
                <TableRow key={row.id} {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default AttachmentsTableOverview;
