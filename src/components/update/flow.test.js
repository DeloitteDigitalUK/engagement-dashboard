import {
  toStringCell,
  fromStringCell,
  toDateCell,
  fromDateCell,
  itemToRow,
  coerceValue,
  saveTableData,
} from './flow';

test('toStringCell', () => {
  expect(toStringCell(null)).toEqual("");
  expect(toStringCell("")).toEqual("");
  expect(toStringCell("foo")).toEqual("foo");
});

test('fromStringCell', () => {
  expect(fromStringCell("")).toEqual(null);
  expect(fromStringCell("\0")).toEqual(null);
  expect(fromStringCell(null)).toEqual(null);
  expect(fromStringCell("foo")).toEqual("foo");
  expect(fromStringCell(1)).toEqual(1);
});

test('toDateCell', () => {
  expect(toDateCell(new Date(2020, 0, 2))).toEqual("02/01/2020");
  expect(toDateCell(null)).toEqual("");
  expect(toDateCell("")).toEqual("");
});

test('fromDateCell', () => {
  expect(fromDateCell(null)).toEqual(null);
  expect(fromDateCell("")).toEqual(null);
  expect(fromDateCell("\0")).toEqual(null);
  expect(fromDateCell("01/02/2020")).toEqual(new Date(2020, 1, 1));
  expect(fromDateCell("2020-02-01")).toEqual(new Date(2020, 1, 1));
});

test('itemToRow', () => {
  const item = {
    foo: 1,
    bar: 2,
    unused: 3
  };

  const columns = [
    { type: 'text', name: 'bar', toCell: val => val * 3 },
    { type: 'text', name: 'foo', toCell: val => val * 2 },
  ];

  expect(itemToRow(columns, item)).toEqual([6, 2]);
});

test('coerceValue', () => {
  // calls each transform in turn
  expect(coerceValue(
    {
      fromCell: val => val + '_from',
      validate: val => val + '_valid',
      toCell: val => val + '_to'
    },
    'foo'
  )).toEqual('foo_from_valid_to');

  // validator optional
  expect(coerceValue(
    {
      fromCell: val => val + '_from',
      // validate: val => val + '_valid',
      toCell: val => val + '_to'
    },
    'foo'
  )).toEqual('foo_from_to');

  // ignore exceptions in validator
  expect(coerceValue(
    {
      fromCell: val => val + '_from',
      validate: val => { throw new Error(); },
      toCell: val => val + '_to'
    },
    'foo'
  )).toEqual('foo_from_to');
});

test('saveTableData', () => {
  const field = { name: 'foo' };
  const form = {
    setFieldValue(name, value) {
      expect(name).toEqual('foo');
      expect(value).toEqual([
        {foo: 'a_foo', bar: 'b_bar'},
        {foo: 'c_foo', bar: 'd_bar'},
      ]);
    }
  };
  
  saveTableData([
      ['a', 'b'],
      ['c', 'd']
    ], [
      { type: 'text', name: 'foo', fromCell: val => val + '_foo' },
      { type: 'text', name: 'bar', fromCell: val => val + '_bar' },
    ],
    form,
    field
  );
});

test('saveTableData empty', () => {
  const field = { name: 'foo' };
  const form = {
    setFieldValue(name, value) {
      expect(name).toEqual('foo');
      expect(value).toEqual([]);
    }
  };
  
  saveTableData([], [
      { type: 'text', name: 'foo', fromCell: val => val + '_foo' },
      { type: 'text', name: 'bar', fromCell: val => val + '_bar' },
    ],
    form,
    field
  );
});