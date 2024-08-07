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
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectableObservable } from 'rxjs';
import { styles } from '../grouped-timeline';
import { testResultsBasePath } from '../helpers';

interface IndividualResultsTableProps {
  panels: any; //add types
  isLoading: boolean;
  // error: any; //for now
}

const IndividualResultValue: React.FC<{ panel: Record<string, any> }> = ({ panel }) => {
  //imporve these types
  const { value, valueQuantity, interpretation } = panel;

  let additionalClassname: string;

  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      additionalClassname = styles['off-scale-high'];
      break;

    case 'CRITICALLY_HIGH':
      additionalClassname = styles['critically-high'];
      break;

    case 'HIGH':
      additionalClassname = styles['high'];
      break;

    case 'OFF_SCALE_LOW':
      additionalClassname = styles['off-scale-low'];
      break;

    case 'CRITICALLY_LOW':
      additionalClassname = styles['critically-low'];
      break;

    case 'LOW':
      additionalClassname = styles['low'];
      break;

    case 'NORMAL':
    default:
      additionalClassname = '';
  }

  return (
    <div className={classNames(styles['individual-results-value'], additionalClassname)}>
      <p>{`${value} ${valueQuantity?.unit || ''}`}</p>
    </div>
  );
};

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
            to={`${testResultsBasePath(`/patient/${patientUuid}/chart`)}/trendline/${panel.conceptUuid}`}
          >
            {panel.name}
          </ConfigurableLink>
        ),
        value: <IndividualResultValue panel={panel} />,
        referenceRange: range,
      };
    });

    return rowData;
  }, [panels, patientUuid]);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (panels?.length) {
    return (
      <div className={styles.widgetCard}>
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
        <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'sm'}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table aria-label="allergies summary" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={classNames(styles.productiveHeading01, styles.text02)}
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
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                      {/* <TableCell className="cds--table-column-menu">
                        <AllergiesActionMenu
                          patientUuid={patient.id}
                          allergy={allergies.find((allergy) => allergy.id == row.id)}
                        />
                      </TableCell> */}
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
