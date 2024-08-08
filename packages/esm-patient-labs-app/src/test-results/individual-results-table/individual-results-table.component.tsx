import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib'; //use type from the utils
import { testResultsBasePath } from '../helpers';

import styles from './individual-results-table.scss';

interface IndividualResultsTableProps {
  panels: any; //add types
  isLoading: boolean;
  // error: any; //for now
}

const IndividualResultsTable: React.FC<IndividualResultsTableProps> = ({ panels, isLoading }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientUuid = getPatientUuidFromUrl();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const headerTitle = t('individualResults', 'Individual Results');

  // console.log(panels);
  const tableHeaders = [
    { key: 'testName', header: t('testName', 'Test Name') },
    {
      key: 'value',
      header: t('value', 'Value'),
    },
    { key: 'referenceRange', header: t('referenceRange', 'Reference range') },
  ];

  const StyledTableCell = ({ interpretation, children }: { interpretation: string; children: React.ReactNode }) => {
    switch (interpretation?.toLowerCase()) {
      case 'critically_high':
        return <TableCell className={styles.criticallyHigh}>{children}</TableCell>;
      case 'critically_low':
        return <TableCell className={styles.criticallyLow}>{children}</TableCell>;
      case 'high':
        return <TableCell className={styles.high}>{children}</TableCell>;
      case 'low':
        return <TableCell className={styles.low}>{children}</TableCell>;
      default:
        return <TableCell>{children}</TableCell>;
    }
  };

  function extractReferenceRangeFromPanel(panel) {
    //will add typings
    if (!panel.referenceRange?.length) return '--';

    const { high, low } = panel.referenceRange[0];
    if (!high || !low) return '--';

    return `${low.value} - ${high.value} ${panel.valueQuantity.unit}`;
  }

  const tableRows = useMemo(() => {
    const rowData = panels.map((panel) => {
      const range = extractReferenceRangeFromPanel(panel);

      return {
        ...panel,
        testName: (
          <ConfigurableLink
            // className={styles.configurableLink} //styles not picking
            style={{ textDecoration: 'none' }}
            to={`${testResultsBasePath(`/patient/${patientUuid}/chart`)}/trendline/${panel.conceptUuid}`}
          >
            {panel.name}
          </ConfigurableLink>
        ),
        value: `${panel.value} ${panel.valueQuantity?.unit || ''}`,
        referenceRange: range,
      };
    });

    return rowData;
  }, [panels, patientUuid]);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (panels?.length) {
    return (
      <div>
        <CardHeader title={headerTitle}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            iconDescription="view timeline"
            // onClick={launchAllergiesForm} where should this button direct you to???
          >
            {t('viewTimeline', 'View timeline')}
          </Button>
          {/* to add date here, but what date should be represented here? */}
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'md'}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table aria-label="allergies summary" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        // className={classNames(styles.productiveHeading01, styles.text02)}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map(
                        (cell) => (
                          <TableCell className={styles.testClass} key={cell.id}>
                            {cell.value?.content ?? cell.value}
                          </TableCell>
                        ),
                        // if (cell.info?.header === 'value') {
                        //   const panelObject = panels.find((panel) => panel.id === row.id);
                        //   const { interpretation } = panelObject;

                        //   return (
                        //     // <StyledTableCell key={`styled-cell-${cell.id}`} interpretation={interpretation}>
                        //     //   {cell.value?.content ?? cell.value}
                        //     // </StyledTableCell>
                        //     <TableCell className={styles.criticallyHigh}>{cell.value?.content ?? cell.value}</TableCell>
                        //   );
                        // }
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
  }
  // return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
};

export default IndividualResultsTable;
