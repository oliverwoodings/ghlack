import createGithubApi from './lib/createGithubApi'
import createSlackApi from './lib/createSlackApi'
import handleEvents from './handlers'
import createLogger from './log'

const log = createLogger('pollUser')

export default function pollUser (name, config) {
  const slack = createSlackApi(config.slack)
  const github = createGithubApi(name, config.githubToken)

  poll()

  async function poll () {
    log.info(`Polling ${name}`)

    const {
      pollInterval,
      events
    } = await github.getNewEvents()

    log.debug(`Received events for ${name}`)

    handleEvents(events, slack)

    setTimeout(poll, pollInterval * 1000)
  }
}
