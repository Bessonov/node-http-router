function parseNumber(value) {
    if (value.trim().length === 0) {
        return Number('nan');
    }
    return Number(value);
}
export function trueVal() {
    return () => ({
        match: () => true,
        parse: (value) => value,
    });
}
export function requiredVal() {
    return () => ({
        match(value) {
            return value !== undefined && value !== null;
        },
        parse(value) {
            return value;
        },
    });
}
export function getNthVal(num = 0) {
    return () => ({
        match(value) {
            return Array.isArray(value);
        },
        parse(value) {
            if (num >= 0) {
                return value[num];
            }
            const newNum = value.length + num;
            return value[newNum];
        },
    });
}
export function mapToNumVal() {
    return () => {
        const parsedValues = [];
        return {
            match(values) {
                for (const value of values) {
                    const parsedValue = parseNumber(value);
                    if (Number.isNaN(parsedValue)) {
                        return false;
                    }
                    parsedValues.push(parsedValue);
                }
                return true;
            },
            parse() {
                return parsedValues;
            },
        };
    };
}
export function oneOfVal(values) {
    return () => ({
        match: value => values.includes(value),
        parse: (value) => value,
    });
}
export function atLeastOneVal(expectedValues) {
    return () => {
        let newValues;
        return {
            match(values) {
                newValues = values.filter(value => expectedValues.includes(value));
                return newValues.length > 0;
            },
            parse() {
                return newValues;
            },
        };
    };
}
export function minCountVal(min) {
    return () => ({
        match(value) {
            return value.length >= min;
        },
        parse(value) {
            return value;
        },
    });
}
export function toNumVal() {
    return () => {
        let parsedValue;
        return {
            match(value) {
                parsedValue = parseNumber(value);
                return Number.isNaN(parsedValue) === false;
            },
            parse() {
                return parsedValue;
            },
        };
    };
}
export function chain(...validators) {
    return () => {
        let lastValidatorValue;
        return {
            match(value) {
                lastValidatorValue = value;
                for (const validatorFactory of validators) {
                    const validator = validatorFactory();
                    const match = validator.match(lastValidatorValue);
                    if (!match) {
                        return false;
                    }
                    lastValidatorValue = validator.parse(lastValidatorValue);
                }
                return true;
            },
            parse() {
                return lastValidatorValue;
            },
        };
    };
}
//# sourceMappingURL=validators.js.map