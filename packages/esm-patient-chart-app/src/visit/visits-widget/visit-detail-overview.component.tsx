import React, { useEffect, useState, useMemo } from 'react';
import styles from './visit-detail-overview.scss';
import capitalize from 'lodash-es/capitalize';
import { Visit, createErrorHandler, OpenmrsResource } from '@openmrs/esm-framework';
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
import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { fetchEncounterObservations, getVisitsForPatient, getDosage } from './visit.resource';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

function formatTime(dateTime) {
  return dayjs(dateTime).format('hh:mm');
}

interface Observation {
  uuid: string;
  display: string;
  links: Array<any>;
}

interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  route: {
    uuid: string;
    display: string;
  };
}

// Visit Summary Components

interface VisitSummaryProps {
  orders: Array<Order>;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ orders }) => {
  const { t } = useTranslation();
  const [tabSelected, setSelectedTab] = useState(0);

  let tabContent = null;
  if (tabSelected == 0) {
    tabContent = 'Notes Content';
  } else if (tabSelected == 1) {
    tabContent = 'Tests Content';
  } else {
    tabContent =
      orders.length > 0 ? (
        orders.map(
          (order) =>
            order.dose && (
              <>
                <p className={`${styles.bodyLong01} ${styles.medicationBlock}`}>
                  <strong>{capitalize(order.drug?.name)}</strong> &mdash; {order.doseUnits?.display} &mdash;{' '}
                  {order.route?.display}
                  <br />
                  <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
                  <strong>{getDosage(order.drug?.strength, order.dose).toLowerCase()}</strong> &mdash;{' '}
                  {order.frequency?.display} &mdash;{' '}
                  {!order.duration
                    ? t('orderIndefiniteDuration', 'Indefinite duration')
                    : t('orderDurationAndUnit', 'for {duration} {durationUnit}', {
                        duration: order.duration,
                        durationUnit: order.durationUnits?.display,
                      })}
                  <br />
                  <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span> {order.numRefills}
                </p>
                <p className={styles.caption01} style={{ color: '#525252' }}>
                  {formatTime(order.dateActivated)} &middot; {order.orderer.person?.display}
                </p>
              </>
            ),
        )
      ) : (
        <p className={styles.bodyLong01}>No Medications found.</p>
      );
  }

  return (
    <div className={styles.summaryContainer}>
      <div style={{ display: 'flex', padding: '1rem 0' }}>
        <p className={styles.productiveHeading01} style={{ width: '30%' }}>
          Diagnoses
        </p>
        <div className={styles.diagnosesList} style={{ width: '70%' }}></div>
      </div>
      <div className={styles.tabSections}>
        <Tabs className={styles.verticalTabs}>
          <Tab
            className={`${styles.tab} ${tabSelected == 0 && styles.selectedTab}`}
            onClick={() => setSelectedTab(0)}
            href="#"
            id="tab-1"
            label="Notes"></Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 1 && styles.selectedTab}`}
            onClick={() => setSelectedTab(1)}
            href="#"
            id="tab-2"
            label="Tests"></Tab>
          <Tab
            className={`${styles.tab} ${tabSelected == 2 && styles.selectedTab}`}
            onClick={() => setSelectedTab(2)}
            href="#"
            id="tab-3"
            label="Medications"></Tab>
        </Tabs>
        <div className={`${styles.tabContent} ${styles.bodyLong01}`}>{tabContent}</div>
      </div>
    </div>
  );
};

// EncounterList Components

interface EncounterObservationsProps {
  encounterUuid: string;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ encounterUuid }) => {
  const { t } = useTranslation();
  const [observations, setObservations] = useState<Array<Observation>>([]);

  useEffect(() => {
    const sub = fetchEncounterObservations(encounterUuid).subscribe((data) => setObservations(data.obs));
    return () => {
      sub.unsubscribe();
    };
  }, [encounterUuid]);

  const observationsList = useMemo(() => {
    return observations.map((obs: Observation) => {
      const qna = obs.display.split(':');
      return {
        question: qna[0],
        answer: qna[1],
      };
    });
  }, [observations]);

  return observationsList.length > 0 ? (
    <div>
      {observationsList.map((obs, ind) => (
        <div key={ind} className={styles.observation}>
          <span className={styles.caption01} style={{ marginRight: '0.125rem' }}>
            {obs.question}:{' '}
          </span>
          <span className={styles.bodyShort02}>{obs.answer}</span>
        </div>
      ))}
    </div>
  ) : (
    <SkeletonText />
  );
};

interface EncounterListProps {
  encounters: Array<{
    id: any;
    time: any;
    encounterType: string;
    provider: string;
  }>;
}

const EncounterListDataTable: React.FC<EncounterListProps> = ({ encounters }) => {
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
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => {
        return (
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
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                        <div style={{ width: '100%' }}>
                          <EncounterObservations encounterUuid={row.id} />
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            {encounters.length === 0 && <p className={styles.dataTableRow}>No encounters found.</p>}
          </TableContainer>
        );
      }}
    </DataTable>
  );
};

interface SingleVisitDetailComponentProps {
  visit: Visit;
}

const SingleVisitDetailComponent: React.FC<SingleVisitDetailComponentProps> = ({ visit }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState<boolean>(true);
  const encounters = useMemo(
    () =>
      visit.encounters.map((encounter: OpenmrsResource, ind) => ({
        id: encounter.uuid,
        time: dayjs(encounter.encounterDateTime).format('hh:mm'),
        encounterType: encounter.encounterType.display,
        provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
      })),
    [visit],
  );

  const orders: Array<Order> = useMemo(() => {
    let orders: Array<Order> = [];
    visit.encounters.forEach((enc) => {
      orders = [...orders, ...enc.orders];
    });
    return orders;
  }, [visit]);

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
      {!listView && <VisitSummary orders={orders} />}
    </div>
  );
};

// Base VisitsOverviewComponent

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const [visits, setvisits] = useState<Array<Visit | null>>(null);

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      const sub = getVisitsForPatient(patientUuid, abortController).subscribe(({ data }) => {
        setvisits(data.results);
      }, createErrorHandler());
      return () => {
        abortController.abort();
        sub.unsubscribe();
      };
    }
  }, [patientUuid]);

  return visits ? (
    visits.length > 0 ? (
      <div className={styles.container}>
        {visits.map((visit, ind) => (
          <SingleVisitDetailComponent key={ind} visit={visit} />
        ))}
      </div>
    ) : (
      <p>No Visit Found</p>
    )
  ) : (
    <SkeletonText heading />
  );
}

export default VisitDetailOverviewComponent;
