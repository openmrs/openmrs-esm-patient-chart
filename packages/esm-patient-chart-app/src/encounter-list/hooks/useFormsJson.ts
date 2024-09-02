import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr';
import { fetchOpenMRSForms2 } from '../encounter-list.resource';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';

export function useFormsJson(formUuids: string[]) {
  const [openmrsForms, setOpenmrsForms] = useState<FormSchema[]>([]);
  const { data: responses, isLoading: isLoadingOpenmrsForms } = useSWRImmutable<any, Error>(
    formUuids,
    fetchOpenMRSForms2,
  );

  useEffect(() => {
    if (responses?.length) {
      setOpenmrsForms(
        responses
          .map((response, index) => {
            const match =
              response?.data ?? response?.data?.find((result) => !result.retired && result.name === formUuids[index]);
            if (!match) {
              console.error('Form not found: ' + formUuids[index]);
              return null;
            }
            return match;
          })
          .filter(Boolean),
      );
    }
  }, [formUuids, responses]);

  return {
    formsJson: openmrsForms,
    isLoading: isLoadingOpenmrsForms,
  };
}
