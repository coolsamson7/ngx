import "reflect-metadata"

window.addEventListener('beforeunload', (e) => {
  const err = new Error('PAGE UNLOAD STACK TRACE')
    console.error(err.stack)
  debugger  // ← will pause execution so you can see the stack
})

import('./bootstrap').catch(err => console.error(err));