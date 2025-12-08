import React, { useState, useCallback, type ComponentProps, useMemo } from 'react';
import {
  usePagination,
  useConfig,
  formatDate,
  formatTime,
  showSnackbar,
  useSession,
  useLayoutType,
  isDesktop,
  EditIcon,
  AddIcon,
  type Concept,
  userHasAccess,
  type Privilege,
  getCoreTranslation,
} from '@openmrs/esm-framework';
import {
  Button,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  InlineLoading,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  IconButton,
} from '@carbon/react';
import { Checkmark, Close } from '@carbon/react/icons';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import styles from './obs-table-horizontal.scss';
import { useTranslation } from 'react-i18next';
import { type ConfigObjectHorizontal } from '../config-schema-obs-horizontal';
import { updateObservation, createObservationInEncounter, createEncounter } from './obs-table-horizontal.resource';
import classNames from 'classnames';
import { useEncounterTypes } from '../resources/useEncounterTypes';

interface ObsTableHorizontalProps {
  patientUuid: string;
}

interface ColumnData {
  id: string;
  date: Date;
  encounter: { value: string; editPrivilege: Privilege };
  encounterReference: string;
  encounterUuid: string | null; // null for temporary encounters
  obs: Record<string, CellData>;
  isTemporary?: boolean; // true for encounters that haven't been saved yet
}

interface CellData {
  value: string | number;
  obsUuid: string;
  dataType: string;
  display?: string;
}

/**
 * This component displays a table of observations, where each column represents an encounter.
 * It may be 'editable' or not. If it is editable, then
 *  - Individual observations can be edited by tapping them or clicking an edit button.
 *  - New encounters can be created by tapping a "plus" button. When the plus button is
 *     tapped, a temporary encounter is created on the front-end only. The new encounter is
 *     only saved to the backend when the first obs value for it is entered.
 */
