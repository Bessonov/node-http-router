function parseNumber(value) {
    if (value.trim().length === 0) {
        return Number('nan');
    }
    return Number(value);
}
/**
 * It's a wildcard validator mainly used for optional parameters.
 * It does nothing and simply returns the value.
 */
// it is unclear, why `null` is needed and why `undefined` doesn't work
export function trueVal() {
    return (value) => (() => value);
}
/**
 * Validator to mark required parameters. It ensures, for example:
 * string[] | undefined -> string[]
 * number | undefined  -> number
 */
export function requiredVal() {
    return (value) => {
        if (value === undefined || value === null) {
            return undefined;
        }
        return () => value;
    };
}
/**
 * Returns the n-th element of an array. A negative value returns
 * the element counting from the end of the array.
 */
export function getNthVal(num = 0) {
    return (value) => {
        if (value === undefined || value === null) {
            return () => undefined;
        }
        if (Array.isArray(value)) {
            return () => {
                if (num >= 0) {
                    return value[num];
                }
                const newNum = value.length + num;
                return value[newNum];
            };
        }
        return undefined;
    };
}
/**
 * Ensures that a string array can be converted to a number array.
 */
export function mapToNumVal() {
    return (values) => {
        if (values === undefined || values === null) {
            return (() => undefined);
        }
        const parsedValues = [];
        for (const value of values) {
            const parsedValue = parseNumber(value);
            if (Number.isNaN(parsedValue)) {
                return undefined;
            }
            parsedValues.push(parsedValue);
        }
        return (() => parsedValues);
    };
}
/**
 * Ensures that a single value can be converted to a number.
 */
export function toNumVal() {
    return (value) => {
        if (value === undefined) {
            return (() => undefined);
        }
        const parsedValue = parseNumber(value);
        if (Number.isNaN(parsedValue)) {
            return undefined;
        }
        return (() => parsedValue);
    };
}
/**
 * Filters the passed values based on the listed options. If `undefined` is
 * included in the option list, it indicates that the passed value is optional.
 */
export function atLeastOneVal(expectedValues) {
    return (values) => {
        if (values === undefined && expectedValues.includes(undefined)) {
            return (() => undefined);
        }
        const newValues = (values !== null && values !== void 0 ? values : []).filter(value => expectedValues.includes(value));
        if (newValues.length > 0) {
            return () => newValues;
        }
        return undefined;
    };
}
/**
 * Ensures that the passed value is one of the listed options.
 */
export function oneOfVal(values) {
    return (value) => {
        if (values.includes(value)) {
            return () => value;
        }
        return undefined;
    };
}
/**
 * Ensures that the passed array has a minimal length.
 */
export function minCountVal(min) {
    return (value) => {
        if (value !== undefined && value !== null && value.length >= min) {
            return () => value;
        }
        return undefined;
    };
}
export function chain(...validators) {
    return value => {
        let lastValidatorValue = value;
        for (const matcher of validators) {
            const getter = matcher(lastValidatorValue);
            if (getter === undefined) {
                return undefined;
            }
            lastValidatorValue = getter();
        }
        return () => lastValidatorValue;
    };
}
//# sourceMappingURL=validators.js.map