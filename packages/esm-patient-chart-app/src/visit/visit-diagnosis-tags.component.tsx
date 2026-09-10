import React from 'react';
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
 * DiagnosisTags (sharing its `diagnosisTags` color config), and additionally surfaces the
 * diagnosis certainty on hover plus as screen-reader text. Interim local rendering until
 * DiagnosisTags itself can display certainty (O3-5823).
 *
 * The tag markup is rendered directly with Carbon's public tag classes because Carbon's
 * `Tag` component reserves the `title` prop for its filter-close button and force-writes
 * its own `title` onto the label, so it cannot carry a certainty tooltip.
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
          <span
            key={diagnosis.uuid}
            className={classNames('cds--tag', 'cds--tag--md', 'cds--layout--size-md', `cds--tag--${color}`)}
            title={certaintyLabel ?? undefined}
          >
            <span className="cds--tag__label">{diagnosis.display}</span>
            {certaintyLabel && <span className={styles.visuallyHidden}>{` (${certaintyLabel})`}</span>}
          </span>
        );
      })}
    </div>
  );
};

export default VisitDiagnosisTags;
