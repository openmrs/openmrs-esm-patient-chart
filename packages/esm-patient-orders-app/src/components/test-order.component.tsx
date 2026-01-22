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
import {
  useLabEncounter,
  useOrderConceptByUuid,
  useOrderConceptsByUuids,
  useConceptReferenceRanges,
} from '../lab-results/lab-results.resource';
import { getObservationDisplayValue, getEffectiveRanges } from '../utils';
import styles from './test-order.scss';

interface TestOrderProps {
  testOrder: Order;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingTestConcepts } = useOrderConceptByUuid(testOrder?.concept?.uuid);
  const { encounter, isLoading: isLoadingResult } = useLabEncounter(testOrder?.encounter?.uuid);

  const patientUuid = encounter?.patient?.uuid;

  const conceptUuids = useMemo(() => {
    if (!concept) {
      return [];
    }
    const uuids = [concept.uuid];
    if (concept.setMembers) {
      concept.setMembers.forEach((member) => uuids.push(member.uuid));
    }
    return uuids;
  }, [concept]);

  // Fetch reference ranges from the API
  const { ranges: referenceRanges, isLoading: isLoadingRanges } = useConceptReferenceRanges(patientUuid, conceptUuids);

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
      if (!concept) return [];

      // Handle panel tests (with set members / groupMembers)
      if (concept.setMembers && concept.setMembers.length > 0) {
        return concept.setMembers.map((memberConcept) => {
          const memberObs = obs.groupMembers?.find((gm) => gm.concept.uuid === memberConcept.uuid);

          let resultValue: React.ReactNode;
          if (isLoadingResult) {
            resultValue = <SkeletonText />;
          } else if (memberObs) {
            resultValue = getObservationDisplayValue(memberObs.value ?? memberObs);
          } else {
            resultValue = '--';
          }

          const { lowNormal: effectiveLowNormal, hiNormal: effectiveHiNormal } = getEffectiveRanges(
            memberConcept,
            referenceRanges,
          );

          return {
            id: memberConcept.uuid,
            testType: <div className={styles.testType}>{memberConcept.display || '--'}</div>,
            result: resultValue,
            normalRange:
              effectiveLowNormal != null && effectiveHiNormal != null
                ? `${effectiveLowNormal} - ${effectiveHiNormal}`
                : t('notApplicable', 'Not applicable'),
          };
        });
      }

      // Handle single test (no set members)
      let resultValue: React.ReactNode;
      if (isLoadingResult) {
        resultValue = <SkeletonText />;
      } else {
        resultValue = getObservationDisplayValue(obs.value ?? obs);
      }

      const { lowNormal: effectiveLowNormal, hiNormal: effectiveHiNormal } = getEffectiveRanges(
        concept,
        referenceRanges,
      );

      return {
        id: concept.uuid,
        testType: <div className={styles.testType}>{concept.display || '--'}</div>,
        result: resultValue,
        normalRange:
          effectiveLowNormal != null && effectiveHiNormal != null
            ? `${effectiveLowNormal} - ${effectiveHiNormal}`
            : t('notApplicable', 'Not applicable'),
      };
    });
  }, [isLoadingResult, testResultObs, conceptList, t, referenceRanges]);

  if (isLoadingResultsConcepts || isLoadingResult || isLoadingRanges) {
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
            <Table {...getTableProps()} aria-label={t('testOrders', 'Test orders')}>
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
    </div>
  );
};

export default TestOrder;
