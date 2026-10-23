/** Interaction checks for the static loan review. Build Storybook first. */
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
const gate = (page) =>
  page
    .locator('aside')
    .first()
    .getByRole('button', { name: /Approve credit memo/ })
const log = (page) => page.locator('#wf-run-log')
try {
  {
    const page = await open('workflows-recipes-loan-review-run--run')
    await gate(page).click()
    await page.getByRole('button', { name: 'Approve', exact: true }).click()
    await empty(page).waitFor()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await log(page).getByText('Preparing the approval letter', { exact: true }).waitFor()
    checks.push('Loan approval clears the gate and starts the letter')
    await page.close()
  }
  {
    const page = await open('workflows-recipes-loan-review-run--run')
    await gate(page).click()
    await page.getByRole('button', { name: 'Decline', exact: true }).click()
    await empty(page).waitFor()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await log(page).getByText('Decision letter and notification skipped', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Approve', exact: true }).count(), 0)
    checks.push('Loan decline skips the letter and ends the run')
    await page.close()
  }
  {
    const page = await open('workflows-recipes-loan-review-run--run')
    await gate(page).click()
    await page.getByRole('button', { name: 'Request changes', exact: true }).click()
    await page.getByRole('button', { name: 'Run log', exact: true }).click()
    await log(page).getByText('Revising the memo with your notes', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Restart run', exact: true }).click()
    await gate(page).waitFor()
    checks.push('Loan request for changes revises the memo, and restart brings the gate back')
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log(checks.join('\n'))
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}
