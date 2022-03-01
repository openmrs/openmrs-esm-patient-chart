import React, { useContext, useState } from 'react';
import styles from './filter-set.scss';
import { Accordion, AccordionItem, Checkbox } from 'carbon-components-react';
import FilterContext from './filter-context';

interface Observation {
  display: string;
  flatName: string;
  hasData?: boolean;
}
export interface TreeNode {
  display: string;
  datatype?: string;
  subSets?: TreeNode[];
  obs?: Observation[];
  flatName: string;
}

interface FilterNodeProps {
  root: TreeNode;
  level: number;
}

interface FilterLeafProps {
  leaf: Observation;
}

const isIndeterminate = (kids, checkboxes) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

const FilterSet = () => {
  const { root } = useContext(FilterContext);

  return (
    <div className={`${styles.filterContainer} ${styles.nestedAccordion}`}>
      <FilterNode root={root} level={0} />
    </div>
  );
};

const FilterNode = ({ root, level }: FilterNodeProps) => {
  const { checkboxes, parents, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.flatName], checkboxes);
  const allChildrenChecked = parents[root.flatName]?.every((kid) => checkboxes[kid]);
  return (
    <Accordion align="start">
      <AccordionItem
        title={
          <Checkbox
            id={root?.display}
            checked={allChildrenChecked}
            indeterminate={indeterminate}
            labelText={`${root?.display} (${parents?.[root?.flatName]?.length})`}
            onChange={() => updateParent(root.flatName)}
          />
        }
        style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}
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
        id={leaf?.display}
        labelText={leaf?.display}
        checked={checkboxes?.[leaf.flatName]}
        onChange={() => toggleVal(leaf.flatName)}
        disabled={!leaf.hasData}
      />
    </div>
  );
};

export default FilterSet;
