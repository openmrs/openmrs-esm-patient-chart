import React, { useEffect, useRef, useState, SyntheticEvent } from 'react';
import styles from './appointments-form.css';
import { SummaryCard } from '@openmrs/esm-patient-common-lib';
import { createErrorHandler } from '@openmrs/esm-framework';
import {
  getSession,
  createAppointment,
  getAppointmentService,
  getAppointmentServiceAll,
} from './appointments.resource';
import { useHistory } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { DataCaptureComponentProps } from '../types';

interface AppointmentsFormProps extends DataCaptureComponentProps {
  patientUuid: string;
}

export interface Appointment {
  serviceUuid: string;
  serviceTypeUuid?: string;
  startDateTime: Date;
  endDateTime: Date;
  appointmentKind: string;
  comments: string;
  locationUuid?: string;
  providerUuid?: string;
  status?: string;
  patientUuid: string;
}

const AppointmentsForm: React.FC<AppointmentsFormProps> = ({
  patientUuid,
  entryStarted = () => {},
  entryCancelled = () => {},
  closeComponent = () => {},
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [appointmentService, setAppointmentService] = useState(null);
  const [appointmentServiceType, setAppointmentServiceType] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentStartTime, setAppointmentStartTime] = useState(null);
  const [appointmentEndTime, setAppointmentEndTime] = useState(null);
  const [appointmentKind, setAppointmentKind] = useState('Scheduled');
  const [comments, setComment] = useState(null);
  const [location, setLocation] = useState(null);
  const [serviceUuid, setServiceUuid] = useState('');
  const [serviceTypeUuid, setServiceTypeUuid] = useState(null);
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [enableCreateButtons, setEnableCreateButtons] = useState<boolean>(false);
  const { t } = useTranslation();
  const history = useHistory();

  useEffect(() => {
    // toggle based on required fields
    if (appointmentDate && appointmentStartTime && appointmentEndTime) {
      setEnableCreateButtons(true);
    }
  }, [appointmentDate, appointmentStartTime, appointmentEndTime]);

  useEffect(() => {
    const abortController = new AbortController();

    if (patientUuid) {
      getAppointmentServiceAll(abortController).then(({ data }) => {
        setAppointmentService(data);
      }, createErrorHandler());
      getSession(abortController).then((response) => {
        setCurrentSession(response?.data);
        setLocation(response?.data?.sessionLocation?.uuid);
      }, createErrorHandler());
    }

    return () => abortController.abort();
  }, [patientUuid]);

  useEffect(() => {
    const abortController = new AbortController();
    if (serviceUuid && serviceUuid !== 'default') {
      getAppointmentService(abortController, serviceUuid).then(({ data }) => {
        setAppointmentServiceType(data.serviceTypes);
      });
    }
  }, [serviceUuid]);

  const navigate = () => {
    history.push(`/patient/${patientUuid}/chart/appointments`);
  };

  const closeForm = (event: SyntheticEvent<HTMLButtonElement>) => {
    formRef.current.reset();
    let userConfirmed: boolean = false;
    if (formChanged) {
      userConfirmed = confirm('There is ongoing work, are you sure you want to close this tab?');
    }

    if (userConfirmed && formChanged) {
      entryCancelled();
      closeComponent();
    } else if (!formChanged) {
      entryCancelled();
      closeComponent();
    }
  };

  const handleCreateFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    let startDateTime = new Date(appointmentDate + ' ' + appointmentStartTime);
    let endDateTime = new Date(appointmentDate + ' ' + appointmentEndTime);

    let appointment: Appointment = {
      serviceTypeUuid: serviceTypeUuid,
      serviceUuid: serviceUuid,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      appointmentKind: appointmentKind,
      comments: comments,
      locationUuid: location,
      patientUuid: patientUuid,
      status: null,
      providerUuid: currentSession.currentProvider.uuid,
    };
    const abortController = new AbortController();
    createAppointment(appointment, abortController).then((response) => {
      response.status === 200 && navigate();
    }, createErrorHandler());
  };

  return (
    <SummaryCard
      name={t('scheduleNewAppointment', 'Schedule new appointment')}
      styles={{ backgroundColor: 'var(--omrs-color-bg-medium-contrast)' }}>
      <form
        ref={formRef}
        onSubmit={handleCreateFormSubmit}
        onChange={() => {
          setFormChanged(true);
          return entryStarted();
        }}
        className={styles.appointmentContainer}>
        <div className={styles.inputContainer}>
          <label htmlFor="service">
            <Trans i18nKey="service">Service</Trans>
          </label>
          <select
            id="service"
            name="select-service"
            value={serviceUuid}
            defaultChecked={true}
            onChange={(event) => setServiceUuid(event.target.value)}>
            <option key={0} value={'default'}>
              {t('selectService', 'Select service')}
            </option>
            {appointmentService &&
              appointmentService.map((service) => (
                <option value={service.uuid} key={service.uuid}>
                  {service.name}
                </option>
              ))}
          </select>
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="serviceType">
            <Trans i18nKey="serviceType">Service type</Trans>
          </label>
          <select
            name="serviceType"
            id="serviceType"
            onChange={(event) => setServiceTypeUuid(event.target.value)}
            defaultValue={serviceTypeUuid}>
            {appointmentServiceType &&
              appointmentServiceType.map((serviceType) => {
                return (
                  <option key={serviceType.uuid} value={serviceType.uuid}>
                    {serviceType.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className={styles.inputContainer} style={{ flexDirection: 'row' }}>
          <div className={styles.inputContainer}>
            <label htmlFor="date">
              <Trans i18nKey="date">Date</Trans>
            </label>
            <div className="omrs-datepicker">
              <input
                id="date"
                type="date"
                name="datepicker"
                onChange={(event) => setAppointmentDate(event.target.value)}
                required
              />
              <svg className="omrs-icon" role="img">
                <use xlinkHref="#omrs-icon-calendar"></use>
              </svg>
            </div>
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="startTime">
              <Trans i18nKey="startTime">Start time</Trans>
            </label>
            <div className="omrs-datepicker">
              <input
                id="startTime"
                type="time"
                name="datepicker"
                onChange={(event) => setAppointmentStartTime(event.target.value)}
                required
              />
              <svg className="omrs-icon" role="img">
                <use xlinkHref="#omrs-icon-access-time"></use>
              </svg>
            </div>
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="endTime">
              <Trans i18nKey="endTime">End time</Trans>
            </label>
            <div className="omrs-datepicker">
              <input
                id="endTime"
                type="time"
                name="datepicker"
                onChange={(event) => setAppointmentEndTime(event.target.value)}
                required
              />
              <svg className="omrs-icon" role="img">
                <use xlinkHref="#omrs-icon-access-time"></use>
              </svg>
            </div>
          </div>
        </div>
        <div className={styles.inputContainer}>
          <div className="omrs-checkbox">
            <label>
              <input
                type="checkbox"
                name="omrs-checkbox"
                onChange={(event) => setAppointmentKind(event.target.value)}
                style={{ marginRight: '0.5rem' }}
                value="WalkIn"
              />
              <span>
                <Trans i18nKey="walkInAppointment">Walk-in appointment</Trans>
              </span>
            </label>
          </div>
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="notes">
            <Trans i18nKey="notes">Notes</Trans>
          </label>
          <textarea name="notes" id="notes" rows={5} onChange={(event) => setComment(event.target.value)} />
        </div>
        <div
          className={enableCreateButtons ? styles.buttonStyles : `${styles.buttonStyles} ${styles.buttonStylesBorder}`}>
          <button
            type="button"
            className="omrs-btn omrs-outlined-neutral omrs-rounded"
            style={{ width: '50%' }}
            onClick={closeForm}>
            <Trans i18nKey="cancel">Cancel</Trans>
          </button>
          <button
            type="submit"
            style={{ width: '50%' }}
            className={
              enableCreateButtons ? 'omrs-btn omrs-filled-action omrs-rounded' : 'omrs-btn omrs-outlined omrs-rounded'
            }
            disabled={!enableCreateButtons}>
            <Trans i18nKey="save">Save</Trans>
          </button>
        </div>
      </form>
    </SummaryCard>
  );
};

export default AppointmentsForm;
