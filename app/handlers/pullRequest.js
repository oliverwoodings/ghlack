import { startCase } from 'lodash'

export default function pullRequest ({ payload, repo }) {
  const {
    action,
    pull_request: pullRequest
  } = payload

  const {
    html_url: htmlUrl,
    title: pullRequestTitle,
    number,
    body
  } = pullRequest

  const title = `*<${htmlUrl}|[${repo.name}] ${pullRequestTitle} (#${number})>*`

  let message
  if (action === 'opened') {
    message = body || '_No description provided._'
  } else {
    message = `${startCase(action)} <${htmlUrl}|#${number}>`
  }

  return {
    title,
    message
  }
}

pullRequest.ACTIONS = ['opened', 'closed', 'reopened']
