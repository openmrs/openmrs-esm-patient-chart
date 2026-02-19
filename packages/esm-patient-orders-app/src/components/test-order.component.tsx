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
import { useLayoutType } from '@openmrs/esm-framework';
import {
  type Order,
  type OBSERVATION_INTERPRETATION,
  useReferenceRanges,
  ReferenceRangeDisplay,
} from '@openmrs/esm-patient-common-lib';
import { useLabEncounter, useOrderConceptByUuid, useOrderConceptsByUuids } from '../lab-results/lab-results.resource';
import { getConceptUuids, getEffectiveRanges, getInterpretationClass, interpretObservation } from '../utils';
import styles from './test-order.scss';

interface TestOrderProps {
  testOrder: Order;
  /** When provided, reference ranges fetch starts immediately instead of waiting for encounter. Pass from parent when available (e.g. OrderDetailsTable) to avoid request waterfall. */
  patientUuid?: string;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder, patientUuid: patientUuidProp }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(testOrder?.concept?.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(testOrder?.encounter?.uuid);

  const patientUuid = patientUuidProp ?? encounter?.patient?.uuid;

  const conceptUuids = useMemo(() => getConceptUuids(concept), [concept]);

  // Fetch reference ranges from the API
  const { ranges: referenceRanges, isLoading: isLoadingRanges } = useReferenceRanges(patientUuid, conceptUuids);

  const tableHeaders = useMemo(() => {
    return [
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
        header: t('referenceRange', 'Reference range'),
      },
    ];
  }, [t, testOrder?.orderType?.display]);

  const [testResultObs, obsUuids] = useMemo(() => {
    if (!encounter) return [[], []];
    const testObs = encounter.obs?.filter((obs) => obs.order?.uuid === testOrder.uuid) ?? [];
    return [testObs, testObs.map((obs) => obs.concept?.uuid).filter(Boolean)];
  }, [encounter, testOrder.uuid]);

  const { isLoading: isLoadingResultsConcepts, concepts: conceptList } = useOrderConceptsByUuids(obsUuids);

  const testRows = useMemo(() => {
    if (!Array.isArray(testResultObs) || testResultObs.length === 0) return [];

    return testResultObs.flatMap((obs) => {
      const concept = conceptList.find((c) => c.uuid === obs.concept.uuid);
      if (!concept) {
        return [];
      }

      // Handle panel tests (with set members / groupMembers)
      if (concept.setMembers && concept.setMembers.length > 0) {
        return concept.setMembers.map((memberConcept) => {
          const memberObs = obs.groupMembers?.find((gm) => gm.concept.uuid === memberConcept.uuid);

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
            id: memberObs?.uuid ?? `${obs.uuid}:${memberConcept.uuid}`,
            testType: memberConcept.display || '--',
            result,
            normalRange: <ReferenceRangeDisplay ranges={ranges} />,
          };
        });
      }

      // Handle single test (no set members)
      const ranges = getEffectiveRanges(concept, referenceRanges);

      let result: { value: string; interpretation: OBSERVATION_INTERPRETATION } | React.ReactNode;
      if (isLoadingResult) {
        result = <SkeletonText />;
      } else {
        const { displayValue, interpretation } = interpretObservation(obs, ranges);
        result = { value: displayValue, interpretation };
      }

      return {
        id: obs.uuid,
        testType: concept.display || '--',
        result,
        normalRange: <ReferenceRangeDisplay ranges={ranges} />,
      };
    });
  }, [isLoadingResult, testResultObs, conceptList, referenceRanges]);

  if (isLoadingTestConcepts || isLoadingResultsConcepts || isLoadingResult || isLoadingRanges) {
    return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  }

  if (!concept) {
    return <div className={styles.error}>{t('noTestData', 'No test data available')}</div>;
  }

  return (
    <div className={styles.testOrder}>
      <DataTable rows={testRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} className={styles.table} aria-label={t('testOrders', 'Test orders')}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => {
                    const headerProps = getHeaderProps({ header });
                    return (
                      <TableHeader
                        {...headerProps}
                        className={classNames(headerProps.className, styles[`col-${header.key}`])}
                      >
                        {header.header}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) =>
                      cell.value?.interpretation ? (
                        <TableCell key={cell.id} className={getInterpretationClass(styles, cell.value.interpretation)}>
                          <span>{cell.value.value}</span>
                        </TableCell>
                      ) : (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
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
  );
};

export default TestOrder;
