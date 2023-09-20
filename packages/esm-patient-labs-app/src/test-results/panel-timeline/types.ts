import { ParsedTimeType } from '../filter/filter-types';
import { ObsRecord } from '../../types';

export interface TimelineData {
  parsedTimes: ParsedTimeType;
  timelineData: Record<string, Array<ObsRecord>>;
  panelName: string;
}
