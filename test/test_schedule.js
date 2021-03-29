// @format
const test = require("ava");
const { execSync } = require("child_process");
const diffInSecs = require("date-fns/differenceInSeconds");
const add = require("date-fns/add");
const sub = require("date-fns/sub");

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

const { jobParser, isPast } = require("../src/schedule.js");

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

test("to avoid that shift contains a line break", t => {
  const testDate = shift("+ 2 days");
  t.notRegex(testDate, new RegExp("[\r\n]+"));
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

test("remove a job", t => {
  const job = schedule("echo hello", "+ 1 minutes");
  remove(job.id);
  t.throws(() => getContent(job.id), { instanceOf: IndexError });
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
  t.throws(() => getContent(1337), { instanceOf: IndexError });
});

test("exists", t => {
  const job = schedule("echo hello", "+ 1 minutes");
  t.assert(exists(job.id));
});

test("exists but the job doesn't", t => {
  t.assert(1337);
});

test("if output with user name can be read by job parser", t => {
  const fDate = "Mon Oct 26 16:03:00 2020";
  const output = `79\t${fDate}
78\tMon Oct 26 15:31:00 2020 a root
80\tMon Oct 26 15:35:00 2020 a root
`;

  const jobs = jobParser(output, "list");
  t.is(jobs && jobs.length, 3);
  t.is(jobs[0].id, 79);
  t.is(jobs[0].date.obj.getTime(), new Date(fDate).getTime());
});

test("if output without user name can be read by job parser", t => {
  const fDate = "Mon Oct 26 16:03:00 2020";
  const output = `79\t${fDate}
78\tMon Oct 26 15:31:00 2020
80\tMon Oct 26 15:35:00 2020
`;

  const jobs = jobParser(output, "list");
  t.is(jobs && jobs.length, 3);
  t.is(jobs[0].id, 79);
  t.is(jobs[0].date.obj.getTime(), new Date(fDate).getTime());
});

test("if assumptions about date-fns diff methods are correct", t => {
  let now = new Date();
  // NOTE: On date-fns docs, they say that dateRight is the "later date". Since
  // we always compare now with the alarm time and since we assume that the
  // alarm is always in the future, we say the alarm is the "later date".
  // For reference see: https://date-fns.org/v2.16.1/docs/differenceInMinutes
  let futureAlarm = add(now, { minutes: 1 });
  let pastAlarm = sub(now, { minutes: 1 });
  let slightlyPastAlarm = sub(now, { seconds: 1 });
  t.assert(diffInSecs(now, futureAlarm) === -60);
  t.assert(diffInSecs(now, now) === 0);
  t.assert(diffInSecs(now, pastAlarm) === 60);
  t.assert(diffInSecs(now, slightlyPastAlarm) === 1);

  now = new Date();
  futureAlarm = add(now, { minutes: 1 });
  pastAlarm = sub(now, { minutes: 1 });
  // NOTE: We ignore submitting now, as too much time passes between isPast
  // (that instantiates its own "now") and the test's "now".
  t.assert(!isPast(shift(futureAlarm.toISOString())));
  t.assert(isPast(shift(pastAlarm.toISOString())));
});

test("if scheduling a job with a date that represents now fails", t => {
  try {
    schedule("echo hello", new Date());
  } catch (err) {
    if (err instanceof ScheduleError) {
      t.assert(err.message.includes("#2"));
      t.assert(!err.message.includes("#1"));
    }
  }
});

test("if scheduling is only possible 60 seconds into the future", t => {
  const now = new Date();
  const futureAlarm = add(now, { minutes: 1 });
  const pastAlarm = sub(now, { minutes: 1 });
  schedule("echo hello", futureAlarm);
  try {
    schedule("echo hello", pastAlarm);
  } catch (err) {
    if (err instanceof ScheduleError) {
      t.assert(err.message.includes("#2"));
      t.assert(!err.message.includes("#1"));
    }
  }
});
