import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
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
  useConnectivity,
  useLayoutType,
  userHasAccess,
  useSession,
} from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useDynamicFormDataEntries } from './offline-form-helpers';
import { type Form } from '../types';
import { useValidOfflineFormEncounters } from './use-offline-form-encounters';
import styles from './offline-forms.scss';

export interface OfflineFormsProps {}

const OfflineForms: React.FC<OfflineFormsProps> = () => {
  const { t } = useTranslation();
  const session = useSession();
  const forms = useValidOfflineFormEncounters();
  const layout = useLayoutType();
  const canMarkFormsAsOffline = useConnectivity();
  const toolbarItemSize = isDesktop(layout) ? 'sm' : undefined;
  const headers = [
    { key: 'formName', header: t('offlineFormsTableFormNameHeader', 'Form name') },
    { key: 'availableOffline', header: t('offlineFormsTableFormAvailableOffline', 'Offline') },
  ];

  const rows = useMemo(() => {
    const filteredForms = forms?.data?.filter((formInfo) =>
      userHasAccess(formInfo?.encounterType?.editPrivilege?.display, session?.user),
    );

    const sortedForms = filteredForms
      ?.map((form) => ({
        id: form.uuid,
        formName: form.display,
        availableOffline: <OfflineFormToggle form={form} disabled={!canMarkFormsAsOffline} />,
      }))
      ?.sort((a, b) => a.formName.localeCompare(b.formName));

    return sortedForms ?? [];
  }, [forms.data, session.user, canMarkFormsAsOffline]);

  if (rows.length === 0) {
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
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps, onInputChange }) => (
            <TableContainer {...getTableContainerProps()}>
              <div className={styles.tableHeaderContainer}>
                <Layer>
                  <Search
                    className={styles.tableSearch}
                    labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                    placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                    size={toolbarItemSize}
                    onChange={(e) => onInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
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
