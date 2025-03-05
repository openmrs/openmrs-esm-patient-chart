import React, { type ComponentProps, useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
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
  type DataTableHeader,
} from '@carbon/react';
import {
  EditIcon,
  formatDatetime,
  getConfig,
  isDesktop,
  parseDate,
  showModal,
  showSnackbar,
  TrashCanIcon,
  useLayoutType,
  usePagination,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import {
  type HtmlFormEntryForm,
  EmptyState,
  PatientChartPagination,
  launchFormEntryOrHtmlForms,
  useMutateVisits,
} from '@openmrs/esm-patient-common-lib';
import { deleteEncounter } from './visits-table.resource';
import { type MappedEncounter } from '../../visit.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './encounters-table.scss';

interface VisitTableProps {
  encounters: Array<MappedEncounter>;
  showAllEncounters?: boolean;
  patientUuid: string;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<typeof DataTableHeader>;
  cellsById: Record<string, Record<string, boolean | string | null | Record<string, unknown>>>;
  inputValue: string;
  getCellId: (row, key) => string;
};

const EncountersTable: React.FC<VisitTableProps> = ({ showAllEncounters, encounters, patientUuid }) => {
  const pageSize = 20;
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();
  const { mutateVisits } = useMutateVisits(patientUuid);

  const [htmlFormEntryFormsConfig, setHtmlFormEntryFormsConfig] = useState<Array<HtmlFormEntryForm> | undefined>();

  useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryFormsConfig(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  });

  const encounterTypes = [...new Set(encounters.map((encounter) => encounter.encounterType))].sort();

  const [filter, setFilter] = useState('');

  const filteredRows = useMemo(() => {
    if (!filter || filter == 'All') {
      return encounters;
    }

    if (filter) {
      return encounters?.filter((encounter) => encounter.encounterType === filter);
    }

    return encounters;
  }, [filter, encounters]);

  const { results: paginatedEncounters, goTo, currentPage } = usePagination(filteredRows ?? [], pageSize);

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
    return paginatedEncounters?.map((encounter) => ({
      ...encounter,
      formName: encounter.form?.display ?? '--',
      datetime: formatDatetime(parseDate(encounter.datetime)),
    }));
  }, [paginatedEncounters]);

  const handleEncounterTypeChange = useCallback(({ selectedItem }) => setFilter(selectedItem), []);

  const handleDeleteEncounter = useCallback(
    (visitUuid: string, encounterUuid: string, encounterTypeName: string) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              mutateVisits(visitUuid);
              showSnackbar({
                isLowContrast: true,
                title: t('encounterDeleted', 'Encounter deleted'),
                subtitle: t('encounterSuccessfullyDeleted', 'The encounter has been deleted successfully'),
                kind: 'success',
              });
            })
            .catch(() => {
              showSnackbar({
                isLowContrast: false,
                title: t('error', 'Error'),
                subtitle: t(
                  'encounterWithError',
                  'The encounter could not be deleted successfully. If the error persists, please contact your system administrator.',
                ),
                kind: 'error',
              });
            });
          close();
        },
      });
    },
    [t, mutateVisits],
  );

  const handleFilter = useCallback(
    ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
      return rowIds.filter((rowId) =>
        headers.some(({ key }) => {
          const cellId = getCellId(rowId, key);
          const filterableValue = cellsById[cellId].value;
          const filterTerm = inputValue.toLowerCase();

          return ('' + filterableValue).toLowerCase().includes(filterTerm);
        }),
      );
    },
    [],
  );

  if (!encounters?.length) {
    return (
      <div className={styles.container}>
        <EmptyState headerTitle={t('encounters', 'Encounters')} displayText={t('encounters__lower', 'encounters')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable
        filterRows={handleFilter}
        headers={tableHeaders}
        rows={tableRows}
        overflowMenuOnHover={desktopLayout}
        size={desktopLayout ? 'sm' : 'lg'}
        useZebraStyles={encounters?.length > 1 ? true : false}
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
                    const selectedEncounter = encounters.find((encounter) => encounter.id === row.id);

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
                                  <OverflowMenuItem
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    className={styles.menuItem}
                                    itemText={t('goToThisEncounter', 'Go to this encounter')}
                                  />
                                  {userHasAccess(selectedEncounter?.editPrivilege, session?.user) &&
                                    selectedEncounter?.form?.uuid && (
                                      <OverflowMenuItem
                                        className={styles.menuItem}
                                        itemText={t('editThisEncounter', 'Edit this encounter')}
                                        size={desktopLayout ? 'sm' : 'lg'}
                                        onClick={() => {
                                          launchFormEntryOrHtmlForms(
                                            htmlFormEntryFormsConfig,
                                            patientUuid,
                                            selectedEncounter?.form?.uuid,
                                            selectedEncounter?.visitUuid,
                                            selectedEncounter?.id,
                                            selectedEncounter?.form?.display,
                                            selectedEncounter?.visitTypeUuid,
                                            selectedEncounter?.visitStartDatetime,
                                            selectedEncounter?.visitStopDatetime,
                                          );
                                        }}
                                      />
                                    )}
                                  {userHasAccess(selectedEncounter?.editPrivilege, session?.user) && (
                                    <OverflowMenuItem
                                      size={desktopLayout ? 'sm' : 'lg'}
                                      className={styles.menuItem}
                                      itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                      onClick={() =>
                                        handleDeleteEncounter(
                                          selectedEncounter.visitUuid,
                                          selectedEncounter.id,
                                          selectedEncounter.form?.display,
                                        )
                                      }
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
                              <EncounterObservations observations={selectedEncounter?.obs} />
                              {userHasAccess(selectedEncounter?.editPrivilege, session?.user) && (
                                <>
                                  {selectedEncounter?.form?.uuid && (
                                    <Button
                                      kind="ghost"
                                      onClick={() => {
                                        launchFormEntryOrHtmlForms(
                                          htmlFormEntryFormsConfig,
                                          patientUuid,
                                          selectedEncounter?.form?.uuid,
                                          selectedEncounter?.visitUuid,
                                          selectedEncounter?.id,
                                          selectedEncounter?.form?.display,
                                          selectedEncounter?.visitTypeUuid,
                                          selectedEncounter?.visitStartDatetime,
                                          selectedEncounter?.visitStopDatetime,
                                        );
                                      }}
                                      renderIcon={(props: ComponentProps<typeof EditIcon>) => (
                                        <EditIcon size={16} {...props} />
                                      )}
                                    >
                                      {t('editThisEncounter', 'Edit this encounter')}
                                    </Button>
                                  )}
                                  <Button
                                    kind="danger--ghost"
                                    onClick={() =>
                                      handleDeleteEncounter(
                                        selectedEncounter.visitUuid,
                                        selectedEncounter?.id,
                                        selectedEncounter?.form?.display,
                                      )
                                    }
                                    renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => (
                                      <TrashCanIcon size={16} {...props} />
                                    )}
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
              <div className={styles.paginationContainer}>
                <PatientChartPagination
                  currentItems={paginatedEncounters.length}
                  onPageNumberChange={({ page }) => goTo(page)}
                  pageNumber={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredRows.length}
                />
              </div>
            ) : null}
          </>
        )}
      </DataTable>
    </div>
  );
};

export default EncountersTable;
