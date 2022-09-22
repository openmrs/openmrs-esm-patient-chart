import React, { useContext } from 'react';
import { FilterContext } from '../filter';
import LabSetPanel from './result-panel.component';

const PanelView: React.FC = () => {
  const {
    lowestParents,
    parents,
    timelineData: {
      data: { rowData },
    },
  } = useContext(FilterContext);

  return (
    <>
      {lowestParents.map((parent) => {
        const subRows = rowData?.filter((row: { flatName: string }) => parents[parent.flatName].includes(row.flatName));
        return <LabSetPanel key={parent.flatName} tests={subRows} heading={parent.display} />;
      })}
    </>
  );
};

export default PanelView;
