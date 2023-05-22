import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Header, HeaderContainer, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import {
  ConfigurableLink,
  useAssignedExtensions,
  useLayoutType,
  usePatient,
  useVisit,
  navigate,
  useConfig,
  showModal,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useVisitQueueEntry } from '../visit/queue-entry/queue.resource';
import PatientInfoCard from './patient-info-card.component';
import VisitHeaderSideMenu from './visit-header-side-menu.component';
import VisitQueueEntryDetails from './visit-queue-entry-details.component';
import styles from './visit-header.scss';

interface PatientInfoProps {
  patient: fhir.Patient;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { currentVisit } = useVisit(patient?.id);
  const { queueEntry } = useVisitQueueEntry(patient?.id, currentVisit?.uuid);
  const priority = queueEntry?.priority ?? '';

  return (
    <div className={styles.patientDetails}>
      <PatientInfoCard patient={patient} />
      <VisitQueueEntryDetails queueEntry={queueEntry} priority={priority} />
    </div>
  );
};

function launchStartVisitForm() {
  launchPatientWorkspace('start-visit-workspace-form');
}

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { currentVisit, isValidating } = useVisit(patient?.id);
  const [showVisitHeader, setShowVisitHeader] = useState(true);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const { startVisitLabel, endVisitLabel, logo } = useConfig();

  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;

  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);

  const hasActiveVisit = !isLoading && !visitNotLoaded;

  const onClosePatientChart = useCallback(() => {
    const originPage = localStorage.getItem('fromPage');
    localStorage.removeItem('fromPage');

    setShowVisitHeader((prevState) => !prevState);
    originPage ? navigate({ to: `${window.spaBase}/${originPage}` }) : navigate({ to: `${window.spaBase}/home` });
  }, []);

  const openModal = useCallback((patientUuid) => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, []);

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
              {logo?.src ? (
                <img className={styles.logo} src={logo.src} alt={logo.alt} width={110} height={40} />
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
          <PatientInfo patient={patient} />
          <HeaderGlobalBar>
            <ExtensionSlot name="visit-header-right-slot" />
            {!hasActiveVisit && (
              <Button className={styles.startVisitButton} onClick={launchStartVisitForm} size="lg">
                {startVisitLabel ? startVisitLabel : t('startAVisit', 'Start a visit')}
              </Button>
            )}
            {currentVisit !== null && endVisitLabel && (
              <>
                <HeaderGlobalAction
                  className={styles.headerGlobalBarButton}
                  aria-label={endVisitLabel ?? t('endAVisit', 'End a visit')}
                  onClick={() => openModal(patient?.id)}
                >
                  <Button as="div" className={styles.startVisitButton}>
                    {endVisitLabel ? endVisitLabel : <>{t('endAVisit', 'End a visit')}</>}
                  </Button>
                </HeaderGlobalAction>
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
    }

    return null;
  }, [
    hasActiveVisit,
    isSideMenuExpanded,
    onClosePatientChart,
    patient,
    showHamburger,
    showVisitHeader,
    startVisitLabel,
    t,
    toggleSideMenu,
    endVisitLabel,
    openModal,
    currentVisit,
    logo,
  ]);

  return <HeaderContainer render={render} />;
};

export default VisitHeader;
