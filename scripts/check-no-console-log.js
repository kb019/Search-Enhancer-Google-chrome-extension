const fs = require("fs");

const files = process.argv.slice(2);
const consoleLogPattern = /\bconsole\.log\s*\(/;
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (consoleLogPattern.test(line)) {
      failures.push(`${file}:${index + 1} contains console.log`);
    }
  });
}

if (failures.length > 0) {
  console.error("Remove console.log statements before committing:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
