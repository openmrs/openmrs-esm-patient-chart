import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { navigate, showModal, showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EncounterListDataTable } from './table.component';
import { EmptyState } from './empty-state.component';
import {
  Button,
  Link,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  DataTableSkeleton,
  MenuButton,
  MenuItem,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { deleteEncounter, launchEncounterForm } from '../utils/helpers';
import { useEncounterRows, useFormsJson, usePatientDeathStatus } from '../hooks';
import { type Encounter } from '../types';

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
    name: string;
    uuid?: string;
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
  const [paginatedRows, setPaginatedRows] = useState([]);
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isDead } = usePatientDeathStatus(patientUuid);
  const formUuids = useMemo(() => formList.map((form) => form.uuid), [formList]);

  const { formsJson, isLoading: isLoadingFormsJson } = useFormsJson(formUuids);

  const { encounters, isLoading, onFormSave } = useEncounterRows(
    patientUuid,
    encounterType,
    filter,
    afterFormSaveAction,
  );

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

  const generateActionMenu = (actions, encounter, handleDeleteEncounter, launchEncounterForm) => (
    <OverflowMenu flipped className={styles.flippedOverflowMenu} data-testid="actions-id">
      {actions.map((actionItem, index) => {
        const form = formsJson.find((form) => form.name === actionItem?.form?.name);

        return (
          form && (
            <OverflowMenuItem
              key={index}
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

  const createLaunchFormAction = (encounter, mode) => () =>
    launchEncounterForm(formsJson[0], mode, onFormSave, null, encounter.uuid, null, workspaceWindowSize, patientUuid);

  const constructTableRows = (encounters, columns, defaultActions, launchEncounterForm, handleDelete) => {
    return encounters.map((encounter) => {
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
                      ? handleDelete(encounter.uuid, encounter.encounterType.name)
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
  };

  const constructPaginatedTableRows = useCallback(
    (encounters: Encounter[], currentPage: number, pageSize: number) => {
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedEncounters = encounters.slice(startIndex, startIndex + pageSize);
      const rows = constructTableRows(
        paginatedEncounters,
        columns,
        defaultActions,
        launchEncounterForm,
        handleDeleteEncounter,
      );
      setPaginatedRows(rows);
    },
    [columns, defaultActions, constructTableRows], // eslint-disable-line
  );

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
              const updatedEncounters = encounters.filter((enc) => enc.uuid !== encounterUuid);
              constructPaginatedTableRows(updatedEncounters, currentPage, pageSize);
              close();
            });
        },
      });
    },
    [currentPage, encounters, onFormSave, pageSize, t, constructPaginatedTableRows],
  );

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  useEffect(() => {
    if (encounters?.length) {
      constructPaginatedTableRows(encounters, currentPage, pageSize);
    }
  }, [encounters, pageSize, constructPaginatedTableRows, currentPage]);

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
      {paginatedRows?.length > 0 || encounters.length > 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
              {/* @ts-ignore */}
              {!(hideFormLauncher ?? isDead) && <div className={styles.toggleButtons}>{formLauncher}</div>}
            </div>
            <EncounterListDataTable tableHeaders={headers} tableRows={paginatedRows} />
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={encounters.length}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </div>
        </>
      ) : (
        <EmptyState
          displayText={description}
          headerTitle={headerTitle}
          launchForm={() =>
            launchEncounterForm(forms[0], 'add', onFormSave, null, '', '*', workspaceWindowSize, patientUuid)
          }
          launchFormComponent={formLauncher}
          hideFormLauncher={hideFormLauncher ?? isDead}
        />
      )}
    </>
  );
};
