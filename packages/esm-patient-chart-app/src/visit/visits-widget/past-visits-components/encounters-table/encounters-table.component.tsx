import React, { type ComponentProps, useCallback, useMemo, useState } from 'react';
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
  Pagination,
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
  type EncounterType,
} from '@openmrs/esm-framework';
import { type HtmlFormEntryForm, launchFormEntryOrHtmlForms } from '@openmrs/esm-patient-common-lib';
import {
  deleteEncounter,
  type EncountersTableProps,
  mapEncounter,
  useEncounterTypes,
} from './encounters-table.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './encounters-table.scss';

/**
 * This components is used by the AllEncountersTable and VisitEncountersTable to display
 * a table of encounters, with the actual data, pagination and filtering logic passed in
 * as props.
 */
const EncountersTable: React.FC<EncountersTableProps> = ({
  patientUuid,
  totalCount,
  currentPage,
  goTo,
  isLoading,
  onEncountersUpdated,
  showVisitType,
  paginated,
  paginatedEncounters,
  encounterTypeToFilter,
  setEncounterTypeToFilter,
  showEncounterTypeFilter,
  pageSize,
  setPageSize,
}) => {
  const pageSizes = [10, 20, 30, 40, 50];

  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();

  const { data: encounterTypes, isLoading: isLoadingEncounterTypes } = useEncounterTypes();

  const formsConfig: { htmlFormEntryForms: HtmlFormEntryForm[] } = useConfig({
    externalModuleName: '@openmrs/esm-patient-forms-app',
  });
  const { htmlFormEntryForms } = formsConfig;
  const paginatedMappedEncounters = useMemo(() => paginatedEncounters?.map(mapEncounter), [paginatedEncounters]);

  const tableHeaders = [
    {
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
    },
    ...(showVisitType
      ? [
          {
            header: t('visitType', 'Visit type'),
            key: 'visitType',
          },
        ]
      : []),
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

  const handleDeleteEncounter = useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      const dispose = showModal('delete-encounter-modal', {
        close: () => dispose(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              onEncountersUpdated();

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
          dispose();
        },
      });
    },
    [onEncountersUpdated, t],
  );

  if (isLoadingEncounterTypes) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  return (
    <div className={styles.container}>
      <DataTable
        headers={tableHeaders}
        rows={paginatedMappedEncounters ?? []}
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
          rows: Array<{ isExpanded: boolean; cells: Array<{ id: string; value: string }> }>;
          headers: typeof tableHeaders;
          [key: string]: any;
        }) => (
          <>
            <TableContainer className={styles.tableContainer}>
              {showEncounterTypeFilter && (
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <div className={styles.filterContainer}>
                      <ComboBox
                        className={styles.substitutionType}
                        id="encounterTypeFilter"
                        aria-label={t('filterByEncounterType', 'Filter by encounter type')}
                        size={desktopLayout ? 'sm' : 'lg'}
                        items={encounterTypes}
                        itemToString={(item: EncounterType) => item?.display}
                        onChange={({ selectedItem }) => {
                          setEncounterTypeToFilter(selectedItem);
                        }}
                        placeholder={t('filterByEncounterType', 'Filter by encounter type')}
                        selectedItem={encounterTypeToFilter}
                      />
                    </div>
                  </TableToolbarContent>
                </TableToolbar>
              )}
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableExpandHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.map((row, i) => {
                    const encounter = paginatedMappedEncounters[i];
                    return (
                      <React.Fragment key={encounter.id}>
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
                                {userHasAccess(encounter.editPrivilege, session?.user) && encounter.form?.uuid && (
                                  <OverflowMenuItem
                                    className={styles.menuItem}
                                    itemText={t('editThisEncounter', 'Edit this encounter')}
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    onClick={() => {
                                      launchFormEntryOrHtmlForms(
                                        htmlFormEntryForms,
                                        patientUuid,
                                        encounter.form?.uuid,
                                        encounter.visitUuid,
                                        encounter.id,
                                        encounter.form?.display,
                                        encounter.visitTypeUuid,
                                        encounter.visitStartDatetime,
                                        encounter.visitStopDatetime,
                                      );
                                    }}
                                  />
                                )}
                                {userHasAccess(encounter.editPrivilege, session?.user) && (
                                  <OverflowMenuItem
                                    size={desktopLayout ? 'sm' : 'lg'}
                                    className={styles.menuItem}
                                    itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                    onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
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
                              <EncounterObservations observations={encounter.obs} />
                              {userHasAccess(encounter.editPrivilege, session?.user) && (
                                <>
                                  {encounter.form?.uuid && (
                                    <Button
                                      kind="ghost"
                                      onClick={() => {
                                        launchFormEntryOrHtmlForms(
                                          htmlFormEntryForms,
                                          patientUuid,
                                          encounter.form?.uuid,
                                          encounter.visitUuid,
                                          encounter.id,
                                          encounter.form?.display,
                                          encounter.visitTypeUuid,
                                          encounter.visitStartDatetime,
                                          encounter.visitStopDatetime,
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
                                    onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
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
          </>
        )}
      </DataTable>
      {paginated && (
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={totalCount}
          onChange={({ pageSize: newPageSize, page }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (page !== currentPage) {
              goTo(page);
            }
          }}
        />
      )}
    </div>
  );
};

export default EncountersTable;
