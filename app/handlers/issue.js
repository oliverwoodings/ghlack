import { startCase } from 'lodash'

export default function issue ({ payload, repo }) {
  const {
    action,
    issue
  } = payload

  const {
    html_url,
    title: issueTitle,
    number,
    body
  } = issue

  const title = `*<${html_url}|[${repo.name}] ${issueTitle} (#${number})>*`

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

issue.ACTIONS = ['opened', 'closed', 'reopened']
