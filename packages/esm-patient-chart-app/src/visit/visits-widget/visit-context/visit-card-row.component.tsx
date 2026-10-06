import React from 'react';
import classNames from 'classnames';
import { RadioButton } from '@carbon/react';
import { type Visit } from '@openmrs/esm-framework';
import VisitContextInfo from './visit-context-info.component';
import styles from './visit-card-row.scss';

interface VisitCardRowProps {
  visit: Visit;
  isSelected: boolean;
  setSelectedVisit(visitUuid: string);
}

/**
 * A clickable row to select a visit. This has slightly different UX than a regular
 * radio button, as the entire card (not just the radio button and the label) is clickable
 */
const VisitCardRow: React.FC<VisitCardRowProps> = ({ visit, setSelectedVisit: setSelected, isSelected }) => {
  const isActive = !visit.stopDatetime;

  return (
    <div
      className={classNames(
        styles.visitCardRow,
        isActive ? styles.activeVisit : styles.retroactiveVisit,
        isSelected ? styles.isSelected : '',
      )}
    >
      <div className={styles.visitInfoContainer}>
        <div className={styles.visitType}>{visit.visitType.display}</div>
        <div className={styles.visitInfo}>
          <VisitContextInfo visit={visit} />
        </div>
      </div>
      <div className={styles.visitCardRowRadioButton}>
        <RadioButton
          className={styles.visitRow}
          id={`visit-card-row-${visit.uuid}`}
          value={visit.uuid}
          checked={isSelected}
          labelText={visit.visitType.display}
          onChange={(value) => setSelected(String(value))}
        />
      </div>
      <button className={styles.visitCardRowButton} onClick={() => setSelected(visit.uuid)}></button>
    </div>
  );
};

export default VisitCardRow;
