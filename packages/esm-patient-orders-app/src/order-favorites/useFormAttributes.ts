import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reportError } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { useDrugsByConceptName, useOrderConfig } from './drug-favorites.resource';
import type { AttributeKey, ManualInputKey, OrderConfigItem, StrengthOption } from './types';

interface UseFormAttributesProps {
  // For strength selection (concept-based favorites)
  conceptName?: string;
  conceptUuid?: string;
  isConceptBased: boolean;

  // For initialization
  effectiveDrug?: Drug;

  // For pre-filled values
  strength?: string;
  dose?: string;
  unit?: string;
  route?: string;
  frequency?: string;
}

/**
 * Manages drug order attribute state for the favorites form.
 */
export function useFormAttributes({
  conceptName,
  conceptUuid,
  isConceptBased,
  effectiveDrug,
  strength,
  dose,
  unit,
  route,
  frequency,
}: UseFormAttributesProps) {
  const { t } = useTranslation();

  // Strength Selection
  const {
    matchingDrugs: availableStrengths,
    isLoading: isLoadingStrengths,
    error: strengthsError,
  } = useDrugsByConceptName(isConceptBased ? conceptName : undefined, conceptUuid);

  const strengthOptions: StrengthOption[] = useMemo(() => {
    const anyOption: StrengthOption = { id: 'any', label: t('anyStrength', 'Any strength') };
    return [anyOption, ...availableStrengths.map((d) => ({ id: d.uuid, label: d.strength || d.display, drug: d }))];
  }, [availableStrengths, t]);

  const [selectedStrengthId, setSelectedStrengthId] = useState<string>('any');

  useEffect(() => {
    if (availableStrengths.length > 0 && strength) {
      const match = availableStrengths.find((d) => d.strength === strength);
      if (match) {
        setSelectedStrengthId(match.uuid);
      }
    }
  }, [availableStrengths, strength]);

  const selectedStrengthDrug = useMemo(
    () => (selectedStrengthId === 'any' ? undefined : availableStrengths.find((d) => d.uuid === selectedStrengthId)),
    [selectedStrengthId, availableStrengths],
  );

  // Manual Inputs (dose, route, frequency)
  const [manualDose, setManualDose] = useState<number | null>(null);
  const [manualRoute, setManualRoute] = useState<OrderConfigItem | null>(null);
  const [manualFrequency, setManualFrequency] = useState<OrderConfigItem | null>(null);
  const [showManualInputs, setShowManualInputs] = useState({ dose: false, route: false, frequency: false });

  // Fetch order config only when needed
  const needsOrderConfig = showManualInputs.route || showManualInputs.frequency;
  const {
    routes,
    frequencies,
    isLoading: isLoadingOrderConfig,
    error: orderConfigError,
  } = useOrderConfig(needsOrderConfig);

  useEffect(() => {
    if (strengthsError) {
      reportError(strengthsError);
    }
    if (orderConfigError) {
      reportError(orderConfigError);
    }
  }, [strengthsError, orderConfigError]);

  // Attribute Toggles
  const hasPrefilledStrength = Boolean(strength || effectiveDrug?.strength);
  const hasPrefilledDose = Boolean(dose);
  const hasPrefilledUnit = Boolean(unit || effectiveDrug?.dosageForm?.display);
  const hasPrefilledRoute = Boolean(route);
  const hasPrefilledFrequency = Boolean(frequency);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<AttributeKey, boolean>>(() => ({
    strength: hasPrefilledStrength,
    dose: hasPrefilledDose,
    unit: hasPrefilledUnit,
    route: hasPrefilledRoute,
    frequency: hasPrefilledFrequency,
  }));

  const resolvedValues = useMemo(
    () => ({
      strength: strength || selectedStrengthDrug?.strength || effectiveDrug?.strength,
      dose: dose || (manualDose == null ? undefined : manualDose.toString()),
      unit: unit || selectedStrengthDrug?.dosageForm?.display || effectiveDrug?.dosageForm?.display,
      route: route || manualRoute?.display,
      frequency: frequency || manualFrequency?.display,
    }),
    [
      strength,
      dose,
      unit,
      route,
      frequency,
      selectedStrengthDrug,
      effectiveDrug,
      manualDose,
      manualRoute,
      manualFrequency,
    ],
  );

  const resolvedUuids = useMemo(
    () => ({
      unitUuid: selectedStrengthDrug?.dosageForm?.uuid || effectiveDrug?.dosageForm?.uuid,
      routeUuid: manualRoute?.uuid,
      frequencyUuid: manualFrequency?.uuid,
    }),
    [selectedStrengthDrug, effectiveDrug, manualRoute, manualFrequency],
  );

  // Handlers
  const handleRemoveAttribute = useCallback((key: AttributeKey) => {
    if (key === 'strength') {
      setSelectedAttributes((prev) => ({ ...prev, strength: false, dose: false, route: false, frequency: false }));
      setManualDose(null);
      setManualRoute(null);
      setManualFrequency(null);
      setShowManualInputs({ dose: false, route: false, frequency: false });
    } else {
      setSelectedAttributes((prev) => ({ ...prev, [key]: false }));
    }
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
    loading: {
      isLoadingStrengths,
      isLoadingOrderConfig,
    },

    prefilled: {
      hasPrefilledDose,
      hasPrefilledRoute,
      hasPrefilledFrequency,
    },

    strength: {
      selectedId: selectedStrengthId,
      selectedDrug: selectedStrengthDrug,
      availableStrengths,
      options: strengthOptions,
      onChange: handleStrengthChange,
    },

    selection: {
      selected: selectedAttributes,
      onAdd: handleAddAttribute,
      onRemove: handleRemoveAttribute,
    },

    manualInputs: {
      show: showManualInputs,
      dose: manualDose,
      route: manualRoute,
      frequency: manualFrequency,
      setDose: setManualDose,
      setRoute: setManualRoute,
      setFrequency: setManualFrequency,
      onShow: handleShowManualInput,
      onHide: handleHideManualInput,
    },

    orderConfig: {
      routes,
      frequencies,
    },

    resolved: {
      values: resolvedValues,
      uuids: resolvedUuids,
    },
  };
}
