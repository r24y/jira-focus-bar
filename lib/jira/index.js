'use babel';

import fetch from 'isomorphic-fetch';
import co from 'co';
import url from 'url';
import xs from 'xstream';

export default function makeJiraDriver(opts = {}) {
  function jiraDriver(input$) {
    return xs.create({
      start(listener) {
        input$.addListener({
          next(action) {
            console.info(action)
            switch (action.type) {
              default: co.wrap(listIssues)(
                atom.config.get('jira-focus-bar.jiraServer'),
                atom.config.get('jira-focus-bar.username'),
                atom.config.get('jira-focus-bar.password'),
                atom.config.get('jira-focus-bar.issueQuery')
              ).then(listener.next.bind(listener));
            }
          },
          error() {},
          complete() {},
        });
      },
      stop() {},
    })
  }
  return jiraDriver;
}

export function promiseToAction(gen, type, meta, ...args) {
  return co(function *() {
    try {
      const payload = yield gen(...args);
      return {
        type,
        ok: true,
        payload,
        meta,
      };
    } catch (error) {
      return {
        error: true,
        meta,
        payload: error,
      };
    }
  });
}

export function *listIssues(endpt, user, password, issueQuery) {
  const reqUrl = url.parse(url.resolve(endpt, 'rest/api/2/search'));
  console.debug(reqUrl)
  reqUrl.query = {
    ...reqUrl.query,
    jql: issueQuery,
    expand: 'summary',
  };
  reqUrl.auth = [user, password].join(':');
  const response = yield fetch(url.format(reqUrl));
  if (!response.ok) {
    return atom.notifications.addWarning(`Error ${response.statusCode} fetching issues`);
  }
  const json = yield response.json();
  console.info(json);
  return json;
}
