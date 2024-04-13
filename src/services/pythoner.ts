import { spawn } from 'child_process'
import path from 'path'

interface CommonExecuteReturn {
  status: number
  data: Maybe<any>
  error: Maybe<string>
}

export enum Script {
  Build,
  Simulate,
  Execute,
}

export const getScriptFilePath = (script: Script) => {
  const base = 'roles_royce/roles_royce/applications/execution_app'
  switch (script) {
    case Script.Execute:
      return base + '/execute.py'
    case Script.Simulate:
      return base + '/simulate.py'
    case Script.Build:
      return base + '/transaction_builder.py'
  }
}

export function runScript(
  script: Script,
  parameters: any,
  env: Record<string, string>,
): Promise<CommonExecuteReturn> {
  return new Promise((resolve, reject) => {
    try {
      const filePath = getScriptFilePath(script)
      const scriptFile = path.resolve(process.cwd(), filePath)

      const childEnv = {
        NODE_ENV: process.env.NODE_ENV,
        ...env,
      }

      console.log('Executing', [filePath, ...parameters].join(' '))
      const started = +new Date()

      const python = spawn(`python3`, [`${scriptFile}`, ...parameters], { env: childEnv })

      let buffer = ''
      python.stdout.on('data', function (data) {
        buffer += data.toString()

        if (buffer.indexOf('DEBUGGER READY') !== -1) {
          console.log('DEBUGGER READY')
          console.log('after connect_client')
        }
      })

      python.stderr.on('data', function (data) {
        console.log('STD_ERR', data.toString())
      })

      python.on('error', function (data) {
        console.log('DEBUG PROGRAM ERROR:')
        console.error('ERROR: ', data.toString())
        reject({ status: 500, error: new Error(data.toString()) })
      })

      python.on('exit', function (code) {
        console.log('Debug Program Exit', code)

        // destroy python process
        python.kill()

        let response = undefined
        console.log('Buffer Before', buffer)

        try {
          //const regex = new RegExp('"value": ([0-9]+)', 'g')
          //buffer = buffer.replace(regex, '"value": "$1"')
          response = JSON.parse(buffer)
        } catch (e) {
          console.log('Error with buffer, is not a valid json object', e, buffer)
        }

        const {
          status = 500,
          tx_data = null, // {"transaction"?: null, "decoded_transaction": null}}
          sim_data = null,
          tx_hash = null,
          message = null,
        } = response ?? {}

        const body = {
          status,
          data: tx_data || sim_data || { tx_hash } || null,
          error: message || null,
        }

        console.log(`script took: ${(+new Date() - started) / 1000}s`)
        resolve(body)
      })
    } catch (error) {
      console.error('ERROR Reject: ', error)
      reject({
        status: 500,
        error: (error as Error)?.message,
      })
    }
  })
}
