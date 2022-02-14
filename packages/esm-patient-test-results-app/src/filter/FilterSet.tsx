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
  const { someChecked } = useContext(FilterContext);

  return (
    <div
      className={`${styles.filterContainer} ${someChecked && styles.filterContainerActive} ${styles.nestedAccordion}`}
    >
      <Accordion align="start">
        <AccordionItem title={<Checkbox id={root?.display} labelText={root?.display} />}>
          {root?.subSets?.map((node) => (
            <FilterNode root={node} level={0} maxNest={maxNest} />
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const FilterNode = ({ root, level, maxNest = 3 }: FilterNodeProps) => {
  const { state, toggleVal } = useContext(FilterContext);
  if (root?.subSets?.length || root?.obs?.length) {
    return (
      <AccordionItem
        title={<Checkbox id={root?.display} labelText={root?.display} />}
        style={{ paddingLeft: level > 0 && level < maxNest ? '1em' : '0' }}
      >
        {root?.subSets?.map((node, index) => (
          <FilterNode root={node} level={level + 1} maxNest={maxNest} key={index} />
        ))}
        {root?.obs?.map((node, index) => (
          <FilterNode root={node} level={level + 1} key={index} />
        ))}
      </AccordionItem>
    );
  }

  return (
    <div className={styles.filterItem}>
      <Checkbox
        id={root?.display}
        labelText={root?.display}
        checked={state[root?.display]}
        onChange={() => toggleVal(root?.display)}
      />
    </div>
  );
};

export default FilterSet;