const ObsTableHorizontal: React.FC<ObsTableHorizontalProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObjectHorizontal>();
  const isTablet = !isDesktop(useLayoutType());
  const {
    data: { observations, concepts, encounters },
    isValidating,
    mutate,
  } = useObs(patientUuid);

  const [temporaryEncounters, setTemporaryEncounters] = useState<Array<ColumnData>>([]);

  let obssGroupedByEncounters = useMemo(
    () =>
      encounters?.length
        ? encounters.map((encounter) => observations.filter((o) => o.encounter.reference === encounter.reference))
        : [],
    [encounters, observations],
  );

  const { encounterTypes, isLoading: isLoadingEncounterTypes, error: errorEncounterTypes } = useEncounterTypes();

  const encounterTypeToCreateEditPrivilege = useMemo(() => {
    return encounterTypes.find((et) => et.uuid === config.encounterTypeToCreateUuid)?.editPrivilege;
  }, [encounterTypes, config.encounterTypeToCreateUuid]);

  const editPrivilegePerEncounterReference = useMemo(() => {
    if (!encounters?.length || isLoadingEncounterTypes || errorEncounterTypes) {
      return {};
    }
    return encounters.reduce(
      (acc, encounter) => {
        const encounterType = encounterTypes.find((et) => et.uuid === encounter.encounterTypeUuid);
        if (encounterType) {
          acc[encounter.reference] = encounterType.editPrivilege;
        }
        return acc;
      },
      {} as Record<string, Privilege>,
    );
  }, [encounterTypes, encounters, isLoadingEncounterTypes, errorEncounterTypes]);

  const conceptByUuid = useMemo(() => {
    return Object.fromEntries(concepts.map((c) => [c.uuid, c]));
  }, [concepts]);

  if (config.oldestFirst) {
    obssGroupedByEncounters.sort(
      (a, b) => new Date(a[0].effectiveDateTime).getTime() - new Date(b[0].effectiveDateTime).getTime(),
    );
  } else {
    obssGroupedByEncounters.sort(
      (a, b) => new Date(b[0].effectiveDateTime).getTime() - new Date(a[0].effectiveDateTime).getTime(),
    );
  }

  let tableRowLabels = config.data.map(({ concept, label }) => ({
    key: concept,
    header: t(label, label) || concepts.find((c) => c.uuid === concept)?.display,
  }));

  if (config.showEncounterType) {
    tableRowLabels = [{ key: 'encounter', header: t('encounterType', 'Encounter type') }, ...tableRowLabels];
  }

  const handleAddEncounter = useCallback(() => {
    const now = new Date();
    const newTemporaryEncounter: ColumnData = {
      id: `temp-${Date.now()}`,
      date: now,
      encounter: { value: '', editPrivilege: encounterTypeToCreateEditPrivilege },
      encounterReference: '',
      encounterUuid: null,
      obs: {},
      isTemporary: true,
    };
    setTemporaryEncounters((prev) => [...prev, newTemporaryEncounter]);
  }, [encounterTypeToCreateEditPrivilege]);

  const handleEncounterCreated = useCallback(
    async (tempEncounterId: string, encounterUuid: string) => {
      await mutate();
      // Remove the temporary encounter from state since it's now in the real data
      setTemporaryEncounters((prev) => prev.filter((enc) => enc.id !== tempEncounterId));
    },
    [mutate],
  );

  const tableColumns = useMemo(() => {
    const existingColumns = obssGroupedByEncounters?.map((obss, index) => {
      const encounterReference = obss[0].encounter.reference;
      const encounterUuid = encounterReference.split('/')[1];
      const columnData: ColumnData = {
        id: `${index}`,
        date: new Date(obss[0].effectiveDateTime),
        encounter: {
          value: obss[0].encounter.name,
          editPrivilege: editPrivilegePerEncounterReference[encounterReference],
        },
        encounterReference,
        encounterUuid,
        obs: {} as Record<string, CellData>,
      };

      for (const obs of obss) {
        switch (conceptByUuid[obs.conceptUuid]?.dataType) {
          case 'Text':
            columnData.obs[obs.conceptUuid] = {
              value: obs.valueString,
              obsUuid: obs.id,
              dataType: 'Text',
            };
            break;

          case 'Numeric': {
            const decimalPlaces: number | undefined = config.data.find(
              (ele: any) => ele.concept === obs.conceptUuid,
            )?.decimalPlaces;

            let value;
            if (obs.valueQuantity?.value % 1 !== 0) {
              value = obs.valueQuantity?.value.toFixed(decimalPlaces);
            } else {
              value = obs.valueQuantity?.value;
            }
            columnData.obs[obs.conceptUuid] = {
              value: value,
              obsUuid: obs.id,
              dataType: 'Numeric',
            };
            break;
          }

          case 'Coded':
            columnData.obs[obs.conceptUuid] = {
              value: obs.valueCodeableConcept?.coding[0]?.code,
              display: obs.valueCodeableConcept?.coding[0]?.display,
              obsUuid: obs.id,
              dataType: 'Coded',
            };
            break;
        }
      }

      return columnData;
    });

    return [...existingColumns, ...temporaryEncounters];
  }, [config.data, obssGroupedByEncounters, conceptByUuid, temporaryEncounters, editPrivilegePerEncounterReference]);

  const { results, goTo, currentPage } = usePagination(tableColumns, config.maxColumns);

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={t(config.title)}>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
        {isTablet && config.editable && (
          <div className={styles.editabilityNote}>{t('editabilityNote', 'Tap an observation to edit')}</div>
        )}
      </CardHeader>
      <HorizontalTable
        tableRowLabels={tableRowLabels}
        tableColumns={results}
        // If encounter types are not loaded or can't be loaded, assume the user does
        // not have the necessary privileges.
        editable={config.editable && !isLoadingEncounterTypes && !errorEncounterTypes}
        patientUuid={patientUuid}
        mutate={mutate}
        concepts={concepts}
        onAddEncounter={handleAddEncounter}
        onEncounterCreated={handleEncounterCreated}
      />
      <PatientChartPagination
        currentItems={results.length}
        totalItems={tableColumns.length}
        pageSize={config.maxColumns}
        pageNumber={currentPage}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

