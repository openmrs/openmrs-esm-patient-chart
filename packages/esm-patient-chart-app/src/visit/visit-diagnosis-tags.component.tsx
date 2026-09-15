import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { type DedupedDiagnosis } from './dedupe-diagnoses';
import styles from './visit-diagnosis-tags.scss';

interface StyleguideConfig {
  diagnosisTags: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface VisitDiagnosisTagsProps {
  diagnoses: Array<DedupedDiagnosis>;
}

/**
 * Renders visit-level diagnosis tags with the same rank-based colors as the styleguide's
 * DiagnosisTags (sharing its `diagnosisTags` color config), with the diagnosis certainty
 * displayed alongside the name — visible text rather than a tooltip, so it also reaches
 * touch devices. Interim local rendering until DiagnosisTags itself can display certainty
 * (O3-5823).
 *
 * The tag markup is rendered directly with Carbon's public tag classes because Carbon's
 * `Tag` component force-writes its own `title` onto the label span, which prevents
 * composing the label from name + certainty. The name (not the certainty) truncates when
 * space is tight; the full-name reveal is a body-portaled tooltip because the tag lives
 * inside scroll containers (`.cds--data-table-content` is overflow: auto, which clips
 * in-place popovers) and the chart's transformed ancestors break fixed-position popovers
 * rendered in place (Carbon Tooltip autoAlign). The tooltip is visual-only (aria-hidden):
 * the label's DOM text is already complete, so screen readers read the full name from the
 * pill itself.
 */
const VisitDiagnosisTags: React.FC<VisitDiagnosisTagsProps> = ({ diagnoses }) => {
  const { t } = useTranslation();
  const { diagnosisTags } = useConfig<StyleguideConfig>({ externalModuleName: '@openmrs/esm-styleguide' });

  return (
    <div className={styles.container}>
      {diagnoses.map((diagnosis) => {
        // The aggregate certainty is a passthrough of stored values, so anything outside
        // the known enum gets no label rather than a guessed one
        const certaintyLabel =
          diagnosis.certainty === 'CONFIRMED'
            ? t('confirmed', 'Confirmed')
            : diagnosis.certainty === 'PROVISIONAL'
              ? t('provisional', 'Provisional')
              : null;
        const color =
          diagnosis.rank === 1 ? diagnosisTags?.primaryColor ?? 'red' : diagnosisTags?.secondaryColor ?? 'blue';

        return (
          <DiagnosisPill key={diagnosis.uuid} certaintyLabel={certaintyLabel} color={color} name={diagnosis.display} />
        );
      })}
    </div>
  );
};

interface DiagnosisPillProps {
  certaintyLabel: string | null;
  color: string;
  name: string;
}

function DiagnosisPill({ certaintyLabel, color, name }: DiagnosisPillProps) {
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const showTooltip = (event: React.SyntheticEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 4 });
  };
  const hideTooltip = () => setTooltipPosition(null);

  // The portal is positioned from a viewport rect snapshot, so close it if anything scrolls
  useEffect(() => {
    if (!tooltipPosition) {
      return;
    }
    const close = () => setTooltipPosition(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [tooltipPosition]);

  return (
    <>
      <span
        className={classNames(
          'cds--tag',
          'cds--tag--md',
          'cds--layout--size-md',
          `cds--tag--${color}`,
          styles.diagnosisTag,
        )}
        data-testid="diagnosis-tag"
        onBlur={hideTooltip}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        tabIndex={0}
      >
        <span className="cds--tag__label">{name}</span>
        {certaintyLabel && <span className={styles.certaintySuffix}>({certaintyLabel})</span>}
      </span>
      {tooltipPosition &&
        createPortal(
          <span
            aria-hidden="true"
            className={styles.tagTooltip}
            style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          >
            {name}
          </span>,
          document.body,
        )}
    </>
  );
}

export default VisitDiagnosisTags;
