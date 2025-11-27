import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem, Button, Checkbox } from '@carbon/react';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import type { FilterNodeProps, FilterLeafProps } from './filter-types';
import FilterEmptyState from '../ui-elements/reset-filters-empty-state/filter-empty-state.component';
import FilterContext from './filter-context';
import styles from './filter-set.scss';

const isIndeterminate = (kids: Array<string>, checkboxes: Record<string, boolean>) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

interface FilterSetProps {
  hideFilterSetHeader?: boolean;
}

interface FilterNodeParentProps extends Pick<FilterNodeProps, 'root'> {
  itemNumber: number;
}

function filterTreeNode(inputValue: string, treeNode: any): boolean {
  if (!treeNode) {
    return false;
  }

  const matchesSearch = treeNode.display.toLowerCase().includes(inputValue.toLowerCase());
  const childMatches = treeNode.subSets?.some((child) => filterTreeNode(inputValue, child)) ?? false;

  return matchesSearch || childMatches;
}

const FilterSet: React.FC<FilterSetProps> = () => {
  const { roots } = useContext(FilterContext);
  const config = useConfig<ConfigObject>();
  const [searchTerm, setSearchTerm] = useState('');
  const [treeDataFiltered, setTreeDataFiltered] = useState(roots);

  useEffect(() => {
    const configuredConceptUuids = config?.resultsViewerConcepts?.map((c) => c.conceptUuid) ?? [];

    // Helper to check if a node or its children match configured concepts
    const isConfiguredNode = (node: any): boolean => {
      // Check if the node itself has a matching conceptUuid
      if (node.conceptUuid && configuredConceptUuids.includes(node.conceptUuid)) {
        return true;
      }
      // Check if any direct child has a matching conceptUuid
      return (
        node.subSets?.some((child: any) => child.conceptUuid && configuredConceptUuids.includes(child.conceptUuid)) ??
        false
      );
    };

    // Filter the tree data, ensuring only parent categories (with subSets) are at root level
    const filteredData = (roots as any[]).filter((node) => {
      // Only include nodes that have subSets (are parent categories)
      if (!node.subSets || !Array.isArray(node.subSets)) {
        return false;
      }

      // Keep configured concepts even if they have no children after filtering
      const isConfiguredConcept = isConfiguredNode(node);
      if (node.subSets.length === 0 && !isConfiguredConcept) {
        return false;
      }

      // Apply search filter
      return filterTreeNode(searchTerm, node);
    });

    setTreeDataFiltered(filteredData);
  }, [searchTerm, roots, config]);

  return (
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
  );
};

const FilterNodeParent = ({ root, itemNumber }: FilterNodeParentProps) => {
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  if (!root.subSets) {
    return;
  }

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
    if (node?.subSets && Array.isArray(node.subSets)) {
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

  const hasChildren = root.subSets && root.subSets.length > 0;

  return (
    <div>
      <div className={classNames(styles.treeNodeHeader, { [styles.treeNodeHeaderTablet]: tablet })}>
        <h5>{t(root.display)}</h5>
        {hasChildren && (
          <Button
            className={styles.button}
            kind="ghost"
            size={tablet ? 'md' : 'sm'}
            onClick={() => setExpandAll((prevValue) => !prevValue)}
          >
            <span>{expandAll ? t('collapseAll', 'Collapse all') : t('expandAll', 'Expand all')}</span>
          </Button>
        )}
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

  return (
    <Accordion align="start" size={tablet ? 'md' : 'sm'}>
      <AccordionItem
        disabled={!root.hasData}
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
        ) : root?.subSets && Array.isArray(root.subSets) && root.subSets.length > 0 ? (
          /* If this node has subSets, it's a parent - recursively render children */
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
        ) : (
          /* Parent node with empty subSets - render empty div to maintain accordion structure */
          <div />
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
