// Object to capture process exits and call app specific cleanup function
const noOp = () => {};

exports.Cleanup = (callback = noOp()) => {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  process.on('cleanup',callback);

  // do app specific cleaning before exiting
  process.on('exit', () =>
    process.emit('cleanup')
  );

  // catch ctrl+c event and exit normally
  process.on('SIGINT', () =>
    process.exit(2)
  );

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', () =>
    process.exit(99)
  );
};
