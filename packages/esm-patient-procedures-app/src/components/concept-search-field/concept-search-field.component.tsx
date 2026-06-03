import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { InlineLoading, InlineNotification, Layer, Search, Tile } from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import type { ConceptReference } from '../../types';
import type { useConceptSearchField } from '../../procedures.resource';
import styles from './concept-search-field.scss';

type ConceptSearchResultsProps = {
  isSearching: boolean;
  onSelect: (result: ConceptReference) => void;
  searchResults: Array<ConceptReference>;
  hasSelection: boolean;
  searchTerm: string;
};

export const ConceptSearchField = ({
  label,
  placeholder,
  field,
  selectedConcept,
  onChange,
  invalid,
  invalidText,
}: {
  label: string;
  placeholder: string;
  field: ReturnType<typeof useConceptSearchField>;
  selectedConcept: ConceptReference | null;
  onChange: (selectedConcept: ConceptReference | null) => void;
  invalid?: boolean;
  invalidText?: string;
}) => {
  const { t } = useTranslation();
  const invalidTextId = useId();
  const showInvalidText = Boolean(invalid && invalidText);

  return (
    <>
      <ResponsiveWrapper>
        <div className={classNames({ [styles.invalid]: invalid })}>
          <Search
            aria-describedby={showInvalidText ? invalidTextId : undefined}
            aria-invalid={invalid || undefined}
            labelText={label}
            placeholder={placeholder}
            onChange={(e) => {
              field.setSearchTerm(e.target.value);
              if (selectedConcept) {
                onChange(null);
              }
            }}
            onClear={() => {
              field.clear();
              onChange(null);
            }}
            value={selectedConcept ? selectedConcept.display : field.searchTerm}
          />
        </div>
      </ResponsiveWrapper>

      {showInvalidText && (
        <p className={styles.invalidText} id={invalidTextId}>
          {invalidText}
        </p>
      )}

      {field.error ? (
        <InlineNotification
          kind="error"
          lowContrast
          title={t('errorFetchingConcepts', 'Error fetching concepts')}
          subtitle={field.error?.message}
        />
      ) : (
        <ConceptSearchResults
          isSearching={field.isSearching}
          searchResults={field.searchResults}
          hasSelection={Boolean(selectedConcept)}
          searchTerm={field.searchTerm}
          onSelect={(result) => {
            field.setSearchTerm('');
            onChange(result);
          }}
        />
      )}
    </>
  );
};

const ConceptSearchResults = ({
  isSearching,
  onSelect,
  searchResults,
  hasSelection,
  searchTerm,
}: ConceptSearchResultsProps) => {
  const { t } = useTranslation();

  if (!searchTerm || hasSelection) {
    return null;
  }

  if (isSearching) {
    return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
  }

  if (searchResults?.length > 0) {
    return (
      <ul className={styles.resultsList} role="listbox">
        {searchResults.map((result) => (
          <li
            aria-selected={false}
            className={styles.resultItem}
            key={result.uuid}
            onClick={() => onSelect(result)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(result);
              }
            }}
            role="option"
            tabIndex={0}
          >
            {result.display}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Layer>
      <Tile className={styles.emptyResults}>
        <span>
          {t('noResultsFor', 'No results for')} <strong>"{searchTerm}"</strong>
        </span>
      </Tile>
    </Layer>
  );
};
