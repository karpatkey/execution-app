import { BigQuery } from '@google-cloud/bigquery'
import { DATA_WAREHOUSE_ENV, GOOGLE_CREDS, GOOGLE_PROJECT_ID } from 'src/config/constants'

type DataWarehouseEnvironment = 'production' | 'development'

const REPORTS_DATASET = {
  development: {
    getPositions: 'reports.vw_position_list',
  },
  production: {
    getPositions: 'reports_production.prod_position_list',
  },
}

export class DataWarehouse {
  private static instance: DataWarehouse
  private bigQuery: BigQuery

  private constructor() {
    this.bigQuery = new BigQuery({
      projectId: GOOGLE_PROJECT_ID,
      credentials: GOOGLE_CREDS,
    })
  }

  public static getInstance(): DataWarehouse {
    if (!DataWarehouse.instance) {
      DataWarehouse.instance = new DataWarehouse()
    }

    return DataWarehouse.instance
  }

  async getPositions(DAOs?: string[]) {
    const table =
      REPORTS_DATASET[DATA_WAREHOUSE_ENV as unknown as DataWarehouseEnvironment]['getPositions']

    let viewQuery = `SELECT * FROM  \`karpatkey-data-warehouse.${table}\``

    let params = {}
    if (DAOs && DAOs.length > 0) {
      viewQuery += ` WHERE dao IN UNNEST(@daos)`
      params = { daos: DAOs }
    }

    return await this.executeCommonJobQuery(viewQuery, params)
  }

  async getPositionById(id: string) {
    const table =
      REPORTS_DATASET[DATA_WAREHOUSE_ENV as unknown as DataWarehouseEnvironment]['getPositions']
    const viewQuery = `SELECT * FROM  \`karpatkey-data-warehouse.${table}\` where position_id = @id`

    return await this.executeCommonJobQuery(viewQuery, { id })
  }

  private async executeCommonJobQuery(viewQuery: string, params = {}) {
    const options = {
      query: viewQuery,
      params,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    }

    // Run the query as a job
    const [job] = await this.bigQuery.createQueryJob(options)
    console.log(`Job ${job.id} started.`)

    // Wait for the query to finish
    const [rows] = await job.getQueryResults()

    // We need to do this because the rows object is not serializable (some weird objects returned by the BigQuery API)
    return JSON.parse(JSON.stringify(rows))
  }
}
