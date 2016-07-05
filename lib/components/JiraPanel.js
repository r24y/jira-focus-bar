'use babel';
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver, div, h2, h3, span, a } from '@cycle/dom';

import makeJiraDriver from '../jira';

const PRIVATE = Symbol();

export default class JiraPanel {
  constructor() {
    const that = this;
    this[PRIVATE] = {};
    this.element = document.createElement('div');
    this.element.style.minHeight = '300px';
    this.element.style.maxHeight = '400px';
    this.element.style.overflowY = 'scroll';
    this.dataset = {};
    this.fireGui = () => null;
    this[PRIVATE].guiProducer = () => xs.create({
      start(listener) {
        that.fireGui = (event) => listener.next(event);
      },
      stop() {
        that.fireGui = () => null;
      }
    })
    this.start();
  }
  drivers() {
    return {
      DOM: makeDOMDriver(this.element),
      jira: makeJiraDriver(),
      gui: this[PRIVATE].guiProducer,
    };
  }
  renderIssues(response) {
    console.warn(response)
    if (!response || !response.issues) return h2([
      div('.loading.loading-spinner-small.inline-block'),
      span([' Loading issues...']),
    ]);
    return div(response.issues.map(i => [
      h3([i.key, ' ', i.fields.summary]),
    ]).reduce((a, b) => a.concat(b), []));
  }
  main(sources) {
    return {
      DOM: sources.jira.startWith(null).map(response => div([this.renderIssues(response)])),
      jira: sources.gui
        .filter(({ type, visible }) => (type === 'set-visible') && visible)
        .mapTo({ type: 'fetch-all' }),
    };
  }
  start() {
    this[PRIVATE].dispose = run(this.main.bind(this), this.drivers());
  }
  serialize() {
    return {};
  }
  destroy() {
    const { dispose } = this[PRIVATE];
    if (dispose) {
      dispose();
    }
  }
}
