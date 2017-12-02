import logger from '@pnpm/logger'
import {IncomingMessage} from 'http'
import fs = require('mz/fs')
import path = require('path')
import * as unpackStream from 'unpack-stream'
import {Resolution} from './createResolver'
import {PnpmError} from './errorTypes'
import {progressLogger} from './loggers'

const gitLogger = logger('git')

const fetchLogger = logger('fetch')

export type IgnoreFunction = (filename: string) => boolean

export interface FetchOptions {
  auth?: object,
  cachedTarballLocation: string,
  pkgId: string,
  offline: boolean,
  prefix: string,
  ignore?: IgnoreFunction,
  onStart?: (totalSize: number | null, attempt: number) => void,
  onProgress?: (downloaded: number) => void,
}

export interface PackageDist {
  tarball: string,
  registry?: string,
  integrity?: string,
}

export default function (
  fetcherCreators: Array<(opts: object) => {type: string, fetch: FetchFunction}>,
  opts: object,
) {
  const fetchers = fetcherCreators.reduce((fetcherByHostingType, createFetcher) => {
    const f = createFetcher(opts)
    fetcherByHostingType[f.type] = f.fetch
    return fetcherByHostingType
  }, {})
  return fetcher.bind(null, fetchers)
}

export type FetchFunction =  (
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
) => Promise<unpackStream.Index>

async function fetcher (
  fetcherByHostingType: {[hostingType: string]: FetchFunction},
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
): Promise<unpackStream.Index> {
  const fetch = fetcherByHostingType[resolution.type || 'tarball']
  if (!fetch) {
    throw new Error(`Fetching for dependency type "${resolution.type}" is not supported`)
  }
  return await fetch(resolution, target, opts)
}