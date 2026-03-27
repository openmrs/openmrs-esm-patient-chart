import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { Button, ModalBody, ModalFooter, Tag } from '@carbon/react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { useSession, formatDatetime, parseDate, PrinterIcon } from '@openmrs/esm-framework';
import { type MappedEncounter } from '../encounters-table/encounters-table.resource';
import styles from './print-encounter.scss';
import PrintableEncounterReport from './print-encounter-preview.component';

type PrintEncounterModalProps = {
  encounter: MappedEncounter;
  closeModal: () => void;
};

const PrintEncounterModal: React.FC<PrintEncounterModalProps> = ({ encounter, closeModal }) => {
  const { t } = useTranslation();
  const contentToPrintRef = useRef<HTMLDivElement>(null);
  const setIsPrinting = useState(false)[1];
  const { sessionLocation } = useSession();
  const location = sessionLocation?.display;

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPrinting(false),
    pageStyle: `
      @media print {
        body { height: auto !important; }
        @page { margin: 1.5cm; }
      }
    `,
  });

  const genderDisplay =
    encounter?.patient?.person?.gender === 'M'
      ? t('male', 'Male')
      : encounter?.patient?.person?.gender === 'F'
        ? t('female', 'Female')
        : encounter?.patient?.person?.gender ?? '--';

  return (
    <>
      <ModalBody className={classNames(styles.modalBody, styles.modalContentWrapper)}>
        {/* ── Preview panel ── */}
        <div className={styles.previewPanel}>
          <div ref={contentToPrintRef}>
            <div className={styles.printContent}>
              {/* Header */}
              <div className={styles.printableHeader}>
                <div className={styles.headerLeft}>
                  <p className={styles.titleHeader}>{capitalize(t('encounterReport', 'Encounter Report'))}</p>
                  <p className={styles.facilityName}>{capitalize(location) ?? '--'}</p>
                </div>
                <div className={styles.headerRight}>
                  {encounter?.datetime && (
                    <span className={styles.itemLabel}>
                      {formatDatetime(parseDate(encounter.datetime), { mode: 'standard', noToday: true })}
                    </span>
                  )}
                </div>
              </div>

              <hr className={styles.divider} />

              {/* Patient demographics + encounter meta */}
              <div className={styles.printableBody}>
                {/* Left: patient info */}
                <div className={styles.patientDetails}>
                  <p className={styles.sectionSubHeader}>
                    {capitalize(t('patientInformation', 'Patient information'))}
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.metaLabel}>{capitalize(t('name', 'Name'))}:</span>{' '}
                    {encounter?.patient?.person?.display ?? '--'}
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.metaLabel}>{capitalize(t('age', 'Age'))}:</span>{' '}
                    {encounter?.patient?.person?.age ?? '--'}
                  </p>
                  <p className={styles.itemLabel}>
                    <span className={styles.metaLabel}>{capitalize(t('gender', 'Gender'))}:</span>{' '}
                    {capitalize(genderDisplay)}
                  </p>
                </div>

                {/* Right: encounter details */}
                <div className={styles.encounterDetails}>
                  <p className={styles.sectionSubHeader}>{capitalize(t('encounterDetails', 'Encounter details'))}</p>
                  <p className={styles.itemLabel}>
                    <span className={styles.metaLabel}>{capitalize(t('encounterType', 'Encounter type'))}:</span>{' '}
                    {encounter?.encounterType ?? '--'}
                  </p>
                  {encounter?.visitType && (
                    <p className={styles.itemLabel}>
                      <span className={styles.metaLabel}>{capitalize(t('visitType', 'Visit type'))}:</span>{' '}
                      {encounter.visitType}
                    </p>
                  )}
                  <p className={styles.itemLabel}>
                    <span className={styles.metaLabel}>{capitalize(t('provider', 'Provider'))}:</span>{' '}
                    {encounter?.provider ?? '--'}
                  </p>
                  {encounter?.form?.display && (
                    <p className={styles.itemLabel}>
                      <span className={styles.metaLabel}>{capitalize(t('form', 'Form'))}:</span>{' '}
                      {encounter.form.display}
                    </p>
                  )}
                </div>
              </div>

              <hr className={styles.divider} />

              {/* Observations */}
              <p className={styles.sectionHeader}>{capitalize(t('observations', 'Observations'))}</p>
              <PrintableEncounterReport observations={encounter?.obs ?? []} />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handlePrint}>
          {t('print', 'Print')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default PrintEncounterModal;
