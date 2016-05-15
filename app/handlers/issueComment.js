export default function issueComment ({ payload, repo }) {
  const {
    html_url: htmlUrl,
    body
  } = payload.comment

  const {
    title: issueTitle,
    number
  } = payload.issue

  const title = `*<${htmlUrl}|[${repo.name}] ${issueTitle} (#${number})>*`

  return {
    title,
    message: body
  }
}

issueComment.ACTIONS = ['created']
