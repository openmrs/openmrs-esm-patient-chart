import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, OperationalTag, Tag } from '@carbon/react';
import { EditIcon, launchWorkspace2, navigate, useConfig } from '@openmrs/esm-framework';
import { carbonTagColors, type CarbonTagColor, type ConfigObject, type PriorityConfig } from '../config-schema';
import { type FlagWithPriority, usePatientFlags } from './hooks/usePatientFlags';
import styles from './flags-list.scss';

interface FlagsListProps {
  patientUuid: string;
  filterByTags?: Array<string>;
}

const FlagsList: React.FC<FlagsListProps> = ({ patientUuid, filterByTags = [] }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const config = useConfig<ConfigObject>();

  const filteredFlags = useMemo(() => {
    const filtered = flags.filter((flag) => {
      if (flag.voided) {
        return false;
      }
      if (filterByTags.length === 0) {
        return true;
      }
      // Check if flag has at least one of the specified tags (by uuid or display name)
      return flag.tags?.some((tag) => filterByTags.includes(tag.display));
    });

    // Sort by priority rank (lower numbers = higher priority)
    // Flags without a rank are sorted to the end
    return filtered.sort((a, b) => {
      const rankA = a.flagDefinition?.priority?.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.flagDefinition?.priority?.rank ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    });
  }, [flags, filterByTags]);

  const handleClickEditFlags = useCallback(() => launchWorkspace2('patient-flags-workspace'), []);

  if (!isLoading && !error) {
    return (
      <div className={styles.container}>
        <ul className={styles.flagsList}>
          {filteredFlags.map((flag) => (
            <li key={flag.uuid}>
              <Flag flag={flag} patientUuid={patientUuid} />
            </li>
          ))}
        </ul>
        {config.allowFlagDeletion && filteredFlags.length > 0 ? (
          <Button
            className={styles.actionButton}
            hasIconOnly
            kind="ghost"
            size="sm"
            renderIcon={EditIcon}
            onClick={handleClickEditFlags}
            iconDescription={t('editFlags', 'Edit flags')}
          />
        ) : null}
      </div>
    );
  }
  return null;
};

interface FlagProps {
  flag: FlagWithPriority;
  patientUuid: string;
}

const Flag: React.FC<FlagProps> = ({ flag, patientUuid }) => {
  const config = useConfig<ConfigObject>();
  const priorityName = flag.flagDefinition?.priority?.name?.toLowerCase() ?? '';

  const priorityConfig = useMemo<PriorityConfig>(() => {
    return (
      config.priorities.find((priorityConfig) => priorityConfig.priority.toLowerCase() === priorityName) || {
        priority: 'info',
        color: 'orange',
        isRiskPriority: false,
      }
    );
  }, [config.priorities, priorityName]);

  const action = useMemo(() => {
    const flagName = flag.flagDefinition?.display ?? flag.flag?.display;

    const action =
      config.flagActions.find((action) => action.flagName === flagName) ||
      config.tagActions.find((action) => flag.tags?.some((tag) => tag.display === action.tagName));

    return action;
  }, [flag, config]);

  const handleClick = useCallback(() => {
    if (action.workspace) {
      launchWorkspace2(action.workspace);
    } else if (action.url) {
      navigate({ to: action.url, templateParams: { patientUuid } });
    }
  }, [action, patientUuid]);

  const isRiskPriority = priorityConfig?.isRiskPriority ?? false;
  const flagText = isRiskPriority ? `🚩 ${flag.message}` : flag.message;

  // Handle custom colors that aren't native Carbon Tag types
  const isCustomColor = !carbonTagColors.includes(priorityConfig.color as CarbonTagColor);
  const tagType = isCustomColor ? undefined : (priorityConfig.color as CarbonTagColor);

  const customStyle = useMemo(() => {
    switch (priorityConfig.color) {
      case 'orange':
        return { backgroundColor: '#ffd9be', color: '#8b3901' };
      case 'high-contrast':
        if (action) {
          // OperationalTag for whatever reason doesn't provide the `high-contrast` color type
          return { backgroundColor: '#393939', color: '#fafafa' };
        } else {
          return undefined;
        }
      default:
        return undefined;
    }
  }, [priorityConfig.color, action]);

  if (action) {
    return (
      <OperationalTag
        className={styles.flagTag}
        type={tagType}
        style={customStyle}
        onClick={handleClick}
        text={flagText}
      />
    );
  }

  return (
    <Tag className={styles.flagTag} type={tagType} style={customStyle}>
      {isRiskPriority && <span className={styles.flagIcon}>&#128681;</span>}
      {flag.message}
    </Tag>
  );
};

export default FlagsList;
