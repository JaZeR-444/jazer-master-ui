# Patterns

This directory contains JavaScript implementations of common design patterns.

## Files

- `factory-pattern.js` - Implementation of the Factory pattern
- `observer-pattern.js` - Implementation of the Observer pattern
- `singleton-pattern.js` - Implementation of the Singleton pattern
- `mediator-proxy-command.js` - Implementations of Mediator, Proxy, and Command patterns
- `builder-observer-strategy.js` - Implementations of Builder, enhanced Observer, and Strategy patterns

## Usage

To use these patterns, import the specific implementation you need:

```javascript
import { Singleton } from './patterns/singleton-pattern.js';

const instance = Singleton.getInstance();
```