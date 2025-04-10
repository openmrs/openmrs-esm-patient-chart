import React, { type ComponentProps, useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
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
  Tile,
  ComboBox,
  InlineLoading,
  DataTableSkeleton,
} from '@carbon/react';
import {
  EditIcon,
  isDesktop,
  showModal,
  showSnackbar,
  TrashCanIcon,
  useLayoutType,
  useSession,
  userHasAccess,
  useConfig,
  type Visit,
  type EncounterType,
} from '@openmrs/esm-framework';
import {
  type HtmlFormEntryForm,
  PatientChartPagination,
  launchFormEntryOrHtmlForms,
} from '@openmrs/esm-patient-common-lib';
import { deleteEncounter, mapEncounter, useEncounterTypes, usePaginatedEncounters } from './encounters-table.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './encounters-table.scss';

interface EncountersTableProps {
  visitToShowEncounters?: Visit;
  showAllEncounters?: boolean;
  patientUuid: string;
  mutateVisits?: () => void;
}

const EncountersTable: React.FC<EncountersTableProps> = ({
  visitToShowEncounters,
  showAllEncounters,
  patientUuid,
  mutateVisits,
}) => {
  const pageSize = 20;
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();

  const formsConfig: { htmlFormEntryFormsConfig: HtmlFormEntryForm[] } = useConfig({
    externalModuleName: '@openmrs/esm-patient-forms-app',
  });
  const { htmlFormEntryFormsConfig } = formsConfig;

  const { data: encounterTypes, isLoading: isLoadingEncounterTypes, mutate } = useEncounterTypes();
  const [selectedEncounterType, setSelectedEncounterType] = useState<EncounterType>();

  const fetchEncounters = !visitToShowEncounters;
  const {
    data: paginatedEncounters,
    currentPage,
    isLoading,
    totalCount,
    goTo,
  } = usePaginatedEncounters(fetchEncounters ? patientUuid : null, selectedEncounterType?.uuid, pageSize);

  const tableHeaders = [
    {
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
    },
    ...(visitToShowEncounters
      ? []
      : [
          {
            header: t('visitType', 'Visit type'),
            key: 'visitType',
          },
        ]),
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
  ];

  const tableRows = useMemo(() => {
    return paginatedEncounters?.map(mapEncounter);
  }, [paginatedEncounters]);

  const handleDeleteEncounter = useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              mutate();
              mutateVisits?.();

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
    [mutateVisits, t, mutate],
  );

  if (isLoadingEncounterTypes) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  return (
    <div className={styles.container}>
      <DataTable
        headers={tableHeaders}
        rows={tableRows ?? []}
        overflowMenuOnHover={desktopLayout}
        size={desktopLayout ? 'sm' : 'lg'}
        useZebraStyles={totalCount > 1 ? true : false}
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandHeaderProps,
          getToolbarProps,
          getTableProps,
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
                    <ComboBox
                      className={styles.substitutionType}
                      id="encounterTypeFilter"
                      size={'sm'}
                      items={encounterTypes}
                      itemToString={(item: EncounterType) => item?.display}
                      onChange={({ selectedItem }) => {
                        setSelectedEncounterType(selectedItem);
                      }}
                      placeholder={t('filterByEncounterType', 'Filter by encounter type')}
                      selectedItem={selectedEncounterType}
                    />
                  </div>
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
                  {rows?.map((row) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
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
                                {userHasAccess(row?.editPrivilege, session?.user) && row?.form?.uuid && (
                                  <OverflowMenuItem
                                    className={styles.menuItem}
                                    itemText={t('editThisEncounter', 'Edit this encounter')}
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    onClick={() => {
                                      launchFormEntryOrHtmlForms(
                                        htmlFormEntryFormsConfig,
                                        patientUuid,
                                        row?.form?.uuid,
                                        row?.visitUuid,
                                        row?.id,
                                        row?.form?.display,
                                        row?.visitTypeUuid,
                                        row?.visitStartDatetime,
                                        row?.visitStopDatetime,
                                      );
                                    }}
                                  />
                                )}
                                {userHasAccess(row?.editPrivilege, session?.user) && (
                                  <OverflowMenuItem
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    className={styles.menuItem}
                                    itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                    onClick={() => handleDeleteEncounter(row.id, row.form?.display)}
                                    hasDivider
                                    isDelete
                                  />
                                )}
                              </OverflowMenu>
                            </Layer>
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                            <>
                              <EncounterObservations observations={row?.obs} />
                              {userHasAccess(row?.editPrivilege, session?.user) && (
                                <>
                                  {row?.form?.uuid && (
                                    <Button
                                      kind="ghost"
                                      onClick={() => {
                                        launchFormEntryOrHtmlForms(
                                          htmlFormEntryFormsConfig,
                                          patientUuid,
                                          row?.form?.uuid,
                                          row?.visitUuid,
                                          row?.id,
                                          row?.form?.display,
                                          row?.visitTypeUuid,
                                          row?.visitStartDatetime,
                                          row?.visitStopDatetime,
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
                                    onClick={() => handleDeleteEncounter(row?.id, row?.form?.display)}
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
              {isLoading && <InlineLoading />}
              {rows?.length === 0 && (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noEncountersToDisplay', 'No encounters to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              )}
            </TableContainer>

            <div className={styles.paginationContainer}>
              <PatientChartPagination
                currentItems={rows?.length}
                onPageNumberChange={({ page }) => goTo(page)}
                pageNumber={currentPage}
                pageSize={pageSize}
                totalItems={totalCount}
              />
            </div>
          </>
        )}
      </DataTable>
    </div>
  );
};

export default EncountersTable;
