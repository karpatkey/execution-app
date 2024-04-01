import path from 'path'
import { spawn } from 'child_process'

interface DBankReturn {
  data?: Maybe<any>
  error?: Maybe<string>
}

export const dBankPromise = (parameters: string[] = []): Promise<DBankReturn> => {
  return new Promise((resolve, reject) => {
    try {
      const scriptFile = path.resolve(process.cwd(), 'dbank/debank_panic_botton_app.py')

      const python = spawn(`python3`, [`${scriptFile}`, ...parameters])

      let buffer = ''
      python.stdout.on('data', function (data) {
        buffer += data.toString()

        if (buffer.indexOf('DEBUGGER READY') !== -1) {
          console.log('DEBUGGER READY')
          console.log('after connect_client')
        }
      })

      python.stderr.on('data', function (data) {
        console.log(data.toString())
      })

      python.on('error', function (data) {
        console.log('DEBUG PROGRAM ERROR:')
        console.error('ERROR: ', data.toString())
        reject({ error: data.toString() })
      })

      python.on('exit', function (code) {
        console.log('Debug Program Exit', code)

        // destroy python process
        python.kill()

        let response = undefined
        console.log('Buffer Before', buffer)

        try {
          const regex = new RegExp('"value": ([0-9]+)', 'g')
          buffer = buffer.replace(regex, '"value": "$1"')
          response = JSON.parse(buffer)
          console.log('Buffer After', buffer)
        } catch (e) {
          console.log('Error with buffer, is not a valid json object', e, buffer)
        }

        resolve({ data: response })
      })
    } catch (error) {
      console.error('ERROR Reject: ', error)
      reject({
        error: (error as Error)?.message
      })
    }
  })
}
