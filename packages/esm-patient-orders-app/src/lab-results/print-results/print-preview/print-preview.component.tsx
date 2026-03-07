import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
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
import {
  type Order,
  type OBSERVATION_INTERPRETATION,
  ReferenceRangeDisplay,
  useReferenceRanges,
} from '@openmrs/esm-patient-common-lib';
import { useLabEncounter, useOrderConceptByUuid } from '../../lab-results.resource';
import { getConceptUuids, getEffectiveRanges, getInterpretationClass, interpretObservation } from '../../../utils';
import styles from './print-preview.scss';

interface PrintableReportProps {
  order: Order;
  index: number;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ order, index }) => {
  const { t } = useTranslation();
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(order?.concept?.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(order?.encounter?.uuid);
  const patientUuid = encounter?.patient?.uuid;
  const conceptUuids = useMemo(() => getConceptUuids(concept), [concept]);
  const { ranges: referenceRanges, isLoading: isLoadingRanges } = useReferenceRanges(patientUuid, conceptUuids);

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
        header: t('referenceRange', 'Reference range'),
      },
    ],
    [t, order?.orderType?.display],
  );

  const testResultObs = useMemo(() => {
    if (!encounter || !concept) return null;
    return encounter.obs?.find((obs) => obs.concept.uuid === concept.uuid);
  }, [concept, encounter]);

  const testRows = useMemo(() => {
    if (!concept || !encounter) {
      return [];
    }

    if (concept.setMembers?.length > 0) {
      return concept.setMembers.map((memberConcept) => {
        const memberObs = testResultObs?.groupMembers?.find((obs) => obs?.concept?.uuid === memberConcept?.uuid);

        const ranges = getEffectiveRanges(memberConcept, referenceRanges);

        let result: { value: string; interpretation: OBSERVATION_INTERPRETATION } | React.ReactNode;
        if (isLoadingResult) {
          result = <SkeletonText />;
        } else if (memberObs) {
          const { displayValue, interpretation } = interpretObservation(memberObs, ranges);
          result = { value: displayValue, interpretation };
        } else {
          result = '--';
        }

        return {
          id: memberObs?.uuid ?? `${testResultObs?.uuid}:${memberConcept?.uuid}`,
          testType: <div className={styles.testType}>{memberConcept?.display || '--'}</div>,
          result,
          normalRange: <ReferenceRangeDisplay ranges={ranges} />,
        };
      });
    }

    const ranges = getEffectiveRanges(concept, referenceRanges);

    let result: { value: string; interpretation: OBSERVATION_INTERPRETATION } | React.ReactNode;
    if (isLoadingResult) {
      result = <SkeletonText />;
    } else if (testResultObs) {
      const { displayValue, interpretation } = interpretObservation(testResultObs, ranges);
      result = { value: displayValue, interpretation };
    } else {
      result = '--';
    }

    return [
      {
        id: testResultObs?.uuid ?? concept.uuid,
        testType: <div className={styles.testType}>{concept.display || '--'}</div>,
        result,
        normalRange: <ReferenceRangeDisplay ranges={ranges} />,
      },
    ];
  }, [concept, encounter, isLoadingResult, testResultObs, referenceRanges]);

  if (isLoadingTestConcepts || isLoadingResult || isLoadingRanges) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (!concept) {
    return <div className={styles.error}>{t('noTestData', 'No test data available')}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <p className={styles.testDoneHeader}>
          {index + 1}. {order.concept.display} &mdash; {order.orderNumber}
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
                        {row.cells.map((cell) =>
                          cell.value?.interpretation ? (
                            <TableCell
                              key={cell.id}
                              className={classNames(
                                styles.testCell,
                                getInterpretationClass(styles, cell.value.interpretation),
                              )}
                            >
                              <span>{cell.value.value}</span>
                            </TableCell>
                          ) : (
                            <TableCell key={cell.id} className={styles.testCell}>
                              {cell.value}
                            </TableCell>
                          ),
                        )}
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
