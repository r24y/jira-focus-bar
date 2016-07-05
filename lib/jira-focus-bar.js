'use babel';

import JiraPanel from './components/JiraPanel';
import { CompositeDisposable } from 'atom';
import fetch from 'isomorphic-fetch';
import co from 'co';
import url from 'url';

import JiraIssueButtons from './components/JiraIssueButtons';

let toolBarManager;
let visible = false;

export default {

  jiraPanel: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.jiraPanel = new JiraPanel(state.jiraPanelState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.jiraPanel.element,
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'jira-focus-bar:toggle': () => this.toggle(),
      'jira-focus-bar:list': () => this.list(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jiraPanel.destroy();
  },

  serialize() {
    return {
      jiraPanelState: this.jiraPanel.serialize()
    };
  },

  toggle() {
    visible = !visible;
    this.modalPanel[visible ? 'show' : 'hide']();
    this.jiraPanel.fireGui({ type: 'set-visible', visible });
  },

  list() {
    const endpt = atom.config.get('jira-focus-bar.jiraServer');
    const user = atom.config.get('jira-focus-bar.username');
    const password = atom.config.get('jira-focus-bar.password');
    const issueQuery = atom.config.get('jira-focus-bar.issueQuery');
    co(function *() {
      const reqUrl = url.parse(url.resolve(endpt, 'rest/api/2/search'));
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
      atom.notifications.addInfo(`Found ${
        json.issues.length} issues; first 6: ${
        json.issues.slice(0, 6).map(iss => `${iss.key}: ${iss.fields.summary}`).join('; ')}`);
    }).catch(err => atom.notifications.addError(err.message, { dismissable: true }));
  },

  config: {
    jiraServer: {
      type: 'string',
      default: 'https://jira.atlassian.com/',
      description: 'URL of the Jira server to connect to',
    },
    username: {
      type: 'string',
      default: '',
      description: 'Jira username',
    },
    password: {
      type: 'string',
      default: '****',
      description: 'Jira password',
    },
    issueQuery: {
      type: 'string',
      default: '',
      description: 'JQL query to filter issues by',
    },
  },

  consumeToolBar(getToolBar) {
    toolBarManager = getToolBar('jira-focus-bar');
    // Add buttons and spacers here...
    // Adding button
    toolBarManager.toolBar.addItem(new JiraIssueButtons());
    toolBarManager.addButton({
      icon: 'book',
      callback: 'jira-focus-bar:toggle',
      tooltip: 'JIRA issues',
    });
  },

  deactivate() {
    if (toolBarManager) {
      toolBarManager.removeItems();
      toolBarManager = null;
    }
  }
};
