// @format
const { execSync, spawnSync } = require("child_process");

// NOTE: This is the format `at` expects.
const dateFormat = "+%OI:%M %p %m/%d/%y";

// NOTE: Since Mac OS X implements a different version of date, we check for
// the user's platform here. We use coreutils's gdate when this software is
// executed on a Mac.
const dateTool = process.platform === "darwin" ? "gdate" : "date";

// WARN/TODO: We're not sanitizing any inputs here.
function shift(datetime) {
  const cmd = `${dateTool} -d "${datetime}" "${dateFormat}"`;
  return execSync(cmd).toString();
}

function schedule(cmd, dateVal) {
  const datetime = shift(dateVal);

  // TODO:
  const cmdOut = execSync(cmd);
  const scheduleOut = spawnSync("at", [datetime], { input: cmd });

  const jobPattern = new RegExp("job ([0-9]+) at (.+)");
  const [match, id, date] = scheduleOut.stderr.toString().match(jobPattern);
  return {
    id: parseInt(id, 10),
    date: {
      plain: date,
      obj: new Date(date)
    }
  };
}

module.exports = {
  schedule,
  shift
};
