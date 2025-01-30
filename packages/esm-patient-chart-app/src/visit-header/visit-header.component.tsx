import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Header, HeaderGlobalBar, HeaderMenuButton, Tag, Tooltip } from '@carbon/react';
import {
  age,
  getPatientName,
  ConfigurableLink,
  useAssignedExtensions,
  useLayoutType,
  useVisit,
  useConfig,
  showModal,
  ExtensionSlot,
  interpolateUrl,
  getCoreTranslation,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { type MappedQueuePriority, useVisitQueueEntry } from '../visit/queue-entry/queue.resource';
import { CloseButton } from './close-button.component';
import { EditQueueEntry } from '../visit/queue-entry/edit-queue-entry.component';
import RetrospectiveVisitLabel from './retrospective-visit-label.component';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import styles from './visit-header.scss';

interface PatientInfoProps {
  patient: fhir.Patient;
}

function getGender(gender: string) {
  switch (gender) {
    case 'male':
      return getCoreTranslation('male', 'Male');
    case 'female':
      return getCoreTranslation('female', 'Female');
    case 'other':
      return getCoreTranslation('other', 'Other');
    case 'unknown':
      return getCoreTranslation('unknown', 'Unknown');
    default:
      return gender;
  }
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const name = patient ? getPatientName(patient) : '';
  const patientUuid = `${patient?.id}`;
  const patientNameIsTooLong = !isTablet && name.trim().length > 25;
  const { currentVisit } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const visitType = queueEntry?.visitType ?? '';
  const priority = queueEntry?.priority ?? '';
  const getServiceString = useCallback(() => {
    if (queueEntry?.status && queueEntry.service) {
      return `${t(queueEntry.status)} - ${t(queueEntry.service)}`;
    } else {
      return '';
    }
  }, [queueEntry, t]);

  const getTagType = (priority: string) => {
    switch (priority as MappedQueuePriority) {
      case 'emergency':
        return 'red';
      case 'not urgent':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <>
      {patientNameIsTooLong ? (
        <Tooltip
          align="bottom-left"
          width={100}
          label={
            <>
              <p className={styles.tooltipPatientName}>{name}</p>
              <p className={styles.tooltipPatientInfo}>{`${age(patient?.birthDate)}, ${getGender(patient?.gender)}`}</p>
            </>
          }
        >
          <button className={styles.longPatientNameBtn} type="button">
            {name.slice(0, 25) + '...'}
          </button>
        </Tooltip>
      ) : (
        <span className={styles.patientName}>{name} </span>
      )}

      <span className={styles.patientInfo}>
        {patient?.birthDate ? `${age(patient.birthDate)}, ` : ''}
        {patient?.gender ? getGender(patient.gender) : ''}
      </span>

      {queueEntry && (
        <>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}>{getServiceString()}</span>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}>{visitType}</span>
          <Tag
            className={priority === 'Priority' ? styles.priorityTag : styles.tag}
            type={getTagType(priority?.toLocaleLowerCase('en'))}
          >
            {priority}
          </Tag>
          <EditQueueEntry queueEntry={queueEntry} />{' '}
        </>
      )}
    </>
  );
};

function launchStartVisitForm() {
  launchPatientWorkspace('start-visit-workspace-form', { openedFrom: 'patient-chart-start-visit' });
}

const VisitHeader: React.FC<{ patient: fhir.Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { currentVisit, isLoading } = useVisit(patient?.id);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const { logo } = useConfig();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isTablet = useLayoutType() === 'tablet';

  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;
  const currentVisitIsRetrospective = Boolean(currentVisit && currentVisit.stopDatetime);

  const toggleSideMenu = useCallback(
    (state?: boolean) => setIsSideMenuExpanded((prevState) => (state !== undefined ? state : !prevState)),
    [],
  );

  const openModal = useCallback((patientUuid: string) => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);

  return (
    <Header aria-label="OpenMRS" className={styles.topNavHeader}>
      {showHamburger && (
        <HeaderMenuButton
          aria-label="Open menu"
          isCollapsible
          className={styles.headerMenuButton}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            toggleSideMenu();
          }}
          isActive={isSideMenuExpanded}
        />
      )}
      <ConfigurableLink className={isTablet ? styles.navLogoTablet : styles.navLogo} to="${openmrsSpaBase}/home">
        <div className={styles.divider}>
          {logo?.src ? (
            <img className={styles.logo} src={interpolateUrl(logo.src)} alt={logo.alt} width={110} height={40} />
          ) : logo?.name ? (
            logo.name
          ) : (
            <svg role="img" width={110} height={40}>
              <use xlinkHref="#omrs-logo-white"></use>
            </svg>
          )}
        </div>
      </ConfigurableLink>
      <div className={styles.navDivider} />
      <div className={styles.patientDetails}>{patient && <PatientInfo patient={patient} />}</div>
      {currentVisitIsRetrospective && <RetrospectiveVisitLabel currentVisit={currentVisit} />}
      <HeaderGlobalBar>
        {systemVisitEnabled && (
          <>
            <ExtensionSlot name="visit-header-right-slot" />
            {!isLoading && !currentVisit && !isDeceased && (
              <Button
                className={styles.startVisitButton}
                onClick={launchStartVisitForm}
                size="lg"
                aria-label={t('startAVisit', 'Start a visit')}
              >
                {t('startAVisit', 'Start a visit')}
              </Button>
            )}
            {!isLoading && !!currentVisit && (
              <Button
                onClick={() => openModal(patient?.id)}
                className={styles.startVisitButton}
                aria-label={t('endVisit', 'End visit')}
              >
                {t('endVisit', 'End visit')}
              </Button>
            )}
          </>
        )}
        <CloseButton patientUuid={patient?.id} />
      </HeaderGlobalBar>
      <VisitHeaderSideMenu isExpanded={isSideMenuExpanded} toggleSideMenu={toggleSideMenu} />
    </Header>
  );
};

export default VisitHeader;
