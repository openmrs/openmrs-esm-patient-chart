import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import first from 'lodash-es/first';
import {
  DataTable,
  type DataTableHeader,
  type DataTableRow,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Button,
} from '@carbon/react';
import {
  EmptyDataIllustration,
  PatientChartPagination,
  launchFormEntryOrHtmlForms,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { EditIcon, formatDatetime, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type CompletedFormInfo } from '../types';
import styles from './form-view.scss';
import { mapFormsToHtmlFormEntryForms } from '../hooks/use-forms';

type FormsCategory = 'All' | 'Completed' | 'Recommended';

interface FormViewProps {
  category?: FormsCategory;
  forms: Array<CompletedFormInfo>;
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  mutateForms?: () => void;
}

const FormView: React.FC<FormViewProps> = ({
  category,
  forms,
  patientUuid,
  patient,
  pageSize,
  pageUrl,
  urlLabel,
  mutateForms,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const isTablet = useLayoutType() === 'tablet';
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return forms;
    }
    return forms.filter((form) => {
      const formName = form.form.display ?? form.form.name;
      return formName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [forms, searchTerm]);

  const htmlFormEntryForms = useMemo(() => {
    const allForms = forms.map((completedFormInfo) => completedFormInfo.form);
    return mapFormsToHtmlFormEntryForms(allForms, config.htmlFormEntryForms);
  }, [config.htmlFormEntryForms, forms]);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const { results, goTo, currentPage } = usePagination(
    filteredForms?.sort((a, b) => (a.form?.display > b.form?.display ? 1 : -1)),
    pageSize,
  );

  const tableHeaders: Array<typeof DataTableHeader> = useMemo(
    () => [
      { key: 'formName', header: t('formName', 'Form name (A-Z)') },
      {
        key: 'lastCompleted',
        header: t('lastCompleted', 'Last completed'),
      },
    ],
    [t],
  );

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      results?.map((formInfo) => {
        return {
          id: formInfo.form.uuid,
          lastCompleted: formInfo.lastCompletedDate ? formatDatetime(formInfo.lastCompletedDate) : undefined,
          formName: formInfo.form.display ?? formInfo.form.name,
          formUuid: formInfo.form.uuid,
          encounterUuid: formInfo?.associatedEncounters[0]?.uuid,
        };
      }),
    [results],
  );

  if (!forms?.length) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noMatchingFormsAvailable', 'There are no {{formCategory}} forms to display', {
              formCategory: category?.toLowerCase(),
            })}
          </p>
          <p className={styles.helper}>{t('formSearchHint', 'Try using an alternative name or keyword')}</p>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.formContainer}>
      {forms?.length > 0 && (
        <>
          <DataTable
            headers={tableHeaders}
            rows={tableRows}
            size={isTablet ? 'lg' : 'sm'}
            isSortable
            useZebraStyles
            overflowMenuOnHover={false}
          >
            {({ rows, headers, getHeaderProps, getTableProps, onInputChange, getToolbarProps }) => (
              <TableContainer className={styles.tableContainer}>
                <TableToolbarContent {...getToolbarProps()} style={{ justifyContent: 'flex-start' }}>
                  <Layer style={{ width: '100%' }}>
                    <TableToolbarSearch
                      persistent
                      expanded
                      onChange={(event) => handleSearch(event.target.value)}
                      placeholder={t('searchForAForm', 'Search for a form')}
                      size={isTablet ? 'lg' : 'sm'}
                    />
                  </Layer>
                </TableToolbarContent>
                <Table {...getTableProps()} className={styles.table}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={classNames(styles.heading, styles.text02)}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => {
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <label
                              onClick={() =>
                                launchFormEntryOrHtmlForms(
                                  htmlFormEntryForms,
                                  patientUuid,
                                  row.id,
                                  currentVisit?.uuid,
                                  undefined,
                                  results[index].form.display ?? results[index].form.name,
                                  currentVisit?.visitType?.uuid,
                                  currentVisit?.startDatetime,
                                  currentVisit?.stopDatetime,
                                  mutateForms,
                                )
                              }
                              role="presentation"
                              className={styles.formName}
                            >
                              {row.cells[0].value}
                            </label>
                          </TableCell>
                          <TableCell>
                            <label
                              onClick={() =>
                                launchFormEntryOrHtmlForms(
                                  htmlFormEntryForms,
                                  patientUuid,
                                  patientUuid,
                                  currentVisit?.uuid,
                                  first(results[index].associatedEncounters)?.uuid,
                                  results[index].form.display ?? results[index].form.name,
                                  currentVisit?.visitType.uuid,
                                  currentVisit?.startDatetime,
                                  currentVisit?.stopDatetime,
                                  mutateForms,
                                )
                              }
                              role="presentation"
                              className={styles.formName}
                            >
                              {row.cells[1].value}
                            </label>
                          </TableCell>
                          <TableCell className="cds--table-column-menu">
                            {row.cells[0].value && (
                              <Button
                                hasIconOnly
                                renderIcon={EditIcon}
                                iconDescription={t('editForm', 'Edit form')}
                                onClick={() =>
                                  launchFormEntryOrHtmlForms(
                                    htmlFormEntryForms,
                                    patientUuid,
                                    patientUuid,
                                    currentVisit?.uuid,
                                    first(results[index].associatedEncounters)?.uuid,
                                    results[index].form.display ?? results[index].form.name,
                                    currentVisit?.visitType.uuid,
                                    currentVisit?.startDatetime,
                                    currentVisit?.stopDatetime,
                                    mutateForms,
                                  )
                                }
                                size={isTablet ? 'lg' : 'sm'}
                                kind="ghost"
                                tooltipPosition="left"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {rows.length === 0 ? (
                  <div className={styles.tileContainer}>
                    <Tile className={styles.tile}>
                      <div className={styles.tileContent}>
                        <p className={styles.content}>
                          {t('noMatchingFormsToDisplay', 'No matching forms to display')}
                        </p>
                      </div>
                    </Tile>
                  </div>
                ) : null}
              </TableContainer>
            )}
          </DataTable>
          <PatientChartPagination
            pageNumber={currentPage}
            totalItems={filteredForms?.length}
            currentItems={results.length}
            pageSize={pageSize}
            onPageNumberChange={({ page }) => goTo(page)}
            dashboardLinkUrl={pageUrl}
            dashboardLinkLabel={urlLabel}
          />
        </>
      )}
    </div>
  );
};

export default FormView;
