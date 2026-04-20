import React, { useState, useCallback } from 'react';
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
import { Download, Printer } from '@carbon/react/icons';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { showToast } from '@openmrs/esm-framework';
import { fetchPrintData } from './api/print-api';
import type { PrintData, Diagnosis, Observation, EncounterOrder, Visit } from './api/print-api';
import { PDFGenerator, printViaBrowser, generatePrintableHTML } from './generator/print-generator';
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

  // Format date as DD/MM/YYYY HH:MM
  const formatGeneratedDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

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

  const handleDownloadPDF = async () => {
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

      const generator = new PDFGenerator();
      const pdf = generator.generatePDF(filteredPrintData);
      pdf.save(`patient-info-${patientUuid}.pdf`);
      showToast({
        kind: 'success',
        title: t('downloadPdf', 'PDF downloaded successfully'),
        description: t('downloadPdf', 'PDF downloaded successfully'),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF generation failed';
      showToast({
        kind: 'error',
        title: errorMessage,
        description: errorMessage,
      });
    } finally {
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
        <h1 className={styles.title}>{t('patientInfo', 'Patient Information')}</h1>
        <p className={styles.generatedAt}>
          {t('generatedOn', 'Generated on:') + ' ' + formatGeneratedDate(printData.generatedAt)}
        </p>

        <Tile className={styles.card}>
          <h3>{t('patientDetails', 'Patient Details')}</h3>
          <div className={styles.patientInfo}>
            <p>
              <strong>{t('name', 'Name')}:</strong> {patient.person.preferredName.display}
            </p>
            <p>
              <strong>{t('patientId', 'Patient ID')}:</strong>{' '}
              {patient.identifiers
                .find((id) => id.display.includes('OpenMRS ID'))
                ?.display.replace(/.*[=:]/, '')
                .trim() || '-'}
            </p>
            <p>
              <strong>{t('gender', 'Gender')}:</strong> {patient.person.gender}
            </p>
            <p>
              <strong>{t('age', 'Age')}:</strong> {patient.person.age}
            </p>
            <p>
              <strong>{t('birthDate', 'Birth Date')}:</strong> {formatBirthDate(patient.person.birthdate)}
            </p>
            {patient.identifiers
              .filter((identifier) => !identifier.display.includes('OpenMRS ID'))
              .map((identifier, index) => (
                <p key={index}>
                  <strong>{identifier.display}:</strong> {identifier.display}
                </p>
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
          <h3>
            {t('diagnoses', 'Diagnoses')} ({filteredDiagnoses.length})
          </h3>
          {filteredDiagnoses.length > 0 ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={filteredDiagnoses.map((d) => ({
                  id: d.uuid,
                  rank: d.rank,
                  diagnosis: getDiagnosisDisplay(d),
                  certainty: d.certainty || '-',
                  voided: d.voided ? t('voided', 'Voided') : t('active', 'Active'),
                }))}
                headers={[
                  { key: 'rank', header: t('rank', 'Rank') },
                  { key: 'diagnosis', header: t('diagnosis', 'Diagnosis') },
                  { key: 'certainty', header: t('certainty', 'Certainty') },
                  { key: 'voided', header: t('status', 'Status') },
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
            {t('observations', 'Observations')} ({filteredObservations.length})
          </h3>
          {filteredObservations.length > 0 ? (
            <div className={styles.tableContainer}>
              <DataTable
                rows={filteredObservations.map((obs) => ({
                  id: obs.uuid,
                  concept: obs.concept.display,
                  value: formatObservationValue(obs),
                  datetime: formatDateTime(obs.obsDatetime),
                  groupMembers: obs.groupMembers?.length || 0,
                }))}
                headers={[
                  { key: 'concept', header: t('concept', 'Concept') },
                  { key: 'value', header: t('value', 'Value') },
                  { key: 'datetime', header: t('obsDatetime', 'Date & Time') },
                  { key: 'groupMembers', header: t('groupMembers', 'Group Members') },
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

      <div className={styles.actions} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button onClick={handlePrintBrowser} disabled={generating} renderIcon={Printer}>
          {generating ? t('printing', 'Printing...') : t('printBrowser', 'Print (Browser)')}
        </Button>
        <Button onClick={handleDownloadPDF} disabled={generating} renderIcon={Download} kind="secondary">
          {t('downloadPdf', 'Download PDF')}
        </Button>
      </div>
    </div>
  );
};

export default PrintPreview;
