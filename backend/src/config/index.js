"use strict";

module.exports = {
  NSW: {
    API_BASE: "https://api.apps1.nsw.gov.au/eplanning/data/v0",
    COUNCIL: "Junee Shire Council",
    PAGE_SIZE: 5,
    PAGE: 1,
    HEADERS: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://www.planningportal.nsw.gov.au",
      Referer: "https://www.planningportal.nsw.gov.au/",
      "User-Agent": "Mozilla/5.0",
    },
  },

 HOUNSLOW: {
  FROM_DATE: "01/05/2026",
  TO_DATE: "08/05/2026",
  MAX_RESULTS: 5,
  PROXY: "http://mkcoyqdg:y518nbexcsyd@45.38.107.97:6014",
},
  
  HTTP: {
    TIMEOUT_MS: 30000,
    RETRY_LIMIT: 2,
  },
};
