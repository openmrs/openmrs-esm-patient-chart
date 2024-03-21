import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './test-order.scss';
import { type Order } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  DataTableSkeleton,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLabEncounterConcepts, useOrderConceptByUuid } from '../lab-results/lab-results.resource';
import { useLayoutType } from '@openmrs/esm-framework';
import { TableContainer } from '@carbon/react';

interface TestOrderProps {
  testOrder: Order;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(testOrder.concept.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounterConcepts(testOrder.encounter.uuid);

  const tableHeaders: Array<{ key: string; header: string }> = [
    {
      key: 'testType',
      header: t('testType', 'Test type'),
    },
    {
      key: 'result',
      header: t('result', 'Result'),
    },
    {
      key: 'normalRange',
      header: t('normalRange', 'Normal range'),
    },
  ];

  const testResultObs = useMemo(() => {
    if (encounter && concept) {
      return encounter.obs?.find((obs) => obs.concept.uuid === concept.uuid);
    }
  }, [concept]);

  const testRows = useMemo(() => {
    if (concept && concept.setMembers.length > 0) {
      return concept?.setMembers.map((memberConcept) => ({
        id: memberConcept.uuid,
        testType: <div className={styles.testType}>{memberConcept.display}</div>,
        result: isLoadingResult ? (
          <SkeletonText />
        ) : (
          testResultObs?.groupMembers?.find((obs) => obs.concept.uuid === memberConcept.uuid)?.value.display ?? '--'
        ),
        normalRange:
          memberConcept.hiNormal && memberConcept.lowNormal
            ? `${memberConcept.lowNormal} - ${memberConcept.hiNormal}`
            : 'N/A',
      }));
    } else if (concept && concept.setMembers.length === 0) {
      return [
        {
          id: concept.uuid,
          testType: <div className={styles.testType}>{concept.display}</div>,
          result: isLoadingResult ? <SkeletonText /> : testResultObs?.value.display ?? '--',
          normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
        },
      ];
    } else {
      return [];
    }
  }, [concept]);

  return (
    <div className={styles.testOrder}>
      {isLoadingTestConcepts ? (
        <DataTableSkeleton role="progressbar" compact={isTablet} zebra />
      ) : (
        <DataTable rows={testRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()} aria-label="testorders">
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
                        <TableCell key={cell.id} className={styles.testCell}>
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

export default TestOrder;
