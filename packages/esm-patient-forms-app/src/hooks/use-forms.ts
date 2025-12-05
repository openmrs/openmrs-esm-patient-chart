import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import {
  getDynamicOfflineDataEntries,
  interpolateUrl,
  openmrsFetch,
  restBaseUrl,
  useConfig,
  userHasAccess,
  useSession,
} from '@openmrs/esm-framework';
import type { FormEntryConfigSchema } from '../config-schema';
import type { ListResponse, Form, EncounterWithFormRef, CompletedFormInfo } from '../types';
import {
  customEncounterRepresentation,
  customFormRepresentation,
  formEncounterUrl,
  formEncounterUrlPoc,
} from '../constants';
import { isValidOfflineFormEncounter } from '../offline-forms/offline-form-helpers';
import useSWRInfinite from 'swr/infinite';

const PAGE_SIZE = 50;

function useCustomFormsUrl(patientUuid: string, visitUuid: string) {
  const { customFormsUrl, showHtmlFormEntryForms } = useConfig<FormEntryConfigSchema>();
  const hasCustomFormsUrl = Boolean(customFormsUrl);

  const baseUrl = hasCustomFormsUrl ? customFormsUrl : showHtmlFormEntryForms ? formEncounterUrl : formEncounterUrlPoc;

  const url = interpolateUrl(baseUrl, {
    patientUuid: patientUuid,
    visitUuid: visitUuid,
    representation: customFormRepresentation,
  });

  return {
    url,
    hasCustomFormsUrl,
  };
}

export function useFormEncounters(
  cachedOfflineFormsOnly = false,
  patientUuid: string = '',
  visitUuid: string = '',
  limit?: number,
  startIndex?: number,
  searchQuery?: string,
) {
  const { url: baseUrl, hasCustomFormsUrl } = useCustomFormsUrl(patientUuid, visitUuid);

  const url = useMemo(() => {
    if (!baseUrl) return baseUrl;

    let finalUrl: URL;
    try {
      finalUrl = new URL(baseUrl);
    } catch {
      const cleanUrl = baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl;
      const fullUrl = `${window.location.origin}/openmrs/${cleanUrl}`;
      finalUrl = new URL(fullUrl);
    }

    if (limit !== undefined) {
      finalUrl.searchParams.set('limit', limit.toString());
    }
    if (startIndex !== undefined) {
      finalUrl.searchParams.set('startIndex', startIndex.toString());
    }
    if (searchQuery) {
      finalUrl.searchParams.set('q', searchQuery);
    }

    return finalUrl.toString();
  }, [baseUrl, limit, startIndex, searchQuery]);

  return useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch<ListResponse<Form>>(url);
    const forms = hasCustomFormsUrl
      ? res?.data.results
      : res.data?.results?.filter((form) => form.published && !/component/i.test(form.name)) ?? [];

    if (!cachedOfflineFormsOnly) {
      return forms;
    }

    const dynamicFormData = await getDynamicOfflineDataEntries('form');
    return forms.filter((form) => dynamicFormData.some((entry) => entry.identifier === form.uuid));
  });
}

export function useEncountersWithFormRef(
  patientUuid: string,
  startDate: Date = dayjs(new Date()).startOf('day').subtract(500, 'day').toDate(),
  endDate: Date = dayjs(new Date()).endOf('day').toDate(),
) {
  const url = patientUuid
    ? `${restBaseUrl}/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`
    : null;
  return useSWR(url, openmrsFetch<ListResponse<EncounterWithFormRef>>);
}

// December 31, 1969; hopefully we don't have encounters before that
const MINIMUM_DATE = new Date(0);

