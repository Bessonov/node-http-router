import { atLeastOneVal, getNthVal, mapToNumVal, minCountVal, oneOfVal, requiredVal, toNumVal, trueVal, } from '../validators.js';
describe(trueVal.name, () => {
    it('matches always', () => {
        const validator = trueVal()();
        const input = ['any'];
        expect(validator.match(input)).toBe(true);
        expect(validator.parse(input)).toBe(input);
    });
});
describe(requiredVal.name, () => {
    const validatorFactory = requiredVal();
    it(`don't match undefined and null`, () => {
        expect(validatorFactory().match()).toBe(false);
        expect(validatorFactory().match(undefined)).toBe(false);
        expect(validatorFactory().match(null)).toBe(false);
    });
    it('match defined values', () => {
        const validator = validatorFactory();
        const value = 'test';
        expect(validator.match(value)).toBe(true);
        expect(validator.parse(value)).toBe(value);
    });
});
describe(getNthVal.name, () => {
    const validatorFactory = getNthVal();
    it(`don't match non-arrays`, () => {
        expect(validatorFactory().match(null)).toBe(false);
        expect(validatorFactory().match({})).toBe(false);
    });
    it('match defined values and return the first value', () => {
        const validator = validatorFactory();
        expect(validator.match(['value1', 'value2', 'value3'])).toBe(true);
        expect(validator.parse(['value1', 'value2', 'value3'])).toBe('value1');
    });
    it('match defined values and return the last value', () => {
        const validatorLast = getNthVal(-1)();
        expect(validatorLast.match(['value1', 'value2', 'value3'])).toBe(true);
        expect(validatorLast.parse(['value1', 'value2', 'value3'])).toBe('value3');
    });
});
describe(mapToNumVal.name, () => {
    const validatorFactory = mapToNumVal();
    it(`don't match uncconvertible arrays`, () => {
        expect(validatorFactory().match(['1', ' '])).toBe(false);
        expect(validatorFactory().match(['1', 'a'])).toBe(false);
        expect(validatorFactory().match(['1_000'])).toBe(false);
    });
    it(`convert a string array to a number array`, () => {
        let validator = validatorFactory();
        expect(validator.match([])).toBe(true);
        expect(validator.parse([])).toStrictEqual([]);
        validator = validatorFactory();
        expect(validator.match(['1', '-1', '1000'])).toBe(true);
        expect(validator.parse(['1', '-1', '1000'])).toStrictEqual([1, -1, 1000]);
        validator = validatorFactory();
        expect(validator.match([' 1 '])).toBe(true);
        expect(validator.parse([' 1 '])).toStrictEqual([1]);
    });
});
describe(oneOfVal.name, () => {
    const validatorFactory = oneOfVal(['a', 'b', 'c']);
    it(`don't match if not in list`, () => {
        expect(validatorFactory().match('1')).toBe(false);
    });
    it(`match one of the list`, () => {
        const validator = validatorFactory();
        expect(validator.match('b')).toBe(true);
        expect(validator.parse('b')).toStrictEqual('b');
    });
});
describe(atLeastOneVal.name, () => {
    const validatorFactory = atLeastOneVal(['a', 'b', 'c']);
    it(`don't match if not in list`, () => {
        expect(validatorFactory().match(['1'])).toBe(false);
    });
    it(`match one of the list`, () => {
        const validator = validatorFactory();
        expect(validator.match(['b', 'c', 'd'])).toBe(true);
        expect(validator.parse(['b', 'c', 'd'])).toStrictEqual(['b', 'c']);
    });
});
describe(minCountVal.name, () => {
    const validatorFactory = minCountVal(2);
    it(`don't match if not enough elements`, () => {
        expect(validatorFactory().match([])).toBe(false);
        expect(validatorFactory().match(['1'])).toBe(false);
    });
    it(`match if enough elements`, () => {
        const validator = validatorFactory();
        expect(validator.match(['1', '2'])).toBe(true);
        expect(validator.parse(['1', '2'])).toStrictEqual(['1', '2']);
    });
});
describe(toNumVal.name, () => {
    const validatorFactory = toNumVal();
    it(`don't match if not convertible to a number`, () => {
        expect(validatorFactory().match('')).toBe(false);
        expect(validatorFactory().match(' ')).toBe(false);
        expect(validatorFactory().match('a')).toBe(false);
    });
    it(`match if convertible to a number`, () => {
        const validator = validatorFactory();
        expect(validator.match('1')).toBe(true);
        expect(validator.parse('1')).toStrictEqual(1);
    });
});
//# sourceMappingURL=validators.test.js.map