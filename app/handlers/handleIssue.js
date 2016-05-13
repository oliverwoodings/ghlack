import { each } from 'lodash'
import createLogger from '../log'

const log = createLogger('handleIssue')

export default async function handleIssue (notification, github) {
  const {
    subject,
    last_read_at: lastReadAt
  } = notification

  // check latest comment vs url - if same, then need to look up issue + comments
  // if not, only comments
  const messages = []

  try {
    if (!lastReadAt) {
      const issue = await github.get(subject.url)
      messages.push(formatIssueBody(issue))
    }

    const since = lastReadAt || ''
    const comments = await github.get(`${subject.url}/comments?since=${since}`)

    each(comments, (comment) => {
      messages.push(formatIssueComment(comment))
    })
  } catch (e) {
    log.error('Unable to handle issue')
    console.log(e)
  }

  return messages
}

function formatIssueBody ({ title }) {
  return { text: title }
}

function formatIssueComment ({ body }) {
  return { text: body }
}
