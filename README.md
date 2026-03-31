![CI](https://github.com/coolsamson7/ngx/actions/workflows/ci.yml/badge.svg)

# NGX

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/0b7293e9-23d9-4a71-ac84-a6fdff3dff3b" />

## Overview 

NGX implements an Angular based portal framework supporting microfrontends vastly simplifying implementation efforts since a number of technical challenges every application has to solve are already part of the framework.

- centralized error handling ( including error boundaries )
- session handling
- i18n integration
- meta-data based approach required for the microfrontend logic and additional dynamic approaches

While the framework supports enterprise portals with dynamic microfrontends - and server side configuration mechanisms - as one extreme it also covers small local only applications without significant coding and rampup overhead, making it a one-size-fits-all framework.

The main architectural idea for most of the mechanisms is that modules expose meta-data of "what is inside", by annotating available "features" ( named components used internally or part of the routing ) with special decorators that can be parsed and extracted.

```ts
@Feature({
  id: 'public-navigation',
  label: 'Navigation',
  visibility: ["public"],
  features: ["feature-a"],
  permissions: []
  tags: ['portal'],
  path: '/'
})
export class PublicNavigationFeature extends AbstractFeature {
    ...
}
```

A parser - as part of the build - will locate those features and generate a manifest.json.

```ts
{
  "id": "shell",
  "label": "Shell",
  "version": "1.0.0",
  "moduleName": "ApplicationModule",
  "sourceFile": "apps/shell/src/main.tsx",
  "description": "Shell",
  "features": [
     {
      "id": "public-navigation",
      "label": "Navigation",
      "path": "",
      "visibility": [
        "public"
      ],
      "tags": [
        "portal"
      ],
      "features": [
        "feature-a"
      ],
      "permissions": [
      ],
      "component": "PublicNavigationFeature",
      "sourceFile": "apps/shell/src/PublicNavigation.tsx",
      "children": []
    },
    ...
  ],
  ...
}
```

which will be used by the framework in order to support different use-cases:
- completely dynamic generation of routes
- offering a `<feature-outlet>` component that can render features by name
- dynamic assembly of navigation possibilities ( menus, etc. ) based on the meta-data
- integration of federated modules contributing additional features

Several application styles are supported with this architecture:
- Applications with local only features 
- Applications that support federated modules based on client-side fetching of the corresponding manifests
- Applications that support federated modules based on a server-computed overall manifest.

The third point is the most flexible and powerfull approach by having server side components that control the complete configuration
of a portal with respect to the number of associated modules and any filtering- and configuration-logic respecting authorization and feture-flag aspects. 

## Monorepo Setup

NGX is split in individual packages

- [common](https://github.com/coolsamson7/ngx/tree/main/libs/core#readme) utility functions
- [i18n](https://github.com/coolsamson7/ngx/tree/main/libs/i18n#readme) a lightweight i18n solution
- [security](https://github.com/coolsamson7/ngx/tree/main/libs/security#readme) authentication & session handling
- [portal](https://github.com/coolsamson7/ngx/tree/main/libs/portal#readme) the meta-data microfrontend framework 

## Wiki

Check the corresponding [Wiki](https://github.com/coolsamson7/ngx/wiki) for more detailed information.

## API Docs

The overall API docs can be found [here](http://ernstandreas.de/ngx/)
