import { atLeastOneVal, getNthVal, mapToNumVal, minCountVal, oneOfVal, requiredVal, toNumVal, trueVal, } from '../validators.js';
describe(trueVal.name, () => {
    it('matches always', () => {
        var _a;
        const validator = trueVal();
        const input = ['any'];
        expect(validator(input)).toBeDefined();
        expect((_a = validator(input)) === null || _a === void 0 ? void 0 : _a()).toBe(input);
    });
});
describe(requiredVal.name, () => {
    const validator = requiredVal();
    it(`don't match undefined and null`, () => {
        expect(validator()).toBeUndefined();
        expect(validator(undefined)).toBeUndefined();
        expect(validator(null)).toBeUndefined();
    });
    it('match defined values', () => {
        var _a;
        const value = 'test';
        expect(validator(value)).toBeInstanceOf(Function);
        expect((_a = validator(value)) === null || _a === void 0 ? void 0 : _a()).toBe(value);
    });
});
describe(getNthVal.name, () => {
    const validator = getNthVal();
    it(`don't match non-arrays`, () => {
        expect(validator(null)).toBeUndefined();
        expect(validator({})).toBeUndefined();
    });
    it('match defined values and return the first value', () => {
        var _a;
        expect(validator(['value1', 'value2', 'value3'])).toBeInstanceOf(Function);
        expect((_a = validator(['value1', 'value2', 'value3'])) === null || _a === void 0 ? void 0 : _a()).toBe('value1');
    });
    it('match defined values and return the last value', () => {
        var _a;
        const validatorLast = getNthVal(-1);
        expect(validatorLast(['value1', 'value2', 'value3'])).toBeInstanceOf(Function);
        expect((_a = validatorLast(['value1', 'value2', 'value3'])) === null || _a === void 0 ? void 0 : _a()).toBe('value3');
    });
});
describe(mapToNumVal.name, () => {
    const validator = mapToNumVal();
    it(`don't match uncconvertible arrays`, () => {
        expect(validator(['1', ' '])).toBeUndefined();
        expect(validator(['1', 'a'])).toBeUndefined();
        expect(validator(['1_000'])).toBeUndefined();
    });
    it(`convert a string array to a number array`, () => {
        var _a, _b, _c;
        expect(validator([])).toBeDefined();
        expect((_a = validator([])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual([]);
        expect(validator(['1', '-1', '1000'])).toBeDefined();
        expect((_b = validator(['1', '-1', '1000'])) === null || _b === void 0 ? void 0 : _b()).toStrictEqual([1, -1, 1000]);
        expect(validator([' 1 '])).toBeDefined();
        expect((_c = validator([' 1 '])) === null || _c === void 0 ? void 0 : _c()).toStrictEqual([1]);
    });
});
describe(oneOfVal.name, () => {
    const validator = oneOfVal(['a', 'b', 'c']);
    it(`don't match if not in list`, () => {
        expect(validator('1')).toBeUndefined();
    });
    it(`match one of the list`, () => {
        var _a;
        expect(validator('b')).toBeDefined();
        expect((_a = validator('b')) === null || _a === void 0 ? void 0 : _a()).toStrictEqual('b');
    });
});
describe(atLeastOneVal.name, () => {
    const validator = atLeastOneVal(['a', 'b', 'c']);
    it(`don't match if not in list`, () => {
        expect(validator(['1'])).toBeUndefined();
    });
    it(`match one of the list`, () => {
        var _a;
        expect(validator(['b', 'c', 'd'])).toBeDefined();
        expect((_a = validator(['b', 'c', 'd'])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(['b', 'c']);
    });
});
describe(minCountVal.name, () => {
    const validator = minCountVal(2);
    it(`don't match if not enough elements`, () => {
        expect(validator([])).toBeUndefined();
        expect(validator(['1'])).toBeUndefined();
    });
    it(`match if enough elements`, () => {
        var _a;
        expect(validator(['1', '2'])).toBeDefined();
        expect((_a = validator(['1', '2'])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(['1', '2']);
    });
});
describe(toNumVal.name, () => {
    const validator = toNumVal();
    it(`don't match if not convertible to a number`, () => {
        expect(validator('')).toBeUndefined();
        expect(validator(' ')).toBeUndefined();
        expect(validator('a')).toBeUndefined();
    });
    it(`match if convertible to a number`, () => {
        var _a;
        expect(validator('1')).toBeDefined();
        expect((_a = validator('1')) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(1);
    });
});
//# sourceMappingURL=validators.test.js.map