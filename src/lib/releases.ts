export const RELEASES = 'https://github.com/ArtyomStkr/arancel_bob_releases/releases'
export const DOWNLOAD = `${RELEASES}/latest/download/Arancel.Bolivia.2026.apk`
export const MANIFEST = 'https://raw.githubusercontent.com/ArtyomStkr/arancel_bob_releases/main/latest.json'

export function trustedDownload(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && (
      (url.hostname === 'github.com' && url.pathname.startsWith('/ArtyomStkr/arancel_bob_releases/releases/') && url.pathname.endsWith('.apk')) ||
      (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/ArtyomStkr/arancel_bob_releases/main/') && url.pathname.endsWith('.apk')))
  } catch { return false }
}

export function releaseFromManifest(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const manifest = data as Record<string, unknown>
  const url = [manifest.githubUrl, manifest.apkUrl].find(trustedDownload)
  if (!url) return null
  const version = typeof manifest.version === 'string' && /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(manifest.version) ? manifest.version : ''
  return { url, version }
}
