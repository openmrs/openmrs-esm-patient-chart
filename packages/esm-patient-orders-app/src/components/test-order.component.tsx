import React, { useMemo } from 'react';
import styles from './test-order.scss';
import { type Order } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useOrderConceptByUuid } from '../test-results-form/lab-results.resource';
import { useLayoutType } from '@openmrs/esm-framework';

interface TestOrderProps {
  testOrder: Order;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(testOrder.concept.uuid);

  const headers: Array<{ key: string; header: string }> = [
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

  const testRows = useMemo(() => {
    if (concept && concept.setMembers.length === 0) {
      return [
        {
          id: concept.uuid,
          testType: concept.display,
          result: 'TBD',
          normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
        },
      ];
    } else if (concept && concept.setMembers.length > 0) {
      return concept?.setMembers.map((concept) => ({
        testType: concept.display,
        result: 'TBD',
        normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
      }));
    } else {
      return [];
    }
  }, [testOrder]);

  return (
    <div className={styles.testOrder}>
      {isLoadingTestConcepts ? (
        <DataTableSkeleton headers={headers} compact={!isTablet} />
      ) : (
        <DataTable rows={testRows} headers={headers} useZebraStyles size="lg">
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
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
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      )}
    </div>
  );
};

export default TestOrder;
