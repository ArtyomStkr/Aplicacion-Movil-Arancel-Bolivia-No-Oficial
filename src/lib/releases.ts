export const RELEASES = 'https://github.com/ArtyomStkr/arancel_bob_releases/releases'
export const DOWNLOAD = `${RELEASES}/latest/download/Arancel.Bolivia.2026.apk`
export const MANIFEST = 'https://raw.githubusercontent.com/ArtyomStkr/arancel_bob_releases/main/latest.json'
const RELEASE_TAG_API = 'https://api.github.com/repos/ArtyomStkr/arancel_bob_releases/releases/tags/'

export function trustedDownload(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && (
      (url.hostname === 'github.com' && url.pathname.startsWith('/ArtyomStkr/arancel_bob_releases/releases/') && url.pathname.endsWith('.apk')) ||
      (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/ArtyomStkr/arancel_bob_releases/main/') && url.pathname.endsWith('.apk')))
  } catch { return false }
}

function manifestVersion(data: Record<string, unknown>) {
  return typeof data.version === 'string' && /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(data.version) ? data.version : ''
}

export function releaseFromManifest(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const manifest = data as Record<string, unknown>
  const url = [manifest.githubUrl, manifest.apkUrl].find(trustedDownload)
  if (!url) return null
  return { url, version: manifestVersion(manifest) }
}

export type DownloadCandidate = { url: string; version: string; source: 'github' | 'raw' }

export function manifestCandidates(data: unknown): DownloadCandidate[] {
  if (!data || typeof data !== 'object') return []
  const manifest = data as Record<string, unknown>
  const version = manifestVersion(manifest)
  const candidates: DownloadCandidate[] = []
  if (trustedDownload(manifest.githubUrl)) candidates.push({ url: manifest.githubUrl, version, source: 'github' })
  if (trustedDownload(manifest.apkUrl)) candidates.push({ url: manifest.apkUrl, version, source: 'raw' })
  return candidates
}

export function releaseTagFromUrl(url: string) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.split('/')
    return parsed.hostname === 'github.com' && path.length === 7 && path[3] === 'releases' && path[4] === 'download' && path[5] && path[6].endsWith('.apk') ? decodeURIComponent(path[5]) : ''
  } catch { return '' }
}

export function releaseTagApiUrl(url: string) {
  const tag = releaseTagFromUrl(url)
  return tag ? `${RELEASE_TAG_API}${encodeURIComponent(tag)}` : ''
}

export function githubAssetExists(data: unknown, expectedUrl: string) {
  if (!data || typeof data !== 'object') return false
  const assets = (data as Record<string, unknown>).assets
  return Array.isArray(assets) && assets.some(asset => asset && typeof asset === 'object' && (asset as Record<string, unknown>).browser_download_url === expectedUrl)
}
