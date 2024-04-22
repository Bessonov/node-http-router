import { atLeastOneVal, getNthVal, mapToNumVal, minCountVal, oneOfVal, requiredVal, toNumVal, trueVal, } from '../validators.js';
describe(trueVal.name, () => {
    const validator = trueVal();
    it(`ignore undefined`, () => {
        var _a;
        expect(validator(undefined)).toBeInstanceOf(Function);
        expect((_a = validator(undefined)) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
    });
    it('matches always', () => {
        var _a;
        const input = ['any'];
        expect(validator(input)).toBeInstanceOf(Function);
        expect((_a = validator(input)) === null || _a === void 0 ? void 0 : _a()).toBe(input);
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
        var _a;
        const value = 'test';
        expect(validator(value)).toBeInstanceOf(Function);
        expect((_a = validator(value)) === null || _a === void 0 ? void 0 : _a()).toBe(value);
    });
});
describe(getNthVal.name, () => {
    const validator = getNthVal();
    it(`ignore undefined`, () => {
        var _a, _b;
        expect(validator()).toBeInstanceOf(Function);
        expect((_a = validator()) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
        expect(validator(null)).toBeInstanceOf(Function);
        expect((_b = validator(null)) === null || _b === void 0 ? void 0 : _b()).toBe(undefined);
    });
    it(`don't match non-arrays`, () => {
        expect(validator({})).toBe(undefined);
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
    it(`ignore undefined`, () => {
        var _a, _b;
        expect(validator()).toBeInstanceOf(Function);
        expect((_a = validator()) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
        expect(validator(null)).toBeInstanceOf(Function);
        expect((_b = validator(null)) === null || _b === void 0 ? void 0 : _b()).toBe(undefined);
    });
    it(`don't match uncconvertible arrays`, () => {
        expect(validator(['1', ' '])).toBe(undefined);
        expect(validator(['1', 'a'])).toBe(undefined);
        expect(validator(['1_000'])).toBe(undefined);
    });
    it(`convert a string array to a number array`, () => {
        var _a, _b, _c;
        expect(validator([])).toBeInstanceOf(Function);
        expect((_a = validator([])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual([]);
        expect(validator(['1', '-1', '1000'])).toBeInstanceOf(Function);
        expect((_b = validator(['1', '-1', '1000'])) === null || _b === void 0 ? void 0 : _b()).toStrictEqual([1, -1, 1000]);
        expect(validator([' 1 '])).toBeInstanceOf(Function);
        expect((_c = validator([' 1 '])) === null || _c === void 0 ? void 0 : _c()).toStrictEqual([1]);
    });
});
describe(toNumVal.name, () => {
    const validator = toNumVal();
    it(`ignore undefined`, () => {
        var _a;
        expect(validator()).toBeInstanceOf(Function);
        expect((_a = validator()) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
    });
    it(`don't match if not convertible to a number`, () => {
        expect(validator('')).toBe(undefined);
        expect(validator(' ')).toBe(undefined);
        expect(validator('a')).toBe(undefined);
    });
    it(`match if convertible to a number`, () => {
        var _a;
        expect(validator('1')).toBeInstanceOf(Function);
        expect((_a = validator('1')) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(1);
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
            var _a, _b;
            expect(validator(['b', 'c', 'd'])).toBeInstanceOf(Function);
            expect((_a = validator(['b', 'c', 'd'])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(['b', 'c']);
            expect(validator(['b', 'undefined', 'd'])).toBeInstanceOf(Function);
            expect((_b = validator(['b', 'undefined', 'd'])) === null || _b === void 0 ? void 0 : _b()).toStrictEqual(['b', 'undefined']);
        });
    });
    describe('optional', () => {
        const validator = atLeastOneVal([undefined, 'a', 'b', 'c']);
        it(`don't match if not in list`, () => {
            expect(validator(null)).toBe(undefined);
            expect(validator(['1'])).toBe(undefined);
        });
        it(`match one of the list`, () => {
            var _a, _b;
            expect(validator()).toBeInstanceOf(Function);
            expect((_a = validator()) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
            expect(validator(['b', 'c', 'd'])).toBeInstanceOf(Function);
            expect((_b = validator(['b', 'c', 'd'])) === null || _b === void 0 ? void 0 : _b()).toStrictEqual(['b', 'c']);
        });
    });
});
describe(oneOfVal.name, () => {
    const validator = oneOfVal([undefined, 'a', 'b', 'c']);
    it(`ignore undefined`, () => {
        var _a, _b;
        expect(validator()).toBeInstanceOf(Function);
        expect((_a = validator()) === null || _a === void 0 ? void 0 : _a()).toBe(undefined);
        expect(validator(undefined)).toBeInstanceOf(Function);
        expect((_b = validator(undefined)) === null || _b === void 0 ? void 0 : _b()).toBe(undefined);
    });
    it(`don't match if not in list`, () => {
        expect(validator('1')).toBe(undefined);
    });
    it(`match one of the list`, () => {
        var _a;
        expect(validator('b')).toBeInstanceOf(Function);
        expect((_a = validator('b')) === null || _a === void 0 ? void 0 : _a()).toStrictEqual('b');
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
        var _a;
        expect(validator(['1', '2'])).toBeInstanceOf(Function);
        expect((_a = validator(['1', '2'])) === null || _a === void 0 ? void 0 : _a()).toStrictEqual(['1', '2']);
    });
});
//# sourceMappingURL=validators.test.js.map