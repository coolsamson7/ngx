import "reflect-metadata"

import { TypeDescriptor } from "./type-descriptor"
import { Type } from "@angular/core"

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-empty-function
const typeDecorator = (): any => {
    return function create(target: Type<any>) {
        TypeDescriptor.forType(target).addTypeDecorator(typeDecorator)
    }
}

const methodDecorator = (test: string) :any => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    return (target: any, property: string, descriptor: PropertyDescriptor) => {
        TypeDescriptor.forType(target.constructor).addMethodDecorator(target, property, methodDecorator, test)
    }
}

const propertyDecorator = (): any => {
    return function (target: any, propertyKey: string) {
        TypeDescriptor.forType(target.constructor).addPropertyDecorator(target, propertyKey, propertyDecorator)
    }
}

@typeDecorator()
class Base {
    @methodDecorator("base")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    basebar(): void {}
}

@typeDecorator()
class Test extends Base {
    @propertyDecorator()
    id = ""

    @methodDecorator("test")
    async foo(): Promise<string> {
        return Promise.resolve("")
    }
    @methodDecorator("test")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    bar(): void {}
}

describe("TypeDescriptor", () => {
    it("should analyze", () => {
        const baseDescriptor = TypeDescriptor.forType(Base)
        const descriptor = TypeDescriptor.forType(Test)

        const test = descriptor.create()

        expect(test).toBeDefined()
        expect(test.id).toBeDefined()
    })

    it("should analyze", () => {
        const descriptor = TypeDescriptor.forType(Test)

        console.log(descriptor.toString())

        expect(descriptor.typeDecorators.length).toBe(1)
        expect(descriptor.typeDecorators[0]).toBe(typeDecorator)

        expect(descriptor.getMethods().length).toBe(3)

        const foo = descriptor.getMethod("foo")!

        expect(foo.decorators.length).toBe(1)
        expect(foo.decorators[0].decorator).toBe(methodDecorator)

        //expect(descriptor.getProperties().length).toBe(1)

        //expect(descriptor.getField("id")!!.decorators.length).toBe(1)
        //expect(descriptor.getField("id")!!.decorators[0]).toBe(propertyDecorator)

        //

        //const baz = descriptor.getMethod("baz")
        //expect(baz!!.async).toBe(true)
    })
})
