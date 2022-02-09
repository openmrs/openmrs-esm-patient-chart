import { useLayoutType } from '@openmrs/esm-framework';
import {
  DataTable,
  TableContainer,
  Search,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableRow,
  Toggle,
  SkeletonPlaceholder,
} from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormEncounter } from '../types';
import { useOfflineFormManagement } from './use-offline-form-management';
import styles from './offline-forms.styles.scss';
import { useValidOfflineFormEncounters } from './use-offline-form-encounters';

export interface OfflineFormsProps {
  canMarkFormsAsOffline: boolean;
}

const OfflineForms: React.FC<OfflineFormsProps> = ({ canMarkFormsAsOffline }) => {
  const { t } = useTranslation();
  const forms = useValidOfflineFormEncounters();
  const layout = useLayoutType();
  const toolbarItemSize = layout === 'desktop' ? 'sm' : undefined;
  const headers: Array<DataTableHeader> = [
    { key: 'formName', header: t('offlineFormsTableFormNameHeader', 'Form name') },
    { key: 'availableOffline', header: t('offlineFormsTableFormAvailableOffline', 'Offline') },
  ];
  const rows: Array<DataTableRow & Record<string, unknown>> =
    forms.data?.map((form) => ({
      id: form.uuid,
      formName: form.name,
      availableOffline: <OfflineFormToggle form={form} disabled={!canMarkFormsAsOffline} />,
    })) ?? [];

  return (
    <>
      <header className={styles.pageHeaderContainer}>
        <h1 className={styles.pageHeader}>{t('offlineFormsTitle', 'Offline forms')}</h1>
      </header>
      <main className={styles.contentContainer}>
        <DataTable rows={rows} headers={headers}>
          {({
            rows,
            headers,
            getTableProps,
            getHeaderProps,
            getRowProps,
            getTableContainerProps,
            onInputChange,
          }: DataTableCustomRenderProps) => (
            <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
              <div className={styles.tableHeaderContainer}>
                <Search
                  className={styles.tableSearch}
                  labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                  placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                  size={toolbarItemSize}
                  onChange={onInputChange}
                  light
                />
              </div>
              <Table {...getTableProps()} isSortable useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} isSortable>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.value ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </main>
    </>
  );
};

function OfflineFormToggle({ form, disabled }: { form: FormEncounter; disabled: boolean }) {
  const { isFormFullyCachedSwr, isFormMarkedAsOffline, registerFormAsOffline, unregisterFormAsOffline } =
    useOfflineFormManagement(form);

  const handleToggled = (checked: boolean) => {
    if (checked) {
      registerFormAsOffline();
    } else {
      unregisterFormAsOffline();
    }
  };

  if (isFormFullyCachedSwr.data === undefined) {
    // ^ Using an explicit undefined check since 'data' is a bool. We want to handle false separately.
    return <SkeletonPlaceholder className={styles.availableOfflineToggleSkeleton} />;
  }

  return (
    <div>
      <Toggle
        id={`${form.uuid}-offline-toggle`}
        className={styles.availableOfflineToggle}
        labelA=""
        labelB=""
        size="sm"
        toggled={isFormMarkedAsOffline}
        disabled={disabled || isFormFullyCachedSwr.isValidating}
        onToggle={handleToggled}
      />
    </div>
  );
}

export default OfflineForms;
