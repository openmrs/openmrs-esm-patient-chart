import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, Column, Form, InlineLoading, Row, Stack, TextArea } from '@carbon/react';
import {
  createErrorHandler,
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../../config-schema';
import { saveVisitNote } from '../visit-notes.resource';
import styles from './notes-form.scss';
import { moduleName } from '@openmrs/esm-patient-medications-app/src/dashboard.meta';

type NotesFormData = z.infer<typeof noteFormSchema>;

const noteFormSchema = z.object({
  wardClinicalNote: z.string().refine((val) => val.trim().length > 0, {
    //t('clinicalNoteErrorMessage','Clinical note is required')
    message: translateFrom(moduleName, 'clinicalNoteErrorMessage', 'Clinical note is required'),
  }),
});

const WardPatientNotesForm: React.FC<DefaultPatientWorkspaceProps> = ({
  closeWorkspaceWithSavedChanges,
  patientUuid,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const config = useConfig<ConfigObject>();
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid } = config.visitNoteConfig;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rows, setRows] = useState<number>();

  const { control, handleSubmit, watch, getValues, setValue, formState } = useForm<NotesFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      wardClinicalNote: '',
    },
  });

  const { isDirty } = formState;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const locationUuid = session?.sessionLocation?.uuid;
  const providerUuid = session?.currentProvider?.uuid;

  const onSubmit = (data: NotesFormData) => {
    const { wardClinicalNote } = data;
    setIsSubmitting(true);

    const notePayload = {
      encounterDatetime: dayjs(new Date()).format(),
      patient: patientUuid,
      location: locationUuid,
      encounterType: encounterTypeUuid,
      encounterProviders: [
        {
          encounterRole: clinicianEncounterRole,
          provider: providerUuid,
        },
      ],
      obs: wardClinicalNote
        ? [{ concept: { uuid: encounterNoteTextConceptUuid, display: '' }, value: wardClinicalNote }]
        : [],
    };

    const abortController = new AbortController();

    saveVisitNote(abortController, notePayload)
      .then(() => {
        closeWorkspaceWithSavedChanges();
        showSnackbar({
          isLowContrast: true,
          subtitle: t('visitNoteNowVisible', 'It is now visible on the Visits page'),
          kind: 'success',
          title: t('visitNoteSaved', 'Visit note saved'),
        });
      })
      .catch((err) => {
        createErrorHandler();

        showSnackbar({
          title: t('visitNoteSaveError', 'Error saving visit note'),
          kind: 'error',
          isLowContrast: false,
          subtitle: err?.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onError = (errors) => console.error(errors);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
      <Stack className={styles.formContainer} gap={2}>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('note', 'Note')}</span>
          </Column>
          <Column sm={3}>
            <Controller
              name="wardClinicalNote"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ResponsiveWrapper>
                  <TextArea
                    id="additionalNote"
                    rows={rows}
                    labelText={t('clinicalNoteLabel', 'Write your notes')}
                    placeholder={t('wardClinicalNotePlaceholder', 'Write any notes here')}
                    value={value}
                    onBlur={onBlur}
                    invalid={!!formState.errors.wardClinicalNote}
                    invalidText={formState.errors.wardClinicalNote?.message}
                    onChange={(event) => {
                      onChange(event);
                      const textareaLineHeight = 24; // This is the default line height for Carbon's TextArea component
                      const newRows = Math.ceil(event.target.scrollHeight / textareaLineHeight);
                      setRows(newRows);
                    }}
                  />
                </ResponsiveWrapper>
              )}
            />
          </Column>
        </Row>
      </Stack>
      <Button kind="primary" className={styles.saveButton} disabled={isSubmitting} type="submit">
        {isSubmitting ? <InlineLoading description={t('saving', 'Saving...')} /> : <span>{t('save', 'Save')}</span>}
      </Button>
    </Form>
  );
};

export default WardPatientNotesForm;
