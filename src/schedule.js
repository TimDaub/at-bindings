// @format
const { execSync, spawnSync } = require("child_process");

// NOTE: This is the format `at` expects.
const dateFormat = "+%OI:%M %p %m/%d/%y";

// NOTE: Since Mac OS X implements a different version of date, we check for
// the user's platform here. We use coreutils's gdate when this software is
// executed on a Mac.
const dateTool = process.platform === "darwin" ? "gdate" : "date";

class ScheduleError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ScheduleError";
  }
}

// WARN/TODO: We're not sanitizing any inputs here.
function shift(datetime) {
  const cmd = `${dateTool} -d "${datetime}" "${dateFormat}"`;
  return execSync(cmd).toString();
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
      pattern = new RegExp("^([0-9]+)\t(.*)$", "gm");
      res = [...output.matchAll(pattern)];
      res = res.map(([_, id, date]) => {
        return {
          id: parseInt(id, 10),
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

function schedule(cmd, dateVal) {
  const datetime = shift(dateVal);

  // NOTE: Using a pipe with spawn: https://stackoverflow.com/a/39482554
  const scheduleOut = spawnSync("sh", [
    "-c",
    `echo "${cmd}" | at ${datetime}`
  ]).stderr.toString();

  // NOTE: Potential error messages can contains carriage returns, so we're
  // trimming the strings here.
  if (scheduleOut.trim() === "at: trying to travel back in time".trim()) {
    throw new ScheduleError("schedule expectes a datetime in the future");
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
  execSync(`at -r ${jobId}`).toString();
}

module.exports = {
  schedule,
  shift,
  list,
  remove,
  ScheduleError
};
