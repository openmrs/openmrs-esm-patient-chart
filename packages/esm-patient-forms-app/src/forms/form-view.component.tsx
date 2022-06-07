import React, { useState, useEffect, useMemo } from 'react';
import styles from './form-view.scss';
import EmptyFormView from './empty-form.component';
import isEmpty from 'lodash-es/isEmpty';
import first from 'lodash-es/first';
import debounce from 'lodash-es/debounce';
import { formatDatetime, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Search,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  DataTableHeader,
  DataTableRow,
  Dropdown,
} from 'carbon-components-react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { CompletedFormInfo } from '../types';
import Edit20 from '@carbon/icons-react/es/edit/20';
import { ConfigObject } from '../config-schema';

interface FormViewProps {
  forms: Array<CompletedFormInfo>;
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  changeFormCategory: (formCategory) => void;
  launchForm: (form) => void;
}

const FormView: React.FC<FormViewProps> = ({ forms, pageSize, pageUrl, urlLabel, changeFormCategory, launchForm }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const isDesktop = useLayoutType() === 'desktop';

  const [searchTerm, setSearchTerm] = useState<string>(null);
  const [allFormInfos, setAllFormInfos] = useState<Array<CompletedFormInfo>>(forms);
  const { results, goTo, currentPage } = usePagination(
    allFormInfos?.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0)),
    pageSize,
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  useEffect(() => {
    const entriesToDisplay = isEmpty(searchTerm)
      ? forms
      : forms.filter((formInfo) => formInfo.form.name.toLowerCase().search(searchTerm?.toLowerCase()) !== -1);
    setAllFormInfos(entriesToDisplay);
  }, [searchTerm, forms]);

  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'formName', header: t('formName', 'Form Name (A-Z)') },
      {
        key: 'lastCompleted',
        header: t('lastCompleted', 'Last Completed'),
      },
    ],
    [t],
  );

  const tableRows: Array<DataTableRow> = useMemo(
    () =>
      results?.map((formInfo) => {
        return {
          id: formInfo.form.uuid,
          lastCompleted: formInfo.lastCompleted ? formatDatetime(formInfo.lastCompleted) : undefined,
          formName: formInfo.form.display ?? formInfo.form.name,
          formUuid: formInfo.form.uuid,
          encounterUuid: formInfo?.associatedEncounters[0]?.uuid,
        };
      }),
    [results],
  );

  return (
    <div className={styles.formContainer}>
      <div className={styles.filterContainer}>
        <Dropdown
          ariaLabel="filter"
          id="formCategory"
          items={['All', 'Completed', 'Recommended']}
          label={config.showRecommendedFormsTab ? 'Recommend' : 'All'}
          titleText={t('filter', 'Filter:')}
          type="inline"
          onChange={({ selectedItem }) => changeFormCategory(selectedItem)}
          className={styles.filterDropdownMenu}
        />
        <Search
          id="searchInput"
          labelText=""
          className={styles.formSearchInput}
          placeholder={t('searchForForm', 'Search for a form')}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <>
        {allFormInfos?.length > 0 && (
          <>
            <DataTable size={isDesktop ? 'sm' : 'lg'} rows={tableRows} headers={tableHeaders} isSortable={true}>
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()} useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => {
                        return (
                          <TableRow key={row.id}>
                            <TableCell className={styles.tableCell}>
                              <label
                                onClick={() => launchForm({ formUuid: row.id, encounterUuid: '' })}
                                role="presentation"
                                className={styles.formName}
                              >
                                {row.cells[0].value}
                              </label>
                            </TableCell>
                            <TableCell>
                              <span className={styles.tableCell}>
                                {row.cells[1].value ?? t('never', 'Never')}{' '}
                                {row.cells[1].value && (
                                  <Edit20
                                    description="Edit form"
                                    onClick={() => {
                                      launchForm({
                                        formUuid: row.id,
                                        encounterUuid: first(results[index].associatedEncounters)?.uuid,
                                      });
                                    }}
                                  />
                                )}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={allFormInfos.length}
              currentItems={results.length}
              pageSize={pageSize}
              onPageNumberChange={({ page }) => goTo(page)}
              dashboardLinkUrl={pageUrl}
              dashboardLinkLabel={urlLabel}
            />
          </>
        )}
        {isEmpty(allFormInfos) && (
          <EmptyFormView
            action={t('formSearchHint', 'Try searching for the form using an alternative name or keyword')}
          />
        )}
      </>
    </div>
  );
};

export default FormView;
