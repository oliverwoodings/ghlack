import { filter } from 'lodash'
import config from 'config'
import invariant from 'invariant'
import moment from 'moment'
import axios from 'axios'
import createLogger from '../log'
import { notificationsUrl, eventsUrl } from '../urls'

export default function createGithubApi (name, token) {
  invariant(!!token, 'GitHub token required')

  const log = createLogger(`githubApi:${name}`)

  let lastModified = null
  let eventsEtag = null

  async function getNewNotifications () {
    return new Promise((resolve) => {
      waitForNotifications(resolve)
    })

    async function waitForNotifications (resolve) {
      log.debug(`Getting notifications`)

      let {
        notifications,
        pollInterval,
        lastModifiedResponse
      } = await getNotifications()

      // If we are just getting the default interval back (60s) lets try eager polling
      if (pollInterval === config.poll.defaultInterval) {
        pollInterval = config.poll.eagerInterval
      }

      const previousLastModified = lastModified

      if (lastModifiedResponse) {
        log.debug(`Updating last modified cache to ${lastModifiedResponse}`)
        lastModified = parseModifiedHeader(lastModifiedResponse)
      }

      if (notifications && notifications.length > 0 && !!previousLastModified) {
        resolve({
          pollInterval,
          notifications: notifications
        })
        return
      }

      log.debug(`No new notifications found, trying again in ${pollInterval}`)
      setTimeout(() => waitForNotifications(resolve), pollInterval * 1000)
    }
  }

  async function getNotifications () {
    const headers = {
      'Authorization': `token ${token}`,
      'If-Modified-Since': formatModifiedHeader(lastModified)
    }

    try {
      const res = await axios.get(notificationsUrl(), { headers })

      const pollInterval = getPollInterval(res)
      const lastModifiedResponse = res.headers['last-modified'] || res.headers['date']

      return {
        notifications: res.data,
        pollInterval,
        lastModifiedResponse
      }
    } catch (res) {
      if (res instanceof Error) {
        log.error('Unable to get notifications from GitHub')
        throw res
      }

      let pollInterval = config.poll.defaultInterval
      const lastModifiedResponse = res.headers['last-modified'] || res.headers['date']

      if (res.status === 304) {
        pollInterval = getPollInterval(res)
        log.debug('GitHub cache hit')
      } else {
        log.error(`Got a weird response from GitHub: ${res.status} ${res.statusText}`)
      }

      return { pollInterval, lastModifiedResponse }
    }
  }

  async function getEvents () {
    const headers = {
      'Authorization': `token ${token}`,
      'ETag': eventsEtag || ''
    }

    try {
      const res = await axios.get(eventsUrl(name), { headers })

      eventsEtag = res.headers['etag']
      return res.data
    } catch (res) {
      if (res instanceof Error) {
        log.error('Unable to get events from GitHub')
        throw res
      }

      if (res.status !== 304) {
        log.error(`Got a weird response from GitHub: ${res.status} ${res.statusText}`)
      }

      return []
    }
  }

  async function get (url) {
    const headers = {
      'Authorization': `token ${token}`
    }

    log.debug(`Getting ${url}`)

    return (await axios.get(url, { headers })).data
  }

  async function markAsRead () {
    const headers = {
      'Authorization': `token ${token}`
    }

    log.debug(`Marking notifications as read`)

    try {
      await axios.put(notificationsUrl(), {}, { headers })
    } catch (e) {
      log.error('Unable to mark notifications as read')
      console.log(e)
    }
  }

  return { getNewNotifications, get, markAsRead, getEvents }
}

function getPollInterval ({ headers }) {
  const interval = headers['x-poll-interval']

  if (!interval) {
    return config.poll.defaultInterval
  }
  return parseInt(interval, 10)
}

function parseModifiedHeader (header) {
  return moment.utc(header, 'ddd, DD MMM YYYY HH:mm:ss GMT').valueOf()
}

function formatModifiedHeader (timestamp) {
  if (!timestamp) {
    return ''
  }
  return moment.utc(timestamp).format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT'
}
