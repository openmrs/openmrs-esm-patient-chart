import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tile,
  InlineLoading,
  Layer,
  Stack,
  Section,
  Dropdown,
} from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { showToast } from '@openmrs/esm-framework';
import { fetchPrintData } from './api/print-api';
import type { PrintData, Diagnosis, Observation, EncounterOrder, Visit, Vitals } from './api/print-api';
import { printViaBrowser, generatePrintableHTML } from './generator/print-generator';
import styles from './print-preview.scss';

interface PrintPreviewProps {
  patientUuid: string;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ patientUuid, onClose }) => {
  const { t } = useTranslation();
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedVisitUuid, setSelectedVisitUuid] = useState<string | null>(null);

  const containerId = 'print-preview-container';

  // Format birth date as DD/MM/YYYY
  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format datetime as DD/MM/YYYY HH:MM
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format value for display
  const formatObservationValue = (obs: Observation) => {
    if (obs.value === null || obs.value === undefined) return '-';
    if (typeof obs.value === 'object' && obs.value.display) {
      return obs.value.display;
    }
    return String(obs.value);
  };

  // Concept UUIDs for vital signs (from vitals app config defaults)
  const vitalSignConceptUuids = useMemo(() => {
    return new Set([
      '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // systolic BP
      '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // diastolic BP
      '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // pulse
      '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // temperature
      '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // weight
      '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // height
      '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // respiratory rate
    ]);
  }, []);

  // Extract vitals from observations
  const extractVitals = useCallback((observations: Observation[]): Vitals => {
    const vitals: Vitals = {};
    let systolic: number | undefined;
    let diastolic: number | undefined;
    let height: number | undefined;
    let weight: number | undefined;

    observations.forEach((obs) => {
      const conceptUuid = obs.concept.uuid;
      const value = typeof obs.value === 'object' ? obs.value?.display : obs.value;
      const numericValue = value !== null && value !== undefined ? Number(value) : undefined;

      if (conceptUuid === '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        systolic = numericValue;
      }
      if (conceptUuid === '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        diastolic = numericValue;
      }
      if (conceptUuid === '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        vitals.pulse = numericValue;
      }
      if (conceptUuid === '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        vitals.temperature = numericValue;
      }
      if (conceptUuid === '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        weight = numericValue;
      }
      if (conceptUuid === '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        height = numericValue;
      }
      if (conceptUuid === '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && numericValue) {
        vitals.respiratoryRate = numericValue;
      }
    });

    // Calculate BMI if we have both weight and height
    if (weight != null && height != null && weight > 0 && height > 0) {
      vitals.bmi = Number((weight / (height / 100) ** 2).toFixed(1));
    }

    // Set blood pressure if we have both systolic and diastolic
    if (systolic != null && diastolic != null) {
      vitals.bloodPressure = { systolic, diastolic };
    }

    return vitals;
  }, []);

  // Check if an observation is a vital sign
  const isVitalSign = useCallback(
    (obs: Observation): boolean => {
      return vitalSignConceptUuids.has(obs.concept.uuid);
    },
    [vitalSignConceptUuids],
  );

  // Get diagnosis display text
  const getDiagnosisDisplay = (diagnosis: Diagnosis) => {
    if (diagnosis.diagnosis?.coded?.display) {
      return diagnosis.diagnosis.coded.display;
    }
    if (diagnosis.diagnosis?.nonCoded) {
      return diagnosis.diagnosis.nonCoded;
    }
    return diagnosis.display || '-';
  };

  // Build dosage string for orders (similar to medications)
  const buildOrderDosage = (order: EncounterOrder) => {
    const dosageParts: string[] = [];

    // Add dose with units
    if (order.dose !== null && order.dose !== undefined) {
      const doseValue = order.dose;
      const doseUnitDisplay = order.doseUnits?.display || '';
      dosageParts.push(`${doseValue} ${doseUnitDisplay}`.trim());
    }

    // Add route
    if (order.route?.display) {
      dosageParts.push(order.route.display.toLowerCase());
    }

    // Add frequency
    if (order.frequency?.display) {
      dosageParts.push(order.frequency.display.toLowerCase());
    }

    // Add duration
    if (order.duration !== null && order.duration !== undefined && order.durationUnits?.display) {
      dosageParts.push(`for ${order.duration} ${order.durationUnits.display.toLowerCase()}`);
    }

    // Add dosing instructions
    if (order.dosingInstructions) {
      dosageParts.push(order.dosingInstructions);
    }

    // Add instructions if available
    if (order.instructions) {
      dosageParts.push(order.instructions);
    }

    return dosageParts.join(' — ') || '-';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPrintData(patientUuid);
      setPrintData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      showToast({
        kind: 'error',
        title: t('errorFetchingData', 'Error fetching data: {{error}}', { error: errorMessage }),
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [patientUuid, t]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrintBrowser = async () => {
    if (!printData || !selectedVisit) return;

    setGenerating(true);
    try {
      // Create filtered print data for the selected visit
      const filteredPrintData = {
        ...printData,
        visits: [selectedVisit],
        encounters: selectedVisit.encounters,
        allDiagnoses: filteredDiagnoses,
        allObservations: filteredObservations,
        allOrders: filteredOrders,
      };

      const html = await generatePrintableHTML(filteredPrintData);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setGenerating(false);
      }, 250);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Print failed';
      showToast({
        kind: 'error',
        title: errorMessage,
        description: errorMessage,
      });
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loading', 'Loading...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{t('errorFetchingData', 'Error fetching data: {{error}}', { error })}</p>
        <Button onClick={loadData}>{t('retry', 'Retry')}</Button>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }

  if (!printData) {
    return null;
  }

  const { patient, visits, encounters, allDiagnoses = [], allObservations = [], allOrders = [] } = printData;

  // Helper to sort diagnoses by rank
  const sortedDiagnoses = [...allDiagnoses].sort((a, b) => a.rank - b.rank);

  // Filter data based on selected visit
  const selectedVisit = !selectedVisitUuid
    ? visits.length > 0
      ? visits[0]
      : null
    : visits.find((v) => v.uuid === selectedVisitUuid) || null;

  // Filter diagnoses, observations, and orders based on selected visit
  const filteredDiagnoses = !selectedVisit
    ? []
    : sortedDiagnoses.filter((d) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.diagnoses.map((d) => d.uuid))).has(d.uuid),
      );

  const filteredObservations = !selectedVisit
    ? []
    : allObservations.filter((o) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.obs.map((o) => o.uuid))).has(o.uuid),
      );

  const filteredOrders = !selectedVisit
    ? []
    : allOrders.filter((o) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.orders.map((o) => o.uuid))).has(o.uuid),
      );

  // Extract vitals from filtered observations
  const filteredVitals = selectedVisit ? extractVitals(filteredObservations) : {};

  // Filter out vital sign observations from the observations list
  const filteredNonVitalObservations = filteredObservations.filter((obs) => !isVitalSign(obs));

  // Format visit label for dropdown - simplified for easy scanning
  const formatVisitLabel = (visit: Visit) => {
    const startDate = formatDateTime(visit.startDatetime);
    const visitType = visit.visitType?.name || 'Visit';
    const location = visit.location?.display || 'Unknown location';
    return `${visitType} - ${startDate} (${location})`;
  };

  return (
    <div className={styles.container}>
      <div id={containerId} className={styles.previewContent}>
        <Tile className={styles.card}>
          <h3>{t('patientDetails', 'Patient Details')}</h3>
          <div className={styles.patientGrid}>
            <div className={styles.patientGridItem}>
              <span className={styles.patientGridLabel}>{t('name', 'Name')}:</span>
              <span className={styles.patientGridValue}>{patient.person.preferredName.display}</span>
            </div>
            <div className={styles.patientGridItem}>
              <span className={styles.patientGridLabel}>{t('patientId', 'Patient ID')}:</span>
              <span className={styles.patientGridValue}>
                {patient.identifiers
                  .find((id) => id.display.includes('OpenMRS ID'))
                  ?.display.replace(/.*[=:]/, '')
                  .trim() || '-'}
              </span>
            </div>
            <div className={styles.patientGridItem}>
              <span className={styles.patientGridLabel}>{t('gender', 'Gender')}:</span>
              <span className={styles.patientGridValue}>{patient.person.gender}</span>
            </div>
            <div className={styles.patientGridItem}>
              <span className={styles.patientGridLabel}>{t('age', 'Age')}:</span>
              <span className={styles.patientGridValue}>{patient.person.age}</span>
            </div>
            <div className={styles.patientGridItem}>
              <span className={styles.patientGridLabel}>{t('birthDate', 'Birth Date')}:</span>
              <span className={styles.patientGridValue}>{formatBirthDate(patient.person.birthdate)}</span>
            </div>
            {patient.identifiers
              .filter((identifier) => !identifier.display.includes('OpenMRS ID'))
              .map((identifier, index) => (
                <div key={index} className={styles.patientGridItem}>
                  <span className={styles.patientGridLabel}>{identifier.display}:</span>
                  <span className={styles.patientGridValue}>{identifier.display}</span>
                </div>
              ))}
          </div>
        </Tile>

        <Tile className={styles.card}>
          <h3>{t('visit', 'Visit')}</h3>
          {visits.length > 0 ? (
            <>
              <div className={styles.visitSelector}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'nowrap' }}>
                  <span style={{ fontWeight: 400, fontSize: '1rem', lineHeight: '1.5rem', whiteSpace: 'nowrap' }}>
                    {t('selectVisit', 'Select a visit')}:
                  </span>
                  <div style={{ flex: 1 }}>
                    <Dropdown
                      id="visit-selector"
                      titleText=""
                      label={t('selectVisitLabel', 'Choose a visit')}
                      items={visits}
                      itemToString={(visit: Visit) => formatVisitLabel(visit)}
                      selectedItem={selectedVisit || undefined}
                      onChange={({ selectedItem }: { selectedItem: Visit | null }) => {
                        setSelectedVisitUuid(selectedItem?.uuid || null);
                      }}
                    />
                  </div>
                </span>
              </div>
              <div className={styles.tableContainer}>
                <DataTable
                  rows={
                    selectedVisit
                      ? [
                          {
                            id: selectedVisit.uuid,
                            type: selectedVisit.visitType?.name || '-',
                            location: selectedVisit.location?.display || '-',
                            startDatetime: formatDateTime(selectedVisit.startDatetime),
                            stopDatetime: selectedVisit.stopDatetime
                              ? formatDateTime(selectedVisit.stopDatetime)
                              : 'Ongoing',
                          } as any,
                        ]
                      : []
                  }
                  headers={[
                    { key: 'type', header: t('visitType', 'Type') },
                    { key: 'location', header: t('location', 'Location') },
                    { key: 'startDatetime', header: t('startDate', 'Start Date') },
                    { key: 'stopDatetime', header: t('endDate', 'End Date') },
                  ]}
                >
                  {({ rows, headers, getHeaderProps, getRowProps }) => (
                    <Table>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader key={header.key} {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id} {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </DataTable>
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>{t('noVisits', 'No visits recorded')}</p>
          )}
        </Tile>

        <Tile className={styles.card}>
          <h3>{t('vitals', 'Vitals')}</h3>
          {filteredVitals.bloodPressure ||
          filteredVitals.pulse !== undefined ||
          filteredVitals.temperature !== undefined ||
          filteredVitals.height !== undefined ||
          filteredVitals.weight !== undefined ||
          filteredVitals.respiratoryRate !== undefined ||
          filteredVitals.bmi !== undefined ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={
                  [
                    filteredVitals.bloodPressure
                      ? {
                          id: 'blood-pressure',
                          observation: t('bloodPressure', 'Blood Pressure'),
                          value: `${filteredVitals.bloodPressure.systolic}/${filteredVitals.bloodPressure.diastolic}`,
                        }
                      : null,
                    filteredVitals.pulse !== undefined
                      ? {
                          id: 'pulse',
                          observation: t('pulse', 'Pulse'),
                          value: `${filteredVitals.pulse} bpm`,
                        }
                      : null,
                    filteredVitals.temperature !== undefined
                      ? {
                          id: 'temperature',
                          observation: t('temperature', 'Temperature'),
                          value: `${filteredVitals.temperature} °C`,
                        }
                      : null,
                    filteredVitals.height !== undefined
                      ? {
                          id: 'height',
                          observation: t('height', 'Height'),
                          value: `${filteredVitals.height} cm`,
                        }
                      : null,
                    filteredVitals.weight !== undefined
                      ? {
                          id: 'weight',
                          observation: t('weight', 'Weight'),
                          value: `${filteredVitals.weight} kg`,
                        }
                      : null,
                    filteredVitals.respiratoryRate !== undefined
                      ? {
                          id: 'respiratory-rate',
                          observation: t('respiratoryRate', 'Respiratory Rate'),
                          value: `${filteredVitals.respiratoryRate} /min`,
                        }
                      : null,
                    filteredVitals.bmi !== undefined
                      ? {
                          id: 'bmi',
                          observation: t('bmi', 'BMI'),
                          value: `${filteredVitals.bmi} kg/m²`,
                        }
                      : null,
                  ].filter(Boolean) as Array<{ id: string; observation: string; value: string }>
                }
                headers={[
                  { key: 'observation', header: t('observation', 'Observation') },
                  { key: 'value', header: t('value', 'Value') },
                ]}
              >
                {({ rows, headers, getHeaderProps, getRowProps }) => (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            <span
                              style={{ display: 'block', textAlign: header.key === 'value' ? 'center' : undefined }}
                            >
                              {header.header}
                            </span>
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell, index) => (
                            <TableCell key={cell.id} style={{ textAlign: index === 1 ? 'center' : undefined }}>
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          ) : (
            <p className={styles.emptyState}>{t('noVitals', 'No vitals recorded')}</p>
          )}
        </Tile>

        <Tile className={styles.card}>
          <h3>
            {t('diagnoses', 'Diagnoses')} ({filteredDiagnoses.length})
          </h3>
          {filteredDiagnoses.length > 0 ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={filteredDiagnoses.map((d) => ({
                  id: d.uuid,
                  diagnosis: getDiagnosisDisplay(d),
                  certainty: d.certainty || '-',
                }))}
                headers={[
                  { key: 'diagnosis', header: t('diagnosis', 'Diagnosis') },
                  { key: 'certainty', header: t('certainty', 'Certainty') },
                ]}
              >
                {({ rows, headers, getHeaderProps, getRowProps }) => (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          ) : (
            <p className={styles.emptyState}>{t('noDiagnoses', 'No diagnoses recorded')}</p>
          )}
        </Tile>

        <Tile className={styles.card}>
          <h3>
            {t('observations', 'Observations')} ({filteredNonVitalObservations.length})
          </h3>
          {filteredNonVitalObservations.length > 0 ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={filteredNonVitalObservations
                  .filter((obs) => obs.value !== null && obs.value !== undefined && formatObservationValue(obs) !== '-')
                  .map((obs) => ({
                    id: obs.uuid,
                    observation: obs.concept.display,
                    value: formatObservationValue(obs),
                  }))}
                headers={[
                  { key: 'observation', header: t('observation', 'Observation') },
                  { key: 'value', header: t('value', 'Value') },
                ]}
              >
                {({ rows, headers, getHeaderProps, getRowProps }) => (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            <span
                              style={{ display: 'block', textAlign: header.key === 'value' ? 'center' : undefined }}
                            >
                              {header.header}
                            </span>
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell, index) => (
                            <TableCell key={cell.id} style={{ textAlign: index === 1 ? 'center' : undefined }}>
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          ) : (
            <p className={styles.emptyState}>{t('noObservations', 'No observations recorded')}</p>
          )}
        </Tile>

        <Tile className={styles.card}>
          <h3>
            {t('orders', 'Orders')} ({filteredOrders.length})
          </h3>
          {filteredOrders.length > 0 ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={filteredOrders.map((order) => ({
                  id: order.uuid,
                  concept: order.concept?.display || t('unknown', 'Unknown'),
                  dateActivated: formatDateTime(order.dateActivated),
                  dosage: buildOrderDosage(order),
                }))}
                headers={[
                  { key: 'concept', header: t('orderConcept', 'Concept') },
                  { key: 'dosage', header: t('dosage', 'Dosage') },
                  { key: 'dateActivated', header: t('dateActivated', 'Date Activated') },
                ]}
              >
                {({ rows, headers, getHeaderProps, getRowProps }) => (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          ) : (
            <p className={styles.emptyState}>{t('noOrders', 'No orders recorded')}</p>
          )}
        </Tile>
      </div>

      <div className={styles.actions}>
        <Button onClick={handlePrintBrowser} disabled={generating} renderIcon={Printer}>
          {generating ? t('printing', 'Printing...') : t('printBrowser', 'Print (Browser)')}
        </Button>
      </div>
    </div>
  );
};

export default PrintPreview;
