import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@carbon/react';
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
 * composing the label from name + certainty; the full-name reveal for truncated
 * diagnoses is a Carbon Tooltip on the whole pill instead (hover and keyboard focus).
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
          // The tooltip reveals the full name (the label truncates, the certainty suffix
          // does not) on hover and keyboard focus; `description` keeps the pill's own
          // text — name and certainty — announced to screen readers
          // No autoAlign: its fixed-position placement breaks inside the chart's
          // transformed ancestors; static bottom alignment stays anchored to the pill
          <Tooltip key={diagnosis.uuid} align="bottom" description={diagnosis.display}>
            <span
              className={classNames(
                'cds--tag',
                'cds--tag--md',
                'cds--layout--size-md',
                `cds--tag--${color}`,
                styles.diagnosisTag,
              )}
              data-testid="diagnosis-tag"
              tabIndex={0}
            >
              <span className="cds--tag__label">{diagnosis.display}</span>
              {certaintyLabel && <span className={styles.certaintySuffix}>({certaintyLabel})</span>}
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default VisitDiagnosisTags;
