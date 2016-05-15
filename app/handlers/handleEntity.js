import { each, sortBy } from 'lodash'
import moment from 'moment'
import createLogger from '../log'

const log = createLogger('handleEntity')

export default async function handleEntity (notification, events, github) {
  const {
    subject,
    last_read_at: lastReadAt,
  } = notification

  const {
    url,
    latest_comment_url: latestCommentUrl
  } = subject
  
  const attachments = []
  const [, owner, repo, type, id ] = url.match(/github\.com\/(.+?)\/(.+?)\/(issues|pulls)\/(\d+)/)

  try {
    const entity = await github.get(url)

    // if urls are the same, means the user hasn't been notified about the actual entity
    if (url === latestCommentUrl) {
      attachments.push(formatAttachment(entity))
    }

    const commentsUrl = `${url}/comments?since=${lastReadAt || ''}`
    let comments = await github.get(commentsUrl)

    if (type === 'pulls') {
      const issuesUrl = commentsUrl.replace(/\/pulls\//, '/issues/')
      comments = comments.concat(await github.get(issuesUrl))
    }

    const sortedComments = sortBy(comments, (comment) => {
      return moment.utc(comment.created_at).valueOf()
    })

    each(sortedComments, (comment) => {
      attachments.push(formatAttachment(comment, entity.html_url))
    })

    return {
      text: getTitle(entity, owner, repo, id, latestCommentUrl),
      attachments
    }
  } catch (e) {
    log.error('Unable to handle entity')
    console.error(e)
  }
}

function formatAttachment ({ body, user, diff_hunk, path, url }, baseUrl) {
  let formattedBody = body

  if (path && diff_hunk) {
    const commentUrl = getCommentUrl(baseUrl, url)
    formattedBody = `In <${commentUrl}|${path}>:\n\`\`\`${diff_hunk}\`\`\`\n${body}`
  }

  return {
    mrkdwn_in: ["text"],
    text: formattedBody,
    ...getAuthorFromUser(user)
  }
}

function getTitle({ title, html_url }, owner, repo, id, latestCommentUrl) {
  const url = getCommentUrl(html_url, latestCommentUrl)

  return `*<${url}|[${owner}/${repo}] ${title} (#${id})>*`
}

function getCommentUrl (baseUrl, commentUrl) {
  const [, type, commentId] = commentUrl.match(/(issues|pulls)\/comments\/(\d+)/) || []
  const prefix = type === 'issues' ? 'issuecomment-' : 'discussion_r'

  return baseUrl += `#${prefix}${commentId}`
}

function getAuthorFromUser ({ login, avatar_url, html_url }) {
  return {
    author_name: login,
    author_link: html_url,
    author_icon: `${avatar_url}&s=16`
  }
}
