import useSWR from 'swr';
import { openmrsFetch, showNotification } from '@openmrs/esm-framework';
import { OHRIFormPage, OHRIFormSchema } from '@openmrs/openmrs-form-engine-lib';
import { useState, useEffect } from 'react';
import { fetchForm } from '../utils/utils';
import { useTranslation } from 'react-i18next';

type UseSchemaReturnType = {
  schema: OHRIFormSchema;
  isLoadingSchema: boolean;
  schemaLoadError: Error;
};

const useSchema = (valueReferenceUuid: string): UseSchemaReturnType => {
  const { t } = useTranslation();
  const [jsonSchema, setJsonSchema] = useState<OHRIFormSchema>(null);
  const [loadSchemaError, setLoadSchemaError] = useState<Error>(null);
  const url = `/ws/rest/v1/clobdata/${valueReferenceUuid}`;
  const { data, isLoading, error } = useSWR<{ data: OHRIFormSchema }>(valueReferenceUuid ? url : null, openmrsFetch);

  useEffect(() => {
    const fetchSubForms = async (pages: OHRIFormPage[]) => {
      const subForms = pages.filter((page) => page.isSubform).map(({ subform }) => subform.name);
      const subFormSchemas = await fetchForm(subForms);
      const subFormPages = subFormSchemas.map((subForm) => subForm.pages);
      const subSubFormPages = await Promise.all(subFormPages.map((subFormPage) => fetchSubForms(subFormPage)));
      const mergedSubFormPages = subFormPages.concat(...subSubFormPages).filter((page) => !page.isSubform);
      return mergedSubFormPages;
    };

    const fetchSchema = async () => {
      if (data?.data) {
        const pages = await fetchSubForms(data.data.pages);
        const initialSchema = data?.data;
        initialSchema.pages = initialSchema.pages.concat(...pages).filter((page) => !page.isSubform);
        setJsonSchema(initialSchema);
      }
    };

    fetchSchema().catch((error) => {
      setLoadSchemaError(error);
      showNotification({
        title: t('schemaLoadError', 'Error loading schema'),
        description: error.message,
        kind: 'error',
      });
    });
  }, [data, t]);

  return { schema: jsonSchema, isLoadingSchema: isLoading, schemaLoadError: error ?? loadSchemaError };
};

export default useSchema;
