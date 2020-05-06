import { timeMonday } from 'd3-time';
import {
  cycleTimes,
  averageCycleTimes,
  throughput,
  wip,
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

    { completionDate: new Date(2020, 0, 14), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 15), cycleTime: 5 },
    { completionDate: new Date(2020, 0, 16), cycleTime: 2 },

    { completionDate: new Date(2020, 0, 9), cycleTime: 4 },
    { completionDate: new Date(2020, 0, 10), cycleTime: 6 },
    { completionDate: new Date(2020, 0, 9), cycleTime: 2 },

  ], timeMonday)).toEqual([
    { period: new Date(2019, 11, 30), averageCycleTime: 2},
    { period: new Date(2020, 0, 6), averageCycleTime: 4},
    { period: new Date(2020, 0, 13), averageCycleTime: 3},
  ]);
});

test('throughput', () => {
  expect(throughput([
    { completionDate: new Date(2020, 0, 2), cycleTime: 1 },
    { completionDate: new Date(2020, 0, 5), cycleTime: 3 },
    
    { completionDate: new Date(2020, 0, 14), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 15), cycleTime: 5 },
    { completionDate: new Date(2020, 0, 16), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 18), cycleTime: 2 },

    { completionDate: new Date(2020, 0, 9), cycleTime: 4 },
    { completionDate: new Date(2020, 0, 9), cycleTime: 2 },
    { completionDate: new Date(2020, 0, 10), cycleTime: 6 },
  ], timeMonday)).toEqual([
    { period: new Date(2019, 11, 30), throughput: 2},
    { period: new Date(2020, 0, 6), throughput: 3},
    { period: new Date(2020, 0, 13), throughput: 4},
  ]);
});

test('wip', () => {
  expect(wip([
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 2), itemType: null  },
    { commitmentDate: new Date(2020, 0, 1), completionDate: new Date(2020, 0, 1), itemType: 'foo' },
    { commitmentDate: new Date(2020, 0, 3), completionDate: new Date(2020, 0, 6), itemType: 'bar' },
    { commitmentDate: new Date(2020, 0, 4), completionDate: null,                 itemType: 'foo' }, // open until today
    { commitmentDate: null,                 completionDate: null,                 itemType: null  }, // skip
    { commitmentDate: null,                 completionDate: new Date(2020, 0, 5), itemType: null  }, // skip
  ], null, timeMonday, new Date(2020, 0, 21))).toEqual([
    { period: new Date(2019, 11, 30), wip: 4},
    { period: new Date(2020, 0, 6), wip: 2},
    { period: new Date(2020, 0, 13), wip: 1},
    { period: new Date(2020, 0, 20), wip: 1},
  ]);
});