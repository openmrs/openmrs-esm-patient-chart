import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatient, useConfig } from '@openmrs/esm-framework';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { type ConfigObject } from '../config-schema';
import { useGrowthChartData, getPercentilesForAge } from './growth-chart.resource';
import styles from './growth-chart.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface GrowthChartProps {
  patientUuid: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();

  const weightConceptUuid = config?.concepts?.weightUuid || '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const [selectedGender, setSelectedGender] = useState<string>('');

  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);

  const birthDate = useMemo(() => {
    return patient?.birthDate ? new Date(patient.birthDate) : null;
  }, [patient?.birthDate]);

  const {
    measurements: patientMeasurements,
    isLoading: isLoadingObs,
    error: obsError,
  } = useGrowthChartData(patientUuid, weightConceptUuid, birthDate);

  useEffect(() => {
    if (patient?.gender === 'male' || patient?.gender === 'female') {
      setSelectedGender(patient.gender);
    } else if (patient?.gender) {
      setSelectedGender('');
    }
  }, [patient?.gender]);

  const isGenderValid = selectedGender === 'male' || selectedGender === 'female';
  const isMaleReference = selectedGender === 'male';

  const currentAgeInMonths = useMemo(() => {
    if (!birthDate) return 0;
    const diffTime = new Date().getTime() - birthDate.getTime();
    return Math.round((diffTime / (1000 * 60 * 60 * 24 * 30.4375)) * 10) / 10;
  }, [birthDate]);

  const chartRange = Array.from({ length: 61 }, (_, i) => i);
  const p3Data = chartRange.map((m) => ({ x: m, y: getPercentilesForAge(m, isMaleReference).p3 }));
  const p50Data = chartRange.map((m) => ({ x: m, y: getPercentilesForAge(m, isMaleReference).p50 }));
  const p97Data = chartRange.map((m) => ({ x: m, y: getPercentilesForAge(m, isMaleReference).p97 }));

  const hasOlderMeasurements = patientMeasurements.some((w: any) => w.x > 60);

  const data = {
    datasets: [
      {
        label: t('p97Centile', 'P97 (Upper Limit)'),
        data: p97Data,
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: '+2',
        backgroundColor: 'rgba(99, 102, 241, 0.03)',
        tension: 0.3,
      },
      {
        label: t('p50Centile', 'P50 (Median Reference)'),
        data: p50Data,
        borderColor: '#6366f1',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
      {
        label: t('p3Centile', 'P3 (Lower Limit)'),
        data: p3Data,
        borderColor: '#ec4899',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
      {
        label: t('patientWeight', 'Patient Weight (kg)'),
        data: patientMeasurements,
        borderColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#8b5cf6',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#8b5cf6',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter',
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter',
        },
        callbacks: {
          title: (context: any[]) => {
            const point = context[0];
            if (point.datasetIndex === 3) {
              const dataPoint = patientMeasurements[point.dataIndex];
              return `${t('age', 'Age')}: ${point.parsed.x} mo (${dataPoint.dateStr})`;
            }
            return `${t('age', 'Age')}: ${point.parsed.x} ${t('months', 'Months')}`;
          },
          label: (context: any) => {
            return ` ${context.dataset.label}: ${context.parsed.y} kg`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 60,
        title: {
          display: true,
          text: t('ageMonths', 'Age (Months)'),
          color: '#4b5563',
          font: {
            family: 'Inter',
            size: 13,
            weight: '600',
          },
        },
        ticks: {
          stepSize: 6,
          color: '#9ca3af',
          font: {
            family: 'Inter',
          },
        },
        grid: {
          color: '#f3f4f6',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: t('weightKg', 'Weight (kg)'),
          color: '#4b5563',
          font: {
            family: 'Inter',
            size: 13,
            weight: '600',
          },
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter',
          },
        },
        grid: {
          color: '#f3f4f6',
        },
      },
    },
  };

  if (isLoadingPatient || (isGenderValid && isLoadingObs)) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span>{t('loadingGrowthChart', 'Loading patient growth chart...')}</span>
        </div>
      </div>
    );
  }

  if (patientError || (isGenderValid && obsError)) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <span>{t('failedToLoadData', 'Failed to load patient or observation data.')}</span>
        </div>
      </div>
    );
  }

  const latestMeasurement = patientMeasurements[patientMeasurements.length - 1];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>{t('growthChartWeight', 'Child Growth Chart (Weight-for-Age)')}</h2>
          <p className={styles.subtitle}>{t('whoGrowthStandards', 'WHO Child Growth Standards (0 to 60 Months)')}</p>
        </div>
        <div className={styles.controls}>
          <label htmlFor="gender-select" className={styles.statLabel}>
            {t('referenceStandard', 'Reference Standard')}:
          </label>
          <select
            id="gender-select"
            className={styles.select}
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="">{t('selectGender', 'Select Gender Reference')}</option>
            <option value="male">{t('whoBoysStandard', 'WHO Boys Standard')}</option>
            <option value="female">{t('whoGirlsStandard', 'WHO Girls Standard')}</option>
          </select>
        </div>
      </div>

      {!isGenderValid ? (
        <div className={styles.noChartContainer}>
          <h3 className={styles.noChartTitle}>{t('noGrowthChartsToDisplay', 'No Growth charts to display')}</h3>
          <p className={styles.noChartText}>
            {t('patientUnknownGender', 'The patient is unknown/other gender.')}
            <br />
            {t('growthChartsGenderRequirement', 'Growth charts are only available for male and female patients.')}
            <br />
            {t('selectGenderToProceed', 'You can proceed by selecting one of the available genders.')}
          </p>
          <div className={styles.genderRadioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="genderReference"
                value="male"
                checked={selectedGender === 'male'}
                onChange={() => setSelectedGender('male')}
                className={styles.radioInput}
              />
              {t('male', 'Male')}
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="genderReference"
                value="female"
                checked={selectedGender === 'female'}
                onChange={() => setSelectedGender('female')}
                className={styles.radioInput}
              />
              {t('female', 'Female')}
            </label>
          </div>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.chartArea}>
            <Line data={data} options={chartOptions} />
          </div>

          <div className={styles.sidebar}>
            <div>
              <h3 className={styles.sectionTitle}>{t('patientInfo', 'Patient Info')}</h3>
              <div className={styles.patientStats}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>{t('name', 'Name')}:</span>
                  <span className={styles.statValue}>
                    {patient?.name?.[0]?.given?.join(' ') || ''} {patient?.name?.[0]?.family || ''}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>{t('gender', 'Gender')}:</span>
                  <span className={styles.statValue} style={{ textTransform: 'capitalize' }}>
                    {patient?.gender || '--'}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>{t('birthdate', 'Birthdate')}:</span>
                  <span className={styles.statValue}>{patient?.birthDate || '--'}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>{t('ageMonthsLabel', 'Age (Months)')}:</span>
                  <span className={styles.statValue}>{currentAgeInMonths} mo</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className={styles.sectionTitle}>{t('chartLegend', 'Chart Legend')}</h3>
              <div className={styles.legendList}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ borderTop: '2px dashed #f43f5e' }} />
                  <span>{t('p97Legend', 'P97 Centile (Upper boundary)')}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#6366f1' }} />
                  <span>{t('p50Legend', 'P50 Centile (WHO Median)')}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ borderTop: '2px dashed #ec4899' }} />
                  <span>{t('p3Legend', 'P3 Centile (Lower boundary)')}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.patientDot} />
                  <span>{t('patientWeights', 'Patient Weights')}</span>
                </div>
              </div>
            </div>

            {latestMeasurement && (
              <div>
                <h3 className={styles.sectionTitle}>{t('latestMeasurement', 'Latest Measurement')}</h3>
                <div className={styles.patientStats}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('weight', 'Weight')}:</span>
                    <span className={styles.statValue}>{latestMeasurement.y} kg</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('age', 'Age')}:</span>
                    <span className={styles.statValue}>
                      {latestMeasurement.x} {t('months', 'months')}
                    </span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('date', 'Date')}:</span>
                    <span className={styles.statValue}>{latestMeasurement.dateStr}</span>
                  </div>
                </div>
              </div>
            )}

            {hasOlderMeasurements && (
              <div className={styles.warningBanner}>
                <span className={styles.warningTitle}>{t('note', 'Note')}</span>
                <span className={styles.warningText}>
                  {t(
                    'olderWeightWarning',
                    'Some weight observations are not plotted because they were taken after 60 months of age.',
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthChart;
