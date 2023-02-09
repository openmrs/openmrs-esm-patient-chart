import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  Tag,
  Tooltip,
} from '@carbon/react';
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
} from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { MappedQueuePriority, useVisitQueueEntries } from '../visit/queue-entry/queue.resource';
import { EditQueueEntry } from '../visit/queue-entry/edit-queue-entry.component';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import styles from './visit-header.scss';

interface PatientInfoProps {
  patient: fhir.Patient;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Render translated gender
  const getGender = (gender) => {
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
  };
  const name = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientUuid = `${patient?.id}`;
  const info = `${parseInt(age(patient?.birthDate))}, ${getGender(patient?.gender)}`;
  const truncate = !isTablet && name.trim().length > 25;
  const { visitQueueEntries, isLoading } = useVisitQueueEntries();

  const queueEntry =
    visitQueueEntries?.find(
      (visitQueueEntry) =>
        visitQueueEntry?.patientUuid == patientUuid && currentVisit?.uuid === visitQueueEntry.visitUuid,
    ) ?? null;

  const visitType = queueEntry?.visitType ?? '';
  const priority = queueEntry?.priority ?? '';

  const getServiceString = () => {
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
  };

  const currentService = queueEntry ? getServiceString() : null;

  const { currentVisit } = useVisit(patientUuid);

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

  const text = (
    <>
      <p className={styles.tooltipPatientName}>{name}</p>
      <p className={styles.tooltipPatientInfo}>{info}</p>
    </>
  );

  return (
    <>
      {truncate ? (
        <Tooltip align="bottom-left" width={100} label={text}>
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
      {queueEntry ? (
        <>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}> {currentService} </span>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}> {visitType} </span>
          <Tag
            className={priority === 'Priority' ? styles.priorityTag : styles.tag}
            type={getTagType(priority?.toLocaleLowerCase() as string)}
          >
            {priority}
          </Tag>
          <EditQueueEntry queueEntry={queueEntry} />{' '}
        </>
      ) : null}
    </>
  );
};

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { startVisitLabel } = useConfig();
  const { currentVisit, isValidating } = useVisit(patient?.id);
  const [showVisitHeader, setShowVisitHeader] = useState<boolean>(true);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);

  const launchStartVisitForm = React.useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);
  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;

  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);

  const hasActiveVisit = !isLoading && visitNotLoaded;

  const originPage = localStorage.getItem('fromPage');

  const onClosePatientChart = useCallback(() => {
    originPage ? navigate({ to: `${window.spaBase}/${originPage}` }) : navigate({ to: `${window.spaBase}/home` });
    setShowVisitHeader((prevState) => !prevState);
    localStorage.removeItem('fromPage');
  }, [originPage]);

  const render = useCallback(() => {
    if (!showVisitHeader) {
      return null;
    }

    if (Object.keys(patient ?? {}).length > 0) {
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
              <svg role="img" width={110} height={40}>
                <use xlinkHref="#omrs-logo-white"></use>
              </svg>
            </div>
          </ConfigurableLink>
          <div className={styles.navDivider} />
          <div className={styles.patientDetails}>
            <PatientInfo patient={patient} />
          </div>
          <HeaderGlobalBar>
            {hasActiveVisit && (
              <Button className={styles.startVisitButton} onClick={launchStartVisitForm} size="lg">
                {startVisitLabel ? startVisitLabel : t('startVisit', 'Start a visit')}
              </Button>
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
    }

    return null;
  }, [
    hasActiveVisit,
    isSideMenuExpanded,
    launchStartVisitForm,
    onClosePatientChart,
    patient,
    showHamburger,
    showVisitHeader,
    startVisitLabel,
    t,
    toggleSideMenu,
  ]);

  return <HeaderContainer render={render} />;
};

export default VisitHeader;
