import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem, Button, Checkbox } from '@carbon/react';
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

interface filterNodeParentProps extends Pick<FilterNodeProps, 'root'> {
  itemNumber: number;
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

const FilterSet: React.FC<FilterSetProps> = () => {
  const { roots } = useContext(FilterContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [treeDataFiltered, setTreeDataFiltered] = useState(roots);

  useEffect(() => {
    const filteredData = roots.filter((node) => filterTreeNode(searchTerm, node));
    setTreeDataFiltered(filteredData);
  }, [searchTerm, roots]);

  return (
    <div>
      <div className={styles.filterSetContent}>
        {treeDataFiltered?.length > 0 ? (
          treeDataFiltered?.map((root, index) => (
            <div className={`${styles.nestedAccordion} ${styles.nestedAccordionTablet}`} key={`filter-node-${index}`}>
              <FilterNodeParent root={root} itemNumber={index} />
            </div>
          ))
        ) : (
          <FilterEmptyState clearFilter={() => setSearchTerm('')} />
        )}
      </div>
    </div>
  );
};

const FilterNodeParent = ({ root, itemNumber }: filterNodeParentProps) => {
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  if (!root.subSets) return;

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
      <div className={`${styles.treeNodeHeader} ${tablet ? styles.treeNodeHeaderTablet : ''}`}>
        <h5>{t(root.display)}</h5>
        <Button
          className={styles.button}
          kind="ghost"
          size="sm"
          onClick={() => setExpandAll((prevValue) => !prevValue)}
        >
          <span>{t(!expandAll ? `Expand all` : `Collapse all`)}</span>
        </Button>
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
            labelText={`${root?.display} (${parents?.[root?.flatName]?.length ?? 0})`}
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
