import React, { useContext, useState } from 'react';
import styles from './filter-set.scss';
import { Accordion, AccordionItem, Checkbox } from 'carbon-components-react';
import FilterContext from './filter-context';

interface Observation {
  display: string;
}
interface TreeNode {
  display: string;
  subSets?: TreeNode[];
  obs?: Observation[];
}

interface FilterProps {
  root: TreeNode;
  maxNest?: number;
  children?: React.ReactNode;
}

interface FilterNodeProps {
  root: TreeNode;
  level: number;
  maxNest?: number;
}

interface FilterLeafProps {
  leaf: Observation;
}

const isIndeterminate = (kids, checkboxes) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

const FilterSet = ({ root, maxNest }: FilterProps) => {
  const { someChecked, parents, checkboxes, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.display], checkboxes);
  const allChildrenChecked = parents[root.display]?.every((kid) => checkboxes[kid]);

  return (
    <div
      className={`${styles.filterContainer} ${someChecked && styles.filterContainerActive} ${styles.nestedAccordion}`}
    >
      <Accordion align="start">
        <AccordionItem
          title={
            <Checkbox
              id={root?.display}
              checked={allChildrenChecked}
              indeterminate={indeterminate}
              labelText={root?.display}
              onChange={() => updateParent(root.display)}
            />
          }
        >
          {root?.subSets?.map((node, index) => (
            <FilterNode root={node} level={0} maxNest={maxNest} key={index} />
          ))}
          {root?.obs?.map((obs, index) => (
            <FilterLeaf leaf={obs} key={index} />
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const FilterNode = ({ root, level, maxNest = 3 }: FilterNodeProps) => {
  const { checkboxes, parents, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.display], checkboxes);
  const allChildrenChecked = parents[root.display]?.every((kid) => checkboxes[kid]);

  return (
    <Accordion>
      <AccordionItem
        title={
          <Checkbox
            id={root?.display}
            checked={allChildrenChecked}
            indeterminate={indeterminate}
            labelText={`${root?.display} (${parents?.[root?.display]?.length})`}
            onChange={() => updateParent(root.display)}
          />
        }
        style={{ paddingLeft: level > 0 && level < maxNest ? '1rem' : '0px' }}
      >
        {root?.subSets?.map((node, index) => (
          <FilterNode root={node} level={level + 1} maxNest={maxNest} key={index} />
        ))}
        {root?.obs?.map((obs, index) => (
          <FilterLeaf leaf={obs} key={index} />
        ))}
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
        checked={checkboxes?.[leaf?.display]}
        onChange={() => toggleVal(leaf?.display)}
      />
    </div>
  );
};

export default FilterSet;
