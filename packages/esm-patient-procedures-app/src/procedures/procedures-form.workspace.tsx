import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { closeWorkspace, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { patientProceduresFormWorkspace } from '../constants';
import { saveProcedure } from './procedures.resource';
import styles from './procedures-form.scss';
import { type ConfigObject } from '../config-schema';

interface ProceduresFormWorkspaceProps {
  patientUuid: string;
  closeWorkspace?: () => void;
}

const ProceduresFormWorkspace: React.FC<ProceduresFormWorkspaceProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const session = useSession();
  const config = useConfig<ConfigObject>();
  const [procedureName, setProcedureName] = useState('');
  const [procedureDate, setProcedureDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('Completed');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!procedureName || !procedureDate) {
      showSnackbar({
        title: t('missingFields', 'Missing required fields'),
        kind: 'error',
        subtitle: t('pleaseFillAllRequiredFields', 'Please fill all required fields'),
      });
      return;
    }

    setIsSubmitting(true);
    const abortController = new AbortController();

    try {
      const payload = {
        concept: config.procedureConceptUuid, // The grouping/question concept
        person: patientUuid, // The patient UUID
        obsDatetime: new Date().toISOString(), // Recording time
        // valueDatetime: procedureDate.toISOString(), // Removed: Coded obs should not have valueDatetime
        value: procedureName, // The selected procedure UUID (User must enter UUID)
        comment: comments || undefined,
      };

      await saveProcedure(payload, patientUuid, abortController);

      showSnackbar({
        title: t('procedureRecorded', 'Procedure recorded'),
        kind: 'success',
        subtitle: t('procedureRecordedSuccessfully', 'Procedure has been recorded successfully'),
      });

      closeWorkspace(patientProceduresFormWorkspace);
    } catch (error) {
      showSnackbar({
        title: t('errorRecordingProcedure', 'Error recording procedure'),
        kind: 'error',
        subtitle: error?.message || t('unknownError', 'An unknown error occurred'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <Stack gap={5}>
        <h3 className={styles.heading}>{t('recordProcedure', 'Record a Procedure')}</h3>

        <TextInput
          id="procedureName"
          labelText={t('procedureName', 'Procedure Name')}
          placeholder={t('enterProcedureName', 'Enter procedure name')}
          value={procedureName}
          onChange={(e) => setProcedureName(e.target.value)}
          required
        />

        <DatePicker
          datePickerType="single"
          value={procedureDate}
          onChange={(dates) => setProcedureDate(dates[0])}
          dateFormat="d/m/Y"
        >
          <DatePickerInput
            id="procedureDate"
            labelText={t('procedureDate', 'Procedure Date')}
            placeholder="dd/mm/yyyy"
          />
        </DatePicker>

        <TextInput
          id="status"
          labelText={t('status', 'Status')}
          placeholder={t('enterStatus', 'Enter status (optional)')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        <TextArea
          id="comments"
          labelText={t('comments', 'Comments')}
          placeholder={t('enterComments', 'Enter any additional comments (optional)')}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
        />

        <ButtonSet>
          <Button kind="secondary" onClick={() => closeWorkspace(patientProceduresFormWorkspace)}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving...')} />
            ) : (
              t('saveAndClose', 'Save and close')
            )}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default ProceduresFormWorkspace;
