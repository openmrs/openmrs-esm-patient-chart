import { type Visit } from '@openmrs/esm-framework';
import React from 'react';

interface Props {
	visit: Visit;
}
const VisitProviderCell: React.FC<Props> = ({ visit }) => {
	// Gets the most recent provider from any encounter
	const mostRecentEncounter = visit.encounters
		.filter((enc) => enc.encounterProviders?.length > 0)
		.sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime())[0];

	if (!mostRecentEncounter) {
		return <>{'--'}</>;
	}
    const providerName = mostRecentEncounter.encounterProviders[0]?.provider?.person?.display || 
		mostRecentEncounter.encounterProviders[0]?.provider?.display || 
		mostRecentEncounter.encounterProviders[0]?.display || 
		'--';
	return <>{providerName}</>;
};

export default VisitProviderCell;


