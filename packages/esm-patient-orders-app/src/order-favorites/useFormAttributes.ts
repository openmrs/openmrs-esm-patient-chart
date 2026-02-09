import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { useDrugsByConceptName, useOrderConfig } from './drug-favorites.resource';
import type { AttributeKey, DrugFavoriteAttributes, ManualInputKey, OrderConfigItem, StrengthOption } from './types';

interface UseFormAttributesProps {
  // For strength selection (concept-based favorites)
  conceptName?: string;
  conceptUuid?: string;
  isConceptBased: boolean;

  // For initialization
  initialAttributes?: DrugFavoriteAttributes;
  effectiveDrug?: Drug;

  // For pre-filled values
  strength?: string;
  dose?: string;
  unit?: string;
  route?: string;
  frequency?: string;
}

/**
 * Attribute management hook for drug favorites form.
 * Manages all drug order attributes: strength, dose, unit, route, frequency.
 *
 * Handles:
 * - Strength selection for concept-based favorites
 * - Manual input for dose/route/frequency
 * - Attribute toggles (which attributes to include)
 * - Data fetching (order config, available strengths)
 */
export function useFormAttributes({
  conceptName,
  conceptUuid,
  isConceptBased,
  initialAttributes,
  effectiveDrug,
  strength,
  dose,
  unit,
  route,
  frequency,
}: UseFormAttributesProps) {
  const { t } = useTranslation();

  // Strength Selection
  const { matchingDrugs: availableStrengths, isLoading: isLoadingStrengths } = useDrugsByConceptName(
    isConceptBased ? conceptName : undefined,
    conceptUuid,
  );

  const strengthOptions: StrengthOption[] = useMemo(() => {
    const anyOption: StrengthOption = { id: 'any', label: t('anyStrength', 'Any strength') };
    return [anyOption, ...availableStrengths.map((d) => ({ id: d.uuid, label: d.strength || d.display, drug: d }))];
  }, [availableStrengths, t]);

  const [selectedStrengthId, setSelectedStrengthId] = useState<string>('any');

  const targetStrength = initialAttributes?.strength || strength;
  useEffect(() => {
    if (availableStrengths.length > 0 && targetStrength) {
      const match = availableStrengths.find((d) => d.strength === targetStrength);
      if (match) {
        setSelectedStrengthId(match.uuid);
      }
    }
  }, [availableStrengths, targetStrength]);

  const selectedStrengthDrug = useMemo(
    () => (selectedStrengthId === 'any' ? undefined : availableStrengths.find((d) => d.uuid === selectedStrengthId)),
    [selectedStrengthId, availableStrengths],
  );

  const hasSelectedStrength = selectedStrengthId !== 'any';

  // Manual Inputs (dose, route, frequency)
  const [manualDose, setManualDose] = useState<number | null>(null);
  const [manualRoute, setManualRoute] = useState<OrderConfigItem | null>(null);
  const [manualFrequency, setManualFrequency] = useState<OrderConfigItem | null>(null);
  const [showManualInputs, setShowManualInputs] = useState({ dose: false, route: false, frequency: false });

  // Fetch order config only when needed
  const needsOrderConfig = showManualInputs.route || showManualInputs.frequency;
  const { routes, frequencies, isLoading: isLoadingOrderConfig } = useOrderConfig(needsOrderConfig);

  // Attribute Toggles
  const hasPrefilledStrength = Boolean(strength || initialAttributes?.strength || effectiveDrug?.strength);
  const hasPrefilledDose = Boolean(dose || initialAttributes?.dose);
  const hasPrefilledUnit = Boolean(unit || initialAttributes?.unit || effectiveDrug?.dosageForm?.display);
  const hasPrefilledRoute = Boolean(route || initialAttributes?.route);
  const hasPrefilledFrequency = Boolean(frequency || initialAttributes?.frequency);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<AttributeKey, boolean>>(() => ({
    strength: initialAttributes ? Boolean(initialAttributes.strength) : hasPrefilledStrength,
    dose: initialAttributes ? Boolean(initialAttributes.dose) : hasPrefilledDose,
    unit: initialAttributes ? Boolean(initialAttributes.unit) : hasPrefilledUnit,
    route: initialAttributes ? Boolean(initialAttributes.route) : hasPrefilledRoute,
    frequency: initialAttributes ? Boolean(initialAttributes.frequency) : hasPrefilledFrequency,
  }));

  const resolvedValues = useMemo(
    () => ({
      strength: strength || selectedStrengthDrug?.strength || initialAttributes?.strength || effectiveDrug?.strength,
      dose: dose || initialAttributes?.dose || (manualDose ? manualDose.toString() : undefined),
      unit: unit || initialAttributes?.unit || effectiveDrug?.dosageForm?.display,
      route: route || initialAttributes?.route || manualRoute?.display,
      frequency: frequency || initialAttributes?.frequency || manualFrequency?.display,
    }),
    [
      strength,
      dose,
      unit,
      route,
      frequency,
      selectedStrengthDrug,
      initialAttributes,
      effectiveDrug,
      manualDose,
      manualRoute,
      manualFrequency,
    ],
  );

  const resolvedUuids = useMemo(
    () => ({
      unitUuid: initialAttributes?.unitUuid || effectiveDrug?.dosageForm?.uuid,
      routeUuid: initialAttributes?.routeUuid || manualRoute?.uuid,
      frequencyUuid: initialAttributes?.frequencyUuid || manualFrequency?.uuid,
    }),
    [initialAttributes, effectiveDrug, manualRoute, manualFrequency],
  );

  // Handlers
  const handleRemoveAttribute = useCallback((key: AttributeKey) => {
    setSelectedAttributes((prev) => ({ ...prev, [key]: false }));
  }, []);

  const handleAddAttribute = useCallback((key: AttributeKey) => {
    setSelectedAttributes((prev) => ({ ...prev, [key]: true }));
  }, []);

  const handleStrengthChange = useCallback((selectedItem: StrengthOption) => {
    setSelectedStrengthId(selectedItem?.id || 'any');
    setSelectedAttributes((prev) => ({ ...prev, strength: selectedItem?.id !== 'any' }));
  }, []);

  const handleShowManualInput = useCallback((key: ManualInputKey) => {
    setShowManualInputs((prev) => ({ ...prev, [key]: true }));
    setSelectedAttributes((prev) => ({ ...prev, [key]: true }));
  }, []);

  const handleHideManualInput = useCallback((key: ManualInputKey) => {
    setShowManualInputs((prev) => ({ ...prev, [key]: false }));
    setSelectedAttributes((prev) => ({ ...prev, [key]: false }));
    if (key === 'dose') setManualDose(null);
    if (key === 'route') setManualRoute(null);
    if (key === 'frequency') setManualFrequency(null);
  }, []);

  return {
    // Loading states
    isLoadingStrengths,
    isLoadingOrderConfig,

    // Prefilled flags
    hasPrefilledDose,
    hasPrefilledRoute,
    hasPrefilledFrequency,

    // Strength selection
    selectedStrengthId,
    selectedStrengthDrug,
    hasSelectedStrength,
    availableStrengths,
    strengthOptions,

    // Attribute toggles
    selectedAttributes,

    // Manual inputs
    showManualInputs,
    manualDose,
    manualRoute,
    manualFrequency,

    // Order config
    routes,
    frequencies,

    // Resolved values
    resolvedValues,
    resolvedUuids,

    // Handlers
    handleRemoveAttribute,
    handleAddAttribute,
    handleStrengthChange,
    handleShowManualInput,
    handleHideManualInput,
    setManualDose,
    setManualRoute,
    setManualFrequency,
  };
}
