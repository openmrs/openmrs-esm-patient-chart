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
import { type Order } from '@openmrs/esm-patient-common-lib';
import upperCase from 'lodash/upperCase';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabEncounter, useOrderConceptByUuid } from '../../lab-results.resource';
import styles from './print-preview.scss';

interface PrintableReportProps {
  order: Order;
  index: number;
}

const getObservationValueDisplay = (value: any): string => {
  if (typeof value === 'object' && value !== null && 'display' in value) {
    return value.display;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return '--';
};

const PrintableReport: React.FC<PrintableReportProps> = ({ order, index }) => {
  const { t } = useTranslation();

  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(order?.concept?.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(order?.encounter?.uuid);

  const tableHeaders = useMemo(
    () => [
      {
        key: 'testType',
        header: order?.orderType?.display || t('test', 'Test'),
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
    [t, order?.orderType?.display],
  );

  const testResultObs = useMemo(() => {
    if (!encounter || !concept) return null;
    return encounter.obs?.find((obs) => obs.concept.uuid === concept.uuid);
  }, [concept, encounter]);

  const testRows = useMemo(() => {
    if (!concept || !encounter) return [];

    if (concept.setMembers?.length > 0) {
      return concept.setMembers.map((memberConcept) => {
        const memberObs = testResultObs?.groupMembers?.find((obs) => obs?.concept?.uuid === memberConcept?.uuid);
        const resultValue = getObservationValueDisplay(memberObs?.value);

        return {
          id: memberConcept?.uuid,
          testType: <div className={styles.testType}>{memberConcept?.display || '--'}</div>,
          result: isLoadingResult ? <SkeletonText /> : resultValue,
          normalRange:
            memberConcept?.hiNormal && memberConcept?.lowNormal
              ? `${memberConcept.lowNormal} - ${memberConcept.hiNormal}`
              : 'N/A',
        };
      });
    }

    const mainResultValue = getObservationValueDisplay(testResultObs?.value) || testResultObs?.display || '--';

    return [
      {
        id: concept.uuid,
        testType: <div className={styles.testType}>{concept.display || '--'}</div>,
        result: isLoadingResult ? <SkeletonText /> : mainResultValue,
        normalRange: concept.hiNormal && concept.lowNormal ? `${concept.lowNormal} - ${concept.hiNormal}` : 'N/A',
      },
    ];
  }, [concept, encounter, isLoadingResult, testResultObs]);

  if (isLoadingTestConcepts || isLoadingResult) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (!concept) {
    return <div className={styles.error}>{t('noTestData', 'No test data available')}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <p className={styles.testDoneHeader}>
          {index + 1}. {upperCase(order.concept.display)}
        </p>
        <div className={styles.printResults}>
          <DataTable rows={testRows} headers={tableHeaders} size="sm" useZebraStyles>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table {...getTableProps()} aria-label="test orders">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })} className={styles.testCell}>
                          {header.header}
                        </TableHeader>
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
      </div>
    </div>
  );
};

export default PrintableReport;
