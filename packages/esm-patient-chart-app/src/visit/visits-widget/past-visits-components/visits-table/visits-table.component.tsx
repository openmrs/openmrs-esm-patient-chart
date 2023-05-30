import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
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
  navigate,
  parseDate,
  showModal,
  showToast,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { formEntrySub, launchPatientWorkspace, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import isEmpty from 'lodash-es/isEmpty';
import type { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';
import { MappedEncounter } from '../visit-summary.component';
import EncounterObservations from '../../encounter-observations';
import { deleteEncounter } from './visits-table.resource';
import styles from './visits-table.scss';

interface VisitTableProps {
  visits: Array<MappedEncounter>;
  showAllEncounters?: boolean;
  patientUuid: string;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

const VisitTable: React.FC<VisitTableProps> = ({ showAllEncounters, visits, patientUuid }) => {
  const visitCount = 20;
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());

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
      id: 1,
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
    },
    showAllEncounters && {
      id: 2,
      header: t('visitType', 'Visit type'),
      key: 'visitType',
    },
    {
      id: 3,
      header: t('encounterType', 'Encounter type'),
      key: 'encounterType',
    },
    {
      id: 4,
      header: t('provider', 'Provider'),
      key: 'provider',
    },
  ];

  const launchWorkspace = (
    formUuid: string,
    visitUuid?: string,
    encounterUuid?: string,
    formName?: string,
    visitTypeUuid?: string,
    visitStartDatetime?: string,
    visitStopDatetime?: string,
  ) => {
    const htmlForm = htmlFormEntryFormsConfig?.find((form) => form.formUuid === formUuid);
    if (isEmpty(htmlForm)) {
      formEntrySub.next({ formUuid, visitUuid, encounterUuid, visitTypeUuid, visitStartDatetime, visitStopDatetime });
      launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName, formUuid, encounterUuid });
    } else {
      navigate({
        to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patientUuid}&visitId=${visitUuid}&encounterId=${encounterUuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
      });
    }
  };

  const tableRows = useMemo(() => {
    return paginatedVisits?.map((encounter) => ({
      ...encounter,
      datetime: formatDatetime(parseDate(encounter?.datetime)),
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
              showToast({
                title: t('encounterDeleted', 'Encounter deleted'),
                description: `Encounter ${t('successfullyDeleted', 'successfully deleted')}`,
                kind: 'success',
              });
            })
            .catch((error) => {
              showToast({
                title: t('error', 'Error'),
                description: `Encounter ${t('failedDeleting', "couldn't be deleted")}`,
                kind: 'error',
              });
            });
          close();
        },
      });
    },
    [t],
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

  if (!visits?.length) {
    return <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noEncountersFound', 'No encounters found')}</p>;
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
        rows: Array<typeof tableRows[0] & { isExpanded: boolean; cells: Array<{ id: string; value: string }> }>;
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
                    initialSelectedItem={'All'}
                    label=""
                    titleText={t('filterByEncounterType', 'Filter by encounter type') + ':'}
                    type="inline"
                    items={['All', ...encounterTypes]}
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
                {rows.map((row, index) => (
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
                              ariaLabel="Encounter table actions menu"
                              size={desktopLayout ? 'sm' : 'lg'}
                              flipped
                            >
                              <OverflowMenuItem
                                className={styles.menuItem}
                                itemText={t('editThisEncounter', 'Edit this encounter')}
                                size={desktopLayout ? 'sm' : 'lg'}
                                onClick={() => {
                                  launchWorkspace(
                                    visits[index]?.form?.uuid,
                                    visits[index]?.visitUuid,
                                    visits[index]?.id,
                                    visits[index]?.form?.display,
                                    visits[index]?.visitTypeUuid,
                                    visits[index]?.visitStartDatetime,
                                    visits[index]?.visitStopDatetime,
                                  );
                                }}
                              >
                                {t('editThisEncounter', 'Edit this encounter')}
                              </OverflowMenuItem>
                              <OverflowMenuItem
                                size={desktopLayout ? 'sm' : 'lg'}
                                className={styles.menuItem}
                                itemText={t('goToThisEncounter', 'Go to this encounter')}
                              >
                                {t('goToThisEncounter', 'Go to this encounter')}
                              </OverflowMenuItem>
                              <OverflowMenuItem
                                size={desktopLayout ? 'sm' : 'lg'}
                                className={styles.menuItem}
                                itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                onClick={() => handleDeleteEncounter(visits[index].id, visits[index].form.display)}
                                hasDivider
                                isDelete
                              >
                                itemText={t('deleteThisEncounter', 'Delete this encounter')}
                              </OverflowMenuItem>
                            </OverflowMenu>
                          </Layer>
                        </TableCell>
                      ) : null}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                        <>
                          <EncounterObservations observations={visits[index].obs} />
                          {visits[index]?.form?.uuid && (
                            <Button
                              kind="ghost"
                              onClick={() => {
                                launchWorkspace(
                                  visits[index].form.uuid,
                                  visits[index].visitUuid,
                                  visits[index].id,
                                  visits[index].form.display,
                                  visits[index].visitTypeUuid,
                                  visits[index]?.visitStartDatetime,
                                  visits[index]?.visitStopDatetime,
                                );
                              }}
                              renderIcon={(props) => <Edit size={16} {...props} />}
                            >
                              {t('editThisEncounter', 'Edit this encounter')}
                            </Button>
                          )}
                          {visits[index]?.form?.display && (
                            <Button
                              kind="danger--ghost"
                              onClick={() => handleDeleteEncounter(visits[index].id, visits[index].form.display)}
                              renderIcon={(props) => <TrashCan size={16} {...props} />}
                            >
                              {t('deleteThisEncounter', 'Delete this encounter')}
                            </Button>
                          )}
                        </>
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
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
