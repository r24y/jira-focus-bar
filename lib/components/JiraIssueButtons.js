'use babel';
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver, div, h3, span } from '@cycle/dom';

const PRIVATE = Symbol();

export default class JiraIssueButtons {
  constructor() {
    this[PRIVATE] = {};
    this.element = document.createElement('div');
    this.dataset = {};
    this.start();
  }
  drivers() {
    return {
      DOM: makeDOMDriver(this.element),
    };
  }
  main() {
    return {
      DOM: xs.periodic(1000).map(i => div('.jira-buttons', [
        div('.btn.btn-default', [
          div([`CDF-${i}`]),
        ]),
        div('.btn.btn-default', [
          div([`CDF-${String(1000-i).replace(/^-/, '')}`]),
        ]),
      ])),
    };
  }
  start() {
    this[PRIVATE].dispose = run(this.main, this.drivers());
  }
  destroy() {
    const { dispose } = this[PRIVATE];
    if (dispose) {
      dispose();
    }
  }
}