export function useForms(
  patientUuid: string,
  visitUuid?: string,
  startDate?: Date,
  endDate?: Date,
  cachedOfflineFormsOnly = false,
  orderBy: 'name' | 'most-recent' = 'name',
) {
  const { htmlFormEntryForms } = useConfig<FormEntryConfigSchema>();
  const allFormsRes = useFormEncounters(cachedOfflineFormsOnly, patientUuid, visitUuid);
  const encountersRes = useEncountersWithFormRef(patientUuid, startDate, endDate);
  const pastEncounters = encountersRes.data?.data?.results ?? [];
  const data = allFormsRes.data ? mapToFormCompletedInfo(allFormsRes.data, pastEncounters) : undefined;
  const session = useSession();

  const mutateForms = () => {
    allFormsRes.mutate();
    encountersRes.mutate();
  };
  // Note:
  // `pastEncounters` is currently considered as optional (i.e. any errors are ignored) since it's only used for display
  // and doesn't change any functional flows. This makes offline mode much easier to implement since the past encounters
  // don't have to be cached regularly.
  // If this ever becomes a problem for online mode (i.e. if an error should be rendered there when past encounters
  // for determining filled out forms can't be loaded) this should ideally be conditionally controlled via a flag
  // such that the current offline behavior doesn't change.
  let formsToDisplay = cachedOfflineFormsOnly
    ? data?.filter((formInfo) => isValidOfflineFormEncounter(formInfo.form, htmlFormEntryForms))
    : data;

  if (session?.user) {
    formsToDisplay = formsToDisplay?.filter((formInfo) =>
      userHasAccess(formInfo?.form?.encounterType?.editPrivilege?.display, session.user),
    );
  }

  if (orderBy === 'name') {
    formsToDisplay?.sort((formInfo1, formInfo2) =>
      (formInfo1.form.display ?? formInfo1.form.name).localeCompare(formInfo2.form.display ?? formInfo2.form.name),
    );
  } else {
    formsToDisplay?.sort(
      (formInfo1, formInfo2) =>
        (formInfo1.lastCompletedDate ?? MINIMUM_DATE).getDate() -
        (formInfo2.lastCompletedDate ?? MINIMUM_DATE).getDate(),
    );
  }

  return {
    data: formsToDisplay,
    error: allFormsRes.error,
    isValidating: allFormsRes.isValidating || encountersRes.isValidating,
    allForms: allFormsRes.data,
    mutateForms,
  };
}

