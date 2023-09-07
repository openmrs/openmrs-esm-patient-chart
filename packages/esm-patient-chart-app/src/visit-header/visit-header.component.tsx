import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, Tag, Tooltip } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import {
  age,
  ConfigurableLink,
  useAssignedExtensions,
  useLayoutType,
  usePatient,
  useVisit,
  navigate,
  useConfig,
  showModal,
  ExtensionSlot,
  interpolateUrl,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { MappedQueuePriority, useVisitQueueEntry } from '../visit/queue-entry/queue.resource';
import { EditQueueEntry } from '../visit/queue-entry/edit-queue-entry.component';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import styles from './visit-header.scss';
import RetrospectiveVisitLabel from './retrospective-visit-label.component';

interface PatientInfoProps {
  patient: fhir.Patient;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Render translated gender
  const getGender = useCallback(
    (gender) => {
      switch (gender) {
        case 'male':
          return t('male', 'Male');
        case 'female':
          return t('female', 'Female');
        case 'other':
          return t('other', 'Other');
        case 'unknown':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    },
    [t],
  );

  const name = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientUuid = `${patient?.id}`;
  const { currentVisit } = useVisit(patientUuid);
  const patientNameIsTooLong = !isTablet && name.trim().length > 25;
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const visitType = queueEntry?.visitType ?? '';
  const priority = queueEntry?.priority ?? '';

  const getServiceString = useCallback(() => {
    switch (queueEntry?.status?.toLowerCase()) {
      case 'waiting':
        return `Waiting for ${queueEntry.service}`;
      case 'in service':
        return `Attending ${queueEntry.service}`;
      case 'finished service':
        return `Finished ${queueEntry.service}`;
      default:
        return '';
    }
  }, [queueEntry]);

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
              <p className={styles.tooltipPatientInfo}>{`${parseInt(age(patient?.birthDate))}, ${getGender(
                patient?.gender,
              )}`}</p>
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
        {parseInt(age(patient.birthDate))}, {getGender(patient.gender)}
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
  launchPatientWorkspace('start-visit-workspace-form');
}

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { currentVisit, currentVisitIsRetrospective, isValidating } = useVisit(patient?.id);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const { logo } = useConfig();
  const { systemVisitEnabled } = useSystemVisitSetting();

  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;

  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);

  const hasActiveVisit = !isLoading && !visitNotLoaded;

  const onClosePatientChart = useCallback(() => {
    document.referrer === '' ? navigate({ to: `${window.spaBase}/home` }) : window.history.back();
  }, []);

  const openModal = useCallback((patientUuid) => {
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
          onClick={(event) => {
            event.stopPropagation();
            toggleSideMenu();
          }}
          isActive={isSideMenuExpanded}
        />
      )}
      <ConfigurableLink className={styles.navLogo} to="${openmrsSpaBase}/home">
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
            {!hasActiveVisit && !isDeceased && (
              <Button className={styles.startVisitButton} onClick={launchStartVisitForm} size="lg">
                {t('startAVisit', 'Start a visit')}
              </Button>
            )}
            {currentVisit !== null && (
              <>
                <HeaderGlobalAction
                  className={styles.headerGlobalBarButton}
                  aria-label={t('endVisit', 'End visit')}
                  onClick={() => openModal(patient?.id)}
                >
                  <Button as="div" className={styles.startVisitButton}>
                    {t('endVisit', 'End visit')}
                  </Button>
                </HeaderGlobalAction>
              </>
            )}
          </>
        )}
        <HeaderGlobalAction
          className={styles.headerGlobalBarCloseButton}
          aria-label={t('close', 'Close')}
          onClick={onClosePatientChart}
        >
          <CloseFilled size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
      <VisitHeaderSideMenu isExpanded={isSideMenuExpanded} toggleSideMenu={toggleSideMenu} />
    </Header>
  );
};

export default VisitHeader;
