/*   Profile Editing Appp Pane
 **
 ** Unlike view panes, this is available any place whatever the real subject,
 ** and allows the user to edit their own profile.
 **
 ** Usage: paneRegistry.register('profile/profilePane')
 ** or standalone script adding onto existing mashlib.
 */

import { authn, icons, ns, rdf, store, style, widgets } from 'solid-ui'
import panes from 'pane-registry'

import { NamedNode } from 'rdflib'

import { PaneDefinition } from '../types'
import { getLabel } from './profilePaneUtils'

import preferencesFormText from './preferencesFormText.ttl'

const highlightColor = style.highlightColor || '#7C4DFF'

const thisPane: PaneDefinition = {
  // 'noun_638141.svg' not editing

  global: true,

  icon: icons.iconBase + 'noun_492246.svg', // noun_492246.svg for editing

  name: 'editProfile', // not confuse with 'profile'

  label: function (subject) {
    return getLabel(subject, store, ns)
  },
  render: function (subject, dom) {
    function paneDiv (dom: HTMLDocument, subject: NamedNode, paneName: string) {
      var p = panes.byName(paneName)
      var d = p.render(subject, dom)
      d.setAttribute('style', 'border: 0.3em solid #444; border-radius: 0.5em')
      return d
    }

    function complainIfBad (ok: Boolean, mess: any) {
      if (ok) return
      div.appendChild(widgets.errorMessageBlock(dom, mess, '#fee'))
    }

    function renderProfileForm (div: HTMLElement, subject: NamedNode) {
      const preferencesForm = store.sym(
        'https://solid.github.io/solid-panes/dashboard/profileStyle.ttl#this'
      )
      const preferencesFormDoc = preferencesForm.doc()
      if (!store.holds(undefined, undefined, undefined, preferencesFormDoc)) {
        // If not loaded already
        rdf.parse(
          preferencesFormText,
          store,
          preferencesFormDoc.uri,
          'text/turtle'
        ) // Load form directly
      }

      widgets.appendForm(
        dom,
        div,
        {},
        subject,
        preferencesForm,
        editableProfile,
        complainIfBad
      )
    } // renderProfileForm

    var div = dom.createElement('div')
    var editableProfile: NamedNode | null
    div.setAttribute(
      'style',
      'border: 0.3em solid ' +
        highlightColor +
        '; border-radius: 0.5em; padding: 0.7em; margin-top:0.7em;'
    )

    var table = div.appendChild(dom.createElement('table'))
    // var top = table.appendChild(dom.createElement('tr'))
    var main = table.appendChild(dom.createElement('tr'))
    var bottom = table.appendChild(dom.createElement('tr'))
    var statusArea = bottom.appendChild(dom.createElement('div'))
    statusArea.setAttribute('style', 'padding: 0.7em;')

    function comment (str: string) {
      var p = main.appendChild(dom.createElement('p'))
      p.setAttribute('style', 'padding: 1em;')
      p.textContent = str
      return p
    }

    function heading (str: string) {
      var h = main.appendChild(dom.createElement('h3'))
      h.setAttribute('style', 'color:' + highlightColor + ';')
      h.textContent = str
      return h
    }

    var context = { dom: dom, div: main, statusArea: statusArea, me: null }
    authn.logInLoadProfile(context).then(
      (context: { me: NamedNode }) => {
        var me = context.me
        subject = me

        heading('Edit your public profile')

        var profile = me.doc()
        if (store.any(subject, ns.solid('editableProfile'))) {
          editableProfile = store.any(subject, ns.solid('editableProfile'))
        } else if (store.updater.editable(profile.uri, store)) {
          editableProfile = profile
        } else {
          statusArea.appendChild(
            widgets.errorMessageBlock(
              dom,
              `⚠️ Your profile ${profile} is not editable, so we cannot do much here.`,
              'straw'
            )
          )
          return
        }

        comment(`Everything you put here will be public.
     There will be other places to record private things..`)

        heading('Your contact information')

        main.appendChild(paneDiv(dom, me, 'contact'))

        heading('People you know who have webids')

        comment(`This is your public social network.
        Just put people here you are happy to be connected with publicly
        (You can always keep private track of friends and family in your contacts.)`)

        // TODO: would be useful to explain what it means to "drag people"
        //       what is it that is being dragged?
        //       is there a way to search for people (or things to drag) on this page?
        if (editableProfile)
          comment(`Drag people onto the target below to add people.`)

        widgets.attachmentList(dom, subject, main, {
          doc: profile,
          modify: !!editableProfile,
          predicate: ns.foaf('knows'),
          noun: 'friend'
        })

        heading('The style of your public profile')
        renderProfileForm(main, subject)

        heading('Thank you for filling your profile.')
      },
      (err: Error) => {
        statusArea.appendChild(widgets.errorMessageBlock(dom, err, '#fee'))
      }
    )
    return div
  } // render()
} //

export default thisPane
// ENDS