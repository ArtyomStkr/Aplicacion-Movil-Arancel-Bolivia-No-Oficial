import assert from 'node:assert/strict'
import test from 'node:test'
import { releaseFromManifest, trustedDownload, DOWNLOAD } from '../src/lib/releases.ts'

const publishedApk = 'https://github.com/ArtyomStkr/arancel_bob_releases/releases/download/v0.3.3/Arancel.Bolivia.2026.apk'
const rawApk = 'https://raw.githubusercontent.com/ArtyomStkr/arancel_bob_releases/main/Arancel%20Bolivia%202026.apk?v=0.3.3-25'

test('uses the release URL and version from the current public manifest', () => {
  assert.deepEqual(releaseFromManifest({ githubUrl: publishedApk, apkUrl: rawApk, version: '0.3.3' }), { url: publishedApk, version: '0.3.3' })
})
test('uses the raw APK when the primary URL is missing or invalid', () => {
  assert.deepEqual(releaseFromManifest({ githubUrl: 'https://example.com/file.apk', apkUrl: rawApk }), { url: rawApk, version: '' })
})
test('rejects malformed manifests and unrelated or unsafe download destinations', () => {
  for (const value of [null, 'invalid', {}, { apkUrl: 'javascript:alert(1)' }, { githubUrl: 'http://github.com/ArtyomStkr/arancel_bob_releases/releases/file.apk' }, { githubUrl: 'https://github.com.attacker.test/ArtyomStkr/arancel_bob_releases/releases/file.apk' }, { githubUrl: 'https://github.com/Other/repo/releases/file.apk' }, { githubUrl: 'https://user:pass@github.com/ArtyomStkr/arancel_bob_releases/releases/file.apk' }, { githubUrl: 'https://github.com/ArtyomStkr/arancel_bob_releases/releases/file.exe' }]) assert.equal(releaseFromManifest(value), null)
})
test('does not display arbitrary manifest content as a version', () => {
  assert.equal(releaseFromManifest({ githubUrl: publishedApk, version: 'download now!' })?.version, '')
  assert.equal(releaseFromManifest({ githubUrl: publishedApk, version: '0.4.0-beta.1' })?.version, '0.4.0-beta.1')
})
test('the stable fallback is a valid APK destination', () => assert.equal(trustedDownload(DOWNLOAD), true))
