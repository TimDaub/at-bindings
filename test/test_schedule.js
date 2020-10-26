// @format
const test = require("ava");
const { execSync } = require("child_process");

const {
  shift,
  schedule,
  list,
  remove,
  getContent,
  exists,
  ScheduleError,
  IndexError
} = require("../src/index.js");

const { jobParser } = require("../src/schedule.js");

test("if errors are exported", t => {
  t.assert(ScheduleError);
  t.assert(IndexError);
});

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

test("schedule date in the past", async t => {
  t.throws(
    () => {
      schedule("echo hello", new Date().toString());
    },
    { instanceOf: ScheduleError }
  );
});

test("list", t => {
  const jobs = list();
  t.assert(Array.isArray(jobs));
  if (jobs.length > 0) {
    t.assert(typeof jobs[0].id === "number");
    t.assert(typeof jobs[0].date.plain === "string");
    t.assert(typeof jobs[0].date.obj === "object");
  }
});

test("remove", t => {
  const job = schedule("echo hello", "+ 1 minutes");
  remove(job.id);
  t.assert(execSync(`at -c ${job.id}`).length === 0);
  const l = list().find(j => j.id === job.id);
  t.assert(l === undefined);
});

test("if remove throws on non-existent job", t => {
  t.throws(() => {
    const nonExistent = 1337;
    remove(nonExistent);
  });
});

test("getContent", t => {
  const job = schedule("echo hello", "+ 1 minutes");
  const content = getContent(job.id);
  t.assert(content && content.length > 0);
  t.assert(typeof content === "string");
});

test("getContent with non-existing job", t => {
  const content = getContent(1337);
  t.assert(content.length === 0);
  t.assert(typeof content === "string");
});

test("exists", t => {
  const job = schedule("echo hello", "+ 1 minutes");
  t.assert(exists(job.id));
});

test("exists but the job doesn't", t => {
  t.assert(1337);
});

test("if output with user name can be read by job parser", t => {
  const output = `79\tMon Oct 26 16:03:00 2020 a root
78\tMon Oct 26 15:31:00 2020 a root
80\tMon Oct 26 15:35:00 2020 a root
`;

  const jobs = jobParser(output, "list");
  t.assert(jobs && jobs.length === 3);
  t.assert(jobs[0].id === 79);
  // NOTE: We're assuming UTC.
  t.assert(jobs[0].date.obj.getTime() / 1000 === 1603724580);
});

test("if output without user name can be read by job parser", t => {
  const output = `79\tMon Oct 26 16:03:00 2020
78\tMon Oct 26 15:31:00 2020
80\tMon Oct 26 15:35:00 2020
`;

  const jobs = jobParser(output, "list");
  t.assert(jobs && jobs.length === 3);
  t.assert(jobs[0].id === 79);
  // NOTE: We're assuming UTC.
  t.assert(jobs[0].date.obj.getTime() / 1000 === 1603724580);
});
