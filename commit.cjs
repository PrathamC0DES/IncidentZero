const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Realistic commit message components
const COMMIT_TYPES = [
  {
    prefix: "feat",
    scopes: ["auth", "api", "ui", "core", "router", "config", "hooks", "store", "client"],
    templates: [
      "add validation middleware for incoming payloads",
      "implement responsive layout adjustments",
      "add pagination support to listing endpoint",
      "support custom environment variable overrides",
      "integrate optimistic update on state change",
      "add retry mechanism with exponential backoff",
      "introduce configurable timeout settings",
      "add health-check endpoint and telemetry",
      "implement search filter debounce handler",
      "support export to formatted JSON and CSV",
      "add dark mode theme transition support",
      "implement error boundary fallback screen",
      "add event emitter for background lifecycle hooks"
    ]
  },
  {
    prefix: "fix",
    scopes: ["auth", "api", "db", "validation", "parser", "layout", "utils", "session"],
    templates: [
      "resolve race condition in async handler",
      "handle null and undefined edge cases safely",
      "prevent duplicate event listeners on remount",
      "fix off-by-one error in pagination calculation",
      "correct typo in environment variable resolution",
      "prevent memory leak when unmounting subscriber",
      "resolve layout shift during initial hydration",
      "fix token expiration refresh cycle",
      "handle network timeout error gracefully",
      "correct regex pattern for input sanitization",
      "patch header encoding issue in request headers",
      "fix broken deep-link routing on mobile viewports",
      "ensure cursor resets properly after modal closes"
    ]
  },
  {
    prefix: "refactor",
    scopes: ["core", "utils", "components", "helpers", "services", "models"],
    templates: [
      "simplify nested conditional logic in controller",
      "extract reusable utility functions into shared module",
      "streamline state update pipeline",
      "modernize legacy promise chain with async/await",
      "decouple business logic from UI presentation",
      "consolidate duplicate helper methods",
      "restructure folder hierarchy for cleaner imports",
      "clean up redundant type assertions and guards",
      "improve modularity of service layer abstractions"
    ]
  },
  {
    prefix: "perf",
    scopes: ["render", "queries", "cache", "bundle", "assets"],
    templates: [
      "memoize expensive computation in render loop",
      "optimize asset loading with dynamic imports",
      "add local memory cache for frequent queries",
      "reduce bundle footprint by pruning unused dependencies",
      "optimize batch DOM updates using requestAnimationFrame",
      "streamline database query projections",
      "defer non-critical script loading until idle"
    ]
  },
  {
    prefix: "docs",
    scopes: ["readme", "api", "setup", "contributing"],
    templates: [
      "update setup and configuration instructions in README",
      "clarify prerequisites and environment requirements",
      "document newly added utility functions with examples",
      "fix typos and dead links across documentation",
      "add API reference details for query parameters",
      "add troubleshooting tips for local development"
    ]
  },
  {
    prefix: "style",
    scopes: ["", "theme", "css"],
    templates: [
      "format codebase according to prettier rules",
      "normalize indentation and remove trailing whitespace",
      "adjust padding and margin consistency across cards",
      "align button typography with design system tokens"
    ]
  },
  {
    prefix: "chore",
    scopes: ["deps", "build", "release", "ci", "config"],
    templates: [
      "update dependencies to latest compatible patch versions",
      "clean up unused configuration artifacts",
      "update gitignore and exclude temporary build files",
      "bump package version and refresh lockfile",
      "streamline npm build scripts and runner flags"
    ]
  },
  {
    prefix: "test",
    scopes: ["unit", "e2e", "integration"],
    templates: [
      "add unit test coverage for edge case scenarios",
      "update snapshot tests to reflect recent UI changes",
      "add integration test for authentication flow",
      "mock external network calls in test suite"
    ]
  }
];

// Natural title-case commit messages for extra realism
const NATURAL_MESSAGES = [
  "Update error handling in response pipeline",
  "Refactor helper utilities for cleaner syntax",
  "Improve fallback logic when network is unreachable",
  "Fix minor alignment issue on smaller screens",
  "Optimize initial load time and script execution",
  "Clean up obsolete debug logs and comments",
  "Ensure consistent casing across route identifiers",
  "Add safety check before accessing nested properties",
  "Improve accessibility labels and aria attributes",
  "Update configuration defaults for development mode"
];

function generateCommitMessage() {
  const useNatural = Math.random() < 0.25;
  if (useNatural) {
    return NATURAL_MESSAGES[Math.floor(Math.random() * NATURAL_MESSAGES.length)];
  }

  const group = COMMIT_TYPES[Math.floor(Math.random() * COMMIT_TYPES.length)];
  const template = group.templates[Math.floor(Math.random() * group.templates.length)];
  const useScope = group.scopes.length > 0 && Math.random() < 0.6;
  const scope = useScope ? group.scopes[Math.floor(Math.random() * group.scopes.length)] : "";

  if (scope) {
    return `${group.prefix}(${scope}): ${template}`;
  }
  return `${group.prefix}: ${template}`;
}

