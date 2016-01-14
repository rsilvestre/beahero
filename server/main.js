const Koa = require('koa')
import convert from 'koa-convert'
import serve from 'koa-static'
import historyApiFallback from 'koa-connect-history-api-fallback'
import _debug from 'debug'
import config from '../config'

const debug = _debug('app:server')
const paths = config.utils_paths
const app = new Koa()

app.use(convert(historyApiFallback({
  verbose: false
})))

// logger

app.use(convert(function *(next) {
  var start = new Date()
  yield next
  var ms = new Date - start
  console.log('%s %s - %s', this.method, this.url, ms)
}))

// response

debug(
  'Server is being run outside of live development mode. This starter kit ' +
  'does not provide any production-ready server functionality. To learn ' +
  'more about deployment strategies, check out the "deployment" section ' +
  'in the README.'
)
app.use(convert(serve(paths.base(config.dir_dist))))

export default app
