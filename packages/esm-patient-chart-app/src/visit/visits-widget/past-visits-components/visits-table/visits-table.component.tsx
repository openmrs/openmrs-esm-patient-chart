import React, { useEffect, useState } from 'react';
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
import { Edit } from '@carbon/react/icons';
import { formatDatetime, formatTime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { formEntrySub, launchPatientWorkspace, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { MappedEncounter } from '../visit-summary.component';
import styles from './visits-table.scss';
import EncounterObservations from '../../encounter-observations';

interface VisitTableProps {
  visits: Array<MappedEncounter>;
  showAllEncounters?: boolean;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

const VisitTable: React.FC<VisitTableProps> = ({ showAllEncounters, visits }) => {
  const encountersCount = 20;
  const { t } = useTranslation();
  const encounterTypes = [...new Set(visits.map((encounter) => encounter.encounterType))].sort();
  const { results: paginatedEncounters, goTo, currentPage } = usePagination(visits ?? [], encountersCount);
  const isTablet = useLayoutType() === 'tablet';
  const [filteredRows, setFilteredRows] = useState<Array<MappedEncounter>>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (filter) {
      setFilteredRows(visits?.filter((encounter) => encounter.encounterType === filter));
      setFilter('');
    }
  }, [filter, filteredRows, visits]);

  const tableHeaders = [
    {
      id: 1,
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
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

  if (showAllEncounters) {
    tableHeaders.push({
      id: 2,
      header: t('visitType', 'Visit type'),
      key: 'visitType',
    });

    tableHeaders.sort((a, b) => (a.id > b.id ? 1 : -1));
  }

  const launchWorkspace = (formUuid: string, visitUuid?: string, encounterUuid?: string, formName?: string) => {
    formEntrySub.next({ formUuid, visitUuid, encounterUuid });
    launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName });
  };

  const tableRows = React.useMemo(() => {
    return (filteredRows.length ? filteredRows : paginatedEncounters)?.map((encounter) => ({
      ...encounter,
      datetime: formatDatetime(parseDate(encounter?.datetime)),
    }));
  }, [filteredRows, showAllEncounters, paginatedEncounters]);

  const handleEncounterTypeChange = ({ selectedItem }) => {
    setFilter(selectedItem);
  };

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
      data-floating-menu-container
      filterRows={handleFilter}
      headers={tableHeaders}
      rows={tableRows}
      overflowMenuOnHover={isTablet ? false : true}
      size={isTablet ? 'lg' : 'xs'}
      useZebraStyles={visits?.length > 1 ? true : false}
    >
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getToolbarProps, onInputChange }) => (
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
                    size="sm"
                  />
                </div>
                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                  size={isTablet ? 'lg' : 'sm'}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header, i) => (
                    <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  {showAllEncounters ? <TableExpandHeader /> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      {showAllEncounters ? (
                        <TableCell className="cds--table-column-menu">
                          <Layer>
                            <OverflowMenu ariaLabel="Actions menu" size="sm" flipped>
                              <OverflowMenuItem
                                className={styles.menuItem}
                                id="#editEncounter"
                                itemText={t('editThisEncounter', 'Edit this encounter')}
                                onClick={() =>
                                  launchWorkspace(
                                    visits[i].form.uuid,
                                    visits[i].visitUuid,
                                    visits[i].id,
                                    visits[i].form.display,
                                  )
                                }
                              >
                                {t('editThisEncounter', 'Edit this encounter')}
                              </OverflowMenuItem>
                              <OverflowMenuItem
                                className={styles.menuItem}
                                id="#goToEncounter"
                                itemText={t('goToThisEncounter', 'Go to this encounter')}
                              >
                                {t('editThisEncounter', 'Edit this encounter')}
                              </OverflowMenuItem>
                              <OverflowMenuItem
                                className={styles.menuItem}
                                id="#editEncounter"
                                itemText={t('deleteThisEncounter', 'Delete this encounter')}
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
                      <TableExpandedRow
                        className={styles.expandedRow}
                        style={{ paddingLeft: isTablet ? '4rem' : '3rem' }}
                        colSpan={headers.length + 2}
                      >
                        <>
                          <EncounterObservations observations={visits[i].obs} />
                          <Button
                            kind="ghost"
                            onClick={() => launchWorkspace(visits[i].form.uuid, visits[i].visitUuid, visits[i].id)}
                            renderIcon={(props) => <Edit size={16} {...props} />}
                            style={{ marginLeft: '-1rem', marginTop: '0.5rem' }}
                          >
                            {t('editEncounter', 'Edit encounter')}
                          </Button>
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
                  <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : null}
          {showAllEncounters ? (
            <PatientChartPagination
              currentItems={paginatedEncounters.length}
              onPageNumberChange={({ page }) => goTo(page)}
              pageNumber={currentPage}
              pageSize={encountersCount}
              totalItems={visits.length}
            />
          ) : null}
        </>
      )}
    </DataTable>
  );
};

export default VisitTable;
