import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PrintData, Patient, Visit, Encounter, MedicationOrder } from '../api/print-api';

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  private formatDateDDMMYY(dateString: string): string {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  private formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private getDiagnosisDisplay(diagnosis: any): string {
    if (diagnosis.diagnosis?.coded?.display) {
      return diagnosis.diagnosis.coded.display;
    }
    if (diagnosis.diagnosis?.nonCoded) {
      return diagnosis.diagnosis.nonCoded;
    }
    return diagnosis.display || '-';
  }

  private formatObservationValue(obs: any): string {
    if (obs.value === null || obs.value === undefined) return '-';
    if (typeof obs.value === 'object' && obs.value.display) {
      return obs.value.display;
    }
    return String(obs.value);
  }

  generatePDF(printData: PrintData): jsPDF {
    const { patient, visits, medications, allDiagnoses, allObservations, allOrders, generatedAt } = printData;

    this.doc.setFontSize(20);
    this.doc.text('Patient Information', 14, 20);

    this.doc.setFontSize(12);
    // Format date as DD/MM/YYYY HH:MM
    const date = new Date(generatedAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    this.doc.text(`Generated on: ${formattedDate}`, 14, 30);

    let yPos = 45;
    yPos = this.addPatientSection(patient, yPos);
    yPos = this.addVisitsSection(visits, yPos);
    yPos = this.addDiagnosesSection(allDiagnoses, yPos);
    yPos = this.addObservationsSection(allObservations, yPos);
    yPos = this.addOrdersSection(allOrders, yPos);
    yPos = this.addMedicationsSection(medications, yPos);

    return this.doc;
  }

  private addPatientSection(patient: Patient, startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Patient Details', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    this.doc.text(`Name: ${patient.display}`, 8, yPos);
    yPos += 6;

    this.doc.text(`Gender: ${patient.person.gender}`, 8, yPos);
    yPos += 6;

    this.doc.text(`Age: ${patient.person.age}`, 8, yPos);
    yPos += 6;

    // Format birth date as DD/MM/YYYY
    const birthDate = new Date(patient.person.birthdate);
    const formattedBirthDate = `${String(birthDate.getDate()).padStart(2, '0')}/${String(birthDate.getMonth() + 1).padStart(2, '0')}/${birthDate.getFullYear()}`;
    this.doc.text(`Birth Date: ${formattedBirthDate}`, 8, yPos);
    yPos += 6;

    // Display identifiers excluding OpenMRS ID
    patient.identifiers.forEach((identifier) => {
      if (!identifier.display.includes('OpenMRS ID')) {
        this.doc.text(`${identifier.display}`, 8, yPos);
        yPos += 6;
      }
    });

    return yPos;
  }

  private addVisitsSection(visits: Visit[], startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Most Recent Visit', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    visits.forEach((visit, index) => {
      if (index > 0 && yPos > 250) {
        this.doc.addPage();
        yPos = currentY + 5;
      }

      this.doc.text(`Visit Type: ${visit.visitType?.name || '-'}`, 14, yPos);
      yPos += 6;
      this.doc.text(`Location: ${visit.location?.display || '-'}`, 14, yPos);
      yPos += 6;
      this.doc.text(`Start: ${this.formatDateTime(visit.startDatetime)}`, 14, yPos);
      yPos += 6;
      this.doc.text(`End: ${visit.stopDatetime ? this.formatDateTime(visit.stopDatetime) : 'Ongoing'}`, 14, yPos);
      yPos += 6;

      yPos += 4;
    });

    return yPos;
  }

  private addDiagnosesSection(diagnoses: any[], startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Diagnoses', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    // Sort diagnoses by rank
    const sortedDiagnoses = [...diagnoses].sort((a, b) => a.rank - b.rank);

    if (sortedDiagnoses.length === 0) {
      this.doc.text('No diagnoses recorded', 14, yPos);
      return yPos;
    }

    sortedDiagnoses.forEach((diagnosis, index) => {
      if (index > 0 && yPos > 250) {
        this.doc.addPage();
        yPos = currentY + 5;
      }

      const diagnosisText = this.getDiagnosisDisplay(diagnosis);
      this.doc.text(`Rank ${diagnosis.rank}: ${diagnosisText}`, 14, yPos);
      yPos += 6;
      this.doc.text(`  Certainty: ${diagnosis.certainty || '-'}`, 14, yPos);
      yPos += 6;
      this.doc.text(`  Status: ${diagnosis.voided ? 'Voided' : 'Active'}`, 14, yPos);
      yPos += 6;

      yPos += 2;
    });

    return yPos;
  }

  private addObservationsSection(observations: any[], startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Observations', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    if (observations.length === 0) {
      this.doc.text('No observations recorded', 14, yPos);
      return yPos;
    }

    observations.forEach((obs, index) => {
      if (index > 0 && yPos > 250) {
        this.doc.addPage();
        yPos = currentY + 5;
      }

      this.doc.text(`Concept: ${obs.concept.display}`, 14, yPos);
      yPos += 6;
      this.doc.text(`Value: ${this.formatObservationValue(obs)}`, 14, yPos);
      yPos += 6;
      this.doc.text(`Date: ${this.formatDateTime(obs.obsDatetime)}`, 14, yPos);
      yPos += 6;
      if (obs.groupMembers && obs.groupMembers.length > 0) {
        this.doc.text(`  Group Members: ${obs.groupMembers.length}`, 14, yPos);
        yPos += 6;
      }

      yPos += 2;
    });

    return yPos;
  }

  private addOrdersSection(orders: any[], startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Orders', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    if (orders.length === 0) {
      this.doc.text('No orders recorded', 14, yPos);
      return yPos;
    }

    orders.forEach((order, index) => {
      if (index > 0 && yPos > 250) {
        this.doc.addPage();
        yPos = currentY + 5;
      }

      this.doc.text(`Concept: ${order.concept?.display || 'Unknown'}`, 14, yPos);
      yPos += 6;

      // Build dosage string similar to medications
      const dosageParts: string[] = [];

      if (order.dose !== null && order.dose !== undefined) {
        const doseUnitDisplay = order.doseUnits?.display || '';
        dosageParts.push(`${order.dose} ${doseUnitDisplay}`.trim());
      }

      if (order.route?.display) {
        dosageParts.push(order.route.display.toLowerCase());
      }

      if (order.frequency?.display) {
        dosageParts.push(order.frequency.display.toLowerCase());
      }

      if (order.duration !== null && order.duration !== undefined && order.durationUnits?.display) {
        dosageParts.push(`for ${order.duration} ${order.durationUnits.display.toLowerCase()}`);
      }

      if (order.dosingInstructions) {
        dosageParts.push(order.dosingInstructions);
      }

      if (order.instructions) {
        dosageParts.push(order.instructions);
      }

      if (dosageParts.length > 0) {
        this.doc.text(`Dosage: ${dosageParts.join(' — ')}`, 14, yPos);
        yPos += 6;
      }

      this.doc.text(`Date Activated: ${this.formatDateTime(order.dateActivated)}`, 14, yPos);
      yPos += 6;

      yPos += 2;
    });

    return yPos;
  }

  private addMedicationsSection(medications: MedicationOrder[], startY: number): number {
    let currentY = startY;
    if (currentY > 250) {
      this.doc.addPage();
      currentY = 20;
    }
    this.doc.setFontSize(14);
    this.doc.text('Medications', 14, currentY);

    this.doc.setFontSize(10);
    let yPos = currentY + 5;

    medications.forEach((medication, index) => {
      if (index > 0 && yPos > 250) {
        this.doc.addPage();
        yPos = currentY + 5;
      }

      this.doc.text(`Medication: ${medication.concept?.display || 'Unknown'}`, 14, yPos);
      yPos += 6;

      if (medication.dosage) {
        this.doc.text(`Dosage: ${medication.dosage}`, 14, yPos);
        yPos += 6;
      }

      this.doc.text(`Started: ${new Date(medication.dateActivated).toLocaleDateString()}`, 14, yPos);
      yPos += 6;

      yPos += 4;
    });

    return yPos;
  }

  savePDF(filename: string): void {
    this.doc.save(filename);
  }
}