interface HorizontalTableProps {
  tableRowLabels: Array<{ key: string; header: string }>;
  tableColumns: Array<ColumnData>;
  editable: boolean;
  patientUuid: string;
  concepts: Array<Concept>;
  mutate: () => Promise<any>;
  onAddEncounter?: () => void;
  onEncounterCreated?: (tempEncounterId: string, encounterUuid: string) => void;
}

const HorizontalTable: React.FC<HorizontalTableProps> = ({
  tableRowLabels,
  tableColumns,
  editable,
  patientUuid,
  concepts,
  mutate,
  onAddEncounter,
  onEncounterCreated,
}) => {
  const { t } = useTranslation();
  const patientChartConfig = useConfig({ externalModuleName: '@openmrs/esm-patient-chart-app' });
  const encounterEditableDuration = patientChartConfig?.encounterEditableDuration ?? 0;
  const encounterEditableDurationOverridePrivileges =
    patientChartConfig?.encounterEditableDurationOverridePrivileges ?? [];
  const session = useSession();

  return (
    <TableContainer>
      <Table experimentalAutoAlign={true} size="sm" useZebraStyles>
        <TableHead>
          <TableRow>
            <TableHeader>{t('dateAndTime', 'Date and time')}</TableHeader>
            {tableColumns.map((column) => (
              <TableHeader key={`obs-hz-date-${column.id}-${column.date}`}>
                <div className={styles.headerYear}>{column.date.getFullYear()}</div>
                <div className={styles.headerDate}>{formatDate(column.date, { year: false, time: false })}</div>
                <div className={styles.headerTime}>{formatTime(column.date)}</div>
              </TableHeader>
            ))}
            {editable && (
              <TableHeader>
                <IconButton
                  align="bottom-end"
                  kind="ghost"
                  size="sm"
                  label={t('addEncounter', 'Add encounter')}
                  onClick={onAddEncounter}
                >
                  <AddIcon size={16} />
                </IconButton>
              </TableHeader>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRowLabels.map((label) => {
            const dataType = concepts.find((c) => c.uuid === label.key)?.dataType;
            return (
              <TableRow key={`obs-hz-row-${label.key}`}>
                <TableCell>{label.header}</TableCell>
                {tableColumns.map((column) => {
                  const cellData = column.obs[label.key];
                  const encounterAgeInMinutes = (Date.now() - column.date.getTime()) / (1000 * 60);
                  const canEditEncounter =
                    userHasAccess(column.encounter.editPrivilege?.uuid, session?.user) &&
                    (!encounterEditableDuration ||
                      encounterEditableDuration === 0 ||
                      (encounterEditableDuration > 0 && encounterAgeInMinutes <= encounterEditableDuration) ||
                      encounterEditableDurationOverridePrivileges.some((privilege) =>
                        userHasAccess(privilege, session?.user),
                      ));

                  const canEditCell =
                    editable &&
                    canEditEncounter &&
                    label.key !== 'encounter' &&
                    ['Text', 'Numeric', 'Coded'].includes(dataType);

                  return (
                    <Cell
                      key={`obs-hz-value-${column.id}-${label.key}`}
                      cellData={cellData}
                      dataType={dataType}
                      editable={canEditCell}
                      patientUuid={patientUuid}
                      column={column}
                      label={label}
                      concepts={concepts}
                      mutate={mutate}
                      onEncounterCreated={onEncounterCreated}
                    />
                  );
                })}
                {onAddEncounter && <TableCell />}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Cell: React.FC<{
  cellData: CellData;
  editable: boolean;
  dataType: string;
  patientUuid: string;
  column: ColumnData;
  label: { key: string; header: string };
  concepts: Array<Concept>;
  mutate: () => Promise<any>;
  onEncounterCreated?: (tempEncounterId: string, encounterUuid: string) => void;
}> = ({ cellData, dataType, editable, patientUuid, column, label, concepts, mutate, onEncounterCreated }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<string | number>('');
  const isTablet = !isDesktop(useLayoutType());
  const session = useSession();
  const locationUuid = session?.sessionLocation?.uuid;
  const { encounterTypeToCreateUuid } = useConfig<ConfigObjectHorizontal>();

  const conceptKey = label.key;
  const cellKey = `obs-hz-value-${column.id}-${label.key}`;

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditingValue(cellData?.value ?? '');
  }, [cellData?.value]);

  const handleCreateEncounter = useCallback(async () => {
    const response = await createEncounter(patientUuid, encounterTypeToCreateUuid, locationUuid, [
      { concept: conceptKey, value: editingValue },
    ]);
    const createdEncounterUuid = response?.data?.uuid;
    if (createdEncounterUuid) {
      // onEncounterCreated will call mutate() and remove the temporary encounter
      onEncounterCreated(column.id, createdEncounterUuid);
    } else {
      throw new Error('Failed to create encounter');
    }
  }, [patientUuid, encounterTypeToCreateUuid, locationUuid, conceptKey, editingValue, onEncounterCreated, column.id]);

  const handleSave = useCallback(
    async (conceptKey: string) => {
      if (!editingValue || editingValue === cellData?.value) {
        setIsEditing(false);
        setEditingValue('');
        return;
      }

      try {
        if (cellData?.obsUuid) {
          await updateObservation(cellData.obsUuid, editingValue);
          await mutate();
        } else if (column.isTemporary) {
          await handleCreateEncounter();
        } else if (column.encounterUuid) {
          await createObservationInEncounter(column.encounterUuid, patientUuid, conceptKey, editingValue);
          await mutate();
        } else {
          throw new Error('Cannot save observation: missing encounter information');
        }

        showSnackbar({
          title: t('observationSaved', 'Observation saved successfully'),
          kind: 'success',
        });

        setIsEditing(false);
        setEditingValue('');
      } catch (error) {
        await mutate();
        showSnackbar({
          title: t('errorSavingObservation', 'Error saving observation'),
          kind: 'error',
        });
      }
    },
    [
      editingValue,
      patientUuid,
      mutate,
      t,
      cellData?.obsUuid,
      cellData?.value,
      column.encounterUuid,
      column.isTemporary,
      handleCreateEncounter,
    ],
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditingValue('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave(conceptKey);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel, conceptKey],
  );

  if (isEditing) {
    return (
      <TableCell key={cellKey}>
        <div className={styles.editContainer}>
          {dataType === 'Numeric' ? (
            <NumberInput
              id={cellKey}
              size="sm"
              value={editingValue}
              onChange={(e: any, data: any) => setEditingValue(data.value ?? '')}
              onKeyDown={(e) => handleKeyDown(e)}
              autoFocus
              hideSteppers
              allowEmpty
            />
          ) : dataType === 'Text' ? (
            <TextInput
              id={cellKey}
              labelText=""
              size="sm"
              value={editingValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              autoFocus
            />
          ) : (
            <Select
              id={cellKey}
              labelText=""
              size="sm"
              value={editingValue}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setEditingValue(e.target.value);
              }}
              onKeyDown={(e) => handleKeyDown(e)}
              autoFocus
            >
              <SelectItem text={t('noValue', 'No value')} value="" />
              {concepts
                .find((c) => c.uuid === label.key)
                ?.answers?.map((answer) => <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid} />)}
            </Select>
          )}
          <div className={styles.editButtons}>
            <IconButton
              kind="ghost"
              size="sm"
              label={getCoreTranslation('cancel')}
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              <Close size={16} />
            </IconButton>
            <IconButton
              kind="ghost"
              size="sm"
              label={getCoreTranslation('save')}
              onClick={() => handleSave(conceptKey)}
              className={styles.saveButton}
            >
              <Checkmark size={16} />
            </IconButton>
          </div>
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell
      key={cellKey}
      onClick={() => isTablet && editable && handleEditClick()}
      className={classNames(editable ? styles.editableCell : undefined)}
    >
      <div className={styles.cellContent}>
        <div className={styles.cellValue}>{cellData?.display ?? cellData?.value ?? '--'}</div>
        {editable && (
          <IconButton
            kind="ghost"
            size="sm"
            label={getCoreTranslation('edit')}
            onClick={() => handleEditClick()}
            className={styles.editButton}
          >
            <EditIcon size={16} />
          </IconButton>
        )}
      </div>
    </TableCell>
  );
};

export default ObsTableHorizontal;
