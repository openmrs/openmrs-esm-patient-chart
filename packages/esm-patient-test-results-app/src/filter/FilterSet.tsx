import React, { useContext, useState } from 'react';
import styles from './styles.scss';
import { Accordion, AccordionItem, Checkbox } from 'carbon-components-react';
import FilterContext from './FilterContext';

interface FilterProps {
  root: any;
  maxNest?: number;
  children?: any;
}

interface FilterNodeProps {
  root: any;
  level: number;
  maxNest?: number;
  children?: any;
}

const FilterSet = ({ root, maxNest }: FilterProps) => {
  const { someChecked, parents, checkboxes, updateParent } = useContext(FilterContext);
  const parent = Object.keys(parents).includes(root.display);
  const indeterminate = parent ? calcIndeterminate(parents[root.display], checkboxes) : false;
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
          {root?.subSets?.map((node) => (
            <FilterNode root={node} level={0} maxNest={maxNest} />
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
};
const calcIndeterminate = (kids, checkboxes) => {
  return !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

const FilterNode = ({ root, level, maxNest = 3 }: FilterNodeProps) => {
  const { checkboxes, toggleVal, parents, updateParent } = useContext(FilterContext);
  const parent = Object.keys(parents).includes(root.display);
  const indeterminate = parent ? calcIndeterminate(parents[root.display], checkboxes) : false;
  const allChildrenChecked = parents[root.display]?.every((kid) => checkboxes[kid]);

  if (root?.subSets?.length || root?.obs?.length) {
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
          style={{ paddingLeft: level > 0 && level < maxNest ? '1em' : '0' }}
        >
          {root?.subSets?.map((node, index) => (
            <FilterNode root={node} level={level + 1} maxNest={maxNest} key={index} />
          ))}
          {root?.obs?.map((node, index) => (
            <FilterNode root={node} level={level + 1} key={index} />
          ))}
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className={styles.filterItem}>
      <Checkbox
        id={root?.display}
        labelText={root?.display}
        checked={checkboxes?.[root?.display]}
        onChange={() => toggleVal(root?.display)}
      />
    </div>
  );
};

export default FilterSet;
