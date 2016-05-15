import { each, includes } from 'lodash'
import createLogger from '../log'
import pullRequestReviewComment from './pullRequestReviewComment'
import commitComment from './commitComment'
import issueComment from './issueComment'
import issue from './issue.js'
import pullRequest from './pullRequest.js'

const log = createLogger('handleNotifications')

const handlers = {
  PullRequestReviewCommentEvent: pullRequestReviewComment,
  CommitCommentEvent: commitComment,
  IssueCommentEvent: issueComment,
  IssuesEvent: issue,
  PullRequestEvent: pullRequest
}

export default function handleEvents (events, slack) {
  each(events, (event) => {
    const type = event.type
    const handler = handlers[type]

    log.debug(`Handling event ${event.id} of type ${type}`)

    if (!handler) {
      log.debug(`I don't know how to deal with this type: ${type}`)
      return
    }

    const action = event.payload.action
    if (action && handler.ACTIONS && !includes(handler.ACTIONS, action)) {
      log.debug(`Handler does not care about action ${action}`)
    }

    try {
      const { message, title } = handler(event)

      slack.send({
        text: title,
        attachments: [{
          text: message,
          mrkdwn_in: ['text'],
          ...getAuthor(event.actor)
        }]
      })

      log.debug(`Handled event ${event.id}`)
    } catch (e) {
      log.error(`Failed to handle event ${event.id}`)
      console.log(e.message, e.stack)
    }
  })
}

function getAuthor ({ login, avatar_url: avatarUrl, url }) {
  return {
    author_name: login,
    author_link: url,
    author_icon: `${avatarUrl}&s=16`
  }
}

