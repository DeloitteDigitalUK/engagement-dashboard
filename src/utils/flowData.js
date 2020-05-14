import { timeDay, timeMonday } from 'd3-time';
import { rollup, mean } from 'd3-array';

/**
 * [{commitmentDate, completionDate, itemType}] => [{commitmentDate, completionDate, itemType, cycleTime}]
 * 
 * If `itemType` is given, filters by this type.
 * 
 * Uncompleted items are excluded.
 */
export function cycleTimes(flowData, itemType=undefined, interval=timeDay) {
  return flowData
    .filter(v => (itemType === undefined || itemType === v.itemType) && v.commitmentDate && v.completionDate)
    .map(v => ({...v, cycleTime: interval.count(v.commitmentDate, v.completionDate)}));
}

/**
 * [{completionDate, cycleTime}] => [{period, averageCycleTime}]
 * 
 * By default, `period` will be weeks beginning Mondays, formatted according
 * to the locale's default short time format.
 */
export function averageCycleTimes(cycleTimes, interval=timeMonday) {
  return Array.from(rollup(
    cycleTimes,
    g => mean(g, v => v.cycleTime),
    v => interval(v.completionDate).valueOf(),
  )).sort((a, b) => (a[0] - b[0])) // sort by date
    .map(([key, averageCycleTime]) => ({period: new Date(key), averageCycleTime}));
}

/**
 * [{completionDate, cycleTime}] => [{period, throughput}]
 * 
 * By default, `period` will be weeks beginning Mondays.
 */
export function throughput(cycleTimes, interval=timeMonday) {
  return Array.from(rollup(
    cycleTimes,
    g => g.length,
    v => interval(v.completionDate).valueOf(),
  )).sort((a, b) => (a[0] - b[0])) // sort by date
    .map(([key, throughput]) => ({period: new Date(key), throughput}));
}

/**
 * [{commitmentDate, completionDate, itemType}] => [{period, wip}]
 * 
 * By default, `period` will be weeks beginning Mondays.
 * 
 * If `itemType` is given, filters by this type.
 */
export function wip(flowData, itemType=undefined, interval=timeMonday, today=null) {
  const periods = new Map();
  
  // mostly for testing purposes - allow us to code what `today` is
  if(today === null) {
    today = new Date();
  }

  const currentPeriod = interval(today);

  flowData.forEach(v => {
    const { commitmentDate: start, completionDate: end, itemType: type } = v;
    if(!start || (itemType !== undefined && itemType !== type)) {
      return;
    }

    const firstPeriod = interval(start),
          lastPeriod = end? interval(end) : currentPeriod;
    
    for(const period of interval.range(firstPeriod, interval.offset(lastPeriod, 1))) {
      const key = period.valueOf();
      if(!periods.has(key)) {
        periods.set(key, 1);
      } else {
        periods.set(key, periods.get(key) + 1);
      }
    }
  });

  return Array
    .from(periods)
    .sort((a, b) => (a[0] - b[0])) // sort by date
    .map(([key, wip]) => ({period: new Date(key), wip}));
}