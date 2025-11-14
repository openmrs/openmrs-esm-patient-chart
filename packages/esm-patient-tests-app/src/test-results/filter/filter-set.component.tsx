import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
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
    // Filter the tree data, but ensure only parent categories (with subSets) are at root level
    const filteredData = (roots as any[]).filter((node) => {
      // Only include nodes that are parent categories (have subSets)
      if (!node.subSets || !Array.isArray(node.subSets) || node.subSets.length === 0) {
        return false; // Exclude leaf tests from root level
      }
      return filterTreeNode(searchTerm, node);
    });
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

  const filterParent = root.subSets.map((node, key) => {
    // If node has obs data, it's a leaf - render as FilterLeaf
    if (node?.obs && Array.isArray(node.obs) && node.obs.length > 0) {
      return (
        <div key={key}>
          <FilterLeaf leaf={node} />
        </div>
      );
    }

    // If node has subSets, it's a parent - render as FilterNode
    if (node?.subSets && Array.isArray(node.subSets) && node.subSets.length > 0) {
      return (
        <div key={key}>
          <FilterNode
            root={node}
            level={0}
            open={expandAll === undefined ? config?.resultsViewerConcepts?.[itemNumber]?.defaultOpen : expandAll}
          />
        </div>
      );
    }

    // Fallback - treat as leaf
    return (
      <div key={key}>
        <FilterLeaf leaf={node} />
      </div>
    );
  });

  return (
    <div>
      <div className={classNames(styles.treeNodeHeader, { [styles.treeNodeHeaderTablet]: tablet })}>
        <h5>{t(root.display)}</h5>
        <Button
          className={styles.button}
          kind="ghost"
          size={tablet ? 'md' : 'sm'}
          onClick={() => setExpandAll((prevValue) => !prevValue)}
        >
          <span>{expandAll ? t('collapseAll', 'Collapse all') : t('expandAll', 'Expand all')}</span>
        </Button>
      </div>
      {filterParent}
    </div>
  );
};

const FilterNode = ({ root, level, open }: FilterNodeProps) => {
  const tablet = useLayoutType() === 'tablet';
  const { checkboxes, parents, updateParent, toggleVal } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.flatName], checkboxes);
  const allChildrenChecked = parents[root.flatName]?.every((kid) => checkboxes[kid]);

  // Determine if this is a parent (has children) or leaf (individual test)
  const isParent = parents[root.flatName] && parents[root.flatName].length > 0;
  const isLeaf = !isParent;

  return (
    <Accordion align="start" size={tablet ? 'md' : 'sm'}>
      <AccordionItem
        title={
          <Checkbox
            id={root?.flatName}
            checked={root.hasData && (isParent ? allChildrenChecked : checkboxes[root.flatName])}
            indeterminate={isParent ? indeterminate : false}
            labelText={root?.display}
            onChange={() => (isParent ? updateParent(root.flatName) : toggleVal(root.flatName))}
            disabled={!root.hasData}
          />
        }
        // @ts-ignore
        style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}
        open={open ?? false}
      >
        {/* If this node has obs data, it's a leaf - render as FilterLeaf */}
        {root?.obs && Array.isArray(root.obs) && root.obs.length > 0 ? (
          <FilterLeaf leaf={root} />
        ) : (
          /* If this node has subSets, it's a parent - recursively render children */
          root?.subSets &&
          Array.isArray(root.subSets) &&
          root.subSets.length > 0 &&
          root.subSets.map((child, index) => {
            /* Check if child is a leaf (has obs) or parent (has subSets) */
            if (child?.obs && Array.isArray(child.obs) && child.obs.length > 0) {
              /* Child is a leaf - render as FilterLeaf */
              return <FilterLeaf leaf={child} key={index} />;
            } else if (child?.subSets && Array.isArray(child.subSets) && child.subSets.length > 0) {
              /* Child is a parent - recursively render as FilterNode */
              return <FilterNode root={child} level={level + 1} key={index} />;
            } else {
              /* Child has no obs and no subSets - treat as leaf */
              return <FilterLeaf leaf={child} key={index} />;
            }
          })
        )}
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
