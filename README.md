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

For verification:

```bash
$ gdate --version
date (GNU coreutils) 8.31
Copyright (C) 2019 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Written by David MacKenzie.
```

### Installing the package

```bash
$ npm install --save at-bindings
```

## Usage


### `schedule`

```js
const { schedule } = require("at-bindings");

// Prints "hello world" in 1 minutes from now
schedule("echo hello", "+ 1 minutes")
```

**NOTE:** `schedule`'s second argument accepts `date -d`'s syntax for possible
date formats.

## FAQ 

### Why use this library over other solutions?

`at-bindings` uses the unix system's `atd` service to schedule tasks, which I
imagine to be a fairly failure-safe system.

### Is this library safe?

`at-bindings` doesn't sanitize any inputs (e.g. in the `schedule` function).
Hence, if you pass user input to it, injections may be possible. Please take
care of sanitizing your inputs! Help/feedback is appreciated.

## Changelog

### 0.0.1

- Implement `schedule` and `shift` functions

## License

MIT

## References

- [Enable `at` on Mac OS X](https://superuser.com/a/428475)
- [Overview of command posibilities with
  `at`](https://tecadmin.net/one-time-task-scheduling-using-at-commad-in-linux/)
- [Install GNU `date` through `coreutils` on Mac
  OS](https://apple.stackexchange.com/a/231227)
- [Online man page of
  `date`](https://www.man7.org/linux/man-pages/man1/date.1.html)
