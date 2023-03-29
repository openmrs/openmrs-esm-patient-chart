import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './forms-list.scss';
import isEmpty from 'lodash-es/isEmpty';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination, Visit, formatDatetime, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { launchFormEntryOrHtmlForms } from '../../form-entry-interop';
import {
  Button,
  Layer,
  Tile,
  DataTable,
  DataTableHeader,
  DataTableRow,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { CompletedFormInfo, FormsSection } from '../../types';
import { ConfigObject, OrderBy } from '../../config-schema';
import { defaultPaginationSize } from '../../constants';
import { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';

export interface FormsListProps {
  patientUuid: string;
  patient: fhir.Patient;
  visit: Visit;
  formsSection: FormsSection;
  searchTerm: string;
  pageSize: number;
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
}

const FormsList: React.FC<FormsListProps> = ({
  patientUuid,
  patient,
  visit,
  formsSection,
  searchTerm,
  pageSize = defaultPaginationSize,
  htmlFormEntryForms,
}) => {
  const { t } = useTranslation();
  const { orderBy } = useConfig() as ConfigObject;
  const isTablet = useLayoutType() === 'tablet';
  const [formsToShow, setFormsToShow] = useState(formsSection.completedFromsInfo);
  const orderForms = (orderBy: string, forms: Array<CompletedFormInfo>): Array<CompletedFormInfo> => {
    switch (orderBy) {
      case OrderBy.Name:
        return forms.sort((a, b) => (a.form.display < b.form.display ? -1 : 1));
      case OrderBy.MostRecent:
        return forms.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0));
      default:
        return forms;
    }
  };
  const { results, goTo, currentPage } = usePagination(orderForms(orderBy, formsToShow), pageSize);
  const handleFormOpen = useCallback(
    (formUuid, encounterUuid, formName) => {
      launchFormEntryOrHtmlForms(visit, formUuid, patient, htmlFormEntryForms, encounterUuid, formName);
    },
    [htmlFormEntryForms, patient, visit],
  );
  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'formName', header: t('formName', 'Form name (A-Z)'), maxWidth: 70, minWidth: 50, width: 60 },
      {
        key: 'lastCompleted',
        header: t('lastCompleted', 'Last completed'),
        maxWidth: 70,
        minWidth: 50,
        width: 60,
      },
    ],
    [t],
  );

  useEffect(() => {
    const entriesToDisplay = isEmpty(searchTerm)
      ? formsSection.completedFromsInfo
      : formsSection.completedFromsInfo.filter((formInfo) => {
          return formInfo.form.display.toLowerCase().search(searchTerm?.toLowerCase()) !== -1;
        });
    setFormsToShow(entriesToDisplay);
  }, [formsSection.completedFromsInfo, searchTerm]);

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

  if (tableRows) {
    return (
      <div className={styles.formsListContainer}>
        <CardHeader title={t(formsSection.labelCode, formsSection.name)} children={undefined} />
        <div className={styles.container}>
          <DataTable
            headers={tableHeaders}
            rows={tableRows}
            size={isTablet ? 'lg' : 'sm'}
            useZebraStyles
            overflowMenuOnHover={false}
          >
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()} useZebraStyles={true}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header, i) => (
                        <TableHeader
                          className={`${styles.heading} ${styles.text02}`}
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
                    {rows.map((row, i) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell>
                          <label
                            onClick={() => {
                              handleFormOpen(row.id, null, tableRows[i].formName);
                            }}
                            role="presentation"
                            className={styles.formName}
                          >
                            {tableRows[i]?.formName}
                          </label>
                        </TableCell>
                        <TableCell>
                          {row.cells[1].value ?? (
                            <label
                              onClick={() => {
                                handleFormOpen(row.id, null, tableRows[i].formName);
                              }}
                              role="presentation"
                              className={styles.formName}
                            >
                              {row.cells[1].value}
                            </label>
                          )}
                        </TableCell>
                        <TableCell className="cds--table-column-menu">
                          {row.cells[1].value && (
                            <Button
                              hasIconOnly
                              renderIcon={Edit}
                              iconDescription={t('editForm', 'Edit form')}
                              onClick={() => {
                                handleFormOpen(row.id, tableRows[i].encounterUuid, tableRows[i].formName);
                              }}
                              size={isTablet ? 'lg' : 'sm'}
                              kind="ghost"
                              tooltipPosition="left"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {pageSize != defaultPaginationSize && (
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={formsSection.completedFromsInfo.length}
              currentItems={tableRows.length}
              pageSize={pageSize}
              onPageNumberChange={({ page }) => goTo(page)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Layer>
      <CardHeader title={t(formsSection.labelCode, formsSection.name)} children={undefined} />
      <Tile className={styles.tile}>
        <p className={styles.content}>{t('noFormsAvailable', 'There are no forms to display')}</p>
      </Tile>
    </Layer>
  );
};

export default FormsList;
