import createLogger from 'driftwood'
import config from 'config'

if (config.driftwood.enable) {
  createLogger.enable(config.driftwood.levels)
}

export default createLogger('ghlack')
