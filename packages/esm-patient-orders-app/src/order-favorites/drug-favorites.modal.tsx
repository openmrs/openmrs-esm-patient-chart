import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ComboBox,
  IconButton,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Tag,
  Stack,
  SkeletonText,
  Dropdown,
} from '@carbon/react';
import { Add, Close } from '@carbon/react/icons';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { useFavoriteForm } from './useFavoriteForm';
import type { OrderConfigItem, DrugFavoritesModalProps, StrengthOption, AttributeKey, ManualInputKey } from './types';
import styles from './drug-favorites.modal.scss';

const DrugFavoritesModal: React.FC<DrugFavoritesModalProps> = (props) => {
  const { t } = useTranslation();
  const form = useFavoriteForm(props);

  const renderAttributeTag = (
    key: AttributeKey,
    label: string,
    value: string | undefined,
    skipForConceptBased = false,
  ) => {
    if (!value || (skipForConceptBased && form.isConceptBasedFavorite)) return null;

    return (
      <div key={key} className={styles.attributeRow}>
        <span className={styles.attributeLabel}>{label}</span>
        {form.selectedAttributes[key] ? (
          <Tag
            type="blue"
            filter
            onClose={() => form.handleRemoveAttribute(key)}
            title={t('removeAttribute', 'Remove {{attribute}}', { attribute: label })}
          >
            {value}
          </Tag>
        ) : (
          <Tag
            type="gray"
            onClick={() => form.handleAddAttribute(key)}
            className={styles.removedTag}
            title={t('addAttribute', 'Add {{attribute}}', { attribute: label })}
          >
            {value}
          </Tag>
        )}
      </div>
    );
  };

  const renderAddButton = (key: ManualInputKey, label: string) => (
    <div key={key} className={styles.attributeRow}>
      <span className={styles.attributeLabel}>{label}</span>
      <Button
        kind="ghost"
        size="sm"
        renderIcon={Add}
        onClick={() => form.handleShowManualInput(key)}
        className={styles.addButton}
      >
        {t('addAttribute', 'Add {{attribute}}', { attribute: label.toLowerCase() })}
      </Button>
    </div>
  );

  const renderManualInput = (key: ManualInputKey, label: string) => {
    if (!form.showManualInputs[key]) return null;

    const inputContent =
      key === 'dose' ? (
        <NumberInput
          id="manual-dose"
          size="sm"
          min={0}
          step={0.01}
          hideSteppers
          value={form.manualDose ?? ''}
          onChange={(_e, { value }) => form.setManualDose(typeof value === 'number' ? value : null)}
          className={styles.manualInput}
          label=""
          hideLabel
        />
      ) : form.isLoadingOrderConfig ? (
        <SkeletonText width="120px" />
      ) : (
        <ComboBox
          id={`manual-${key}`}
          size="sm"
          items={key === 'route' ? form.routes : form.frequencies}
          itemToString={(item: OrderConfigItem) => item?.display || ''}
          selectedItem={key === 'route' ? form.manualRoute : form.manualFrequency}
          onChange={({ selectedItem }) =>
            key === 'route' ? form.setManualRoute(selectedItem || null) : form.setManualFrequency(selectedItem || null)
          }
          placeholder={key === 'route' ? t('selectRoute', 'Select route') : t('selectFrequency', 'Select frequency')}
          className={styles.manualInput}
          titleText=""
        />
      );

    return (
      <div key={`${key}-input`} className={styles.attributeRow}>
        <span className={styles.attributeLabel}>{label}</span>
        <div className={styles.manualInputContainer}>
          {inputContent}
          <IconButton
            kind="ghost"
            size="sm"
            label={t('remove', 'Remove')}
            onClick={() => form.handleHideManualInput(key)}
            className={styles.removeInputButton}
          >
            <Close />
          </IconButton>
        </div>
      </div>
    );
  };

  const renderAttribute = (key: ManualInputKey, label: string, value: string | undefined, hasPrefilled: boolean) => {
    if (hasPrefilled) return renderAttributeTag(key, label, value);
    return form.showManualInputs[key] ? renderManualInput(key, label) : renderAddButton(key, label);
  };

  return (
    <>
      <ModalHeader
        closeModal={props.closeModal}
        title={
          form.isEditing
            ? t('editPinnedOrder', 'Edit pinned order')
            : t('addOrderToPinnedOrders', 'Add order to my pinned orders')
        }
      />
      <ModalBody>
        {form.isLoadingDrug || form.isLoadingStrengths ? (
          <div className={styles.loadingContainer}>
            <SkeletonText width="60%" />
            <SkeletonText width="80%" />
            <SkeletonText width="40%" />
          </div>
        ) : (
          <Stack gap={5}>
            <p className={styles.attributesHint}>
              {t('selectAttributesToInclude', 'Select the attributes to include in this pinned order')}
            </p>

            <div className={styles.attributesSection}>
              {form.isConceptBasedFavorite && form.availableStrengths.length > 0 && (
                <div className={styles.attributeRow}>
                  <span className={styles.attributeLabel}>{t('strength', 'Strength')}</span>
                  <Dropdown
                    id="strength-dropdown"
                    titleText=""
                    size="sm"
                    items={form.strengthOptions}
                    itemToString={(item: StrengthOption) => item?.label || ''}
                    selectedItem={form.strengthOptions.find((o) => o.id === form.selectedStrengthId)}
                    onChange={({ selectedItem }: { selectedItem: StrengthOption }) =>
                      form.handleStrengthChange(selectedItem)
                    }
                    label={t('selectStrength', 'Select strength')}
                    className={styles.strengthDropdown}
                  />
                </div>
              )}

              {renderAttributeTag('strength', t('strength', 'Strength'), form.resolvedValues.strength, true)}
              {renderAttributeTag('unit', t('doseUnit', 'Dose unit'), form.resolvedValues.unit)}
              {renderAttribute('dose', t('dose', 'Dose'), form.resolvedValues.dose, form.hasPrefilledDose)}
              {renderAttribute('route', t('route', 'Route'), form.resolvedValues.route, form.hasPrefilledRoute)}
              {renderAttribute(
                'frequency',
                t('frequency', 'Frequency'),
                form.resolvedValues.frequency,
                form.hasPrefilledFrequency,
              )}
            </div>

            <div>
              <p className={styles.attributeLabel}>{t('pinnedOrderName', 'Pinned order name')}</p>
              <p className={styles.computedName}>{form.computedName}</p>
            </div>
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={props.closeModal}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={form.handleSave} disabled={form.isSaving || form.isLoadingDrug}>
          {form.isSaving ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            getCoreTranslation('save', 'Save')
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DrugFavoritesModal;
