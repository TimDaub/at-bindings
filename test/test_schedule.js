// @format
const test = require("ava");

const { shift, schedule, list } = require("../src/schedule");

test("shift", t => {
  t.throws(() => shift());
  const testDate = shift("+ 2 days");
  // NOTE: I trust date's output. Hence I just wanted to check if the format is
  // correct. I don't wanna match on the correctness of the date, as that
  // becomes unsetteling really fast:
  // https://stackoverflow.com/questions/15491894/regex-to-validate-date-format-dd-mm-yyyy
  t.regex(
    testDate,
    new RegExp("[0-9][0-9]:[0-9][0-9] (AM|PM) [0-9][0-9]/[0-9][0-9]/[0-9][0-9]")
  );
});

test("schedule", async t => {
  const job = schedule("echo hello", "+ 1 minutes");
  t.assert(typeof job.id === "number");
  t.assert(typeof job.date.plain === "string");
  t.assert(typeof job.date.obj === "object");
});

test("list", t => {
  // TODO: What if there's are no jobs
  const jobs = list();
  t.assert(Array.isArray(jobs));
  if (jobs.length > 0) {
    t.assert(typeof jobs[0].id === "number");
    t.assert(typeof jobs[0].date.plain === "string");
    t.assert(typeof jobs[0].date.obj === "object");
  }
});
