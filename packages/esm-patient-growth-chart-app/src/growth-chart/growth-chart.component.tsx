import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Layer, Tile, Theme, ActionableNotification } from '@carbon/react';
import { CardHeader, navigate } from '@openmrs/esm-framework';
import GrowthChartVisualization from './growth-chart-visualization.component';
import UnknownGenderState from '../unknown-gender-state/unknown-gender.component';
import { useGrowthChartData } from './growth-chart.resource';
import { getGenderTranslation } from './growth-chart.utils';
import styles from './growth-chart-main.scss';

interface GrowthChartProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGrowthChartData(patient);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const handleGenderSelected = (gender: string) => {
    setSelectedGender(gender);
    setShowUpdatePrompt(true);
  };

  const ageInMonths = useMemo(() => {
    const birthDate = dayjs(patient?.birthDate);
    return birthDate.isValid() ? dayjs().diff(birthDate, 'month', true) : null;
  }, [patient?.birthDate]);

  const genderToUse = selectedGender || patient?.gender?.toLowerCase();

  const isSupportedGender = useMemo(() => {
    return genderToUse === 'male' || genderToUse === 'female';
  }, [genderToUse]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError) {
    return <Tile>{t('errorLoadingData', 'Error loading growth chart data')}</Tile>;
  }

  if (!data?.patient) {
    return <Tile>{t('errorDataUnavailable', 'Patient data not available')}</Tile>;
  }

  if (ageInMonths !== null && ageInMonths > 60) {
    return (
      <Theme theme="white">
        <div className={styles.container}>
          <CardHeader title={t('growthChart', 'Growth chart')} />
          <div className={styles.unavailableStateContainer}>
            <Layer>
              <Tile className={styles.unavailableStateTile}>
                <p className={styles.unavailableStateHeading}>
                  {t('growthChartUnavailable', 'Growth chart unavailable')}
                </p>
                <p className={styles.unavailableStateBody}>
                  {t(
                    'growthChartAgeUnavailable',
                    'Growth charts are available for children from birth through 5 years of age.',
                  )}
                </p>
              </Tile>
            </Layer>
          </div>
        </div>
      </Theme>
    );
  }

  const chartDataToRender = selectedGender
    ? {
        ...data,
        patient: {
          ...data.patient,
          gender: selectedGender,
        },
      }
    : data;

  const selectedReferenceChart =
    selectedGender === 'female' ? t('femaleReference', 'Female reference') : t('maleReference', 'Male reference');

  const patientGenderValue = getGenderTranslation(patient?.gender);

  return (
    <Theme theme="white">
      <div className={styles.container}>
        <CardHeader title={t('growthChart', 'Growth chart')} />

        {showUpdatePrompt && (
          <div className={styles.notificationContainer}>
            <ActionableNotification
              inline
              lowContrast
              className={styles.customNotification}
              kind="info"
              title={t(
                'showingReferenceChart',
                "Showing the {{selectedReferenceChart}} chart. The patient's recorded gender is {{patientGender}}.",
                {
                  selectedReferenceChart,
                  patientGender: patientGenderValue,
                },
              )}
              actionButtonLabel={t('editPatientDetails', 'Edit patient details')}
              onActionButtonClick={() => {
                navigate({ to: '${openmrsSpaBase}/patient/${patientUuid}/edit', templateParams: { patientUuid } });
              }}
              onClose={() => setShowUpdatePrompt(false)}
            />
          </div>
        )}

        {!isSupportedGender ? (
          <UnknownGenderState onGenderSelected={handleGenderSelected} />
        ) : (
          <div className={styles.visualizationContainer}>
            <GrowthChartVisualization data={chartDataToRender} />
          </div>
        )}
      </div>
    </Theme>
  );
};

export default GrowthChart;