function generateDayTimestamps(dateStr, count) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const timestamps = [];

  const startMinute = 9 * 60 + 15; // 09:15 AM
  const endMinute = 22 * 60 + 30;   // 10:30 PM
  const totalMinutes = endMinute - startMinute;

  const totalSecondsList = [];
  for (let i = 0; i < count; i++) {
    const fraction = count === 1 ? Math.random() * 0.8 + 0.1 : (i + 0.2 + Math.random() * 0.6) / count;
    const minuteOfDay = startMinute + Math.floor(fraction * totalMinutes);
    const secondOfMinute = Math.floor(Math.random() * 60);
    totalSecondsList.push(minuteOfDay * 60 + secondOfMinute);
  }

  // Strictly ascending timestamps
  totalSecondsList.sort((a, b) => a - b);

  for (const totalSec of totalSecondsList) {
    const minute = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hours = Math.floor(minute / 60);
    const mins = minute % 60;

    const pad = (n) => String(n).padStart(2, "0");
    const isoString = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    timestamps.push(isoString);
  }

  return timestamps;
}

function runGit(cmd, env = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    throw new Error(`Git command failed: ${cmd}\n${stderr}`);
  }
}

async function makeCommits({
  dates = [],
  count = 3,
  dataFile = "data.json",
  push = false,
  chance = 1.0,
  silent = false
} = {}) {
  if (!dates || dates.length === 0) {
    console.log("No dates provided.");
    return { totalCommits: 0 };
  }

  try {
    runGit("git rev-parse --is-inside-work-tree");
  } catch {
    throw new Error("Current directory is not a Git repository. Run 'git init' first.");
  }

  const filePath = path.resolve(process.cwd(), dataFile);
  let totalCommits = 0;

  for (const dateStr of dates) {
    if (chance < 1.0 && Math.random() > chance) {
      if (!silent) console.log(`Skipping date: ${dateStr} (random probability)`);
      continue;
    }

    const dailyCount = typeof count === "object"
      ? Math.floor(Math.random() * (count.max - count.min + 1)) + count.min
      : count;

    if (dailyCount <= 0) continue;

    const timestamps = generateDayTimestamps(dateStr, dailyCount);

    if (!silent) {
      console.log(`\n📅 Making ${dailyCount} commit(s) for ${dateStr}...`);
    }

    for (let i = 0; i < dailyCount; i++) {
      const timestamp = timestamps[i];
      const message = generateCommitMessage();

      const payload = {
        lastCommit: timestamp,
        buildNumber: Math.floor(Date.now() / 1000) + totalCommits,
        hash: Math.random().toString(36).substring(2, 10),
        activity: {
          timestamp,
          message,
          index: i + 1,
          totalForDay: dailyCount
        }
      };

      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");

      runGit(`git add "${dataFile}"`);
      runGit(`git commit -m "${message}" --date="${timestamp}"`, {
        GIT_AUTHOR_DATE: timestamp,
        GIT_COMMITTER_DATE: timestamp
      });

      totalCommits++;
      if (!silent) {
        console.log(`  [${i + 1}/${dailyCount}] ${timestamp.substring(11)} -> "${message}"`);
      }
    }
  }

  if (push) {
    if (!silent) console.log("\n🚀 Pushing commits to remote repository...");
    runGit("git push");
    if (!silent) console.log("✅ Successfully pushed to remote!");
  }

  if (!silent) {
    console.log(`\n🎉 Done! Created ${totalCommits} realistic commit(s) across ${dates.length} date(s).`);
  }

  return { totalCommits };
}

