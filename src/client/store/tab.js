/**
 * tabs related functions
 */

import newTerm from '../common/new-terminal'
import _ from 'lodash'
import { nanoid as generate } from 'nanoid/non-secure'
import copy from 'json-deep-copy'
import wait from '../common/wait'
// import getInitItem from '../common/init-setting-item'
import {
  statusMap
} from '../common/constants'

const defaultStatus = statusMap.processing

export default store => {
  Object.assign(store, {

    updateTabsStatus () {
      const tabIds = _.uniq(
        store.getTransfers().map(d => d.tabId)
      )
      const tabs = store.getTabs().map(d => {
        return {
          ...d,
          isTransporting: tabIds.includes(d.id)
        }
      })
      store.setTabs(tabs)
    },

    getTabs () {
      return store.getItems('tabs')
    },

    setTabs (list) {
      return store.setItems('tabs', list)
    },

    addTab (
      tab = newTerm(store.tabs.length),
      index = store.tabs.length
    ) {
      store.currentTabId = tab.id
      const tabs = store.getItems('tabs')
      tabs.splice(index, 0, tab)
      store.setItems('tabs', tabs)
    },

    editTab (id, update) {
      store.editItem(id, update, 'tabs')
    },

    delTab ({ id }) {
      const tabs = store.getItems('tabs')
      const { currentTabId } = store
      if (currentTabId === id) {
        let i = _.findIndex(tabs, t => {
          return t.id === id
        })
        i = i ? i - 1 : i + 1
        const next = tabs[i] || {}
        store.currentTabId = next.id
      }
      store.setItems(
        'tabs',
        tabs.filter(t => {
          return t.id !== id
        })
      )
    },

    async reloadTab (tabToReload) {
      const tab = copy(
        tabToReload
      )
      const { id } = tab
      tab.id = generate()
      tab.status = statusMap.processing
      const tabs = store.getItems('tabs')
      const index = _.findIndex(tabs, t => t.id === id)
      store.delTab({ id: tabToReload.id })
      await wait(30)
      store.addTab(tab, index)
    },

    onDuplicateTab (tab) {
      const tabs = store.getItems('tabs')
      const index = _.findIndex(
        tabs,
        d => d.id === tab.id
      )
      store.addTab({
        ...tab,
        status: defaultStatus,
        id: generate(),
        isTransporting: undefined
      }, index + 1)
    },

    onChangeTabId (currentTabId) {
      store.currentTabId = currentTabId
    }
  })
  store.clickNextTab = _.debounce(() => {
    const tab = document.querySelector('.tabs-wrapper .tab.active')
    if (tab) {
      let next = tab.nextSibling
      if (!next || !next.classList.contains('tab')) {
        next = document.querySelector('.tabs-wrapper .tab')
      }
      next &&
      next.querySelector('.tab-title') &&
      next.querySelector('.tab-title').click()
    }
  }, 100)
}
