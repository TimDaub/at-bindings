// @format
const { execSync, spawnSync } = require("child_process");
const diffInSecs = require("date-fns/differenceInSeconds");
const parse = require("date-fns/parse");

// NOTE: This is the format `at` expects.
const dateFormat = "+%OI:%M %p %m/%d/%y";

// NOTE: Since Mac OS X implements a different version of date, we check for
// the user's platform here. We use coreutils's gdate when this software is
// executed on a Mac.
const dateTool = process.platform === "darwin" ? "gdate" : "date";

class ScheduleError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScheduleError);
    }

    this.name = "ScheduleError";
  }
}

class IndexError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IndexError);
    }

    this.name = "IndexError";
  }
}

// WARN/TODO: We're not sanitizing any inputs here.
function shift(datetime) {
  const cmd = `${dateTool} -d "${datetime}" "${dateFormat}"`;
  return execSync(cmd)
    .toString()
    .trim();
}

function jobParser(output, type) {
  let pattern, res;

  switch (type) {
    case "create":
      pattern = new RegExp("job ([0-9]+) at (.+)");
      const [_, id, date] = output.match(pattern);
      res = {
        id: parseInt(id, 10),
        date: {
          plain: new Date(date).toISOString(),
          obj: new Date(date)
        }
      };
      break;
    case "list":
      // NOTE: In some cases, the OS also displays which user has scheduled a
      // task, which is usually appended with e.g. "as root". We account for
      // this in the following regexp:
      pattern = new RegExp("^([0-9]+)\t(.+?)(?= a |$)", "gm");
      res = [...output.matchAll(pattern)];
      res = res.map(([_, id, date]) => {
        return {
          id: parseInt(id, 10),
          // NOTE: By taking our parsed string date here and casting it to a
          // JS date without an information about a timezone, we implicitly
          // assume the machine's timezone configuration here.
          date: { plain: new Date(date).toISOString(), obj: new Date(date) }
        };
      });
      break;
    default:
      throw new Error("jobParser expects type to be 'create' or 'list'");
      break;
  }

  return res;
}

function isPast(datetime) {
  const jsDate = parse(datetime, "hh:mm a MM/dd/yy", new Date());
  const diff = diffInSecs(new Date(), jsDate);
  return diff >= 0;
}

function schedule(cmd, dateVal) {
  const datetime = shift(dateVal);
  if (isPast(datetime)) {
    throw new ScheduleError("schedule expectes a datetime in the future (#2)");
  }

  // NOTE: Using a pipe with spawn: https://stackoverflow.com/a/39482554
  const scheduleOut = spawnSync("sh", [
    "-c",
    `echo "${cmd}" | at ${datetime}`
  ]).stderr.toString();

  // NOTE: Potential error messages can contains carriage returns, so we're
  // trimming the strings here.
  if (scheduleOut.trim() === "at: trying to travel back in time".trim()) {
    throw new ScheduleError("schedule expectes a datetime in the future (#1)");
  }

  const job = jobParser(scheduleOut, "create");
  return job;
}

function list() {
  const out = execSync("at -l").toString();
  const jobs = jobParser(out, "list");
  return jobs;
}

function remove(jobId) {
  // NOTE: We check if the job exists as we'd like to provide a unified user
  // experience. By default, UNIX and Mac OS react differently to a non-
  // existing jobs.  UNIX exits the process with an error, Mac OS doesn't.
  if (exists(jobId)) {
    execSync(`at -r ${jobId}`).toString();
  } else {
    throw new IndexError(`Job with id: "${jobId}" doesn't exist`);
  }
}

function getContent(jobId) {
  let content;

  try {
    content = execSync(`at -c ${jobId}`).toString();
  } catch (err) {
    if (err.toString().includes(`Cannot find jobid ${jobId}`)) {
      throw new IndexError(`Job with id: "${jobId}" doesn't exist`);
    }
  }

  if (!content) {
    throw new IndexError(`Job with id: "${jobId}" doesn't exist`);
  }

  return content;
}

function exists(jobId) {
  return list().find(job => job.id === jobId) !== undefined;
}

module.exports = {
  schedule,
  shift,
  list,
  remove,
  getContent,
  exists,
  ScheduleError,
  IndexError,
  jobParser,
  isPast
};
