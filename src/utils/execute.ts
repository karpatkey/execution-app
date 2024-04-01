import { spawn } from 'child_process'
import path from 'path'

interface CommonExecuteReturn {
  status: number
  data: Maybe<any>
  error: Maybe<string>
}

export const CommonExecutePromise = (
  filePath: string,
  parameters: any,
  env: Record<string, string>,
): Promise<CommonExecuteReturn> => {
  return new Promise((resolve, reject) => {
    try {
      const scriptFile = path.resolve(process.cwd(), filePath)

      const childEnv = {
        NODE_ENV: process.env.NODE_ENV,
        ...env,
      }

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
