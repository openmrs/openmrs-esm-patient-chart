import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { formatDatetime, useLayoutType, Visit } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { HtmlFormEntryForm } from '../config-schema';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';
import { useForms } from '../hooks/use-forms';
import styles from './forms-list.scss';

export type FormsListProps = {
  currentVisit: Visit;
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  patient: fhir.Patient;
  patientUuid: string;
};

const FormsList: React.FC<FormsListProps> = ({ currentVisit, htmlFormEntryForms, patient, patientUuid }) => {
  const { t } = useTranslation();
  const { data, error } = useForms(patientUuid);

  const isTablet = useLayoutType() === 'tablet';

  const handleFormOpen = useCallback(
    (formUuid, encounterUuid, formName) => {
      launchFormEntryOrHtmlForms(currentVisit, formUuid, patient, htmlFormEntryForms, encounterUuid, formName);
    },
    [currentVisit, htmlFormEntryForms, patient],
  );

  const tableHeaders = [
    {
      header: t('formName', 'Form name (A-Z)'),
      key: 'formName',
    },
    {
      header: t('lastCompleted', 'Last completed'),
      key: 'lastCompleted',
    },
  ];

  const tableRows = useMemo(
    () =>
      data?.map((formData) => {
        return {
          id: formData.form.uuid,
          lastCompleted: formData.lastCompleted ? formatDatetime(formData.lastCompleted) : undefined,
          formName: formData.form.display ?? formData.form.name,
          formUuid: formData.form.uuid,
          encounterUuid: formData?.associatedEncounters[0]?.uuid,
        };
      }),
    [data],
  );

  if (!data && !error) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (data?.length === 0) {
    return (
      <Layer>
        <Tile className={styles.emptyState}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('forms', 'Forms')}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.emptyStateContent}>{t('noFormsToDisplay', 'There are no forms to display.')}</p>
        </Tile>
      </Layer>
    );
  }

  return (
    <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
        <>
          <TableContainer className={styles.tableContainer}>
            <div className={styles.toolbarWrapper}>
              <TableToolbar className={styles.tableToolbar}>
                <TableToolbarContent>
                  <TableToolbarSearch
                    className={styles.search}
                    expanded
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()} className={styles.table}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow {...getRowProps({ row })}>
                    <TableCell key={row.cells[0].id}>
                      <Link
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleFormOpen(row.id, '', tableRows[i].formName);
                        }}
                        role="presentation"
                        className={styles.formName}
                      >
                        {tableRows[i]?.formName}
                      </Link>
                    </TableCell>
                    <TableCell className={styles.editCell}>
                      <label>{row.cells[1].value ?? t('never', 'Never')}</label>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows?.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noMatchingFormsToDisplay', 'No matching forms to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : null}
        </>
      )}
    </DataTable>
  );
};

export default FormsList;
