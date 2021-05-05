import React from 'react';
import dayjs from 'dayjs';
import ImmunizationsForm from './immunizations-form.component';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import styles from './immunizations-overview.scss';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/es/components/DataTable';
import { EmptyState, ErrorState, openWorkspaceTab } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';
import { performPatientImmunizationsSearch } from './immunizations.resource';

export interface ImmunizationsOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

const ImmunizationsOverview: React.FC<ImmunizationsOverviewProps> = ({ patient, patientUuid }) => {
  const immunizationsToShowCount = 5;
  const { t } = useTranslation();
  const [immunizations, setImmunizations] = React.useState(null);
  const [error, setError] = React.useState(null);
  const displayText = t('immunizations', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();
      performPatientImmunizationsSearch(patient.identifier[0].value, patientUuid, abortController)
        .then((searchResult) => {
          let allImmunizations = mapFromFHIRImmunizationBundle(searchResult);
          setImmunizations(allImmunizations);
        })
        .catch(setError);

      return () => abortController.abort();
    }
  }, [patient, patientUuid]);

  const headers = [
    {
      key: 'vaccine',
      header: t('vaccine', 'Vaccine'),
    },
    {
      key: 'vaccinationDate',
      header: t('vaccinationDate', 'Vaccination date'),
    },
  ];

  const launchImmunizationsForm = () => {
    openWorkspaceTab(ImmunizationsForm, t('immunizationsForm', 'Immunizations Form'));
  };

  const RenderImmunizations: React.FC = () => {
    if (immunizations.length) {
      const rows = getRowItems(immunizations);
      return (
        <div>
          <div className={styles.immunizationsHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add immunizations"
              onClick={launchImmunizationsForm}>
              {t('add', 'Add')}
            </Button>
          </div>
          <TableContainer>
            <DataTable rows={rows} headers={headers} isSortable={true} size="short">
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={`${styles.productiveHeading01} ${styles.text02}`}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}>
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </TableContainer>
        </div>
      );
    }
    return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
  };

  return (
    <>
      {immunizations ? (
        <RenderImmunizations />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={immunizationsToShowCount} />
      )}
    </>
  );
};

function getRowItems(rows) {
  return rows.map((row, index) => ({
    id: `${index}`,
    vaccine: row.vaccineName,
    vaccinationDate: `${dayjs(row.existingDoses[0].occurrenceDateTime).format('MMM-YYYY')}`,
  }));
}

export default ImmunizationsOverview;
