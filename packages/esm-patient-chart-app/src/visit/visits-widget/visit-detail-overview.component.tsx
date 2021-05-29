import React, { useEffect, useState, useMemo } from 'react';
import styles from './visit-detail-overview.scss';
import { Visit, getVisitsForPatient, createErrorHandler, OpenmrsResource } from '@openmrs/esm-framework';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DataTable, {
  TableContainer,
  Table,
  TableHead,
  TableExpandHeader,
  TableRow,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
} from 'carbon-components-react/es/components/DataTable';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

const EncounterListDataTable = ({ encounters }) => {
  const headerData = [
    {
      id: 1,
      header: 'Time',
      key: 'time',
    },
    {
      id: 2,
      header: 'Encounter Type',
      key: 'encounterType',
    },
    {
      id: 3,
      header: 'Provider',
      key: 'provider',
    },
  ];

  return (
    <DataTable rows={encounters} headers={headerData}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
        <TableContainer>
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableExpandRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableExpandRow>
                  {row.isExpanded && (
                    <TableExpandedRow colSpan={headers.length + 1}>
                      <p>Aux squad rules</p>
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          {encounters.length === 0 && (
            // <TableRow>
            <p className={styles.dataTableRow}>No encounters found!</p>
            // </TableRow>
          )}
        </TableContainer>
      )}
    </DataTable>
  );
};

interface SingleVisitDetailComponentProps {
  visit: Visit;
}

const SingleVisitDetailComponent: React.FC<SingleVisitDetailComponentProps> = ({ visit }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState<Boolean>(true);
  const encounters = useMemo(
    () =>
      visit.encounters.map((encounter: OpenmrsResource, ind) => ({
        id: ind,
        time: dayjs(encounter.encounterDateTime).format('hh:mm'),
        encounterType: encounter.encounterType.display,
        provider: encounter.encounterProviders.length > 0 ? 'Provider' : '',
      })),
    [visit],
  );

  return (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit.visitType.display}
          <br />
          <p className={styles.bodyLong01}>{formatDateTime(visit.startDatetime)}</p>
        </h4>
        <div className={styles.toggleButtons}>
          <Button
            className={`${styles.toggle} ${listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setView(true)}>
            {t('All Encounters', 'All Encounters')}
          </Button>
          <Button
            className={`${styles.toggle} ${!listView ? styles.toggleActive : ''}`}
            size="small"
            kind="ghost"
            onClick={() => setView(false)}>
            {t('Visit Summary', 'Visit Summary')}
          </Button>
        </div>
      </div>
      {listView && visit?.encounters && <EncounterListDataTable encounters={encounters} />}
    </div>
  );
};

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  let A = [1, 2, 3, 4, 5];

  const [visits, setvisits] = useState<Array<Visit>>([]);

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getVisitsForPatient(patientUuid, abortController, 'full').subscribe(({ data }) => {
        setvisits(data.results);
      }, createErrorHandler());
    }
  }, [patientUuid]);

  return (
    <div className={styles.container}>
      {visits?.map((visit, ind) => (
        <SingleVisitDetailComponent visit={visit} />
      ))}
    </div>
  );
}

export default VisitDetailOverviewComponent;
