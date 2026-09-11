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
 * DiagnosisTags (sharing its `diagnosisTags` color config), with the diagnosis certainty
 * displayed alongside the name — visible text rather than a tooltip, so it also reaches
 * touch devices. Interim local rendering until DiagnosisTags itself can display certainty
 * (O3-5823).
 *
 * The tag markup is rendered directly with Carbon's public tag classes because Carbon's
 * `Tag` component force-writes its own `title` onto the label span, which prevents
 * composing the label from name + certainty while keeping the full-name reveal for
 * truncated diagnoses.
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
          >
            {/* title keeps the full name revealable when a long diagnosis is truncated */}
            <span className="cds--tag__label" title={diagnosis.display}>
              {diagnosis.display}
            </span>
            {certaintyLabel && <span className={styles.certaintySuffix}>({certaintyLabel})</span>}
          </span>
        );
      })}
    </div>
  );
};

export default VisitDiagnosisTags;
