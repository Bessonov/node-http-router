function parseNumber(value) {
    if (value.trim().length === 0) {
        return Number('nan');
    }
    return Number(value);
}
export function trueVal() {
    return (value) => () => value;
}
export function requiredVal() {
    return (value) => {
        if (value === undefined || value === null) {
            return undefined;
        }
        return () => value;
    };
}
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
export function mapToNumVal() {
    return (values) => {
        if (values === undefined || values === null) {
            return undefined;
        }
        const parsedValues = [];
        for (const value of values) {
            const parsedValue = parseNumber(value);
            if (Number.isNaN(parsedValue)) {
                return undefined;
            }
            parsedValues.push(parsedValue);
        }
        return () => parsedValues;
    };
}
export function oneOfVal(values) {
    return (value) => {
        if (values.includes(value)) {
            return () => value;
        }
        return undefined;
    };
}
export function atLeastOneVal(expectedValues) {
    return (values) => {
        const newValues = (values !== null && values !== void 0 ? values : []).filter(value => expectedValues.includes(value));
        if (newValues.length > 0) {
            return () => newValues;
        }
        return undefined;
    };
}
export function minCountVal(min) {
    return (value) => {
        if (value !== undefined && value !== null && value.length >= min) {
            return () => value;
        }
        return undefined;
    };
}
export function toNumVal() {
    return (value) => {
        const parsedValue = parseNumber(value);
        if (Number.isNaN(parsedValue)) {
            return undefined;
        }
        return () => parsedValue;
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