import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Layer, Search, Tile } from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { type ConceptReference } from '../../types';
import { type useConceptSearchField } from '../../procedures.resource';
import styles from './concept-search-field.scss';

type ConceptSearchResultsProps = {
  isSearching: boolean;
  onSelect: (result: ConceptReference) => void;
  searchResults: Array<ConceptReference>;
  selectedItem: ConceptReference;
  value: string;
};

export const ConceptSearchField = ({
  label,
  placeholder,
  field,
  onChange,
}: {
  label: string;
  placeholder: string;
  field: ReturnType<typeof useConceptSearchField>;
  onChange: (selectedConcept: ConceptReference) => void;
}) => {
  return (
    <>
      <ResponsiveWrapper>
        <Search
          labelText={label}
          placeholder={placeholder}
          onChange={(e) => {
            field.setSearchTerm(e.target.value);
            field.setSelectedConcept(null);
          }}
          onClear={field.clear}
          value={field.selectedConcept ? field.selectedConcept.display : field.searchTerm}
        />
      </ResponsiveWrapper>

      <ConceptSearchResults
        isSearching={field.isSearching}
        searchResults={field.searchResults}
        selectedItem={field.selectedConcept}
        value={field.searchTerm}
        onSelect={(result) => {
          field.setSelectedConcept(result);
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
  selectedItem,
  value,
}: ConceptSearchResultsProps) => {
  const { t } = useTranslation();

  if (!value || selectedItem) {
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
          {t('noResultsFor', 'No results for')} <strong>"{value}"</strong>
        </span>
      </Tile>
    </Layer>
  );
};
