// @format
const { exec } = require("child_process");

/*
 * Parameters definition
 *
 * - *cmd*: The command to be executed at a certain datetime
 * - *shift*: A time relative to the time the function is invoked. As its using
 *   at's syntax, see at's manual page:
 *
 *     Time can also be specified as: [now] + count time-units, where the
 *     time-units can be minutes, hours, days, weeks, months or years and at
 *     may be told to run the job today by suffixing the time with today and to
 *     run the job tomorrow by suf- fixing the time with tomorrow.
 */

function shifted(cmd, shift) {
  return new Promise((resolve, reject) => {
    exec(`${cmd} | at ${shift}`, (err, stdout, stderr) => {
      if (err) {
        console.warn(err);
        reject(err);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

module.exports = {
  shifted
}
