'use strict'

const Task = require('./Task')

class FunctionTask extends Task {
  isSupportedScriptLanguage (scriptLanguage) {
    return scriptLanguage === 'javascript'
  }

  extractParams ({ params = [], context, ctx }) {
    const paramNames = []
    const paramValues = []
    params.forEach(p => {
      paramNames.push(p.name)
      // eslint-disable-next-line no-eval
      paramValues.push(p.value ? eval(p.value) : p.defaultValue)
    })
    return { paramNames, paramValues }
  }

  async run ({ task, context, message } = {}) {
    try {
      const { params, script, scriptLanguage = 'javascript', results = [] } = task.props
      if (!this.isSupportedScriptLanguage(scriptLanguage)) {
        throw new Error(`Unsupported script language: ${scriptLanguage}`)
      }
      const { paramNames, paramValues } = this.extractParams({ params, context, ctx: message })
      // eslint-disable-next-line no-new-func
      const func = new Function(...paramNames, script)
      // memoize the function to improve performance
      const _result = func(...paramValues)
      const result = {}
      results.forEach(r => {
        // TODO type conversion
        result[r.name] = _result[r.value || r.name]
      })
      return { result }
    } catch (e) {
      throw new Error(`Error running function task: ${e.message}`)
    }
  }
}

module.exports = FunctionTask
