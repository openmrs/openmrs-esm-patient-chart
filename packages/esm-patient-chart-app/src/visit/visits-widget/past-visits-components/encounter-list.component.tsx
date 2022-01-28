import React, { useEffect, useState } from 'react';
import EncounterObservations from './encounter-observations.component';
import styles from '../visit-detail-overview.scss';
import {
  DataTable,
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
  Button,
} from 'carbon-components-react';
import { Observation } from '../visit.resource';
import { useTranslation } from 'react-i18next';
import { OpenmrsResource, useLayoutType, usePatient } from '@openmrs/esm-framework';
import Edit16 from '@carbon/icons-react/es/edit/16';
import { formEntrySub, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface EncounterListProps {
  encounters: Array<{
    id: any;
    time: any;
    encounterType: string;
    provider: string;
    obs: Array<Observation>;
    form: OpenmrsResource;
  }>;
  visitUuid: string;
}

const EncounterListDataTable: React.FC<EncounterListProps> = ({ encounters, visitUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { patient } = usePatient();
  const isDesktop = layout === 'desktop';
  const [headerWidth, setHeaderWidth] = useState(0);

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

  useEffect(() => {
    setHeaderWidth(document.getElementById(`header_${visitUuid}_0`)?.clientWidth);
    const handler = () => setHeaderWidth(document.getElementById(`header_${visitUuid}_0`)?.clientWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  function launchWorkSpace(formUuid: string, visitUuid?: string, encounterUuid?: string) {
    formEntrySub.next({ formUuid, patient, visitUuid, encounterUuid });
    launchPatientWorkspace('patient-form-entry-workspace');
  }

  return encounters.length !== 0 ? (
    <DataTable rows={encounters} headers={headerData}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => {
        return (
          <TableContainer>
            <Table {...getTableProps()} size={!isDesktop ? 'normal' : 'short'} useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header, ind) => (
                    <TableHeader id={`header_${visitUuid}_${ind}`} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, ind) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell, ind) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableExpandedRow
                        className={styles.expandedRow}
                        style={{ paddingLeft: isDesktop ? '3rem' : '4rem' }}
                        colSpan={headers.length + 2}
                      >
                        <div style={{ marginLeft: headerWidth }}>
                          <EncounterObservations observations={encounters[ind].obs} />
                          <Button
                            onClick={() => launchWorkSpace(encounters[ind].form.uuid, visitUuid, encounters[ind].id)}
                            style={{ marginLeft: '-1rem' }}
                            kind="ghost"
                            renderIcon={Edit16}
                          >
                            {t('editEncounter', 'Edit this encounter')}
                          </Button>
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    </DataTable>
  ) : (
    <div className={styles.encounterEmptyState}>
      <h4 className={styles.productiveHeading02}>{t('noEncountersFound', 'No encounters found')}</h4>
      <p className={`${styles.bodyLong01} ${styles.text02}`}>
        {t('thereIsNoInformationToDisplayHere', 'There is no information to display here')}
      </p>
    </div>
  );
};

export default EncounterListDataTable;
