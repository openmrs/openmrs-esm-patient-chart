import React from 'react';
import styles from './styles.scss';

interface FilterProps {
  root: any;
  active?: boolean;
  children?: any;
}

const FilterSetRoot = ({ root, active, children }: FilterProps) => {
  return (
    <div className={`${styles.filterRoot} ${active && styles.active}`}>
      <div>{root?.name}</div>
      <div>{children}</div>
    </div>
  );
};

const FilterSetSubSet = ({ root, active, children }: FilterProps) => {
  return <div>{root?.name}</div>;
};

export default FilterSetRoot;
export { FilterSetSubSet };
