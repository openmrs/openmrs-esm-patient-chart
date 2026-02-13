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
  const { attributes } = form;

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
        {attributes.selectedAttributes[key] ? (
          <Tag
            type="blue"
            filter
            onClose={() => attributes.handleRemoveAttribute(key)}
            title={t('removeAttribute', 'Remove {{attribute}}', { attribute: label })}
          >
            {value}
          </Tag>
        ) : (
          <Tag
            type="gray"
            onClick={() => attributes.handleAddAttribute(key)}
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
        onClick={() => attributes.handleShowManualInput(key)}
        className={styles.addButton}
      >
        {t('addAttribute', 'Add {{attribute}}', { attribute: label.toLowerCase() })}
      </Button>
    </div>
  );

  const renderManualInput = (key: ManualInputKey, label: string) => {
    if (!attributes.showManualInputs[key]) return null;

    const inputContent =
      key === 'dose' ? (
        <NumberInput
          id="manual-dose"
          size="sm"
          min={0}
          step={0.01}
          hideSteppers
          value={attributes.manualDose ?? ''}
          onChange={(_e, { value }) => attributes.setManualDose(typeof value === 'number' ? value : null)}
          className={styles.manualInput}
          label=""
          hideLabel
        />
      ) : attributes.isLoadingOrderConfig ? (
        <SkeletonText width="120px" />
      ) : (
        <ComboBox
          id={`manual-${key}`}
          size="sm"
          items={key === 'route' ? attributes.routes : attributes.frequencies}
          itemToString={(item: OrderConfigItem) => item?.display || ''}
          selectedItem={key === 'route' ? attributes.manualRoute : attributes.manualFrequency}
          onChange={({ selectedItem }) =>
            key === 'route'
              ? attributes.setManualRoute(selectedItem || null)
              : attributes.setManualFrequency(selectedItem || null)
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
            onClick={() => attributes.handleHideManualInput(key)}
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
    return attributes.showManualInputs[key] ? renderManualInput(key, label) : renderAddButton(key, label);
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
        {form.isLoadingDrug || attributes.isLoadingStrengths ? (
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
              {form.isConceptBasedFavorite && attributes.availableStrengths.length > 0 && (
                <div className={styles.attributeRow}>
                  <span className={styles.attributeLabel}>{t('strength', 'Strength')}</span>
                  <Dropdown
                    id="strength-dropdown"
                    titleText=""
                    size="sm"
                    items={attributes.strengthOptions}
                    itemToString={(item: StrengthOption) => item?.label || ''}
                    selectedItem={attributes.strengthOptions.find((o) => o.id === attributes.selectedStrengthId)}
                    onChange={({ selectedItem }: { selectedItem: StrengthOption }) =>
                      attributes.handleStrengthChange(selectedItem)
                    }
                    label={t('selectStrength', 'Select strength')}
                    className={styles.strengthDropdown}
                  />
                </div>
              )}

              {renderAttributeTag('strength', t('strength', 'Strength'), attributes.resolvedValues.strength)}
              {renderAttributeTag('unit', t('doseUnit', 'Dose unit'), attributes.resolvedValues.unit)}
              {!form.isConceptBasedFavorite &&
                renderAttribute('dose', t('dose', 'Dose'), attributes.resolvedValues.dose, attributes.hasPrefilledDose)}
              {!form.isConceptBasedFavorite &&
                renderAttribute(
                  'route',
                  t('route', 'Route'),
                  attributes.resolvedValues.route,
                  attributes.hasPrefilledRoute,
                )}
              {!form.isConceptBasedFavorite &&
                renderAttribute(
                  'frequency',
                  t('frequency', 'Frequency'),
                  attributes.resolvedValues.frequency,
                  attributes.hasPrefilledFrequency,
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
