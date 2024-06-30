import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  type DataTableHeader,
  Dropdown,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import {
  formatDatetime,
  getConfig,
  isDesktop,
  parseDate,
  showModal,
  showSnackbar,
  useLayoutType,
  usePagination,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import { EmptyState, PatientChartPagination, launchFormEntryOrHtmlForms } from '@openmrs/esm-patient-common-lib';
import type { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';
import { deleteEncounter } from './visits-table.resource';
import { type MappedEncounter } from '../../visit.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './visits-table.scss';

interface VisitTableProps {
  visits: Array<MappedEncounter>;
  showAllEncounters?: boolean;
  patientUuid: string;
  mutateVisits?: () => void;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<typeof DataTableHeader>;
  cellsById: Record<string, Record<string, boolean | string | null | Record<string, unknown>>>;
  inputValue: string;
  getCellId: (row, key) => string;
};

const VisitTable: React.FC<VisitTableProps> = ({ showAllEncounters, visits, patientUuid, mutateVisits }) => {
  const visitCount = 20;
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();

  const [htmlFormEntryFormsConfig, setHtmlFormEntryFormsConfig] = useState<Array<HtmlFormEntryForm> | undefined>();

  useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryFormsConfig(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  });

  const encounterTypes = [...new Set(visits.map((encounter) => encounter.encounterType))].sort();

  const [filter, setFilter] = useState('');

  const filteredRows = useMemo(() => {
    if (!filter || filter == 'All') {
      return visits;
    }

    if (filter) {
      return visits?.filter((encounter) => encounter.encounterType === filter);
    }

    return visits;
  }, [filter, visits]);

  const { results: paginatedVisits, goTo, currentPage } = usePagination(filteredRows ?? [], visitCount);

  const tableHeaders = [
    {
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
    },
  ];

  if (showAllEncounters) {
    tableHeaders.push({
      header: t('visitType', 'Visit type'),
      key: 'visitType',
    });
  }

  tableHeaders.push(
    {
      header: t('encounterType', 'Encounter type'),
      key: 'encounterType',
    },
    {
      header: t('form', 'Form name'),
      key: 'formName',
    },
    {
      header: t('provider', 'Provider'),
      key: 'provider',
    },
  );

  const tableRows = useMemo(() => {
    return paginatedVisits?.map((encounter) => ({
      ...encounter,
      formName: encounter.form?.display ?? '--',
      datetime: formatDatetime(parseDate(encounter.datetime)),
    }));
  }, [paginatedVisits]);

  const handleEncounterTypeChange = ({ selectedItem }) => setFilter(selectedItem);

  const handleDeleteEncounter = React.useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              mutateVisits?.();
              showSnackbar({
                isLowContrast: true,
                title: t('encounterDeleted', 'Encounter deleted'),
                subtitle: `Encounter ${t('successfullyDeleted', 'successfully deleted')}`,
                kind: 'success',
              });
            })
            .catch(() => {
              showSnackbar({
                isLowContrast: false,
                title: t('error', 'Error'),
                subtitle: `Encounter ${t('failedDeleting', "couldn't be deleted")}`,
                kind: 'error',
              });
            });
          close();
        },
      });
    },
    [t, mutateVisits],
  );

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  // All encounters tab in visits
  if (!visits?.length) {
    return (
      <EmptyState headerTitle={t('encounters', 'Encounters')} displayText={t('encounters__lower', 'encounters')} />
    );
  }

  return (
    <DataTable
      filterRows={handleFilter}
      headers={tableHeaders}
      rows={tableRows}
      overflowMenuOnHover={desktopLayout}
      size={desktopLayout ? 'sm' : 'lg'}
      useZebraStyles={visits?.length > 1 ? true : false}
    >
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getExpandHeaderProps,
        getTableProps,
        getToolbarProps,
        onInputChange,
      }: {
        rows: Array<(typeof tableRows)[0] & { isExpanded: boolean; cells: Array<{ id: string; value: string }> }>;
        headers: typeof tableHeaders;
        [key: string]: any;
      }) => (
        <>
          <TableContainer className={styles.tableContainer}>
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <div className={styles.filterContainer}>
                  <Dropdown
                    id="serviceFilter"
                    initialSelectedItem={t('all', 'All')}
                    label=""
                    titleText={t('filterByEncounterType', 'Filter by encounter type') + ':'}
                    type="inline"
                    items={[t('all', 'All'), ...encounterTypes]}
                    onChange={handleEncounterTypeChange}
                    size={desktopLayout ? 'sm' : 'lg'}
                  />
                </div>
                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  {showAllEncounters ? <TableExpandHeader /> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const selectedVisit = visits.find((visit) => visit.id === row.id);

                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                        {showAllEncounters ? (
                          <TableCell className="cds--table-column-menu">
                            <Layer className={styles.layer}>
                              <OverflowMenu
                                data-floating-menu-container
                                aria-label="Encounter table actions menu"
                                size={desktopLayout ? 'sm' : 'lg'}
                                flipped
                                align="left"
                              >
                                {selectedVisit?.form?.uuid && (
                                  <OverflowMenuItem
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    className={styles.menuItem}
                                    itemText={t('viewThisEncounter', 'View this encounter')}
                                    onClick={() => {
                                      launchFormEntryOrHtmlForms(
                                        htmlFormEntryFormsConfig,
                                        patientUuid,
                                        selectedVisit?.form?.uuid,
                                        selectedVisit?.visitUuid,
                                        selectedVisit?.id,
                                        selectedVisit?.form?.display,
                                        selectedVisit?.visitTypeUuid,
                                        selectedVisit?.visitStartDatetime,
                                        selectedVisit?.visitStopDatetime,
                                        () => {},
                                        'view',
                                      );
                                    }}
                                  />
                                )}
                                {userHasAccess(selectedVisit?.editPrivilege, session?.user) &&
                                  selectedVisit?.form?.uuid && (
                                    <OverflowMenuItem
                                      className={styles.menuItem}
                                      itemText={t('editThisEncounter', 'Edit this encounter')}
                                      size={desktopLayout ? 'sm' : 'lg'}
                                      onClick={() => {
                                        launchFormEntryOrHtmlForms(
                                          htmlFormEntryFormsConfig,
                                          patientUuid,
                                          selectedVisit?.form?.uuid,
                                          selectedVisit?.visitUuid,
                                          selectedVisit?.id,
                                          selectedVisit?.form?.display,
                                          selectedVisit?.visitTypeUuid,
                                          selectedVisit?.visitStartDatetime,
                                          selectedVisit?.visitStopDatetime,
                                        );
                                      }}
                                    />
                                  )}
                                {userHasAccess(selectedVisit?.editPrivilege, session?.user) && (
                                  <OverflowMenuItem
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    className={styles.menuItem}
                                    itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                    onClick={() => handleDeleteEncounter(selectedVisit.id, selectedVisit.form?.display)}
                                    hasDivider
                                    isDelete
                                  />
                                )}
                              </OverflowMenu>
                            </Layer>
                          </TableCell>
                        ) : null}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                          <>
                            <EncounterObservations observations={selectedVisit?.obs} />
                            {userHasAccess(selectedVisit?.editPrivilege, session?.user) && (
                              <>
                                {selectedVisit?.form?.uuid && (
                                  <Button
                                    kind="ghost"
                                    onClick={() => {
                                      launchFormEntryOrHtmlForms(
                                        htmlFormEntryFormsConfig,
                                        patientUuid,
                                        selectedVisit?.form?.uuid,
                                        selectedVisit?.visitUuid,
                                        selectedVisit?.id,
                                        selectedVisit?.form?.display,
                                        selectedVisit?.visitTypeUuid,
                                        selectedVisit?.visitStartDatetime,
                                        selectedVisit?.visitStopDatetime,
                                      );
                                    }}
                                    renderIcon={(props) => <Edit size={16} {...props} />}
                                  >
                                    {t('editThisEncounter', 'Edit this encounter')}
                                  </Button>
                                )}
                                <Button
                                  kind="danger--ghost"
                                  onClick={() => handleDeleteEncounter(selectedVisit?.id, selectedVisit?.form?.display)}
                                  renderIcon={(props) => <TrashCan size={16} {...props} />}
                                >
                                  {t('deleteThisEncounter', 'Delete this encounter')}
                                </Button>
                              </>
                            )}
                          </>
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {rows.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noEncountersToDisplay', 'No encounters to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : null}

          {showAllEncounters ? (
            <PatientChartPagination
              currentItems={paginatedVisits.length}
              onPageNumberChange={({ page }) => goTo(page)}
              pageNumber={currentPage}
              pageSize={visitCount}
              totalItems={filteredRows.length}
            />
          ) : null}
        </>
      )}
    </DataTable>
  );
};

export default VisitTable;
