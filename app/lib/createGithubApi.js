import { filter } from 'lodash'
import config from 'config'
import invariant from 'invariant'
import axios from 'axios'
import createLogger from '../log'

export default function createGithubApi (name, token) {
  invariant(!!token, 'GitHub token required')

  const log = createLogger(`githubApi:${name}`)

  let lastEventId
  let previousEtag

  async function getNewEvents () {
    return new Promise((resolve) => {
      waitForEvents(resolve)
    })

    async function waitForEvents (resolve) {
      log.debug('Getting events')

      let {
        events,
        pollInterval,
        etag
      } = await getEvents()

      // If we are just getting the default interval back (60s) lets try eager polling
      if (pollInterval === config.poll.defaultInterval) {
        pollInterval = config.poll.eagerInterval
      }

      if (etag && etag !== previousEtag) {
        log.debug(`Updating etag cache to ${etag}`)
        previousEtag = etag
      }

      const newEvents = filter(events, (event) => {
        return !lastEventId || event.id > lastEventId
      })

      if (lastEventId && newEvents.length > 0) {
        resolve({
          pollInterval,
          events: newEvents
        })
      } else {
        log.debug(`No new events found, trying again in ${pollInterval}`)
        setTimeout(() => waitForEvents(resolve), pollInterval * 1000)
      }

      if (newEvents.length > 0) {
        lastEventId = newEvents[0].id
        log.debug(`Updated lastEventId to ${lastEventId}`)
      }
    }
  }

  async function getEvents () {
    const headers = {
      'Authorization': `token ${token}`,
      'If-None-Match': previousEtag || ''
    }

    try {
      const url = `https://api.github.com/users/${name}/received_events`
      const res = await axios.get(url, { headers })

      const pollInterval = getPollInterval(res)
      const etag = res.headers['etag']

      return {
        events: res.data,
        pollInterval,
        etag
      }
    } catch (res) {
      if (res instanceof Error) {
        log.error('Unable to get events from GitHub')
        throw res
      }

      let pollInterval = config.poll.defaultInterval
      const etag = res.headers['etag']

      if (res.status === 304) {
        pollInterval = getPollInterval(res)
        log.debug('GitHub cache hit')
      } else {
        log.error(`Got a weird response from GitHub: ${res.status} ${res.statusText}`)
      }

      return { pollInterval, etag }
    }
  }

  return { getNewEvents }
}

function getPollInterval ({ headers }) {
  const interval = headers['x-poll-interval']

  if (!interval) {
    return config.poll.defaultInterval
  }
  return parseInt(interval, 10)
}
