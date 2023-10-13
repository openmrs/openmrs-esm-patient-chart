import React, { useCallback, useMemo } from 'react';
import {
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DatePicker,
  DatePickerInput,
  Stack,
  Row,
  Column,
  Form,
  TimePicker,
  TimePickerSelect,
  SelectItem,
} from '@carbon/react';
import styles from './retrospective-dialog.scss';
import { useTranslation } from 'react-i18next';
import {
  NewVisitPayload,
  formatDate,
  saveVisit,
  setCurrentVisit,
  showNotification,
  toDateObjectStrict,
  toOmrsIsoString,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { amPm, convertTime12to24 } from '@openmrs/esm-patient-common-lib';

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
      visitStopTime: z.string({ required_error: t('requiredVisitStopTime', 'Visit stop time is required') }),
      timeFormat: z.enum(['PM', 'AM']),
    });
  }, []);

  type RetrospectiveDialogForm = z.infer<typeof retrospectiveFormSchema>;
  const methods = useForm<RetrospectiveDialogForm>({
    mode: 'all',
    resolver: zodResolver(retrospectiveFormSchema),
    defaultValues: {
      timeFormat: new Date().getHours() >= 12 ? 'PM' : 'AM',
      visitStopTime: dayjs().format('hh:mm'),
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = useCallback((formData: RetrospectiveDialogForm) => {
    {
      const { visitStopTime, timeFormat, visitStopDate } = formData;
      const [hours, minutes] = convertTime12to24(visitStopTime, timeFormat);
      const stopDatetime = toDateObjectStrict(
        toOmrsIsoString(
          new Date(
            dayjs(visitStopDate).year(),
            dayjs(visitStopDate).month(),
            dayjs(visitStopDate).date(),
            hours,
            minutes,
          ),
        ),
      );
      payload.stopDatetime = stopDatetime;
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
          <Stack gap={1} className={styles.container}>
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
            <section style={{ display: 'flex', alignItems: 'center' }}>
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

              <Controller
                name="visitStopTime"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TimePicker
                    id="visitStartTime"
                    labelText={t('time', 'Time')}
                    onChange={(event) => onChange(event.target.value as amPm)}
                    pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                    style={{ marginLeft: '0.125rem', flex: 'none' }}
                    value={value}
                    onBlur={onBlur}
                    invalid={!!errors.visitStopTime}
                    invalidText={errors.visitStopDate?.message}
                  >
                    <Controller
                      name="timeFormat"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TimePickerSelect
                          id="visitStartTimeSelect"
                          onChange={(event) => onChange(event.target.value as amPm)}
                          value={value}
                          aria-label={t('timeFormat ', 'Time Format')}
                        >
                          <SelectItem value="AM" text="AM" />
                          <SelectItem value="PM" text="PM" />
                        </TimePickerSelect>
                      )}
                    />
                  </TimePicker>
                )}
              />
            </section>
          </Stack>
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
