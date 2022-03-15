import React, { useContext } from 'react';
import styles from './filter-set.scss';
import { Accordion, AccordionItem, Checkbox } from 'carbon-components-react';
import FilterContext from './filter-context';
import { useConfig } from '@openmrs/esm-framework';

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
  open?: boolean;
}

interface FilterLeafProps {
  leaf: Observation;
}

const isIndeterminate = (kids, checkboxes) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

const FilterSet = () => {
  const { roots } = useContext(FilterContext);
  const config = useConfig();

  return (
    <>
      {roots?.map((root, index) => (
        <div className={`${styles.filterContainer} ${styles.nestedAccordion}`}>
          <FilterNode root={root} level={0} open={config.concepts[index].defaultOpen} />
        </div>
      ))}
    </>
  );
};

const FilterNode = ({ root, level, open }: FilterNodeProps) => {
  const { checkboxes, parents, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.flatName], checkboxes);
  const allChildrenChecked = parents[root.flatName]?.every((kid) => checkboxes[kid]);
  return (
    <Accordion align="start">
      <AccordionItem
        title={
          <Checkbox
            id={root?.flatName}
            checked={allChildrenChecked}
            indeterminate={indeterminate}
            labelText={`${root?.display} (${parents?.[root?.flatName]?.length})`}
            onChange={() => updateParent(root.flatName)}
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
