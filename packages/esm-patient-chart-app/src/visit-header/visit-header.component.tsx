import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import {
  Button,
  DefinitionTooltip,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  Tag,
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
import { launchPatientWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import styles from './visit-header.scss';
import { MappedQueuePriority, MappedVisitQueueEntry, useVisitQueueEntries } from '../visit/queue-entry/queue.resource';
import { EditQueueEntry } from '../visit/queue-entry/edit-queue-entry.component';

interface PatientInfoProps {
  patient: fhir.Patient;
}
const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const name = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientUuid = `${patient?.id}`;
  const info = `${parseInt(age(patient?.birthDate))}, ${t('capitalizedGender', capitalize(patient?.gender))}`;
  const tooltipText = `${name} ${info}`;
  const truncate = !isTablet && name.trim().length > 25;
  const { visitQueueEntries, isLoading } = useVisitQueueEntries();
  const [currentService, setCurrentService] = useState('');
  const [visitType, setVisitType] = useState('');
  const [priority, setPriority] = useState<MappedQueuePriority>('');
  const [queueEntry, setQueueEntry] = useState<MappedVisitQueueEntry>(null);
  const { currentVisit } = useVisit(patientUuid);

  const getTagType = (priority: string) => {
    switch (priority as MappedQueuePriority) {
      case 'Emergency':
        return 'red';
      case 'Not Urgent':
        return 'green';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    visitQueueEntries?.forEach((element) => {
      if (element?.patientUuid == patientUuid && currentVisit?.uuid === element.visitUuid) {
        const visitQueueEntriesStatuses = {
          Waiting: `${element.status} for ${element.service}`,
          'In Service': `Attending ${element.service}`,
          'Finished Service': `Finished ${element.service}`,
        };
        setCurrentService(visitQueueEntriesStatuses[element.status]);
        setVisitType(element.visitType);
        setPriority(element.priority);
        setQueueEntry(element);
      }
    });
  }, [currentVisit?.uuid, patientUuid, visitQueueEntries]);

  return (
    <>
      {truncate ? (
        <DefinitionTooltip className={styles.tooltip} align="bottom-left" direction="bottom" definition={tooltipText}>
          <span className={styles.patientName}>{name.slice(0, 25) + '...'}</span>
        </DefinitionTooltip>
      ) : (
        <span className={styles.patientName}>{name} </span>
      )}
      <span className={styles.patientInfo}>
        {parseInt(age(patient.birthDate))}, {capitalize(patient.gender)}
      </span>
      {queueEntry ? (
        <>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}> {currentService} </span>
          <div className={styles.navDivider} />
          <span className={styles.patientInfo}> {visitType} </span>
          <Tag
            className={priority === 'Priority' ? styles.priorityTag : styles.tag}
            type={getTagType(priority as string)}
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
  const isTabletViewPort = useLayoutType() === 'tablet';
  const [showVisitHeader, setShowVisitHeader] = useState<boolean>(true);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const { startVisitLabel } = useConfig();

  const { currentVisit, isValidating } = useVisit(patient?.id);
  const launchStartVisitForm = React.useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);
  const showHamburger = useMemo(
    () => isTabletViewPort && navMenuItems.length > 0,
    [navMenuItems.length, isTabletViewPort],
  );

  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);

  const noActiveVisit = !isLoading && visitNotLoaded;

  const originPage = localStorage.getItem('fromPage');

  const { workspaces } = useWorkspaces();

  const onClosePatientChart = React.useCallback(() => {
    originPage ? navigate({ to: `${window.spaBase}/${originPage}` }) : navigate({ to: `${window.spaBase}/home` });
    setShowVisitHeader((prevState) => !prevState);
    localStorage.removeItem('fromPage');
    workspaces.forEach((workspace) => {
      workspace.closeWorkspace();
    });
  }, [originPage, workspaces]);

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
            {noActiveVisit && (
              <HeaderGlobalAction
                className={styles.headerGlobalBarButton}
                aria-label={!startVisitLabel ? <>{t('startVisit', 'Start a visit')}</> : startVisitLabel}
                onClick={launchStartVisitForm}
              >
                <Button as="div" className={styles.startVisitButton}>
                  {!startVisitLabel ? <>{t('startVisit', 'Start a visit')}</> : startVisitLabel}
                </Button>
              </HeaderGlobalAction>
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
    } else {
      return null;
    }
  }, [
    showVisitHeader,
    patient,
    showHamburger,
    isSideMenuExpanded,
    noActiveVisit,
    t,
    startVisitLabel,
    launchStartVisitForm,
    onClosePatientChart,
    toggleSideMenu,
  ]);

  return <HeaderContainer render={render} />;
};

export default VisitHeader;