export function useInfiniteForms(
  patientUuid: string,
  visitUuid?: string,
  startDate?: Date,
  endDate?: Date,
  cachedOfflineFormsOnly = false,
  orderBy: 'name' | 'most-recent' = 'name',
  searchQuery?: string,
) {
  const { htmlFormEntryForms } = useConfig<FormEntryConfigSchema>();
  const { url: baseUrl, hasCustomFormsUrl } = useCustomFormsUrl(patientUuid, visitUuid);
  const session = useSession();

  // Get encounters data (load all at once since it's needed for form completion info)
  const encountersRes = useEncountersWithFormRef(patientUuid, startDate, endDate);
  const pastEncounters = useMemo(() => {
    return encountersRes.data?.data?.results ?? [];
  }, [encountersRes.data]);

  // SWR Infinite key generator
  const getKey = useCallback(
    (pageIndex: number, previousPageData: { forms: Form[]; rawCount: number } | null) => {
      if (previousPageData && previousPageData.rawCount < PAGE_SIZE) {
        return null;
      }

      if (!baseUrl) {
        return null;
      }

      // Check if baseUrl is already an absolute URL
      let finalUrl: URL;
      try {
        finalUrl = new URL(baseUrl);
      } catch {
        // If it's a relative URL, construct it properly with the origin
        // Remove leading slash to avoid double slashes and add /openmrs prefix
        const cleanUrl = baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl;
        const fullUrl = `${window.location.origin}/openmrs/${cleanUrl}`;
        finalUrl = new URL(fullUrl);
      }

      // Add pagination parameters
      finalUrl.searchParams.set('limit', PAGE_SIZE.toString());
      finalUrl.searchParams.set('startIndex', (pageIndex * PAGE_SIZE).toString());

      if (searchQuery && searchQuery.trim()) {
        finalUrl.searchParams.set('q', searchQuery.trim());
      }

      return [finalUrl.toString(), cachedOfflineFormsOnly];
    },
    [baseUrl, cachedOfflineFormsOnly, searchQuery],
  );

  // SWR Infinite fetcher
  const fetcher = useCallback(
    async ([url, cachedOnly]: [string, boolean]) => {
      const res = await openmrsFetch<ListResponse<Form>>(url);
      const rawForms = res?.data?.results ?? [];
      const forms = hasCustomFormsUrl
        ? rawForms
        : rawForms.filter((form) => form.published && !/component/i.test(form.name));

      if (!cachedOnly) {
        return {
          forms,
          rawCount: rawForms.length,
        };
      }

      const dynamicFormData = await getDynamicOfflineDataEntries('form');
      return {
        forms: forms.filter((form) => dynamicFormData.some((entry) => entry.identifier === form.uuid)),
        rawCount: rawForms.length,
      };
    },
    [hasCustomFormsUrl],
  );

  const {
    data: pages,
    error,
    size,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateFirstPage: false,
  });

  // Flatten all pages into a single array
  const allLoadedForms = useMemo(() => {
    if (!pages) return [];
    const flattened = pages.flatMap((page) => page.forms);

    return flattened;
  }, [pages]);

  // Process forms with completion info and apply filters
  const processedForms = useMemo(() => {
    if (!allLoadedForms.length) return [];

    const data = mapToFormCompletedInfo(allLoadedForms, pastEncounters);

    let formsToDisplay = cachedOfflineFormsOnly
      ? data?.filter((formInfo) => isValidOfflineFormEncounter(formInfo.form, htmlFormEntryForms))
      : data;

    // Apply user access filter
    if (session?.user) {
      formsToDisplay = formsToDisplay?.filter((formInfo) =>
        userHasAccess(formInfo?.form?.encounterType?.editPrivilege?.display, session.user),
      );
    }

    // Apply sorting
    if (orderBy === 'name') {
      formsToDisplay?.sort((formInfo1, formInfo2) =>
        (formInfo1.form.display ?? formInfo1.form.name).localeCompare(formInfo2.form.display ?? formInfo2.form.name),
      );
    } else {
      formsToDisplay?.sort(
        (formInfo1, formInfo2) =>
          (formInfo2.lastCompletedDate ?? MINIMUM_DATE).getTime() -
          (formInfo1.lastCompletedDate ?? MINIMUM_DATE).getTime(),
      );
    }

    return formsToDisplay;
  }, [allLoadedForms, pastEncounters, cachedOfflineFormsOnly, htmlFormEntryForms, session, orderBy]);

  // Load more data
  const loadMore = useCallback(() => {
    setSize(size + 1);
  }, [setSize, size]);

  // Check if we can load more
  const canLoadMore = useMemo(() => {
    if (!pages || pages.length === 0) return true; // Can load first page

    const lastPage = pages[pages.length - 1];

    // If last page has no results, we can't load more
    if (!lastPage || lastPage.rawCount === 0) {
      return false;
    }

    const result = lastPage.rawCount === PAGE_SIZE;

    return result;
  }, [pages]);

  // Check if currently loading
  const isLoading = useMemo(() => {
    return isValidating;
  }, [isValidating]);

  const mutateForms = useCallback(() => {
    mutate();
    encountersRes.mutate();
  }, [mutate, encountersRes]);

  return {
    data: processedForms,
    isError: error,
    isValidating: isValidating || encountersRes.isValidating,
    isLoading,
    loadMore,
    canLoadMore,
    hasMore: canLoadMore,
    allForms: allLoadedForms,
    mutateScrollableForms: mutateForms,
    isValidatingScrollableForms: isValidating,
    totalLoaded: allLoadedForms.length,
  };
}

function mapToFormCompletedInfo(
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return allForms.map((form) => {
    const associatedEncounters = encounters.filter((encounter) => encounter.form?.uuid === form?.uuid);
    const lastCompletedDate =
      associatedEncounters.length > 0
        ? new Date(Math.max(...associatedEncounters.map((e) => new Date(e.encounterDatetime).getTime())))
        : undefined;

    return {
      form,
      associatedEncounters,
      lastCompletedDate,
    };
  });
}
