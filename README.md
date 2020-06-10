# at-bindings

> A bindings library for datetime-based task scheduling on POSIX operating
> systems.

## Requirements

- Run on POSIX/UNIX operating system

## Installation

### Mac OS X Prerequisites

Unfortunately, Mac OS X's `date` utility exposes a different API than its GNU
counterpart. For this tool, I went with supporting the GNU version. On a Mac,
this means you'll have to do the following

1. [Enable `at` on Mac OS X](https://superuser.com/a/428475)
2. [Install GNU `date` through `coreutils`](https://apple.stackexchange.com/a/231227)
3. Set an alias `alias date=gdate`

For verification:

```bash
$ date --version
date (GNU coreutils) 8.31
Copyright (C) 2019 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Written by David MacKenzie.
```

### Installing the package

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

## References

- [Enable `at` on Mac OS X](https://superuser.com/a/428475)
- [Overview of command posibilities with
  `at`](https://tecadmin.net/one-time-task-scheduling-using-at-commad-in-linux/)
- [Install GNU `date` through `coreutils` on Mac
  OS](https://apple.stackexchange.com/a/231227)
