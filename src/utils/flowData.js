import { timeDay, timeMonday } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { nest } from 'd3-collection';
import { mean } from 'd3-array';

/**
 * [{commitmentDate, completionDate, itemType}] => [{commitmentDate, completionDate, itemType, cycleTime}]
 * 
 * If `itemType` is given, filters by this type.
 * 
 * Uncompleted items are excluded.
 */
export function cycleTimes(flowData, itemType=null, interval=timeDay) {
  return flowData
          .filter(v => (itemType === null || itemType === v.itemType) && v.commitmentDate && v.completionDate)
          .map(v => ({...v, cycleTime: interval.count(v.commitmentDate, v.completionDate)}));
}

/**
 * [{completionDate, cycleTime}] => [{period, averageCycleTime}]
 * 
 * By default, `period` will be weeks beginning Mondays, formatted according
 * to the locale's default short time format.
 */
export function averageCycleTimes(cycleTimes, dateFormat=timeFormat('%x'), interval=timeMonday) {
  return nest()
          .key(v => dateFormat(interval(v.completionDate)))
          .rollup(v => mean(v, e => e.cycleTime))
          .entries(cycleTimes)
          .map(v => ({period: v.key, averageCycleTime: v.value}));
}

/**
 * [{completionDate, cycleTime}] => [{period, throughput}]
 * 
 * By default, `period` will be weeks beginning Mondays.
 */
export function throughput(cycleTimes, dateFormat=timeFormat('%x'), interval=timeMonday) {
  return nest()
          .key(v => dateFormat(interval(v.completionDate)))
          .rollup(v => v.length)
          .entries(cycleTimes)
          .map(v => ({period: v.key, throughput: v.value}));
}