'use babel';
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver, div } from '@cycle/dom';

const PRIVATE = Symbol();

export default class JiraIssueButton {
  constructor() {
    this[PRIVATE] = {};
    this.element = document.createElement('div');
    this.element.style.width = 'auto';
    this.dataset = {};
    this.element.classList.add('btn', 'btn-default');
    this.start();
  }
  drivers() {
    return {
      DOM: makeDOMDriver(this.element),
    };
  }
  main() {
    return {
      DOM: xs.periodic(1000).map(i => div(`CDF-${i}`))
    }
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
