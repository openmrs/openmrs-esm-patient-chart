import React, { useEffect, useState } from 'react';
import EncounterObservations from './encounter-observations.component';
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
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';
import Edit16 from '@carbon/icons-react/es/edit/16';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePagination, usePatient } from '@openmrs/esm-framework';
import {
  EmptyState,
  formEntrySub,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { FormattedEncounter } from '../visit-detail-overview.component';
import styles from '../visit-detail-overview.scss';

interface EncounterListProps {
  encounters: Array<FormattedEncounter>;
  isShowingAllEncounters?: boolean;
}

const EncounterList: React.FC<EncounterListProps> = ({ isShowingAllEncounters, encounters }) => {
  const encountersToShowCount = 20;
  const { t } = useTranslation();
  const { patient } = usePatient();
  const isTablet = useLayoutType() === 'tablet';
  const { results: paginatedEncounters, goTo, currentPage } = usePagination(encounters ?? [], encountersToShowCount);

  const headers = [
    {
      id: 1,
      header: 'Date & time',
      key: 'datetime',
    },
    {
      id: 3,
      header: 'Encounter type',
      key: 'encounterType',
    },
    {
      id: 4,
      header: 'Provider',
      key: 'provider',
    },
  ];

  if (isShowingAllEncounters) {
    headers.push({
      id: 2,
      header: 'Visit type',
      key: 'visitType',
    });

    headers.sort((a, b) => (a.id > b.id ? 1 : -1));
  }

  function launchWorkspace(formUuid: string, visitUuid?: string, encounterUuid?: string) {
    formEntrySub.next({ formUuid, patient, visitUuid, encounterUuid });
    launchPatientWorkspace('patient-form-entry-workspace');
  }

  if (encounters?.length) {
    return (
      <div className={styles.encounterListContainer}>
        <DataTable
          data-floating-menu-container
          headers={headers}
          rows={paginatedEncounters}
          overflowMenuOnHover={isTablet ? false : true}
          size={isTablet ? 'normal' : 'short'}
          useZebraStyles
        >
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <div>
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader />
                      {headers.map((header, i) => (
                        <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      {isShowingAllEncounters ? <TableExpandHeader /> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, i) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                          {isShowingAllEncounters ? (
                            <TableCell className="bx--table-column-menu">
                              <ActionsMenu />
                            </TableCell>
                          ) : null}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow
                            className={styles.expandedRow}
                            style={{ paddingLeft: isTablet ? '4rem' : '3rem' }}
                            colSpan={headers.length + 2}
                          >
                            <div>
                              <EncounterObservations observations={encounters[i].obs} />
                              <Button
                                kind="ghost"
                                onClick={() =>
                                  launchWorkspace(encounters[i].form.uuid, encounters[i].visitUuid, encounters[i].id)
                                }
                                renderIcon={Edit16}
                                style={{ marginLeft: '-1rem', marginTop: '0.5rem' }}
                              >
                                {t('editEncounter', 'Edit encounter')}
                              </Button>
                            </div>
                          </TableExpandedRow>
                        ) : (
                          <div />
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {isShowingAllEncounters ? (
                <PatientChartPagination
                  currentItems={paginatedEncounters.length}
                  onPageNumberChange={({ page }) => goTo(page)}
                  pageNumber={currentPage}
                  pageSize={encountersToShowCount}
                  totalItems={encounters.length}
                />
              ) : null}
            </div>
          )}
        </DataTable>
      </div>
    );
  }

  return <EmptyState headerTitle={t('encounters', 'Encounters')} displayText={t('encounters', 'encounters')} />;
};

export default EncounterList;

function ActionsMenu() {
  const { t } = useTranslation();

  return (
    <OverflowMenu light size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#placeholderMenuItem"
        itemText={t('placeholderMenuitem', 'Placeholder item')}
      >
        {t('placeholderMenuitem', 'Placeholder item')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
}
