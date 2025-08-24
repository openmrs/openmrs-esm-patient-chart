import { type Visit } from '@openmrs/esm-framework';
import React from 'react';

interface Props {
	visit: Visit;
}

const VisitLocationCell: React.FC<Props> = ({ visit }) => {
	// Get the most recent location from encounters, fallback to visit location
	const mostRecentEncounter = visit.encounters
		.filter((enc) => enc.location?.display)
		.sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime())[0];

	const locationDisplay = mostRecentEncounter?.location?.display || visit.location?.display || '--';
	
	return <>{locationDisplay}</>;
};

export default VisitLocationCell;


