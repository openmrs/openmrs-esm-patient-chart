import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, InlineLoading, InlineNotification } from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { useEncounterPrivileges } from '../privileges';
import { useClinicians, type Provider } from './use-clinicians';
import styles from './clinician-picker.scss';

export interface ClinicianPickerProps {
  value: Provider | null;
  onChange: (provider: Provider | null) => void;
  /** Limits the clinicians that can be picked to those having one of these provider roles. Empty means all. */
  providerRoles?: Array<string>;
  labelText?: string;
  /** Prefix for the id of the input, to keep it unique if several pickers are on the page. */
  id?: string;
  isDisabled?: boolean;
}

function filterItemsByProviderName({ item, inputValue }: { item: Provider; inputValue: string }) {
  return (item?.person?.display ?? '').toLowerCase().includes((inputValue ?? '').toLowerCase());
}

/**
 * Lets the user choose the clinician an encounter is placed on behalf of. Renders nothing for users
 * without the `Edit Encounters On Behalf Of Others` privilege.
 */
export function ClinicianPicker({
  value,
  onChange,
  providerRoles,
  labelText,
  id = 'encounter',
  isDisabled = false,
}: ClinicianPickerProps) {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const { canActOnBehalfOfOthers } = useEncounterPrivileges();
  const { providers, isLoading, error } = useClinicians(canActOnBehalfOfOthers ? providerRoles ?? [] : null);

  if (!canActOnBehalfOfOthers) {
    return null;
  }

  if (isLoading) {
    return (
      <InlineLoading className={styles.container} description={t('loadingClinicians', 'Loading clinicians') + '...'} />
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title={t('errorLoadingClinicians', 'Error occurred while loading clinicians')}
          subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ResponsiveWrapper>
        <ComboBox
          id={`${id}-clinician-combobox`}
          titleText={labelText ?? t('clinician', 'Clinician')}
          placeholder={t('searchForClinician', 'Search for a clinician')}
          items={providers ?? []}
          selectedItem={value}
          itemToString={(item: Provider) => item?.person?.display ?? ''}
          shouldFilterItem={filterItemsByProviderName}
          disabled={isDisabled}
          onChange={({ selectedItem }: { selectedItem: Provider | null | undefined }) => onChange(selectedItem ?? null)}
        />
      </ResponsiveWrapper>
    </div>
  );
}
