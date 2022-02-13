import React, { useState } from 'react';
import styles from './styles.scss';
import ChevronDown from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp from '@carbon/icons-react/es/chevron--up/16';
import { Accordion, AccordionItem } from 'carbon-components-react';

interface FilterProps {
  root: any;
  active?: boolean;
  children?: any;
}

interface FilterNodeProps {
  root: any;
  level: number;
  children?: any;
}

const FilterSet = ({ root }: FilterProps) => {
  //const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(false);
  // active means checked

  return (
    <div className={`${styles.filterContainer} ${active && styles.filterContainerActive}`}>
      <Accordion align="start">
        <AccordionItem title={<span>{root?.display}</span>}>
          {root?.subSets?.map((node) => (
            <FilterNode root={node} level={0} />
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const FilterNode = ({ root, level }: FilterNodeProps) => {
  if (root?.subSets?.length) {
    return (
      // <Accordion align="start">
      <AccordionItem title={root.display}>
        {root.subSets.map((node, index) => (
          <FilterNode root={node} level={level + 1} key={index} />
        ))}
      </AccordionItem>
      // </Accordion>
    );
  }
  if (root?.obs?.length) {
    return (
      // <Accordion align="start">
      <AccordionItem title={root.display}>
        {root.obs.map((node, index) => (
          <FilterNode root={node} level={level + 1} key={index} />
        ))}
      </AccordionItem>
      // </Accordion>
    );
  }

  return (
    <div className={styles.filterItem}>{root?.display}</div>
    // <div className={styles.filterNode} style={{ paddingLeft: `${level + 1}rem` }}>
    // </div>
  );
};

export default FilterSet;
