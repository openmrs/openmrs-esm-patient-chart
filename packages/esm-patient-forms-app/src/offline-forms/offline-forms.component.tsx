import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableRow,
  Layer,
  Search,
  SkeletonPlaceholder,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Toggle,
} from '@carbon/react';
import {
  isDesktop,
  putDynamicOfflineData,
  removeDynamicOfflineData,
  syncDynamicOfflineData,
  useLayoutType,
  userHasAccess,
  useSession,
} from '@openmrs/esm-framework';
import { useDynamicFormDataEntries } from './offline-form-helpers';
import { Form } from '../types';
import { useValidOfflineFormEncounters } from './use-offline-form-encounters';
import styles from './offline-forms.styles.scss';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

export interface OfflineFormsProps {
  canMarkFormsAsOffline: boolean;
}

const OfflineForms: React.FC<OfflineFormsProps> = ({ canMarkFormsAsOffline }) => {
  const { t } = useTranslation();
  const session = useSession();
  const forms = useValidOfflineFormEncounters();
  const layout = useLayoutType();
  const toolbarItemSize = isDesktop(layout) ? 'sm' : undefined;
  const headers: Array<typeof DataTableHeader> = [
    { key: 'formName', header: t('offlineFormsTableFormNameHeader', 'Form name') },
    { key: 'availableOffline', header: t('offlineFormsTableFormAvailableOffline', 'Offline') },
  ];

  const rows: Array<typeof DataTableRow & Record<string, unknown>> =
    forms.data
      ?.filter((formInfo) => userHasAccess(formInfo?.encounterType?.editPrivilege?.display, session?.user))
      .map((form) => ({
        id: form.uuid,
        formName: form.name,
        availableOffline: <OfflineFormToggle form={form} disabled={!canMarkFormsAsOffline} />,
      })) ?? [];

  if (forms?.data?.length === 0) {
    return (
      <div className={styles.contentContainer}>
        <EmptyState
          displayText={t('offlineForms__lower', 'offline forms')}
          headerTitle={t('offlineForms', 'Offline forms')}
        />
      </div>
    );
  }

  return (
    <>
      <header className={styles.pageHeaderContainer}>
        <h1 className={styles.pageHeader}>{t('offlineFormsTitle', 'Offline forms')}</h1>
      </header>
      <main className={styles.contentContainer}>
        <DataTable rows={rows} headers={headers} size="sm" useZebraStyles>
          {({
            rows,
            headers,
            getTableProps,
            getHeaderProps,
            getRowProps,
            getTableContainerProps,
            onInputChange,
          }: typeof DataTableCustomRenderProps) => (
            <TableContainer {...getTableContainerProps()}>
              <div className={styles.tableHeaderContainer}>
                <Layer>
                  <Search
                    className={styles.tableSearch}
                    labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                    placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                    size={toolbarItemSize}
                    onChange={onInputChange}
                  />
                </Layer>
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

function OfflineFormToggle({ form, disabled }: { form: Form; disabled: boolean }) {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const dynamicFormEntriesSwr = useDynamicFormDataEntries();
  const isMarkedAsOffline = dynamicFormEntriesSwr.data?.some((entry) => entry.identifier === form.uuid);

  const handleToggled = async (checked: boolean) => {
    setIsUpdating(true);

    try {
      if (checked) {
        await putDynamicOfflineData('form', form.uuid);
        await syncDynamicOfflineData('form', form.uuid);
      } else {
        await removeDynamicOfflineData('form', form.uuid);
      }
    } finally {
      setIsUpdating(false);
      dynamicFormEntriesSwr.mutate();
    }
  };

  if (dynamicFormEntriesSwr.isValidating) {
    // ^ Using an explicit undefined check since 'data' is a bool. We want to handle false separately.
    return <SkeletonPlaceholder className={styles.availableOfflineToggleSkeleton} />;
  }

  return (
    <div>
      <Toggle
        aria-label={t('offlineToggle', 'Offline toggle')}
        id={`${form.uuid}-offline-toggle`}
        className={styles.availableOfflineToggle}
        labelA=""
        labelB=""
        labelText=""
        size="sm"
        toggled={isMarkedAsOffline}
        disabled={disabled || isUpdating || dynamicFormEntriesSwr.isValidating}
        onToggle={handleToggled}
      />
    </div>
  );
}

export default OfflineForms;
