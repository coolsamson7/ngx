# Commands

Commands introduce a pattern where commands are stateful objects, that define additional meta-data
- label
- shortcut
- icon
- i18n

are stateful, by having a `enabled` state and additionaly are able to be intercepted by global command interceptors

The class needs to derive from

```ts
 WithCommands(AbstractFeature) 
```

Methods can be decorated with `@Command`

```ts
 @Command({
    i18n: 'shell:open',
    icon: "forward",
  })
  open() {
    console.log("open")
  }
```