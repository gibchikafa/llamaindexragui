const { spawn } = require("child_process");

const hasHopsworksEnv =
  Boolean(process.env.HOPSWORKS_PROJECT_NAME) &&
  Boolean(process.env.HOPSWORKS_JOB_NAME);

const port = process.env.PORT || process.env.APP_PORT || "3000";
const hostname = process.env.HOST || "0.0.0.0";
const args = hasHopsworksEnv
  ? ["start", "-H", hostname, "-p", port]
  : ["dev", "-H", hostname, "-p", port];

const child = spawn("next", args, {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code === null ? 1 : code);
});
