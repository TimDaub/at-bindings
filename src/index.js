// @format
const { exec, execSync } = require("child_process");

// NOTE: This is the format `at` expects.
const dateFormat = "+%OI:%M %p %D";

// NOTE: Since Mac OS X implements a different version of date, we check for
// the user's platform here. We use coreutils's gdate when this software is
// executed on a Mac.
const dateTool = process.platform === "darwin" ? "gdate" : "date";

function shift(datetime) {
  const cmd = `${dateTool} -d "${datetime}" "${dateFormat}"`;
  return execSync(cmd).toString();
}


function shifted(cmd, dateVal) {
  const datetime = shift(dateVal);

  return new Promise((resolve, reject) => {
    exec(`${cmd} | at ${datetime}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

module.exports = {
  shifted
}
