import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, Link, OverflowMenu, OverflowMenuItem, DataTableSkeleton, Pagination } from '@carbon/react';
import { AddIcon, navigate, showModal, showSnackbar, useConfig, type Visit } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { EncounterListDataTable } from './table.component';
import { type LaunchAction, launchEncounterForm } from '../utils/helpers';
import { deleteEncounter } from '../utils/encounter-list.resource';
import { useEncounterRows, useFormsJson } from '../hooks';
import type { TableRow, Encounter, FormattedColumn, Action } from '../types';
import type { ChartConfig } from '../../config-schema';
import styles from './encounter-list.scss';

export interface EncounterListProps {
  patientUuid: string;
  encounterType: string;
  columns: Array<FormattedColumn>;
  headerTitle: string;
  description: string;
  formList?: Array<{
    name?: string;
    uuid: string;
    excludedIntents?: Array<string>;
    fixedIntent?: string;
    isDefault?: boolean;
  }>;
  launchOptions: {
    hideFormLauncher?: boolean;
    displayText?: string;
    workspaceWindowSize?: 'minimized' | 'maximized';
  };
  filter?: (encounter: Encounter) => boolean;
  afterFormSaveAction?: () => void;
  deathStatus?: boolean;
  visit: Visit;
}

export const EncounterList: React.FC<EncounterListProps> = ({
  patientUuid,
  encounterType,
  columns,
  headerTitle,
  description,
  formList,
  filter,
  launchOptions,
  afterFormSaveAction,
  visit,
  deathStatus,
}) => {
  const { t } = useTranslation();
  const { requireActiveVisitForEncounterTile } = useConfig<Pick<ChartConfig, 'requireActiveVisitForEncounterTile'>>();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { formsJson, isLoading: isLoadingFormsJson } = useFormsJson(formList?.[0]?.uuid);
  const { encounters, total, isLoading, onFormSave, mutate } = useEncounterRows(
    patientUuid,
    encounterType,
    filter,
    afterFormSaveAction,
    pageSize,
    currentPage,
  );

  const { displayText, hideFormLauncher } = launchOptions;

  const defaultActions = useMemo(
    () =>
      [
        {
          label: t('viewEncounter', 'View'),
          form: {
            name: formsJson?.name,
          },
          mode: 'view',
          intent: '*',
        },
        {
          label: t('editEncounter', 'Edit'),
          form: {
            name: formsJson?.name,
          },
          mode: 'edit',
          intent: '*',
        },
        {
          label: t('deleteEncounter', 'Delete'),
          form: {
            name: formsJson?.name,
          },
          mode: 'delete',
          intent: '*',
        },
      ] as Array<Action>,
    [formsJson, t],
  );

  const createLaunchFormAction = useCallback(
    (encounter: Encounter, mode: LaunchAction) => () => {
      launchEncounterForm(formsJson, mode, '*', requireActiveVisitForEncounterTile, visit, encounter.uuid);
    },
    [formsJson, visit, requireActiveVisitForEncounterTile],
  );

  const handleDeleteEncounter = useCallback(
    (encounterUuid: string, encounterTypeName: string) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              onFormSave();
              mutate();
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
            })
            .finally(() => {
              close();
            });
        },
      });
    },
    [onFormSave, t, mutate],
  );

  const tableRows = useMemo(() => {
    return encounters.map((encounter: Encounter) => {
      const tableRow: TableRow = { id: encounter.uuid };

      encounter['launchFormActions'] = {
        editEncounter: createLaunchFormAction(encounter, 'edit'),
        viewEncounter: createLaunchFormAction(encounter, 'view'),
      };

      columns.forEach((column) => {
        let val = column?.getValue(encounter);
        if (column.link) {
          val = (
            <Link
              onClick={(e) => {
                e.preventDefault();
                if (column.link.handleNavigate) {
                  column.link.handleNavigate(encounter);
                } else if (column.link?.getUrl) {
                  navigate({ to: column.link.getUrl(encounter) });
                }
              }}
            >
              {typeof val === 'string' ? val : ''}
            </Link>
          );
        }
        tableRow[column.key] = val;
      });

      const actions =
        Array.isArray(tableRow.actions) && tableRow.actions.length > 0 ? tableRow.actions : defaultActions;

      tableRow['actions'] = (
        <OverflowMenu flipped className={styles.flippedOverflowMenu} data-testid="actions-id">
          {actions.map((actionItem: Action, index: number) => {
            const form = formsJson && actionItem?.form?.name ? formsJson.name === actionItem.form.name : null;

            return (
              form && (
                <OverflowMenuItem
                  key={index}
                  index={index}
                  itemText={t(actionItem.label)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (actionItem.mode === 'delete') {
                      handleDeleteEncounter(encounter.uuid, encounter.encounterType.name);
                    } else {
                      launchEncounterForm(
                        formsJson,
                        actionItem.mode,
                        actionItem.intent,
                        requireActiveVisitForEncounterTile,
                        visit,
                        encounter.uuid,
                      );
                    }
                  }}
                />
              )
            );
          })}
        </OverflowMenu>
      );

      return tableRow;
    });
  }, [
    encounters,
    createLaunchFormAction,
    columns,
    defaultActions,
    formsJson,
    t,
    handleDeleteEncounter,
    visit,
    requireActiveVisitForEncounterTile,
  ]);

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: t(column.header) };
      });
    }
    return [];
  }, [columns, t]);

  const formLauncher = useMemo(() => {
    if (formsJson) {
      return (
        <Button
          kind="ghost"
          renderIcon={() => <AddIcon className={styles.headerIcon} />}
          iconDescription="Add"
          onClick={(e) => {
            e.preventDefault();
            launchEncounterForm(formsJson, 'add', '*', requireActiveVisitForEncounterTile, visit);
          }}
        >
          {t(displayText)}
        </Button>
      );
    }
    return null;
  }, [formsJson, displayText, t, visit, requireActiveVisitForEncounterTile]);

  if (isLoading === true || isLoadingFormsJson === true) {
    return <DataTableSkeleton rowCount={10} />;
  }

  return (
    <>
      {tableRows?.length > 0 || encounters.length > 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              <h4 className={classNames(styles.productiveHeading03)}>{t(headerTitle)}</h4>
              {!(hideFormLauncher ?? deathStatus) && <div className={styles.toggleButtons}>{formLauncher}</div>}
            </div>
            <EncounterListDataTable tableHeaders={headers} tableRows={tableRows} />
            <Pagination
              page={currentPage}
              pageSizes={[10, 20, 30, 40, 50]}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
              pageSize={pageSize}
              totalItems={total}
            />
          </div>
        </>
      ) : (
        <EmptyState
          displayText={t(description)}
          headerTitle={t(headerTitle)}
          launchForm={
            hideFormLauncher || deathStatus
              ? null
              : () => launchEncounterForm(formsJson, 'add', '*', requireActiveVisitForEncounterTile, visit)
          }
        />
      )}
    </>
  );
};
