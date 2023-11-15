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

  convertType (value, type) {
    switch (type) {
      case 'string':
        return String(value)
      case 'number':
        return Number(value)
      case 'boolean':
        return Boolean(value)
      case 'bigint':
        return BigInt(value)
      default:
        return value
    }
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
        result[r.name] = this.convertType(_result[r.value || r.name], r.type)
      })
      return { result }
    } catch (e) {
      throw new Error(`Error running function task: ${e.message}`)
    }
  }
}

module.exports = FunctionTask
