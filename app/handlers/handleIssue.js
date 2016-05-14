import { each } from 'lodash'
import createLogger from '../log'

const log = createLogger('handleIssue')

export default async function handleIssue (notification, github) {
  const {
    subject,
    last_read_at: lastReadAt,
  } = notification

  try {
    const attachments = []

    const issue = await github.get(subject.url)

    // if no lastReadAt field, we need to show issue as well
    if (!lastReadAt) {
      attachments.push(formatIssue(issue))
    }

    const since = lastReadAt || ''
    const comments = await github.get(`${subject.url}/comments?since=${since}`)

    each(comments, (comment) => {
      attachments.push(formatIssue(comment))
    })

    return {
      text: getTitle(issue, subject.latest_comment_url),
      attachments
    }
  } catch (e) {
    log.error('Unable to handle issue')
    console.log(e)
  }
}

function formatIssue ({ body, user }) {
  return {
    text: body,
    ...getAuthorFromUser(user)
  }
}

function getTitle({ title, html_url }, latestCommentUrl) {
  const [, commentId] = latestCommentUrl.match(/issues\/comments\/(\d+)/) || []
  const [, owner, repo, id ] = html_url.match(/github\.com\/(.+?)\/(.+?)\/issues\/(\d+)/)

  let url = html_url
  if (commentId) {
    url += `#issuecomment-${commentId}`
  }

  return `*<${url}|[${owner}/${repo}] ${title} (#${id})>*`
}

function getAuthorFromUser ({ login, avatar_url, html_url }) {
  return {
    author_name: login,
    author_link: html_url,
    author_icon: `${avatar_url}&s=16`
  }
}