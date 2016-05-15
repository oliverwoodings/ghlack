import { startCase } from 'lodash'

export default function pullRequest ({ payload, repo }) {
  const {
    action,
    pull_request: pullRequest
  } = payload

  const {
    html_url,
    title: pullRequestTitle,
    number,
    body
  } = pullRequest

  const title = `*<${html_url}|[${repo.name}] ${pullRequestTitle} (#${number})>*`

  let message
  if (action === 'opened') {
    message = body || '_No description provided._'
  } else {
    message = `${startCase(action)} <${html_url}|#${number}>`
  }

  return {
    title,
    message
  }
}

pullRequest.ACTIONS = ['opened', 'closed', 'reopened']
