export default function issueComment ({ payload, repo }) {
  const {
    id,
    html_url,
    body
  } = payload.comment

  const {
    title: issueTitle,
    number
  } = payload.issue

  const title = `*<${html_url}|[${repo.name}] ${issueTitle} (#${number})>*`

  return {
    title,
    message: body
  }
}

issueComment.ACTIONS = ['created']
