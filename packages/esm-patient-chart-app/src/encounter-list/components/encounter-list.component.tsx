import React, { useCallback, useMemo } from 'react';
import { navigate, showModal, showSnackbar, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { EncounterListDataTable } from './table.component';
import { Button, Link, OverflowMenu, OverflowMenuItem, DataTableSkeleton, MenuButton, MenuItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchEncounterForm } from '../../clinical-views/utils/helpers';
import { deleteEncounter } from '../encounter-list.resource';
import { useEncounterRows, useFormsJson, usePatientDeathStatus } from '../hooks';

import styles from './encounter-list.scss';

export interface EncounterListColumn {
  key: string;
  header: string;
  getValue: (encounter: any) => string;
  link?: any;
}

export interface EncounterListProps {
  patientUuid: string;
  encounterType: string;
  columns: Array<any>;
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
  filter?: (encounter: any) => boolean;
  afterFormSaveAction?: () => void;
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
}) => {
  const { t } = useTranslation();
  const { isDead } = usePatientDeathStatus(patientUuid);
  const formUuids = useMemo(() => formList.map((form) => form.uuid), [formList]);

  const { formsJson, isLoading: isLoadingFormsJson } = useFormsJson(formUuids);

  const { encounters, isLoading, onFormSave, mutate } = useEncounterRows(
    patientUuid,
    encounterType,
    filter,
    afterFormSaveAction,
  );

  const encountersPageSize = 10;
  const { results: paginatedEncounters, goTo, currentPage } = usePagination(encounters ?? [], encountersPageSize);
  const { workspaceWindowSize, displayText, hideFormLauncher } = launchOptions;

  const defaultActions = useMemo(
    () => [
      {
        label: t('viewEncounter', 'View'),
        form: {
          name: formsJson[0]?.name,
        },
        mode: 'view',
        intent: '*',
      },
      {
        label: t('editEncounter', 'Edit'),
        form: {
          name: formsJson[0]?.name,
        },
        mode: 'edit',
        intent: '*',
      },
      {
        label: t('deleteEncounter', 'Delete'),
        form: {
          name: formsJson[0]?.name,
        },
        mode: 'delete',
        intent: '*',
      },
    ],
    [formsJson, t],
  );

  const createLaunchFormAction = (encounter, mode) => () =>
    launchEncounterForm(formsJson[0], mode, onFormSave, null, encounter.uuid, null, workspaceWindowSize, patientUuid);

  const handleDeleteEncounter = useCallback(
    (encounterUuid, encounterTypeName) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              onFormSave();
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
            })
            .finally(() => {
              mutate();
              close();
            });
        },
      });
    },
    [onFormSave, t, mutate],
  );

  const tableRows = paginatedEncounters.map((encounter) => {
    const tableRow: { id: string; actions: any } = { id: encounter.uuid, actions: null };

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
              } else {
                column.link?.getUrl && navigate({ to: column.link.getUrl() });
              }
            }}
          >
            {val}
          </Link>
        );
      }
      tableRow[column.key] = val;
    });

    const actions = tableRow.actions?.length ? tableRow.actions : defaultActions;

    tableRow['actions'] = (
      <OverflowMenu flipped className={styles.flippedOverflowMenu} data-testid="actions-id">
        {actions.map((actionItem, index) => {
          const form = formsJson.length ? formsJson?.find((form) => form.name === actionItem?.form?.name) : null;

          return (
            form && (
              <OverflowMenuItem
                index={index}
                itemText={actionItem.label}
                onClick={(e) => {
                  e.preventDefault();
                  actionItem.mode === 'delete'
                    ? handleDeleteEncounter(encounter.uuid, encounter.encounterType.name)
                    : launchEncounterForm(
                        form,
                        actionItem.mode === 'enter' ? 'add' : actionItem.mode,
                        onFormSave,
                        null,
                        encounter.uuid,
                        actionItem.intent,
                        workspaceWindowSize,
                        patientUuid,
                      );
                }}
              />
            )
          );
        })}
      </OverflowMenu>
    );

    return tableRow;
  });

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  const formLauncher = useMemo(() => {
    if (formsJson.length == 1 && !formsJson[0]['availableIntents']?.length) {
      // we only have one form with no intents
      // just return the "Add" button
      return (
        <Button
          kind="ghost"
          renderIcon={Add}
          iconDescription="Add "
          onClick={(e) => {
            e.preventDefault();
            launchEncounterForm(formsJson[0], 'add', onFormSave, null, '', '*', workspaceWindowSize, patientUuid);
          }}
        >
          {displayText}
        </Button>
      );
    } else if (formsJson.length && !(hideFormLauncher ?? isDead)) {
      return (
        <MenuButton label={t('add', 'Add')} kind="ghost" menuAlignment="bottom-end">
          {formsJson.map((form, index) => (
            <MenuItem
              key={index}
              label={form.name}
              onClick={() =>
                launchEncounterForm(form, 'add', onFormSave, null, '', '*', workspaceWindowSize, patientUuid)
              }
            />
          ))}
        </MenuButton>
      );
    }
    return null;
  }, [formsJson, hideFormLauncher, isDead, displayText, onFormSave, workspaceWindowSize, patientUuid, t]);

  if (isLoading === true || isLoadingFormsJson === true) {
    return <DataTableSkeleton rowCount={5} />;
  }

  return (
    <>
      {tableRows?.length === 0 || encounters.length === 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
              {/* @ts-ignore */}
              {!(hideFormLauncher ?? isDead) && <div className={styles.toggleButtons}>{formLauncher}</div>}
            </div>
            <EncounterListDataTable tableHeaders={headers} tableRows={tableRows} />
            <PatientChartPagination
              currentItems={paginatedEncounters.length}
              onPageNumberChange={({ page }) => goTo(page)}
              pageNumber={currentPage}
              pageSize={encountersPageSize}
              totalItems={encounters.length}
            />
          </div>
        </>
      ) : (
        <EmptyState
          displayText={description}
          headerTitle={headerTitle}
          launchForm={
            hideFormLauncher || isDead
              ? null
              : () =>
                  launchEncounterForm(formsJson[0], 'add', onFormSave, null, '', '*', workspaceWindowSize, patientUuid)
          }
        />
      )}
    </>
  );
};
