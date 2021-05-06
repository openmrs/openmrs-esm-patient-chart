import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ProgramsForm from './programs-form.component';
import styles from './programs-detailed-summary.css';
import { EmptyState, SummaryCard, openWorkspaceTab } from '@openmrs/esm-patient-common-lib';
import { useTranslation, Trans } from 'react-i18next';
import { RouteComponentProps, Link } from 'react-router-dom';
import { attach, createErrorHandler } from '@openmrs/esm-framework';
import { fetchEnrolledPrograms } from './programs.resource';
import { useProgramsContext } from './programs.context';
import { PatientProgram } from '../types';

interface ProgramsDetailedSummaryProps extends RouteComponentProps<{}> {}

const ProgramsDetailedSummary: React.FC<ProgramsDetailedSummaryProps> = () => {
  const { t } = useTranslation();
  const displayText = t('programEnrollments', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const [enrolledPrograms, setEnrolledPrograms] = useState<Array<PatientProgram>>([]);
  const { patientUuid } = useProgramsContext();

  useEffect(() => {
    if (patientUuid) {
      const subscription = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) => setEnrolledPrograms(enrolledPrograms),
        createErrorHandler(),
      );
      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  const launchProgramsForm = React.useCallback(() => attach('patient-chart-workspace-slot', 'programs-workspace'), []);

  return (
    <>
      {enrolledPrograms?.length ? (
        <div className={styles.programsSummary}>
          <SummaryCard
            name={t('carePrograms', 'Care Programs')}
            styles={{
              width: '100%',
            }}
            addComponent
            showComponent={() =>
              openWorkspaceTab(ProgramsForm, `${t('programsForm', 'Programs form')}`, {
                setEnrolledPrograms: setEnrolledPrograms,
                enrolledPrograms: enrolledPrograms,
              })
            }>
            <table className={`omrs-type-body-regular ${styles.programTable}`}>
              <thead>
                <tr>
                  <th>
                    <Trans i18nKey="activePrograms">Active programs</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="since">Since</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="status">Status</Trans>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enrolledPrograms?.map((program) => {
                  return (
                    <React.Fragment key={program.uuid}>
                      <tr className={`${program.dateCompleted ? `${styles.inactive}` : `${styles.active}`}`}>
                        <td className="omrs-medium">{program.display}</td>
                        <td>{dayjs(program.dateEnrolled).format('MMM-YYYY')}</td>
                        <td>
                          {program.dateCompleted ? (
                            <span className={styles.completionDate}>
                              <Trans i18nKey="completedOn">Completed on</Trans>{' '}
                              {dayjs(program.dateCompleted).format('DD-MMM-YYYY')}
                            </span>
                          ) : (
                            <Trans i18nKey="active">Active</Trans>
                          )}
                        </td>
                        <td>
                          {
                            <Link to={`/${program.uuid}`}>
                              <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
                                <use xlinkHref="#omrs-icon-chevron-right" />
                              </svg>
                            </Link>
                          }
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </SummaryCard>
        </div>
      ) : (
        <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />
      )}
    </>
  );
};

export default ProgramsDetailedSummary;
