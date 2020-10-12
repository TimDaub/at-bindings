# at-bindings

[![npm version](https://badge.fury.io/js/at-bindings.svg)](https://badge.fury.io/js/at-bindings)

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

### `schedule(command, dateVal)`

```js
const { schedule } = require("at-bindings");

// Prints "hello world" in 1 minutes from now
const job = schedule("echo hello", "+ 1 minutes")
console.log(job);

{
  id: 141,
  date: { plain: '2020-06-24T13:25:00.000Z', obj: 2020-06-11T09:31:00.000Z }
}
```

**NOTE:** `schedule`'s second argument (`dateVal`) accepts `date -d`'s syntax
for possible date formats.

#### `schedule` throws...

- `ScheduleError` when the input date is in the past.

### `list()`

```js
const { list } = require("at-bindings");

// Lists all jobs currently scheduled on the system
const jobs = list();
console.log(jobs);

[{
  id: 141,
  date: { plain: '2020-06-24T13:25:00.000Z', obj: 2020-06-11T09:31:00.000Z }
}]
```

### `remove(jobId)`

```js
const { remove } = require("at-bindings");

// Removes a job for a given id
remove(1234);
```

**NOTE:** Function throws `IndexError` if jobId wasn't found.

### `getContent(jobId)`

```js
const { getContent } = require("at-bindings");

const content = getContent(1);
console.log(content);

> #!/bin/sh
> # atrun uid=501 gid=20
> ...
```

### `exists(jobId)`

```js
const { exists, schedule } = require("at-bindings");

const res = exists(schedule("echo hello", "+ 1 minutes").id);
console.log(res);

> true

console.log(exists(1337));

> false
```

### Custom Error Types

`at-binding` extends JavaScript with two custom errors. To match them e.g.
with `instanceof`, they can be imported using:

```js
const { ScheduleError, IndexError } = require("at-bindings");
```

## FAQ 

### Why use this library over other solutions?

`at-bindings` uses the unix system's `atd` service to schedule tasks, which I
imagine to be a fairly failure-safe system.

### Is this library safe?

`at-bindings` doesn't sanitize any inputs (e.g. in the `schedule` function).
Hence, if you pass user input to it, injections may be possible. Please take
care of sanitizing your inputs! Help/feedback is appreciated.

## Changelog

### 0.2.1

- Export `IndexError`

### 0.2.0

- `remove(jobId)` now throws an `IndexError` on non-existent jobs

### 0.1.2

- Add `exists(jobId)` function
- Add `getContent(jobId)` function
- Added more tests
- Documented all functions in README.md

### 0.1.1

- Add `remove(jobId)` function 

### 0.1.0

- job object of `list` and `schedule` now returns a `job.date.plain` as a
  [ISO8601
  string](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString).

### 0.0.4

- Add `ScheduleError` to interrupt on dates schedules in the past.

### 0.0.3

- Fix problem with `schedule`. Command argument was executed twice.

### 0.0.2

- Implement `list` function

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
