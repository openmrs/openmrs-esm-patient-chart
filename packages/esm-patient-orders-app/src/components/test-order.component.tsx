import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
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
import { useLabEncounter, useOrderConceptByUuid } from '../lab-results/lab-results.resource';
import { getObservationDisplayValue } from '../utils';
import styles from './test-order.scss';

interface TestOrderProps {
  testOrder: Order;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(testOrder?.concept?.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(testOrder?.encounter?.uuid);

  const tableHeaders = useMemo(
    () => [
      {
        key: 'testType',
        header: testOrder?.orderType?.display || '',
      },
      {
        key: 'result',
        header: t('result', 'Result'),
      },
      {
        key: 'normalRange',
        header: t('normalRange', 'Normal range'),
      },
    ],
    [t, testOrder?.orderType?.display],
  );

  const testResultObs = useMemo(() => {
    if (!encounter || !concept) return null;
    return encounter.obs?.find((obs) => obs.concept.uuid === concept.uuid);
  }, [concept, encounter]);

  const testRows = useMemo(() => {
    if (!concept) return [];

    // For panel tests (with set members)
    if (concept.setMembers && concept.setMembers.length > 0) {
      return concept.setMembers.map((memberConcept) => {
        const memberObs = testResultObs?.groupMembers?.find((obs) => obs.concept.uuid === memberConcept.uuid);

        let resultValue: React.ReactNode;
        if (isLoadingResult) {
          resultValue = <SkeletonText />;
        } else if (memberObs) {
          resultValue = getObservationDisplayValue(memberObs.value ?? memberObs);
        } else {
          resultValue = '--';
        }

        return {
          id: memberConcept.uuid,
          testType: <div className={styles.testType}>{memberConcept.display || '--'}</div>,
          result: resultValue,
          normalRange:
            memberConcept.hiNormal && memberConcept.lowNormal
              ? `${memberConcept.lowNormal} - ${memberConcept.hiNormal}`
              : 'N/A',
        };
      });
    }

    // For single tests (no set members)
    let resultValue: React.ReactNode;
    if (isLoadingResult) {
      resultValue = <SkeletonText />;
    } else if (testResultObs) {
      resultValue = getObservationDisplayValue(testResultObs.value ?? testResultObs);
    } else {
      resultValue = '--';
    }

    return [
      {
        id: concept.uuid,
        testType: <div className={styles.testType}>{concept.display || '--'}</div>,
        result: resultValue,
        normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
      },
    ];
  }, [concept, isLoadingResult, testResultObs]);

  if (isLoadingTestConcepts || isLoadingResult) {
    return <DataTableSkeleton role="progressbar" compact={isTablet} zebra />;
  }

  if (!concept) {
    return <div className={styles.error}>{t('noTestData', 'No test data available')}</div>;
  }

  return (
    <div className={styles.testOrder}>
      <DataTable rows={testRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="test orders">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
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
    </div>
  );
};

export default TestOrder;