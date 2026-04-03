import { Inject, Injectable, Injector, Type } from "@angular/core";
import { UIHandler } from "./ui-handler";
import { UI_HANDLER_TYPES } from "./ui.tokens";
import { UIRequest } from "./ui-request";

@Injectable() 
export class UIExecutor {
    private handlerMap = new Map<Type<any>, UIHandler<any>>();

    constructor(
      private injector: Injector,
      @Inject(UI_HANDLER_TYPES)
      handlerTypes: Type<UIHandler<any>>[][]
    ) {
      const flat = handlerTypes.flat();

      for (const type of flat) {
        const instance = this.injector.get(type);

        // Map request type → handler
        
        this.handlerMap.set(instance.type, instance);
      }
    }

    render<T extends UIRequest<any>>(request: T): T extends UIRequest<infer R> ? R : never {
      const handler = this.handlerMap.get(
        request.constructor as Type<any>
      );

      if (!handler) {
        throw new Error(
          `No handler for ${request.constructor.name}`
        );
      }

      return handler.handle(request) as T extends UIRequest<infer R> ? R : never;
    }
  }