export class BooleanMatcher {
    constructor(value) {
        this.value = value;
        this.match = this.match.bind(this);
    }
    match() {
        if (this.value) {
            return {
                matched: true,
                result: true,
            };
        }
        return {
            matched: false,
        };
    }
}
export function bool(value) {
    return new BooleanMatcher(value);
}
//# sourceMappingURL=BooleanMatcher.js.map