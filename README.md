# at-bindings

> A bindings library for datetime-based task scheduling on POSIX operating
> systems.

## Requirements

- Run on POSIX/UNIX operating system

## Installation

[wip]

```bash
$ npm install --save at-bindings
```

## Usage

### `shifted`

```js
const { shifted } = require("at-bindings")

# Prints "hello world" in 2 minutes from now
shifted("echo 'hello world'", "now + 2 minutes")
```

## Changelog

### 0.0.1

- Added `shifted` method

## License

MIT
