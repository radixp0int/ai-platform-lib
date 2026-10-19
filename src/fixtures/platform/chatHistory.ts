/**
 * A long conversation history, for the pages that have to page through one.
 *
 * `recentChats.ts` is the seven the landing page and the rail show. This is
 * what sits behind "View all": enough rows that a list has to fetch them in
 * pages, in the same mix of retail banking and treasury topics.
 *
 * Newest update first. Times are stored as ages and turned into timestamps
 * when the module loads, for the reason `recentChats.ts` gives: a literal
 * date reads as a dead fixture a month later.
 */
export type ChatSummary = {
  id: string
  /** One line that summarises the conversation, as the assistant titled it. */
  title: string
  /** ISO 8601. When the conversation was started. */
  createdAt: string
  /** ISO 8601. When the last message was added. Never before `createdAt`. */
  updatedAt: string
}

const titles = [
  'Positive pay exceptions before the 2pm cutoff',
  'Mortgage rate lock timing',
  'Lockbox remittance matching',
  'Sweep account thresholds',
  'Overdraft protection options',
  'Wire cutoff times by currency',
  'Reading the account analysis statement',
  'ACH return codes R01 through R10',
  'Same-day ACH limits and deadlines',
  'Reconciling the zero balance accounts',
  'Forward versus spot for the euro payables',
  'Monthly liquidity position against the thirty-day policy floor, all entities',
  'Laddering certificates of deposit',
  'Disputing a card transaction',
  'Setting up dual approval for wires',
  'Earnings credit rate changes this quarter',
  'Remote deposit capture limits',
  'Commercial card rebate tiers',
  'Why the escrow analysis shows a shortage',
  'Home equity line: draw period versus repayment',
  'Stopping payment on a lost check',
  'Fraud alerts on the operating account',
  'Controlled disbursement funding times',
  'Chargeback ratios for merchant services',
  'Amendment fees on a letter of credit',
  'Travel notices and foreign transaction fees',
  'Intraday overdrafts and daylight limits',
  'Opening a business savings account',
  'Payroll file rejected for a bad routing number',
  'Notional pooling across the European entities',
  'Refinancing break-even at today’s rates',
  'Adding a signer to a business account',
  'Returned item fees and how to avoid them',
  'Money market fund versus overnight sweep',
  'Wire recall after a mistyped beneficiary',
  'Debit blocks and filters for ACH',
  'Joint account rights of survivorship',
  'Borrowing base certificate due dates',
  'Covenant headroom on the revolving credit facility',
  'Early withdrawal penalty on a twelve-month CD',
  'Check image retrieval for last year’s audit',
  'Virtual account numbers for receivables',
  'Hedging the floating-rate term loan',
  'Private mortgage insurance removal at 80% loan-to-value',
  'Standing instructions for the monthly tax payment',
  'Interest on the trust account',
  'Card controls for employee spending',
  'Why the available balance differs from the ledger balance',
  'SWIFT fees on incoming international wires',
  'Account validation before the first vendor payment',
  'Cash flow forecast variance for the last four weeks',
  'Converting a sole proprietor account to an LLC',
  'Lifting a hold on a large deposit',
  'Real-time payments versus same-day ACH for refunds',
  'Collateral release after the final loan payment',
  'Student checking account fee waivers',
  'Year-end interest statements and the 1099-INT',
  'Bank fee benchmarking against last year’s analysis',
  'Dormant account notices and escheatment',
  'Entitlements for the new treasury analyst',
]

const MINUTE = 60_000

/** Minutes since the last message. Dense today, thinning out over two months. */
const updatedAgo = (index: number) => Math.round(12 * 1.16 ** index + 45 * index)

/** How long each conversation ran, in minutes: most are short, a few were reopened for weeks. */
const LIFETIMES = [0, 4, 26, 190, 9, 1_440, 55, 4_320, 2, 17, 20_160, 75]

const loadedAt = Date.now()

export const chatHistory: ChatSummary[] = titles.map((title, index) => {
  const updated = loadedAt - updatedAgo(index) * MINUTE
  return {
    id: `chat-${String(index + 1).padStart(3, '0')}`,
    title,
    createdAt: new Date(updated - LIFETIMES[index % LIFETIMES.length] * MINUTE).toISOString(),
    updatedAt: new Date(updated).toISOString(),
  }
})
