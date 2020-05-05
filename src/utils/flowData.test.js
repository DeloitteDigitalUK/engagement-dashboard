import { timeMonday } from 'd3-time';
import { timeFormat } from 'd3-time-format';

import {
  cycleTimes,
  averageCycleTimes,
  throughput,
} from './flowData';

test('cycleTimes', () => {
  expect(cycleTimes([
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 2), itemType: null  },
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 1), itemType: 'foo' },
    { commitmentDate: new Date(2020, 0, 3), completionDate: new Date(2020, 0, 5), itemType: 'bar' },
    { commitmentDate: new Date(2020, 0, 4), completionDate: null,                 itemType: 'foo' },
    { commitmentDate: null,                 completionDate: null,                 itemType: null  },
    { commitmentDate: null,                 completionDate: new Date(2020, 0, 5), itemType: null  },
  ])).toEqual([
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 2), itemType: null,  cycleTime: 1 },
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 1), itemType: 'foo', cycleTime: 0 },
    { commitmentDate: new Date(2020, 0, 3), completionDate: new Date(2020, 0, 5), itemType: 'bar', cycleTime: 2 },
  ]);

  expect(cycleTimes([
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 2), itemType: null  },
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 1), itemType: 'foo' },
    { commitmentDate: new Date(2020, 0, 3), completionDate: new Date(2020, 0, 5), itemType: 'bar' },
    { commitmentDate: new Date(2020, 0, 4), completionDate: null,                 itemType: 'foo' },
    { commitmentDate: null,                 completionDate: null,                 itemType: null  },
    { commitmentDate: null,                 completionDate: new Date(2020, 0, 5), itemType: null  },
  ], 'foo')).toEqual([
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 1), itemType: 'foo', cycleTime: 0 },
  ]);
});

test('averageCycleTimes', () => {
  expect(averageCycleTimes([
    { completionDate: new Date(2020, 0, 2), cycleTime: 1 },
    { completionDate: new Date(2020, 0, 1), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 5), cycleTime: 3 },

    { completionDate: new Date(2020, 0, 9), cycleTime: 4 },
    { completionDate: new Date(2020, 0, 9), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 10), cycleTime: 6 },

    { completionDate: new Date(2020, 0, 14), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 15), cycleTime: 5 },
    { completionDate: new Date(2020, 0, 16), cycleTime: 2 },
  ], timeFormat('%Y-%m-%d'), timeMonday)).toEqual([
    { period: '2019-12-30', averageCycleTime: 2},
    { period: '2020-01-06', averageCycleTime: 4},
    { period: '2020-01-13', averageCycleTime: 3},
  ])
});

test('throughput', () => {
  expect(throughput([
    { completionDate: new Date(2020, 0, 2), cycleTime: 1 },
    { completionDate: new Date(2020, 0, 5), cycleTime: 3 },

    { completionDate: new Date(2020, 0, 9), cycleTime: 4 },
    { completionDate: new Date(2020, 0, 9), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 10), cycleTime: 6 },

    { completionDate: new Date(2020, 0, 14), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 15), cycleTime: 5 },
    { completionDate: new Date(2020, 0, 16), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 18), cycleTime: 2 },
  ], timeFormat('%Y-%m-%d'), timeMonday)).toEqual([
    { period: '2019-12-30', throughput: 2},
    { period: '2020-01-06', throughput: 3},
    { period: '2020-01-13', throughput: 4},
  ])
});