import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem, Button, Checkbox, Search } from '@carbon/react';
import { TreeViewAlt, Close, Search as SearchIcon } from '@carbon/react/icons';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import type { FilterNodeProps, FilterLeafProps } from './filter-types';
import { FilterEmptyState } from '../ui-elements/resetFiltersEmptyState/filter-empty-state.component';
import FilterContext from './filter-context';
import styles from './filter-set.scss';

const isIndeterminate = (kids, checkboxes) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

interface FilterSetProps {
  hideFilterSetHeader?: boolean;
}

function filterTreeNode(inputValue, treeNode) {
  // If the tree node's display value contains the user input, or any of its children's display contains the user input, return true
  if (
    treeNode &&
    (treeNode.display.toLowerCase().includes(inputValue.toLowerCase()) ||
      (treeNode.subSets && treeNode.subSets.some((child) => filterTreeNode(inputValue, child))))
  ) {
    return true;
  }

  // Otherwise, return false
  return false;
}

const FilterSet: React.FC<FilterSetProps> = ({ hideFilterSetHeader = false }) => {
  const { roots } = useContext(FilterContext);
  const tablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const { resetTree } = useContext(FilterContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [treeDataFiltered, setTreeDataFiltered] = useState(roots);
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const filteredData = roots.filter((node) => filterTreeNode(searchTerm, node));
    setTreeDataFiltered(filteredData);
  }, [searchTerm, roots]);

  return (
    <div className={!tablet ? styles.stickyFilterSet : ''}>
      {!hideFilterSetHeader &&
        (!showSearchInput ? (
          <div className={styles.filterSetHeader}>
            <h4>{t('tree', 'Tree')}</h4>
            <div className={styles.filterSetActions}>
              <Button
                kind="ghost"
                size="sm"
                onClick={resetTree}
                renderIcon={(props) => <TreeViewAlt size={16} {...props} />}
              >
                {t('resetTreeText', 'Reset tree')}
              </Button>

              <Button kind="ghost" size="sm" renderIcon={SearchIcon} onClick={() => setShowSearchInput(true)}>
                {t('search', 'Search')}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.filterTreeSearchHeader}>
            <Search autoFocus size="sm" value={searchTerm} onChange={(evt) => setSearchTerm(evt.target.value)} />
            <Button kind="secondary" size="sm" onClick={() => {}}>
              {t('search', 'Search')}
            </Button>
            <Button hasIconOnly renderIcon={Close} size="sm" kind="ghost" onClick={() => setShowSearchInput(false)} />
          </div>
        ))}
      <div className={styles.filterSetContent}>
        {treeDataFiltered?.length > 0 ? (
          treeDataFiltered?.map((root, index) => (
            <div className={styles.nestedAccordion} key={`filter-node-${index}`}>
              <FilterNodeParent //will rename
                root={root}
                itemNumber={index}
              />
            </div>
          ))
        ) : (
          <FilterEmptyState clearFilter={() => setSearchTerm('')} />
        )}
      </div>
    </div>
  );
};

interface filterNodeParentProps extends Pick<FilterNodeProps, 'root'> {
  //move to top of page
  itemNumber: number;
}

const FilterNodeParent = ({ root, itemNumber }: filterNodeParentProps) => {
  const config = useConfig<ConfigObject>();
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  if (!root.subSets) return; //What can we return in this instance?

  const filterParent = root.subSets.map((node) => {
    return (
      <FilterNode
        root={node}
        level={0}
        open={expandAll === undefined ? config.resultsViewerConcepts[itemNumber].defaultOpen : expandAll}
      />
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #d1d1d1', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
        {/* move styles to stylesheet */}
        <div style={{ flexGrow: '1' }}>{root.display}</div>
        <div
          tabIndex={0}
          onClick={() => setExpandAll((previousValue) => !previousValue)}
          style={{ flexGrow: '1', color: '#0E61FE' }}
          // add hover styles
        >
          {/* will refactor */}
          {!expandAll ? `Expand all` : `Collapse all`}
        </div>
      </div>
      {filterParent}
    </div>
  );
};

const FilterNode = ({ root, level, open }: FilterNodeProps) => {
  const tablet = useLayoutType() === 'tablet';
  const { checkboxes, parents, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.flatName], checkboxes);
  const allChildrenChecked = parents[root.flatName]?.every((kid) => checkboxes[kid]);
  return (
    <Accordion align="start" size={tablet ? 'md' : 'sm'}>
      <AccordionItem
        title={
          <Checkbox
            id={root?.flatName}
            checked={root.hasData && allChildrenChecked}
            indeterminate={indeterminate}
            labelText={`${root?.display} (${parents?.[root?.flatName]?.length})`}
            onChange={() => updateParent(root.flatName)}
            disabled={!root.hasData}
          />
        }
        style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}
        open={open ?? false}
      >
        {!root?.subSets?.[0]?.obs &&
          root?.subSets?.map((node, index) => <FilterNode root={node} level={level + 1} key={index} />)}
        {root?.subSets?.[0]?.obs && root.subSets?.map((obs, index) => <FilterLeaf leaf={obs} key={index} />)}
      </AccordionItem>
    </Accordion>
  );
};

const FilterLeaf = ({ leaf }: FilterLeafProps) => {
  const { checkboxes, toggleVal } = useContext(FilterContext);
  return (
    <div className={styles.filterItem}>
      <Checkbox
        id={leaf?.flatName}
        labelText={leaf?.display}
        checked={checkboxes?.[leaf.flatName]}
        onChange={() => toggleVal(leaf.flatName)}
        disabled={!leaf.hasData}
      />
    </div>
  );
};

export default FilterSet;
