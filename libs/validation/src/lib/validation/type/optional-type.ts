import { Type } from "./type"
import { ValidationContext } from "../validation-context"

export class OptionalType<T> extends Type<T | undefined> {
    constructor(public inner: Type<T>, name?: string) {
        super(name ?? "optional " + inner.name)
    }

    override check(object: T | undefined, context: ValidationContext) {
        // ✅ undefined → skip validation completely
        //if (object === undefined) return

        // delegate to inner type
        this.inner.check(object!, context)
    }
}

export const optional = <T>(type: Type<T>, name?: string) =>
    new OptionalType(type, name)