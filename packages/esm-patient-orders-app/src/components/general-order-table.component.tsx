import React, { useMemo } from 'react';
import styles from './general-order-table.scss';
import { type Order } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  DataTableSkeleton,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLabEncounter, useOrderConceptByUuid } from '../lab-results/lab-results.resource';
import { useLayoutType } from '@openmrs/esm-framework';

interface GeneralOrderProps {
  order: Order;
}

const GeneralOrderTable: React.FC<GeneralOrderProps> = ({ order }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingConcept } = useOrderConceptByUuid(order.concept.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(order.encounter.uuid);

  const tableHeaders: Array<{ key: string; header: string }> = [
    {
      key: 'orderName',
      header: order?.orderType?.display,
    },
    {
      key: 'instructions',
      header: t('instructions', 'Instructions'),
    },
    {
      key: 'referenceNumber',
      header: t('referenceNumberTableHeader', '{{orderType}} reference number', {
        orderType: order?.orderType?.display,
      }),
    },
  ];

  const obs = useMemo(() => {
    if (encounter && concept) {
      return encounter.obs?.find((obs) => obs.concept.uuid === concept.uuid);
    }
  }, [concept, encounter]);

  const rows = useMemo(() => {
    if (concept && concept.setMembers.length > 0) {
      return concept?.setMembers.map((memberConcept) => ({
        id: memberConcept.uuid,
        orderName: <div className={styles.type}>{memberConcept.display}</div>,
        instructions: '--',
        result: isLoadingResult ? (
          <SkeletonText />
        ) : (
          obs?.groupMembers?.find((obs) => obs.concept.uuid === memberConcept.uuid)?.value.display ?? '--'
        ),
        normalRange:
          memberConcept.hiNormal && memberConcept.lowNormal
            ? `${memberConcept.lowNormal} - ${memberConcept.hiNormal}`
            : 'N/A',
        referenceNumber: order?.accessionNumber,
      }));
    } else if (concept && concept.setMembers.length === 0) {
      return [
        {
          id: concept.uuid,
          orderName: <div className={styles.type}>{concept.display}</div>,
          instructions: order?.instructions ?? '--',
          result: isLoadingResult ? <SkeletonText /> : obs?.value.display ?? '--',
          normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
          referenceNumber: order?.accessionNumber,
        },
      ];
    } else {
      return [];
    }
  }, [concept, isLoadingResult, obs?.groupMembers, obs?.value.display, order?.accessionNumber, order?.instructions]);

  return (
    <div className={styles.order}>
      {isLoadingConcept ? (
        <DataTableSkeleton role="progressbar" compact={isTablet} zebra />
      ) : (
        <DataTable rows={rows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()} aria-label="orders">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} className={styles.cell}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}
    </div>
  );
};

export default GeneralOrderTable;
