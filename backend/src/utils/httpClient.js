'use strict';

const got = require('got');
const { CookieJar } = require('tough-cookie');
const { HTTP } = require('../config');

const createClient = (
  headers = {},
  withCookies = false,
) => {
  const opts = {
    timeout: {
      request:
        HTTP.TIMEOUT_MS || 120000,
    },

    retry: {
      limit:
        HTTP.RETRY_LIMIT || 3,

      methods: [
        'GET',
        'POST',
      ],

      statusCodes: [
        408,
        429,
        500,
        502,
        503,
        504,
      ],

      errorCodes: [
        'ETIMEDOUT',
        'ECONNRESET',
        'EAI_AGAIN',
      ],
    },

    followRedirect: true,

    https: {
      rejectUnauthorized: false,
    },
  };

  if (withCookies) {
    opts.cookieJar =
      new CookieJar();
  }

  const client =
    got.extend(opts);

  // Safe GET
  client.safeGet = (
    url,
    options = {},
  ) => {
    return client.get(url, {
      ...options,

      headers: {
        ...headers,
        ...(options.headers ||
          {}),
      },
    });
  };

  // Safe POST
  client.safePost = (
    url,
    options = {},
  ) => {
    return client.post(url, {
      ...options,

      headers: {
        ...headers,
        ...(options.headers ||
          {}),
      },
    });
  };

  return client;
};

module.exports = {
  createClient,
};