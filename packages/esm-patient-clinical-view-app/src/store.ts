import { useExtensionStore, useConfig } from '@openmrs/esm-framework';
import startCase from 'lodash-es/startCase';
import { useMemo } from 'react';

export const useClinicalView = () => {
  const { slots } = useExtensionStore();
  const { clinicalViews } = useConfig();
  const viewResults = useMemo(() => {
    return {
      views: slots
        ? Object.keys(slots)
            .filter((slot) => slot.search('slot') !== -1)
            .map((slot) => {
              return {
                slotName: startCase(slot.replace(/-/g, ' ').replace('slot', '')),
                slot: slot,
                checked: clinicalViews?.some((view) => view.slotName === slot),
              };
            })
        : [],
      clinicalViews,
    };
  }, [clinicalViews, slots]);

  return viewResults;
};
