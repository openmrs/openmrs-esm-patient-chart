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
  type Concept,
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
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import styles from './obs-table-horizontal.scss';
import { useTranslation } from 'react-i18next';
import { type ConfigObjectHorizontal } from '../config-schema-obs-horizontal';
import { updateObservation, createObservationInEncounter } from './obs-table-horizontal.resource';
import classNames from 'classnames';

interface ObsTableHorizontalProps {
  patientUuid: string;
}

interface ColumnData {
  id: string;
  date: Date;
  encounter: { value: string };
  encounterReference: string;
  encounterUuid: string;
  obs: Record<string, CellData>;
}

interface CellData {
  value: string | number;
  obsUuid: string;
  dataType: string;
  display?: string;
}

const ObsTableHorizontal: React.FC<ObsTableHorizontalProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObjectHorizontal>();
  const session = useSession();
  const isTablet = !isDesktop(useLayoutType());
  const {
    data: { observations, concepts },
    isValidating,
    mutate,
  } = useObs(patientUuid);
  const uniqueEncounterReferences = [...new Set(observations.map((o) => o.encounter.reference))].sort();
  let obssGroupedByEncounters = uniqueEncounterReferences.map((reference) =>
    observations.filter((o) => o.encounter.reference === reference),
  );

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

  const tableColumns = React.useMemo(
    () =>
      obssGroupedByEncounters?.map((obss, index) => {
        const encounterReference = obss[0].encounter.reference;
        const encounterUuid = encounterReference.split('/')[1];
        const columnData = {
          id: `${index}`,
          date: new Date(obss[0].effectiveDateTime),
          encounter: { value: obss[0].encounter.name },
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
      }),
    [config.data, obssGroupedByEncounters, conceptByUuid],
  );

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
        editable={config.editable}
        patientUuid={patientUuid}
        mutate={mutate}
        concepts={concepts}
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
}

const HorizontalTable: React.FC<HorizontalTableProps> = ({
  tableRowLabels,
  tableColumns,
  editable,
  patientUuid,
  concepts,
  mutate,
}) => {
  const { t } = useTranslation();

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
                  const canEditCell =
                    editable && label.key !== 'encounter' && ['Text', 'Numeric', 'Coded'].includes(dataType);

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
                    />
                  );
                })}
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
  column: { id: string; encounterUuid: string };
  label: { key: string; header: string };
  concepts: Array<Concept>;
  mutate: () => Promise<any>;
}> = ({ cellData, dataType, editable, patientUuid, column, label, concepts, mutate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<string | number>('');
  const isTablet = !isDesktop(useLayoutType());

  const conceptKey = label.key;
  const cellKey = `obs-hz-value-${column.id}-${label.key}`;

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditingValue(cellData?.value ?? '');
  }, [cellData?.value]);

  const handleSave = useCallback(
    async (conceptKey: string) => {
      const obsUuid = cellData?.obsUuid;
      const encounterUuid = column.encounterUuid;

      if (editingValue === cellData?.value) {
        setIsEditing(false);
        setEditingValue('');
        return;
      }

      try {
        if (obsUuid) {
          await updateObservation(obsUuid, editingValue);
        } else {
          await createObservationInEncounter(encounterUuid, patientUuid, conceptKey, editingValue);
        }

        await mutate();

        showSnackbar({
          title: t('success', 'Success'),
          kind: 'success',
          subtitle: t('observationSaved', 'Observation saved successfully'),
        });

        setIsEditing(false);
        setEditingValue('');
      } catch (error) {
        showSnackbar({
          title: t('error', 'Error'),
          kind: 'error',
          subtitle: t('errorSavingObservation', 'Error saving observation'),
        });
      }
    },
    [editingValue, patientUuid, mutate, t, cellData?.obsUuid, cellData?.value, column.encounterUuid],
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
    if (dataType === 'Numeric') {
      return (
        <TableCell key={cellKey}>
          <NumberInput
            id={cellKey}
            size="sm"
            value={editingValue}
            onChange={(e: any, data: any) => setEditingValue(data.value ?? '')}
            onBlur={() => handleSave(conceptKey)}
            onKeyDown={(e) => handleKeyDown(e)}
            autoFocus
            hideSteppers
            allowEmpty
          />
        </TableCell>
      );
    } else if (dataType === 'Text') {
      return (
        <TableCell key={cellKey}>
          <TextInput
            id={cellKey}
            labelText=""
            size="sm"
            value={editingValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingValue(e.target.value)}
            onBlur={() => handleSave(conceptKey)}
            onKeyDown={(e) => handleKeyDown(e)}
            autoFocus
          />
        </TableCell>
      );
    } else if (dataType === 'Coded') {
      return (
        <TableCell key={cellKey}>
          <Select
            id={cellKey}
            labelText=""
            size="sm"
            value={editingValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setEditingValue(e.target.value);
            }}
            onBlur={() => handleSave(conceptKey)}
            onKeyDown={(e) => handleKeyDown(e)}
            autoFocus
          >
            <SelectItem text={t('noValue', 'No value')} value="" />
            {concepts
              .find((c) => c.uuid === label.key)
              ?.answers?.map((answer) => <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid} />)}
          </Select>
        </TableCell>
      );
    }
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
          <Button
            hasIconOnly
            kind="ghost"
            size="sm"
            renderIcon={(props: ComponentProps<typeof EditIcon>) => <EditIcon size={16} {...props} />}
            onClick={() => handleEditClick()}
            iconDescription={t('edit', 'Edit')}
            className={styles.editButton}
          />
        )}
      </div>
    </TableCell>
  );
};

export default ObsTableHorizontal;
