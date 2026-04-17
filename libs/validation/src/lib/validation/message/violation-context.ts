import { TypeViolation } from "../type"

export interface ViolationContext {
    label: string
    violation: TypeViolation
    violations: TypeViolation[]
}
