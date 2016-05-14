import { each } from 'lodash'
import handleIssue from './handleIssue'
import handlePullRequest from './handlePullRequest'
import handleCommit from './handleCommit'
import createLogger from '../log'

const log = createLogger('handleNotifications')
const handlers = {
  Issue: handleIssue,
  PullRequest: handlePullRequest,
  Commit: handleCommit
}

export default function handleNotifications (notifications, github, slack) {
  each(notifications, async (notification) => {
    const type = notification.subject.type
    const handler = handlers[type]

    if (!handler) {
      log.warn(`I don't know how to deal with this type: ${type}`)
      return
    }

    log.debug(`Handling notification ${notification.id} of type ${type}`)
    try {
      const message = await handler(notification, github)

      if (message) {
        slack.send(message)
      }

      log.debug(`Handled notification ${notification.id}`)
    } catch (e) {
      log.error(`Failed to handle notification ${notification.id}`)
      console.log(e)
    }
  })
}