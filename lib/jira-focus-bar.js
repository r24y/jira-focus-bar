'use babel';

import JiraFocusBarView from './jira-focus-bar-view';
import { CompositeDisposable } from 'atom';

import JiraIssueButton from './components/current-ticket';

let toolBarManager;

export default {

  jiraFocusBarView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.jiraFocusBarView = new JiraFocusBarView(state.jiraFocusBarViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.jiraFocusBarView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'jira-focus-bar:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jiraFocusBarView.destroy();
  },

  serialize() {
    return {
      jiraFocusBarViewState: this.jiraFocusBarView.serialize()
    };
  },

  toggle() {
    console.log('JiraFocusBar was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};

export function consumeToolBar(getToolBar) {
  toolBarManager = getToolBar('jira-focus-bar');
  // Add buttons and spacers here...
  // Adding button
  toolBarManager.toolBar.addItem(new JiraIssueButton());
}

export function deactivate() {
  if (toolBarManager) {
    toolBarManager.removeItems();
    toolBarManager = null;
  }
}
