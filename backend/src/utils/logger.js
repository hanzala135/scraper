// src/utils/logger.js
'use strict';

const ts  = () => new Date().toISOString();
const fmt = (lvl, msg) => `[${ts()}] [${lvl}] ${msg}`;

const logger = {
  info:  (msg) => console.log(fmt('INFO',  msg)),
  warn:  (msg) => console.warn(fmt('WARN',  msg)),
  error: (msg) => console.error(fmt('ERROR', msg)),
};

module.exports = logger;
