/*   Home Pane
 **
 ** The home pane is avaiable everywhere and allows a user
 ** to
 **  - keep track of their stuff
 **  - make new things, and possibly
 **  - keep track of accounts and workspaces etc
 **
 */

import { PaneDefinition } from '../types'
import { authn, create, icons } from 'solid-ui'
import * as panes from 'pane-registry'

const HomePaneSource: PaneDefinition = {
  icon: icons.iconBase + 'noun_547570.svg', // noun_25830

  global: true,

  name: 'home',

  // Does the subject deserve an home pane?
  //
  //   yes, always!
  //
  label: function () {
    return 'home'
  },

  render: function (subject, dom) {
    var showContent = async function () {
      var context = { div: div, dom: dom, statusArea: div, me: me }
      /*
            div.appendChild(dom.createElement('h4')).textContent = 'Login status'
            var loginStatusDiv = div.appendChild(dom.createElement('div'))
            // TODO: Find out what the actual type is:
            type UriType = unknown;
            loginStatusDiv.appendChild(UI.authn.loginStatusBox(dom, () => {
              // Here we know new log in status
            }))
      */
      div.appendChild(dom.createElement('h4')).textContent =
        'Create new thing somewhere'
      var creationDiv = div.appendChild(dom.createElement('div'))
      var creationContext = {
        div: creationDiv,
        dom: dom,
        statusArea: div,
        me: me
      }
      const relevantPanes = await authn.filterAvailablePanes(panes.list)
      create.newThingUI(creationContext, relevantPanes) // newUI Have to pass panes down

      div.appendChild(dom.createElement('h4')).textContent = 'Private things'
      // TODO: Replace by a common, representative interface
      type AuthContext = unknown
      authn
        .registrationList(context, { private: true })
        .then(function (context: AuthContext) {
          div.appendChild(dom.createElement('h4')).textContent = 'Public things'
          div.appendChild(dom.createElement('p')).textContent =
            'Things in this list are visible to others.'
          authn.registrationList(context, { public: true }).then(function () {
            // done
          })
        })
    }

    var div = dom.createElement('div')
    var me = authn.currentUser()

    showContent()

    return div
  }
} // pane object

// ends
export default HomePaneSource