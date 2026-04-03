import { UIRequest } from "./ui-request";

export interface UIHandler<T extends UIRequest<any>> {
  type: new (...args: any[]) => T;

  handle(request: T): T extends UIRequest<infer R> ? R : never;
}