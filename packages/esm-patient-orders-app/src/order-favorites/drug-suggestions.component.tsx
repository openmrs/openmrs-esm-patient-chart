import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, IconButton } from '@carbon/react';
import { ChevronDown, ChevronUp, Close, Growth, Information } from '@carbon/react/icons';
import type { SwapCandidate } from './drug-suggestions.resource';
import type { DrugOrderSuggestion } from './types';
import { usePinToggle } from './usePinToggle';
import styles from './drug-suggestions.scss';

interface DrugSuggestionsProps {
  suggestions: Array<DrugOrderSuggestion>;
  swapCandidate: SwapCandidate | null;
  isSwapping: boolean;
  hasPinnedOrders: boolean;
  windowInDays: number;
  scannedOrderCount: number;
  totalOrderCount: number;
  isTablet: boolean;
  onHide: (drugUuid: string) => void;
  onDismiss: (drugUuid: string) => void;
  onSwap: (swapCandidate: SwapCandidate) => void;
  onKeepCurrent: () => void;
}

interface SuggestionItemProps {
  suggestion: DrugOrderSuggestion;
  windowInDays: number;
  isTablet: boolean;
  onHide: (drugUuid: string) => void;
  onDismiss: (drugUuid: string) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, windowInDays, isTablet, onHide, onDismiss }) => {
  const { t } = useTranslation();
  const { isSaving, toggle } = usePinToggle(suggestion.drug);
  const { drug } = suggestion;

  return (
    <div className={styles.item}>
      <div className={styles.itemContent}>
        <p className={styles.itemTitle}>
          {drug.display}
          {drug.dosageForm?.display && <span className={styles.itemForm}> — {drug.dosageForm.display}</span>}
        </p>
        <p className={styles.reason}>
          {t('suggestionOrderCount', '{{count}} orders · last {{days}} days', {
            count: suggestion.count,
            days: windowInDays,
          })}
        </p>
        <Button
          kind="ghost"
          size={isTablet ? 'md' : 'sm'}
          className={styles.dontSuggestButton}
          onClick={() => onDismiss(drug.uuid)}
        >
          {t('dontSuggestAgain', "Don't suggest this again")}
        </Button>
      </div>
      <Button kind="primary" size={isTablet ? 'md' : 'sm'} disabled={isSaving} onClick={toggle}>
        {t('pin', 'Pin')}
      </Button>
      <IconButton
        kind="ghost"
        size={isTablet ? 'md' : 'sm'}
        align="left"
        label={t('hideSuggestion', 'Hide suggestion')}
        onClick={() => onHide(drug.uuid)}
      >
        <Close />
      </IconButton>
    </div>
  );
};

const DrugSuggestions: React.FC<DrugSuggestionsProps> = ({
  suggestions,
  swapCandidate,
  isSwapping,
  hasPinnedOrders,
  windowInDays,
  scannedOrderCount,
  totalOrderCount,
  isTablet,
  onHide,
  onDismiss,
  onSwap,
  onKeepCurrent,
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const suggestedDrug = swapCandidate?.suggestion.drug.display;
  const suggestedCount = swapCandidate?.suggestion.count;
  const pinnedDrug = swapCandidate?.favorite.displayName;
  const pinnedCount = swapCandidate?.favoriteOrderCount;

  return (
    <section className={styles.suggestions} aria-label={t('suggestedForYou', 'Suggested for you')}>
      <div className={styles.header}>
        <Growth className={styles.icon} />
        <div className={styles.heading}>
          <p className={styles.title}>{t('suggestedForYou', 'Suggested for you')}</p>
          <p className={styles.subtitle}>
            {hasPinnedOrders
              ? t('basedOnYourOrderingHistory', 'Based on your ordering history')
              : t('noPinnedOrdersYet', "You haven't pinned anything yet — these are the drugs you order most")}
          </p>
        </div>
        <IconButton
          kind="ghost"
          size="sm"
          align="left"
          label={
            isCollapsed
              ? t('expandSuggestions', 'Expand suggestions')
              : t('collapseSuggestions', 'Collapse suggestions')
          }
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </IconButton>
      </div>
      {!isCollapsed && (
        <>
          {swapCandidate ? (
            <div className={styles.swapPrompt}>
              <p>
                <Trans
                  i18nKey="swapPinnedOrderPrompt"
                  defaults="Your pinned orders are full. You order <strong>{{suggestedDrug}}</strong> ({{suggestedCount}}× in the last {{days}} days) far more than <strong>{{pinnedDrug}}</strong> ({{pinnedCount}}×) — swap it in?"
                  values={{ suggestedDrug, suggestedCount, days: windowInDays, pinnedDrug, pinnedCount }}
                  components={{ strong: <strong /> }}
                  tOptions={{ interpolation: { escapeValue: false } }}
                />
              </p>
              <div className={styles.swapActions}>
                <Button
                  kind="primary"
                  size={isTablet ? 'md' : 'sm'}
                  disabled={isSwapping}
                  onClick={() => onSwap(swapCandidate)}
                >
                  {t('swapThem', 'Swap them')}
                </Button>
                <Button kind="tertiary" size={isTablet ? 'md' : 'sm'} onClick={onKeepCurrent}>
                  {t('keepCurrent', 'Keep current')}
                </Button>
              </div>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.drugUuid}
                suggestion={suggestion}
                windowInDays={windowInDays}
                isTablet={isTablet}
                onHide={onHide}
                onDismiss={onDismiss}
              />
            ))
          )}
          <p className={styles.footnote}>
            <Information />
            {totalOrderCount > scannedOrderCount
              ? t('suggestionsApproximate', 'Approximate — based on your {{count}} most recent orders', {
                  count: scannedOrderCount,
                })
              : t('suggestionsBasedOnWindow', 'Based on your orders in the last {{days}} days', { days: windowInDays })}
          </p>
        </>
      )}
    </section>
  );
};

export default DrugSuggestions;
