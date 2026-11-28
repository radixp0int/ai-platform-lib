// The vendor contract review workflow, as its detail page reads it (board
// WfDetailB): five stages and twelve steps, who decides, its runs and versions.
// Step ids match the live run's (./vendor-contract-run.ts), so a step picked on
// the detail page is the same step on the canvas.
import type { WorkflowSpec, WorkflowStepSpec } from '../../../workflows/components/workflow-spec'

const step = (s: WorkflowStepSpec): WorkflowStepSpec => s

const request = { step: 'trigger', output: 'request' }

export const VENDOR_CONTRACT_SPEC: WorkflowSpec = {
  id: 'vendor-contract-review',
  name: 'Vendor contract review',
  description:
    'Reviews a vendor contract before it is signed. Agents read the documents, check the vendor registry, review the financials and draft a review memo; a buyer approves it before the decision letter goes out.',
  owner: 'Dana Whitfield',
  startsWhen: 'A completed request is posted from the vendor portal',
  version: 'v12 · Sep 26',
  nextVersion: 'v13',
  liveRun: {
    state: 'waiting',
    title: 'Live run · Harbor Street Supply Co. · $450,000',
    sub: 'Stage 4 of 5, Approve · waiting on Dana W., due in 3h 40m',
  },
  stages: [
    {
      id: 'intake',
      name: 'Intake',
      typicalTime: '0:48',
      purpose: 'Takes the request in and pulls out what the later steps need.',
      columns: [
        [
          step({
            id: 'trigger',
            kind: 'trigger',
            title: 'Request received',
            does: 'Starts the run when a completed request is posted from the vendor portal.',
            reads: 'Nothing: it starts the run.',
            handsOn: 'The request and its documents.',
            io: { inputs: [], outputs: [{ name: 'request', type: 'file' }] },
          }),
          step({
            id: 'intake',
            kind: 'agent',
            title: 'Intake agent',
            does: 'Classifies the request and pulls out the fields the later steps need.',
            reads: 'The request.',
            handsOn: 'The fields the later steps read.',
            io: {
              inputs: [{ name: 'request', type: 'file', from: request }],
              outputs: [{ name: 'fields', type: 'object' }],
            },
          }),
        ],
      ],
    },
    {
      id: 'gather',
      name: 'Gather',
      typicalTime: '1:12',
      purpose: 'Checks the vendor in the registry, reads the financials and verifies the owners.',
      columns: [
        [
          step({
            id: 'registry',
            kind: 'tool',
            title: 'vendor_registry.pull',
            does: 'Pulls the supplier rating and any flags from the vendor registry.',
            reads: 'The vendor’s name.',
            handsOn: 'The supplier rating.',
            io: {
              inputs: [
                { name: 'vendor', type: 'text', from: { step: 'intake', output: 'fields' } },
              ],
              outputs: [{ name: 'rating', type: 'number' }],
            },
          }),
          step({
            id: 'financials',
            kind: 'agent',
            title: 'Review financials',
            does: 'Reads three years of statements and works out the margin cover.',
            reads: 'The request’s statements.',
            handsOn: 'The financials, summarised.',
            io: {
              inputs: [{ name: 'request', type: 'file', from: request }],
              outputs: [{ name: 'financials', type: 'object' }],
            },
          }),
          step({
            id: 'owners',
            kind: 'tool',
            title: 'owners.verify',
            does: 'Checks the vendor’s owners against the registry.',
            reads: 'The vendor’s name.',
            handsOn: 'The verified owners.',
            io: {
              inputs: [
                { name: 'vendor', type: 'text', from: { step: 'intake', output: 'fields' } },
              ],
              outputs: [{ name: 'owners', type: 'list' }],
            },
          }),
        ],
      ],
    },
    {
      id: 'analyze',
      name: 'Analyze',
      typicalTime: '2:05',
      purpose: 'Grades the risk and drafts the review memo.',
      columns: [
        [
          step({
            id: 'risk',
            kind: 'agent',
            title: 'Risk scoring',
            does: 'Grades the contract from 1 to 10 with the risk model.',
            reads: 'The rating and the financials.',
            handsOn: 'A risk grade.',
            io: {
              inputs: [
                { name: 'rating', type: 'number', from: { step: 'registry', output: 'rating' } },
                {
                  name: 'financials',
                  type: 'object',
                  from: { step: 'financials', output: 'financials' },
                },
              ],
              outputs: [{ name: 'risk_grade', type: 'number' }],
            },
          }),
          step({
            id: 'memo',
            kind: 'agent',
            title: 'Draft review memo',
            does: 'Writes the review memo and its recommendation.',
            reads: 'The risk grade.',
            handsOn: 'The review memo.',
            io: {
              inputs: [
                {
                  name: 'risk_grade',
                  type: 'number',
                  from: { step: 'risk', output: 'risk_grade' },
                },
              ],
              outputs: [{ name: 'review_memo', type: 'file' }],
            },
          }),
        ],
      ],
    },
    {
      id: 'approve',
      name: 'Approve',
      typicalTime: '2h 50m',
      purpose: 'A buyer reads the memo and decides. Larger contracts also need a senior buyer.',
      columns: [
        [
          step({
            id: 'policy',
            kind: 'decision',
            title: 'Policy check',
            does: 'Routes the run by contract size and any policy exceptions.',
            reads: 'The amount, the risk grade and the memo.',
            handsOn: 'The route, and any exceptions.',
            facts: [
              ['Under $500k', 'Buyer only'],
              ['$500k and over', 'Senior buyer as well'],
            ],
            io: {
              inputs: [
                { name: 'amount', type: 'money', from: { run: 'amount' } },
                {
                  name: 'risk_grade',
                  type: 'number',
                  from: { step: 'risk', output: 'risk_grade' },
                },
                {
                  name: 'review_memo',
                  type: 'file',
                  from: { step: 'memo', output: 'review_memo' },
                },
              ],
              outputs: [
                { name: 'route', type: 'choice' },
                { name: 'exceptions', type: 'list' },
              ],
            },
          }),
        ],
        [
          step({
            id: 'approve',
            kind: 'human',
            title: 'Approve review memo',
            does: 'The buyer reviews the memo and any policy exception, then approves, asks for changes or declines.',
            reads: 'The memo, the risk grade and any exceptions.',
            handsOn: 'The decision, and any conditions.',
            facts: [
              ['Who', 'Dana Whitfield, buyer'],
              ['Answer within', '4 hours'],
              ['Request changes', 'Sends it back to Draft review memo'],
            ],
            io: {
              inputs: [
                {
                  name: 'review_memo',
                  type: 'file',
                  from: { step: 'memo', output: 'review_memo' },
                },
                {
                  name: 'risk_grade',
                  type: 'number',
                  from: { step: 'risk', output: 'risk_grade' },
                },
                {
                  name: 'exceptions',
                  type: 'list',
                  from: { step: 'policy', output: 'exceptions' },
                },
              ],
              outputs: [
                { name: 'decision', type: 'choice' },
                { name: 'conditions', type: 'text' },
              ],
            },
          }),
          step({
            id: 'senior',
            kind: 'human',
            title: 'Senior buyer review',
            sometimes: true,
            does: 'A second approval on larger contracts.',
            reads: 'The memo and any exceptions.',
            handsOn: 'A second decision.',
            facts: [
              ['Who', 'Any senior buyer'],
              ['Only when', 'The contract is $500,000 or more'],
            ],
            io: {
              inputs: [
                {
                  name: 'review_memo',
                  type: 'file',
                  from: { step: 'memo', output: 'review_memo' },
                },
                {
                  name: 'exceptions',
                  type: 'list',
                  from: { step: 'policy', output: 'exceptions' },
                },
              ],
              outputs: [{ name: 'decision', type: 'choice' }],
            },
          }),
        ],
      ],
    },
    {
      id: 'decide',
      name: 'Decide & notify',
      typicalTime: '0:40',
      purpose: 'Writes the decision letter and tells the vendor.',
      columns: [
        [
          step({
            id: 'letter',
            kind: 'agent',
            title: 'Draft decision letter',
            does: 'Writes the letter that tells the vendor the decision.',
            reads: 'The decision.',
            handsOn: 'The decision letter.',
            io: {
              inputs: [
                { name: 'decision', type: 'choice', from: { step: 'approve', output: 'decision' } },
              ],
              outputs: [{ name: 'decision_letter', type: 'file' }],
            },
          }),
          step({
            id: 'notify',
            kind: 'tool',
            title: 'portal.notify',
            does: 'Posts the decision and the letter back to the vendor portal.',
            reads: 'The decision letter.',
            handsOn: 'Nothing new: it sends what it was given.',
            io: {
              inputs: [
                {
                  name: 'decision_letter',
                  type: 'file',
                  from: { step: 'letter', output: 'decision_letter' },
                },
              ],
              outputs: [],
            },
          }),
        ],
      ],
    },
  ],
  inputs: [
    {
      name: 'request',
      type: 'file',
      required: true,
      description: 'The completed request and its documents.',
    },
    { name: 'vendor', type: 'text', required: true, description: 'The company being reviewed.' },
    { name: 'amount', type: 'money', required: true, description: 'The contract value.' },
    {
      name: 'term_months',
      type: 'number',
      required: true,
      description: 'The length of the contract, in months.',
    },
    {
      name: 'references',
      type: 'list',
      required: false,
      description: 'Anyone vouching for the vendor, one per line.',
    },
    {
      name: 'reviewer',
      type: 'person',
      required: true,
      description: 'Who approves the review memo.',
      options: ['Dana Whitfield', 'Marcus Lee', 'Owen Blake'],
    },
  ],
  outputs: [
    {
      name: 'review_memo',
      type: 'file',
      description: 'The memo and its recommendation.',
      goesTo: 'Vendor file',
    },
    {
      name: 'risk_grade',
      type: 'number',
      description: 'The grade from the risk model, 1 to 10.',
      goesTo: 'Vendor file',
    },
    {
      name: 'decision',
      type: 'choice',
      description: 'Approved, sent back or declined.',
      goesTo: 'Vendor portal',
    },
    {
      name: 'decision_letter',
      type: 'file',
      description: 'The letter sent to the vendor.',
      goesTo: 'Vendor',
    },
  ],
  approvers: [
    {
      initials: 'DW',
      step: 'Approve review memo',
      who: 'Dana Whitfield, buyer',
      when: 'Every contract · answer within 4 hours',
    },
    {
      step: 'Senior buyer review',
      who: 'Any senior buyer',
      when: 'Only contracts of $500,000 or more',
    },
  ],
  systems: ['vendor_registry.pull', 'owners.verify', 'docs.read', 'docs.merge', 'portal.notify'],
  stats: [
    ['Runs', '31'],
    ['Approved', '24'],
    ['Typical run', '3h 05m'],
    ['Approvals on time', '29 of 31'],
  ],
  statsNote: 'The approval takes most of the time. Everything before it takes under five minutes.',
  timeNote: 'Typical time, last 31 runs',
  runs: [
    {
      id: '4821',
      name: 'Harbor Street Supply Co. · $450,000',
      startedBy: 'You',
      result: 'Waiting on Dana W.',
      state: 'waiting',
      stagesDone: 3,
      progress: 'Stage 4 of 5 · Approve',
      started: 'Today, 9:02',
    },
    {
      id: '4819',
      name: 'Copperleaf Farms · $310,000',
      startedBy: 'Marcus Lee',
      result: 'Approved',
      state: 'done',
      stagesDone: 5,
      progress: 'Finished',
      started: 'Nov 24',
      took: '3h 12m',
    },
    {
      id: '4816',
      name: 'Northwind Supply · $120,000',
      startedBy: 'Dana Whitfield',
      result: 'Approved with conditions',
      state: 'done',
      stagesDone: 5,
      progress: 'Finished',
      started: 'Nov 23',
      took: '2h 41m',
    },
    {
      id: '4812',
      name: 'Kestrel Analytics · $640,000',
      startedBy: 'Owen Blake',
      result: 'Approved by a senior buyer',
      state: 'done',
      stagesDone: 5,
      progress: 'Finished',
      started: 'Nov 21',
      took: '6h 05m',
    },
    {
      id: '4809',
      name: 'Ridgeline Dental · $220,000',
      startedBy: 'Dana Whitfield',
      result: 'Sent back for changes',
      state: 'stopped',
      stagesDone: 3,
      progress: 'Stopped at Approve',
      started: 'Nov 20',
      took: '4h 18m',
    },
    {
      id: '4803',
      name: 'Brightwater Labs · $95,000',
      startedBy: 'Marcus Lee',
      result: 'Declined',
      state: 'stopped',
      stagesDone: 3,
      progress: 'Stopped at Approve',
      started: 'Nov 18',
      took: '1h 02m',
    },
    {
      id: '4799',
      name: 'Oakmont Freight · $410,000',
      startedBy: 'Dana Whitfield',
      result: 'Approved',
      state: 'done',
      stagesDone: 5,
      progress: 'Finished',
      started: 'Nov 17',
      took: '2h 55m',
    },
    {
      id: '4794',
      name: 'Lumen Print Co. · $180,000',
      startedBy: 'Owen Blake',
      result: 'Approved',
      state: 'done',
      stagesDone: 5,
      progress: 'Finished',
      started: 'Nov 15',
      took: '3h 30m',
    },
  ],
  runsTotal: 31,
  versions: [
    {
      id: 'v12',
      change: 'Added a senior buyer review for contracts of $500,000 or more.',
      meta: 'Dana Whitfield · Sep 26',
      current: true,
    },
    {
      id: 'v11',
      change: 'Policy check now flags parent company ratings under 680.',
      meta: 'Marcus Lee · Aug 14',
    },
    { id: 'v10', change: 'First published version.', meta: 'Dana Whitfield · Jun 2' },
  ],
  draftNote: 'Edits go into a draft. Runs already going keep the version they started on.',
}

/** The live run's progress over the shape: steps it has finished, and the one it waits on. */
export const VENDOR_CONTRACT_LIVE = {
  done: ['trigger', 'intake', 'registry', 'financials', 'owners', 'risk', 'memo', 'policy'],
  current: 'approve',
}
