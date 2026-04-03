import { Injector } from '@angular/core';
import { ModuleMetadata } from './module-metadata.interface';
import { AbstractModule } from './abstract-module';
import { ModuleRegistry } from './module-registry';

export class AbstractPackage<M extends ModuleMetadata = ModuleMetadata> extends AbstractModule() implements ModuleMetadata
{
  // instance data

  public config: M;

  // metadata properties copied from config

  public isLoaded: boolean;
  public commitHash: string;
  public name: string;
  public type: "shell" | "microfrontend" | "library";
  public version: string;

  // constructor

  constructor(injector: Injector) {
    super(injector);

    // read metadata from decorator

    this.config = Reflect.get(this.constructor, "$$metadata");

    // assign instance properties from config

    this.isLoaded = this.config.isLoaded ?? false;
    this.commitHash = this.config.commitHash ?? "";
    this.name = this.config.name;
    this.type = this.config.type ?? "library";
    this.version = this.config.version ?? "?";

    // register self in the ModuleRegistry

    injector.get(ModuleRegistry).register(this as ModuleMetadata);
  }
}
