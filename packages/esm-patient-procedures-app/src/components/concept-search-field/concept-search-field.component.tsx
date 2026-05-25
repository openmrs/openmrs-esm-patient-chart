import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Layer, Search, Tile } from '@carbon/react';
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
}: {
  label: string;
  placeholder: string;
  field: ReturnType<typeof useConceptSearchField>;
  selectedConcept: ConceptReference | null;
  onChange: (selectedConcept: ConceptReference | null) => void;
}) => {
  return (
    <>
      <ResponsiveWrapper>
        <Search
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
      </ResponsiveWrapper>

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
