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
  if (
    treeNode &&
    (treeNode.display.toLowerCase().includes(inputValue.toLowerCase()) ||
      (treeNode.subSets && treeNode.subSets.some((child) => filterTreeNode(inputValue, child))))
  ) {
    return true;
  }
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

// Recursive function to check if a node or any of its descendants have data
const hasNodeOrChildrenWithData = (node) => {
  if (node.hasData) {
    return true;
  }
  if (node.subSets) {
    return node.subSets.some((subNode) => hasNodeOrChildrenWithData(subNode));
  }
  return false;
};

const FilterNodeParent = ({ root, itemNumber }: filterNodeParentProps) => {
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  if (!hasNodeOrChildrenWithData(root)) {
    return null;
  }

  const filterParent = root.subSets
    .filter((node) => hasNodeOrChildrenWithData(node))
    .map((node) => {
      return (
        <FilterNode
          root={node}
          level={0}
          open={expandAll === undefined ? config.resultsViewerConcepts[itemNumber].defaultOpen : expandAll}
          key={node.flatName}
        />
      );
    });

  return (
    <div>
      <div className={classNames(styles.treeNodeHeader, { [styles.treeNodeHeaderTablet]: tablet })}>
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

  // Filter out nodes that don't have data or descendants with data
  if (!hasNodeOrChildrenWithData(root)) {
    return null;
  }

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
          root?.subSets
            ?.filter((node) => hasNodeOrChildrenWithData(node))
            .map((node, index) => <FilterNode root={node} level={level + 1} key={index} />)}
        {root?.subSets?.[0]?.obs &&
          root.subSets?.filter((obs) => obs.hasData).map((obs, index) => <FilterLeaf leaf={obs} key={index} />)}
      </AccordionItem>
    </Accordion>
  );
};

const FilterLeaf = ({ leaf }: FilterLeafProps) => {
  const { checkboxes, toggleVal } = useContext(FilterContext);

  // Filter out leaves without data
  if (!leaf.hasData) {
    return null;
  }

  return (
    <div className={styles.filterItem}>
      <Checkbox
        id={leaf?.flatName}
        labelText={leaf?.display}
        checked={checkboxes?.[leaf.flatName]}
        onChange={() => toggleVal(leaf.flatName)}
      />
    </div>
  );
};

export default FilterSet;
