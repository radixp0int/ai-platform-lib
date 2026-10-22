/** Interaction checks for the fixture-only workflow recipes. Build Storybook first. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'

const root = path.resolve('storybook-static')
const mime = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}
const server = createServer(async (req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname)
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end()
  try {
    res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream')
    res.end(await readFile(file))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
const errors = []
const checks = []
async function open(id) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  })
  page.on('pageerror', (error) => errors.push({ id, message: error.message }))
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`)
  await page.locator('.react-flow').waitFor()
  await page.locator('.react-flow__node').first().waitFor()
  return page
}
const empty = (page) => page.getByText('Nothing waiting on you in this run.', { exact: true })
try {
  for (const order of [
    ['Approve elevated access', 'Confirm background check'],
    ['Confirm background check', 'Approve elevated access'],
  ]) {
    const page = await open('workflows-recipes-employee-onboarding--two-approvals')
    for (const title of order) {
      await page
        .locator('aside')
        .first()
        .getByRole('button', { name: new RegExp(title) })
        .click()
      await page.getByRole('button', { name: 'Approve', exact: true }).click()
    }
    await empty(page).waitFor()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await page
      .locator('#wf-run-log')
      .getByText('Posted to #team-solutions', { exact: true })
      .waitFor()
    await page.getByRole('button', { name: 'Restart run', exact: true }).click()
    await page
      .locator('aside')
      .first()
      .getByRole('button', { name: /Approve elevated access/ })
      .waitFor()
    await page
      .locator('aside')
      .first()
      .getByRole('button', { name: /Confirm background check/ })
      .waitFor()
    checks.push(`Both onboarding approvals in ${order[0]} order, then restart`)
    await page.close()
  }
  {
    const page = await open('workflows-recipes-employee-onboarding--two-approvals')
    await page
      .locator('aside')
      .first()
      .getByRole('button', { name: /Confirm background check/ })
      .click()
    await page.getByRole('button', { name: 'Decline', exact: true }).click()
    await empty(page).waitFor()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await page
      .locator('#wf-run-log')
      .getByText('Day-one setup held — one of the two approvals was declined', { exact: true })
      .waitFor()
    assert.equal(await page.getByRole('button', { name: 'Approve', exact: true }).count(), 0)
    checks.push('Onboarding decline abandons the other approval and holds day-one work')
    await page.close()
  }
  for (const decision of ['Approve', 'Decline']) {
    const page = await open('workflows-recipes-incident-triage--awaiting-rollback')
    await page.getByRole('button', { name: decision, exact: true }).click()
    await empty(page).waitFor()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    const text =
      decision === 'Approve'
        ? 'p99 back inside budget on the second attempt'
        : 'Rollback declined — holding the current build and staying on the call'
    await page.locator('#wf-run-log').getByText(text, { exact: true }).waitFor()
    checks.push(`Incident rollback ${decision.toLowerCase()} branch`)
    await page.close()
  }
  for (const state of ['verification-failed', 'retrying-verification']) {
    const page = await open(`workflows-recipes-incident-triage--${state}`)
    await page.getByRole('heading', { name: 'synthetic.verify', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Pause run', exact: true }).click()
    await page.getByRole('button', { name: 'Resume run', exact: true }).click()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await page
      .locator('#wf-run-log')
      .getByText('p99 back inside budget on the second attempt', { exact: true })
      .waitFor()
    checks.push(`Incident ${state} resumes to successful retry`)
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log(checks.join('\n'))
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}
