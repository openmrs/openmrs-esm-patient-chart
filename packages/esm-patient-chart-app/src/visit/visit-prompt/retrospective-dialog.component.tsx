import React, { useCallback, useMemo } from 'react';
import {
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DatePicker,
  DatePickerInput,
  FlexGrid,
  Row,
  Column,
  Form,
} from '@carbon/react';
import styles from './retrospective-dialog.scss';
import { useTranslation } from 'react-i18next';
import { NewVisitPayload, formatDate, saveVisit, setCurrentVisit, showNotification } from '@openmrs/esm-framework';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

interface RetrospectiveDialogProp {
  patientUuid: string;
  closeModal: () => void;
  onCancel: () => void;
  visitDate: string;
  payload: NewVisitPayload;
}

const RetrospectiveDialog: React.FC<RetrospectiveDialogProp> = ({
  closeModal,
  visitDate,
  payload,
  patientUuid,
  onCancel,
}) => {
  const { t } = useTranslation();

  const retrospectiveFormSchema = useMemo(() => {
    return z.object({
      visitStopDate: z
        .date({ required_error: t('requiredVisitStopDate', 'Visit stop date is required') })
        .max(dayjs().subtract(1, 'day').toDate(), {
          message: t('visitStopDateBeforeCurrentDate', 'Visit stop date should be before current date'),
        })
        .min(new Date(visitDate), {
          message: t('visitStopDateAfterVisitDate', 'Visit stop date should be after visit start date'),
        }),
    });
  }, []);

  type RetrospectiveDialogForm = z.infer<typeof retrospectiveFormSchema>;
  const methods = useForm<RetrospectiveDialogForm>({
    mode: 'all',
    resolver: zodResolver(retrospectiveFormSchema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = useCallback((formData: RetrospectiveDialogForm) => {
    {
      payload.stopDatetime = new Date(formData.visitStopDate);
      const ac = new AbortController(); // TODO: fix abort controller
      saveVisit(payload, ac).subscribe(
        ({ data }) => {
          setCurrentVisit(patientUuid, data['uuid']);
          closeModal();
        },
        (errors) => {
          showNotification({ title: t('error', 'Error'), description: errors.message, kind: 'error' });
        },
      );
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader closeModal={closeModal}>
          <span className={styles.header}>{t('retrospectiveVisit', 'Retrospective visit')}</span>
        </ModalHeader>
        <ModalBody>
          <FlexGrid>
            <Row>
              <Column>
                <span>
                  {formatDate(new Date(visitDate), { mode: 'standard' })}{' '}
                  {t(
                    'retrospectiveMessage',
                    'visit start date is in the past. Do you want to start a retrospective visit?',
                  )}
                </span>
              </Column>
            </Row>
            <Row>
              <Column lg={8} md={8} sm={4}>
                <Controller
                  name="visitStopDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      light
                      dateFormat="d/m/Y"
                      datePickerType="single"
                      id="visitDate"
                      className={styles.datePicker}
                      maxDate={new Date().toISOString()}
                      minDate={new Date(visitDate).toISOString()}
                      onChange={([date]) => onChange(date)}
                      value={value}
                    >
                      <DatePickerInput
                        id="visitStartDateInput"
                        labelText={t('visitStopDate', 'Visit stop date')}
                        placeholder="dd/mm/yyyy"
                        invalid={!!errors.visitStopDate}
                        invalidText={errors.visitStopDate?.message}
                      />
                    </DatePicker>
                  )}
                />
              </Column>
            </Row>
          </FlexGrid>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" kind="primary">
            {t('startRetrospectiveVisit', 'Start retrospective visit')}
          </Button>
        </ModalFooter>
      </Form>
    </FormProvider>
  );
};

export default RetrospectiveDialog;
