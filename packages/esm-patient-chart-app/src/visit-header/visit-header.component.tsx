import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Header, HeaderGlobalBar, HeaderMenuButton, Tag, Tooltip } from '@carbon/react';
import {
  age,
  ConfigurableLink,
  useAssignedExtensions,
  useLayoutType,
  usePatient,
  useVisit,
  useConfig,
  showModal,
  ExtensionSlot,
  interpolateUrl,
} from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { type MappedQueuePriority, useVisitQueueEntry } from '../visit/queue-entry/queue.resource';
import { CloseButton } from './close-button.component';
import { EditQueueEntry } from '../visit/queue-entry/edit-queue-entry.component';
import RetrospectiveVisitLabel from './retrospective-visit-label.component';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import styles from './visit-header.scss';

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
      <span className={styles.patientInfo}>{`${age(patient?.birthDate)}, ${getGender(patient?.gender)}`}</span>
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
  launchWorkspace('start-visit-workspace-form');
}

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { currentVisit, currentVisitIsRetrospective, isLoading } = useVisit(patient?.id);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const { logo } = useConfig();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isTablet = useLayoutType() === 'tablet';

  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;

  const toggleSideMenu = useCallback(
    (state?: boolean) => setIsSideMenuExpanded((prevState) => (state !== undefined ? state : !prevState)),
    [],
  );

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
              <Button className={styles.startVisitButton} onClick={launchStartVisitForm} size="lg">
                {t('startAVisit', 'Start a visit')}
              </Button>
            )}
            {!isLoading && !!currentVisit && (
              <Button onClick={() => openModal(patient?.id)} className={styles.startVisitButton}>
                {t('endVisit', 'End visit')}
              </Button>
            )}
          </>
        )}
        <CloseButton />
      </HeaderGlobalBar>
      <VisitHeaderSideMenu isExpanded={isSideMenuExpanded} toggleSideMenu={toggleSideMenu} />
    </Header>
  );
};

export default VisitHeader;
