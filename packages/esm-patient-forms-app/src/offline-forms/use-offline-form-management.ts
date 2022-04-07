import { useLocalStorage } from '../hooks/use-local-storage';
import { FormEncounter } from '../types';
import useSWR from 'swr';
import {
  addFormToCache,
  isFormFullyCached,
  OfflineFormsStorageItem,
  offlineFormsStorageKey,
} from './offline-form-helpers';

export function useOfflineFormManagement(form: FormEncounter) {
  const isFormFullyCachedSwr = useSWR(`offlineFormInfo/${form.uuid}`, () => isFormFullyCached(form));
  const { formsMarkedAsOffline, setMarkedForOffline } = useOfflineFormsLocalStorage();
  const isFormMarkedAsOffline = formsMarkedAsOffline.some((markedForm) => markedForm.uuid === form.uuid);

  const registerFormAsOffline = async () => {
    setMarkedForOffline(form.uuid, true);
    isFormFullyCachedSwr.mutate(async () => {
      await addFormToCache(form);
      return await isFormFullyCached(form);
    });
  };

  const unregisterFormAsOffline = () => {
    setMarkedForOffline(form.uuid, false);
  };

  return {
    isFormFullyCachedSwr,
    isFormMarkedAsOffline,
    registerFormAsOffline,
    unregisterFormAsOffline,
  };
}

function useOfflineFormsLocalStorage() {
  const [formsMarkedAsOffline, setFormsMarkedAsOffline] = useLocalStorage<Array<OfflineFormsStorageItem>>(
    offlineFormsStorageKey,
    [],
  );

  const setMarkedForOffline = (uuid: string, isThisFormAvailableOffline: boolean) => {
    setFormsMarkedAsOffline((previous) => {
      const offlineFormUuids = isThisFormAvailableOffline
        ? [...previous, { uuid }]
        : previous.filter((entry) => entry.uuid !== uuid);
      return offlineFormUuids.length > 0 ? offlineFormUuids : null;
    });
  };

  return {
    formsMarkedAsOffline,
    setMarkedForOffline,
  };
}
