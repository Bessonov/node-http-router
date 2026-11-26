import { atLeastOneVal, getNthVal, mapToNumVal, minCountVal, oneOfVal, requiredVal, toNumVal, trueVal, } from '../validators.js';
describe(trueVal.name, () => {
    const validator = trueVal();
    it(`ignore undefined`, () => {
        expect(validator(undefined)).toBeInstanceOf(Function);
        expect(validator(undefined)?.()).toBe(undefined);
    });
    it('matches always', () => {
        const input = ['any'];
        expect(validator(input)).toBeInstanceOf(Function);
        expect(validator(input)?.()).toBe(input);
    });
});
describe(requiredVal.name, () => {
    const validator = requiredVal();
    it(`don't match undefined and null`, () => {
        expect(validator()).toBe(undefined);
        expect(validator(undefined)).toBe(undefined);
        expect(validator(null)).toBe(undefined);
    });
    it('match defined values', () => {
        const value = 'test';
        expect(validator(value)).toBeInstanceOf(Function);
        expect(validator(value)?.()).toBe(value);
    });
});
describe(getNthVal.name, () => {
    const validator = getNthVal();
    it(`ignore undefined`, () => {
        expect(validator()).toBeInstanceOf(Function);
        expect(validator()?.()).toBe(undefined);
        expect(validator(null)).toBeInstanceOf(Function);
        expect(validator(null)?.()).toBe(undefined);
    });
    it(`don't match non-arrays`, () => {
        expect(validator({})).toBe(undefined);
    });
    it('match defined values and return the first value', () => {
        expect(validator(['value1', 'value2', 'value3'])).toBeInstanceOf(Function);
        expect(validator(['value1', 'value2', 'value3'])?.()).toBe('value1');
    });
    it('match defined values and return the last value', () => {
        const validatorLast = getNthVal(-1);
        expect(validatorLast(['value1', 'value2', 'value3'])).toBeInstanceOf(Function);
        expect(validatorLast(['value1', 'value2', 'value3'])?.()).toBe('value3');
    });
});
describe(mapToNumVal.name, () => {
    const validator = mapToNumVal();
    it(`ignore undefined`, () => {
        expect(validator()).toBeInstanceOf(Function);
        expect(validator()?.()).toBe(undefined);
        expect(validator(null)).toBeInstanceOf(Function);
        expect(validator(null)?.()).toBe(undefined);
    });
    it(`don't match uncconvertible arrays`, () => {
        expect(validator(['1', ' '])).toBe(undefined);
        expect(validator(['1', 'a'])).toBe(undefined);
        expect(validator(['1_000'])).toBe(undefined);
    });
    it(`convert a string array to a number array`, () => {
        expect(validator([])).toBeInstanceOf(Function);
        expect(validator([])?.()).toStrictEqual([]);
        expect(validator(['1', '-1', '1000'])).toBeInstanceOf(Function);
        expect(validator(['1', '-1', '1000'])?.()).toStrictEqual([1, -1, 1_000]);
        expect(validator([' 1 '])).toBeInstanceOf(Function);
        expect(validator([' 1 '])?.()).toStrictEqual([1]);
    });
});
describe(toNumVal.name, () => {
    const validator = toNumVal();
    it(`ignore undefined`, () => {
        expect(validator()).toBeInstanceOf(Function);
        expect(validator()?.()).toBe(undefined);
    });
    it(`don't match if not convertible to a number`, () => {
        expect(validator('')).toBe(undefined);
        expect(validator(' ')).toBe(undefined);
        expect(validator('a')).toBe(undefined);
    });
    it(`match if convertible to a number`, () => {
        expect(validator('1')).toBeInstanceOf(Function);
        expect(validator('1')?.()).toStrictEqual(1);
    });
});
describe(atLeastOneVal.name, () => {
    describe('required', () => {
        const validator = atLeastOneVal(['undefined', 'a', 'b', 'c']);
        it(`don't match if not in list`, () => {
            expect(validator()).toBe(undefined);
            expect(validator(null)).toBe(undefined);
            expect(validator(['1'])).toBe(undefined);
        });
        it(`match one of the list`, () => {
            expect(validator(['b', 'c', 'd'])).toBeInstanceOf(Function);
            expect(validator(['b', 'c', 'd'])?.()).toStrictEqual(['b', 'c']);
            expect(validator(['b', 'undefined', 'd'])).toBeInstanceOf(Function);
            expect(validator(['b', 'undefined', 'd'])?.()).toStrictEqual(['b', 'undefined']);
        });
    });
    describe('optional', () => {
        const validator = atLeastOneVal([undefined, 'a', 'b', 'c']);
        it(`don't match if not in list`, () => {
            expect(validator(null)).toBe(undefined);
            expect(validator(['1'])).toBe(undefined);
        });
        it(`match one of the list`, () => {
            expect(validator()).toBeInstanceOf(Function);
            expect(validator()?.()).toBe(undefined);
            expect(validator(['b', 'c', 'd'])).toBeInstanceOf(Function);
            expect(validator(['b', 'c', 'd'])?.()).toStrictEqual(['b', 'c']);
        });
    });
});
describe(oneOfVal.name, () => {
    describe('required', () => {
        const validator = oneOfVal(['undefined', 'a', 'b', 'c']);
        it(`don't match if not in list`, () => {
            expect(validator()).toBe(undefined);
            expect(validator(null)).toBe(undefined);
            expect(validator('1')).toBe(undefined);
        });
        it(`match one of the list`, () => {
            expect(validator('b')).toBeInstanceOf(Function);
            expect(validator('b')?.()).toStrictEqual('b');
        });
    });
    describe('optional', () => {
        const validator = oneOfVal([undefined, 'a', 'b', 'c']);
        it(`ignore undefined`, () => {
            expect(validator()).toBeInstanceOf(Function);
            expect(validator()?.()).toBe(undefined);
            expect(validator(undefined)).toBeInstanceOf(Function);
            expect(validator(undefined)?.()).toBe(undefined);
        });
        it(`don't match if not in list`, () => {
            expect(validator('1')).toBe(undefined);
        });
        it(`match one of the list`, () => {
            expect(validator('b')).toBeInstanceOf(Function);
            expect(validator('b')?.()).toStrictEqual('b');
        });
    });
});
describe(minCountVal.name, () => {
    const validator = minCountVal(2);
    it(`don't match if not enough elements`, () => {
        expect(validator()).toBe(undefined);
        expect(validator(null)).toBe(undefined);
        expect(validator([])).toBe(undefined);
        expect(validator(['1'])).toBe(undefined);
    });
    it(`match if enough elements`, () => {
        expect(validator(['1', '2'])).toBeInstanceOf(Function);
        expect(validator(['1', '2'])?.()).toStrictEqual(['1', '2']);
    });
});
//# sourceMappingURL=validators.test.js.map