export async function printViaBrowser(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Print element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window');
  }

  const imgData = canvas.toDataURL('image/png');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Patient Info</title>
        <style>
          body { margin: 0; padding: 20px; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        <img src="${imgData}" alt="Patient Info" />
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export async function generatePrintableHTML(printData: PrintData): Promise<string> {
  const {
    patient,
    visits,
    medications,
    allDiagnoses = [],
    allObservations = [],
    allOrders = [],
    generatedAt,
  } = printData;

  // Helper to sort diagnoses by rank
  const sortedDiagnoses = [...allDiagnoses].sort((a, b) => a.rank - b.rank);

  // Use the first visit if visits array is provided (filtered visit)
  const selectedVisit = visits.length > 0 ? visits[0] : null;

  // Filter diagnoses, observations, and orders based on selected visit
  const filteredDiagnoses = !selectedVisit
    ? sortedDiagnoses
    : sortedDiagnoses.filter((d) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.diagnoses.map((d) => d.uuid))).has(d.uuid),
      );

  const filteredObservations = !selectedVisit
    ? allObservations
    : allObservations.filter((o) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.obs.map((o) => o.uuid))).has(o.uuid),
      );

  const filteredOrders = !selectedVisit
    ? allOrders
    : allOrders.filter((o) =>
        new Set(selectedVisit.encounters.flatMap((enc) => enc.orders.map((o) => o.uuid))).has(o.uuid),
      );

  // Helper functions
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatBirthDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDiagnosisDisplay = (diagnosis: any) => {
    if (diagnosis.diagnosis?.coded?.display) {
      return diagnosis.diagnosis.coded.display;
    }
    if (diagnosis.diagnosis?.nonCoded) {
      return diagnosis.diagnosis.nonCoded;
    }
    return diagnosis.display || '-';
  };

  const formatObservationValue = (obs: any) => {
    if (obs.value === null || obs.value === undefined) return '-';
    if (typeof obs.value === 'object' && obs.value.display) {
      return obs.value.display;
    }
    return String(obs.value);
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patient Information</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          h1 {
            color: #000;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          h2 {
            color: #444;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .patient-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 8px 20px;
            padding: 10px 12px;
            background-color: #f5f5f5;
            border-radius: 5px;
            margin-top: 4px;
          }
          .patient-grid-item {
            display: flex;
            flex-direction: row;
            align-items: baseline;
            gap: 8px;
          }
          .patient-grid-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #777;
            flex-shrink: 0;
          }
          .patient-grid-value {
            font-size: 13px;
            font-weight: 500;
            color: #333;
            word-break: break-word;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .meta-info {
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
          .empty-state {
            color: #666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1>Patient Information</h1>
        <p>Generated on: ${formatDateTime(generatedAt)}</p>
        
        <div class="section">
          <h2>Patient Details</h2>
          <div class="patient-grid">
            <div class="patient-grid-item">
              <span class="patient-grid-label">Name:</span>
              <span class="patient-grid-value">${patient.display}</span>
            </div>
            <div class="patient-grid-item">
              <span class="patient-grid-label">Patient ID:</span>
              <span class="patient-grid-value">
                ${
                  patient.identifiers
                    .find((id) => id.display.includes('OpenMRS ID'))
                    ?.display.replace(/.*[=:]/, '')
                    .trim() || '-'
                }
              </span>
            </div>
            <div class="patient-grid-item">
              <span class="patient-grid-label">Gender:</span>
              <span class="patient-grid-value">${patient.person.gender}</span>
            </div>
            <div class="patient-grid-item">
              <span class="patient-grid-label">Age:</span>
              <span class="patient-grid-value">${patient.person.age}</span>
            </div>
            <div class="patient-grid-item">
              <span class="patient-grid-label">Birth Date:</span>
              <span class="patient-grid-value">${formatBirthDate(patient.person.birthdate)}</span>
            </div>
            ${patient.identifiers
              .filter((identifier) => !identifier.display.includes('OpenMRS ID'))
              .map(
                (identifier) => `
            <div class="patient-grid-item">
              <span class="patient-grid-label">${identifier.display}:</span>
              <span class="patient-grid-value">${identifier.display}</span>
            </div>`,
              )
              .join('')}
          </div>
        </div>

        <div class="section">
          <h2>Visit</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              ${
                selectedVisit
                  ? `
                <tr>
                  <td>${selectedVisit.visitType?.name || '-'}</td>
                  <td>${selectedVisit.location?.display || '-'}</td>
                  <td>${formatDateTime(selectedVisit.startDatetime)}</td>
                  <td>${selectedVisit.stopDatetime ? formatDateTime(selectedVisit.stopDatetime) : 'Ongoing'}</td>
                </tr>
              `
                  : '<tr><td colspan="4" class="empty-state">No visits recorded</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Diagnoses (${filteredDiagnoses.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Diagnosis</th>
                <th>Certainty</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredDiagnoses.length > 0
                  ? filteredDiagnoses
                      .map(
                        (diagnosis) => `
                <tr>
                  <td>${diagnosis.rank}</td>
                  <td>${getDiagnosisDisplay(diagnosis)}</td>
                  <td>${diagnosis.certainty || '-'}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="3" class="empty-state">No diagnoses recorded</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Observations (${filteredObservations.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Observation</th>
                <th style="text-align: center;">Value</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredObservations.length > 0
                  ? filteredObservations
                      .map(
                        (obs) => `
                <tr>
                  <td>${obs.concept.display}</td>
                  <td style="text-align: center;">${formatObservationValue(obs)}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="2" class="empty-state">No observations recorded</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Orders (${filteredOrders.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Concept</th>
                <th>Dosage</th>
                <th>Date Activated</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredOrders.length > 0
                  ? filteredOrders
                      .map((order) => {
                        // Build dosage string similar to medications
                        const dosageParts = [];

                        if (order.dose !== null && order.dose !== undefined) {
                          const doseUnitDisplay = order.doseUnits?.display || '';
                          dosageParts.push(`${order.dose} ${doseUnitDisplay}`.trim());
                        }

                        if (order.route?.display) {
                          dosageParts.push(order.route.display.toLowerCase());
                        }

                        if (order.frequency?.display) {
                          dosageParts.push(order.frequency.display.toLowerCase());
                        }

                        if (order.duration !== null && order.duration !== undefined && order.durationUnits?.display) {
                          dosageParts.push(`for ${order.duration} ${order.durationUnits.display.toLowerCase()}`);
                        }

                        if (order.dosingInstructions) {
                          dosageParts.push(order.dosingInstructions);
                        }

                        if (order.instructions) {
                          dosageParts.push(order.instructions);
                        }

                        const dosage = dosageParts.length > 0 ? dosageParts.join(' — ') : '-';

                        return `
                <tr>
                  <td>${order.concept?.display || 'Unknown'}</td>
                  <td>${dosage}</td>
                  <td>${formatDateTime(order.dateActivated)}</td>
                </tr>
              `;
                      })
                      .join('')
                  : '<tr><td colspan="3" class="empty-state">No orders recorded</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Medications (${medications.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Started</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                medications.length > 0
                  ? medications
                      .map(
                        (med) => `
                <tr>
                  <td>${med.concept?.display || 'Unknown'}</td>
                  <td>${med.dosage || '-'}</td>
                  <td>${new Date(med.dateActivated).toLocaleDateString()}</td>
                  <td>${med.status}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="4" class="empty-state">No medications prescribed</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <div class="meta-info">
          <p>Printed from OpenMRS Patient Chart</p>
        </div>
      </body>
    </html>
  `;
}