function generateDateRange(startDateStr, endDateStr, skipWeekends = false) {
  const dates = [];
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (!skipWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Generate a sorted list of random past dates
 * Supports optional specific month 'YYYY-MM'
 */
function generateRandomDates(numDates = 7, daysBack = 60, targetMonth = null) {
  const dateSet = new Set();
  const today = new Date();

  if (targetMonth) {
    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let attempts = 0;
    const maxDays = Math.min(numDates, daysInMonth);
    while (dateSet.size < maxDays && attempts < 500) {
      attempts++;
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const d = new Date(year, month, day);
      if (d > today) continue; // Don't pick future dates
      const dayOfWeek = d.getDay();
      if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.7) {
        continue;
      }
      const pad = (n) => String(n).padStart(2, "0");
      dateSet.add(`${year}-${pad(month + 1)}-${pad(day)}`);
    }
    return Array.from(dateSet).sort();
  }

  let attempts = 0;
  while (dateSet.size < numDates && attempts < 500) {
    attempts++;
    const randomDaysAgo = Math.floor(Math.random() * daysBack) + 1;
    const d = new Date(today);
    d.setDate(today.getDate() - randomDaysAgo);
    const dayOfWeek = d.getDay();
    // 70% chance to skip weekend for realism
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.7) {
      continue;
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dateSet.add(`${year}-${month}-${day}`);
  }

  return Array.from(dateSet).sort();
}

function parseArgs(args) {
  const parsed = {
    dates: [],
    start: null,
    end: null,
    month: null,
    count: null,
    min: 1,
    max: 4,
    push: false,
    file: "data.json",
    skipWeekends: false,
    chance: 1.0,
    random: false,
    randomCount: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--push" || arg === "-p") parsed.push = true;
    else if (arg === "--skip-weekends") parsed.skipWeekends = true;
    else if (arg === "--month" || arg === "-m") parsed.month = args[++i];
    else if (arg === "--random" || arg === "-r") {
      parsed.random = true;
      if (args[i + 1] && !args[i + 1].startsWith("-") && !isNaN(Number(args[i + 1]))) {
        parsed.randomCount = parseInt(args[++i], 10);
      }
    }
    else if (arg === "--date" || arg === "-d") parsed.dates.push(args[++i]);
    else if (arg === "--dates") parsed.dates = args[++i].split(",").map(s => s.trim());
    else if (arg === "--start" || arg === "-s") parsed.start = args[++i];
    else if (arg === "--end" || arg === "-e") parsed.end = args[++i];
    else if (arg === "--count" || arg === "-c") parsed.count = parseInt(args[++i], 10);
    else if (arg === "--min") parsed.min = parseInt(args[++i], 10);
    else if (arg === "--max") parsed.max = parseInt(args[++i], 10);
    else if (arg === "--chance") parsed.chance = parseFloat(args[++i]);
    else if (arg === "--file" || arg === "-f") parsed.file = args[++i];
  }

  return parsed;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Genuine Git Commit Generator
============================
Easily generate realistic-looking commit activity on multiple dates.
Zero dependencies needed - can be copied and run in any Git repository!

Usage Examples:
  1. Fully Random (random dates + random commit amounts):
     node commit.cjs --random --min 1 --max 4 --push

  2. Specific Date with 5 commits:
     node commit.cjs --date 2026-03-15 --count 5

  3. Multiple Specific Dates:
     node commit.cjs --dates 2026-03-01,2026-03-05,2026-03-10 --min 2 --max 5

  4. Date Range (from start to end):
     node commit.cjs --start 2026-02-01 --end 2026-02-28 --min 1 --max 4 --chance 0.75

Options:
  --month, -m <YYYY-MM>        Target a specific month (e.g. 2026-08)
  --random, -r [numDates]      Generate random dates (works with --month too)
  --date, -d <YYYY-MM-DD>      Single date to commit on
  --dates <D1,D2,...>          Comma-separated dates list
  --start, -s <YYYY-MM-DD>     Start of date range
  --end, -e <YYYY-MM-DD>       End of date range
  --count, -c <number>         Exact number of commits per date
  --min <number>               Minimum commits per date (default: 1)
  --max <number>               Maximum commits per date (default: 4)
  --chance <0.0 - 1.0>         Probability of committing on each day (default: 1.0)
  --skip-weekends              Only commit Monday through Friday
  --push, -p                   Run 'git push' after finishing commits
  --file, -f <filepath>        Target file to update (default: data.json)
  --help, -h                   Show this help screen
`);
    process.exit(0);
  }

  let finalDates = [];
  if (args.month) {
    // If user specified --month YYYY-MM
    // e.g. --month 2026-08 (all days or random days in that month)
    const [yearStr, monthStr] = args.month.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const pad = (n) => String(n).padStart(2, "0");

    if (args.random) {
      const numDates = args.randomCount || Math.floor(Math.random() * 5) + 5;
      finalDates = generateRandomDates(numDates, 60, args.month);
    } else {
      const start = `${year}-${pad(month + 1)}-01`;
      const end = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;
      finalDates = generateDateRange(start, end, args.skipWeekends);
    }
  } else if (args.random) {
    const numDates = args.randomCount || Math.floor(Math.random() * 5) + 5; // 5 to 9 dates
    finalDates = generateRandomDates(numDates, 60);
  } else if (args.start && args.end) {
    finalDates = generateDateRange(args.start, args.end, args.skipWeekends);
  } else if (args.dates.length > 0) {
    finalDates = args.dates;
  } else {
    // If no args provided, default to random
    console.log("No dates specified. Running in automatic random mode...");
    const numDates = Math.floor(Math.random() * 4) + 4; // 4 to 7 dates
    finalDates = generateRandomDates(numDates, 45);
  }

  const commitCount = args.count ? args.count : { min: args.min, max: args.max };

  makeCommits({
    dates: finalDates,
    count: commitCount,
    dataFile: args.file,
    push: args.push,
    chance: args.chance
  }).catch(err => {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  });
}

module.exports = {
  makeCommits,
  generateCommitMessage,
  generateDayTimestamps,
  generateDateRange,
  generateRandomDates
};
