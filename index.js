const fs = require('fs');
const igClient = require('./src/instagram/client');
const { task } = require('./src');

/**
 * interval configuration
 */

const DEFAULT_INTERVAL = 900000; // 15 min

let { INTERVAL: interval } = process.env;

// Keep intervals above 1 min to honor rate limits
if (!(interval && interval > 60000)) {
  console.info(`Interval defaulting to ${DEFAULT_INTERVAL}ms`);

  interval = DEFAULT_INTERVAL;
}

(async () => {
  await igClient.login();
})();

/**
 * create efemeral dirs
 */

['./media'].forEach(v => {
  if (!fs.existsSync(v)) {
    fs.mkdirSync(v);
  }
});

/**
 * run is the loop function
 */

let run;
let runTimeout;

run = async () => {
  console.info('Checking for new post(s)', (new Date()).toISOString());
  const err = await task();
  if (err) {
    console.error('[FATAL]', 'task', err);

    // if (runTimeout) {
    //   clearTimeout(runTimeout);
    // }

    process.exit(1);
  }

  // do not run the task again, before the last run tasks is complete, wait an
  // extra interval before trying again
  runTimeout = setTimeout(run, interval);
};

// go!
(async () => {
  await run();
})();
