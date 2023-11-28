import { type ParsedTimeType } from '../filter/filter-types';
import { type ObsRecord } from '../../types';

export interface TimelineData {
  parsedTimes: ParsedTimeType;
  timelineData: Record<string, Array<ObsRecord>>;
  panelName: string;
}
