import type { Account, Building, Phase, ProjectRow, ServiceId } from './model'

/**
 * Two example accounts.
 *  - Halvering Estates (mature): the staging demo customer — two batches, eight workstreams.
 *  - Showcase Cinemas (pilot): one new batch at kickoff, two proposed workstreams.
 * Dates are past events or estimates the platform already holds. Nothing is scheduled ahead.
 */

const b = (prefix: string, list: Array<[string, string]>): Building[] =>
  list.map(([name, city], i) => ({ id: `${prefix}${i + 1}`, name, city }))
const rows = (ids: string[], step: number, note?: string): ProjectRow[] =>
  ids.map((buildingId) => ({ buildingId, step, note }))
const f = (...n: number[]) => n.map((i) => `f${i}`)
const o = (...n: number[]) => n.map((i) => `o${i}`)
const p = (buildingId: string, step: number, extra: Partial<ProjectRow> = {}): ProjectRow => ({ buildingId, step, ...extra })

/** Current service is now; the other services on this workstream's route are planned. */
const route = (services: ServiceId[], now: ServiceId, startedOn?: string): Phase[] =>
  services.map((service) => (service === now ? { service, state: 'now', ...(startedOn ? { startedOn } : {}) } : { service, state: 'planned' }))

/* ------------------------------------------------------------ Halvering */

const FLAGSHIP = b('f', [
  ['Halverkamp 19', 'Hamburg'],
  ['Kelmsdorfer Straße 41', 'Berlin'],
  ['Kervelstraat 14', 'Antwerp'],
  ['Speicherallee 7', 'Hamburg'],
  ['Lindenhof 3', 'Munich'],
  ['Am Hafen 12', 'Bremen'],
  ['Wiesenstraße 88', 'Frankfurt'],
  ['Brückenstraße 5', 'Cologne'],
  ['Marktplatz 2', 'Düsseldorf'],
  ['Havenweg 30', 'Rotterdam'],
  ['Kanaalstraat 9', 'Ghent'],
  ['Parkring 16', 'Stuttgart'],
])
FLAGSHIP[0].photo = '/concept/sites/halverkamp.jpg'
FLAGSHIP[2].photo = '/concept/sites/kervelstraat.jpg'

const OFFICES = b('o', [
  ['Rue Belvaux 22', 'Liège'],
  ['Avenue Louise 140', 'Brussels'],
  ['Rue de la Loi 81', 'Brussels'],
  ['Meir 48', 'Antwerp'],
  ['Rue Nationale 9', 'Lille'],
  ['Quai Perrache 30', 'Lyon'],
  ['Rue de Rivoli 112', 'Paris'],
  ['Boulevard Haussmann 55', 'Paris'],
  ['Rue Sainte-Catherine 7', 'Bordeaux'],
  ['Place Kléber 4', 'Strasbourg'],
  ['Rue du Faubourg 18', 'Toulouse'],
  ['Cours Mirabeau 26', 'Aix-en-Provence'],
  ['Friedrichstraße 200', 'Berlin'],
  ['Königsallee 60', 'Düsseldorf'],
  ['Zeil 106', 'Frankfurt'],
  ['Leopoldstraße 33', 'Munich'],
  ['Mönckebergstraße 11', 'Hamburg'],
  ['Schildergasse 72', 'Cologne'],
  ['Prager Straße 15', 'Dresden'],
  ['Breite Straße 2', 'Hanover'],
  ['Kaiserstraße 44', 'Karlsruhe'],
  ['Domplatz 8', 'Münster'],
  ['Grand-Place 3', 'Namur'],
  ['Rue Neuve 61', 'Charleroi'],
])
OFFICES[18].photo = '/concept/sites/prager.jpg'

const halvering: Account = {
  id: 'halvering',
  customer: 'Halvering Estates',
  user: 'Olena Mostepan',
  kind: 'mature',
  buildings: [...FLAGSHIP, ...OFFICES],
  toReconcile: 0,
  batches: [
    {
      id: 'flagship',
      name: 'Flagship sites',
      goal: 'Cut energy use at the 12 flagship sites',
      target: 'Dec 2027',
      buildingIds: FLAGSHIP.map((x) => x.id),
      route: ['indicative', 'scope', 'tender', 'pricing', 'delivery'],
      planState: 'live',
      planProposed: '12 May 2026',
      planAgreed: '20 May 2026',
      changes: '1 project dropped this month',
      createdOn: '6 May 2026',
    },
    {
      id: 'offices',
      name: 'Offices DE, FR and BE',
      goal: 'Replace gas heating and add EV charging in the office portfolio',
      buildingIds: OFFICES.map((x) => x.id),
      route: ['indicative', 'scope', 'tender', 'pricing', 'delivery'],
      planState: 'live',
      planProposed: '28 Jul 2026',
      planAgreed: '4 Aug 2026',
      changes: '6 assets joined this month',
      createdOn: '21 Jul 2026',
    },
  ],
  workstreams: [
    // Flagship
    {
      id: 'solar-est', batchId: 'flagship', name: 'Solar PV · Estimates', service: 'indicative',
      phases: [
        {
          service: 'indicative', state: 'done', startedOn: '20 May 2026', completedOn: '28 Aug 2026',
          projects: [
            ...['f1', 'f5', 'f7', 'f12'].map((id) =>
              p(id, 3, {
                estimate: [115, 140],
                decision: 'go',
                destination: 'tender',
                decidedOn: '28 Aug 2026',
                left: { kind: 'split', to: 'solar-de', on: '1 Sep 2026' },
              }),
            ),
            ...['f2', 'f8', 'f9'].map((id) =>
              p(id, 3, {
                estimate: [120, 145],
                decision: 'scope',
                destination: 'scope',
                decidedOn: '28 Aug 2026',
                left: { kind: 'split', to: 'solar-roof', on: '1 Sep 2026' },
              }),
            ),
            p('f6', 3, {
              estimate: [80, 95],
              decision: 'no',
              decidedOn: '28 Aug 2026',
              dropped: true,
              left: { kind: 'dropped', on: '28 Aug 2026' },
            }),
          ],
        },
      ],
      solution: 'solar',
      owner: 'done',
      now: '',
      startedOn: '20 May 2026',
      closedOn: '28 Aug 2026',
      completedOn: '28 Aug 2026',
      needs: [],
      projects: [
        ...['f1', 'f5', 'f7', 'f12'].map((id) =>
          p(id, 3, {
            estimate: [115, 140],
            decision: 'go',
            destination: 'tender',
            decidedOn: '28 Aug 2026',
            left: { kind: 'split', to: 'solar-de', on: '1 Sep 2026' },
          }),
        ),
        ...['f2', 'f8', 'f9'].map((id) =>
          p(id, 3, {
            estimate: [120, 145],
            decision: 'scope',
            destination: 'scope',
            decidedOn: '28 Aug 2026',
            left: { kind: 'split', to: 'solar-roof', on: '1 Sep 2026' },
          }),
        ),
        p('f6', 3, {
          estimate: [80, 95],
          decision: 'no',
          decidedOn: '28 Aug 2026',
          dropped: true,
          left: { kind: 'dropped', on: '28 Aug 2026' },
        }),
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'solar-de', batchId: 'flagship', name: 'Solar PV DE', service: 'tender',
      from: { workstreamId: 'solar-est', kind: 'split', on: '1 Sep 2026' },
      phases: [
        {
          service: 'indicative', state: 'done', startedOn: '20 May 2026', completedOn: '28 Aug 2026',
          projects: [
            ...['f1', 'f5', 'f7', 'f12'].map((id) => p(id, 3, { estimate: [115, 140], decision: 'go', destination: 'tender', decidedOn: '28 Aug 2026' })),
            p('f9', 3, { estimate: [120, 145], decision: 'scope', destination: 'scope', decidedOn: '28 Aug 2026' }),
          ],
        },
        { service: 'tender', state: 'now', startedOn: '1 Sep 2026' },
        { service: 'delivery', state: 'planned' },
      ],
      solution: 'solar',
      owner: 'suppliers', now: '', startedOn: '1 Sep 2026',
      next: { kind: 'offers', in: 8, invited: 11, chased: '12 Oct 2026' },
      needs: [
        { label: 'Offers still to come in', why: 'Needed before offers are compared', owner: 'suppliers', since: '12 Oct 2026' },
        { label: 'Brief', why: 'Sent to invited suppliers', owner: 'cquel', received: '15 Sep 2026' },
      ],
      surveyDocs: true,
      tender: {
        source: 'CQuel network',
        approached: 57,
        invited: 11,
        invitedOn: '15 Sep 2026',
        matchedOn: '12 Sep 2026',
        offersDue: '24 Oct 2026',
        brief: 'Workstream brief + 1 addition',
        briefAgreedOn: '10 Sep 2026',
        criteria: ['Low risk appetite', 'Company financial stability', 'PPA or capex', 'In-house personnel', 'In-house AC/DC installation', 'Zero downtime', 'Under 25 kg/m²', 'Grid connection experience', 'On time, on budget'],
        offers: { received: 6, partial: 2, noResponse: 3, summary: '8 of 11 in. The last 3 were chased on 12 Oct. Partial offers cover some projects only.' },
      },
      projects: [
        p('f1', 2, {
          note: 'Survey confirmed the roof can take panels',
          sizeKwp: 180,
          briefLabel: 'Own · 1 addition',
          briefStrong: true,
          briefNote: 'Roof access by internal stairs only',
          visit: { state: 'done', on: '8 Oct 2026', note: 'roof can take panels', detail: 'The roof can take the panels' },
          basedOn: [
            { label: 'Size', value: '180 kWp', source: 'Estimates' },
            { label: 'Roof', value: 'Flat, 1,400 m² usable', source: 'Site check, 8 Oct' },
            { label: 'Electricity use', value: '410 MWh a year', source: '12 months of bills' },
            { label: 'Indicative estimate', value: '€115–140k · 7–9 yr payback', source: 'Estimates, 28 Aug' },
          ],
          history: [
            { event: 'Brief addition sent', detail: 'Roof access by internal stairs only — sent to the 11 suppliers.', date: '9 Oct' },
            { event: 'Site check done', detail: 'The roof can take the panels.', date: '8 Oct' },
            { event: 'Invited to tender', detail: '11 suppliers in Solar PV DE.', date: '15 Sep' },
            { event: 'Moved to Tender', detail: 'You decided to go ahead on 28 Aug; roof data was complete, so no scope needed.', date: '1 Sep' },
            { event: 'Estimate presented', detail: '€115–140k, 7–9 year payback.', date: '28 Aug' },
            { event: 'Joined Solar PV', detail: 'Allocated from Flagship sites.', date: '20 May' },
          ],
        }),
        p('f5', 2, { sizeKwp: 220, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f7', 2, { sizeKwp: 260, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f12', 2, { sizeKwp: 190, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f9', 2, {
          joined: { on: '4 Nov 2026', from: 'solar-roof' },
          briefLabel: 'Workstream brief',
          visit: { state: 'skip' },
          sizeKwp: 200,
          history: [{ event: 'Matched to brief', detail: 'Solar PV DE', date: '15 Sep 2026' }],
        }),
      ],
      activity: [
        { date: '4 Nov', title: 'Marktplatz 2 joined', text: 'From Solar PV · Missing roof data.' },
        { date: '12 Oct', title: 'Last 3 suppliers chased', text: '8 of 11 offers in.' },
        { date: '9 Oct', title: 'Brief addition sent to suppliers', text: 'Halverkamp 19: roof access by internal stairs only.' },
        { date: '8 Oct', title: 'Site check at Halverkamp 19', text: 'The roof can take the panels.' },
        { date: '15 Sep', title: '11 suppliers invited', text: 'Matched to the brief from 57 approached.' },
        { date: '1 Sep', title: 'Package started', text: '4 projects from Solar PV · Estimates — you decided to go ahead, 28 Aug.' },
      ],
      documents: [
        { name: 'Site check — Halverkamp 19', type: 'PDF', meta: '8 Oct', action: 'Download' },
        { name: 'Brief — Solar PV DE', type: 'PDF', meta: 'agreed 10 Sep', action: 'Download' },
        { name: 'Indicative estimates — Solar PV', type: 'PDF', meta: 'PDF · from Solar PV · Estimates · 28 Aug', action: 'Download' },
        { name: 'Results', meta: 'After all offers are in', muted: true },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'solar-roof', batchId: 'flagship', name: 'Solar PV · Missing roof data', service: 'scope',
      from: { workstreamId: 'solar-est', kind: 'split', on: '1 Sep 2026' },
      phases: [
        {
          service: 'indicative', state: 'done', startedOn: '20 May 2026', completedOn: '28 Aug 2026',
          projects: [
            ...['f2'].map((id) => p(id, 3, { estimate: [115, 140], decision: 'scope', destination: 'scope', decidedOn: '28 Aug 2026' })),
            ...['f8', 'f9'].map((id) => p(id, 3, { estimate: [120, 145], decision: 'scope', destination: 'scope', decidedOn: '28 Aug 2026' })),
          ],
        },
        { service: 'scope', state: 'now', startedOn: '1 Sep 2026' },
        { service: 'tender', state: 'planned' },
        { service: 'delivery', state: 'planned' },
      ],
      solution: 'solar',
      owner: 'you', now: '', startedOn: '1 Sep 2026',
      next: { kind: 'roof', since: '2 Oct 2026' },
      surveyNote: 'once drawings are in',
      found: 'No roof drawings for 3 projects — Found in Estimates, 28 Aug',
      needs: [
        { label: 'Roof drawings', why: 'Shows whether each roof can take panels', owner: 'you', since: '2 Oct 2026' },
        { label: 'Roof surveys', why: 'CQuel books them once drawings are in', owner: 'cquel' },
      ],
      projects: [
        p('f2', 1, { gap: 'Roof drawings', visit: { state: 'unbooked', detail: 'CQuel books it once drawings are in' } }),
        p('f8', 1, {
          gap: 'Roof drawings',
          visit: { state: 'unbooked', detail: 'CQuel books it once drawings are in' },
          hold: { since: '2 Oct 2026' },
        }),
        p('f9', 1, {
          gap: 'Roof drawings',
          joined: { on: '1 Sep 2026', from: 'solar-est' },
          left: { kind: 'moved', to: 'solar-de', on: '4 Nov 2026' },
          history: [{ event: 'Roof drawings requested', detail: 'Solar PV · Missing roof data', date: '2 Oct 2026' }],
        }),
      ],
      activity: [
        { date: '4 Nov', title: 'Marktplatz 2 moved', text: 'To Solar PV DE.' },
        { date: '2 Oct', title: 'Roof drawings requested', text: 'For 3 buildings, by email to you.' },
        { date: '1 Sep', title: 'Package started', text: '3 projects moved from Estimates — no roof drawings; survey needed before tender.' },
      ],
      documents: [
        { name: 'Indicative estimates — Solar PV', type: 'PDF', meta: 'PDF · from Solar PV · Estimates · 28 Aug', action: 'Download' },
        { name: 'Files you sent', meta: 'you sent · site photos, 12 months of bills', action: 'View' },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'ev-voltreny', batchId: 'flagship', name: 'EV charging · Voltreny', service: 'delivery',
      phases: [
        {
          service: 'indicative', state: 'done', startedOn: '20 May 2026', completedOn: '30 May 2026',
          projects: [
            ...['f1', 'f3', 'f4', 'f6'].map((id) => p(id, 3, { estimate: [23, 28], paybackYears: 6, decision: 'go', destination: 'tender', decidedOn: '30 May 2026' })),
            ...['f10', 'f11'].map((id) => p(id, 3, { estimate: [24, 29], paybackYears: 6, decision: 'go', destination: 'tender', decidedOn: '30 May 2026' })),
          ],
        },
        {
          service: 'tender', state: 'done', startedOn: '2 Jun 2026', completedOn: '5 Aug 2026', outcome: 'Voltreny chosen',
          tender: { invited: 10, offers: { received: 7 } },
          projects: rows(f(1, 3, 4, 6, 10, 11), 5),
        },
        { service: 'delivery', state: 'now', startedOn: '6 Aug 2026' },
      ],
      solution: 'ev', supplier: 'Voltreny',
      owner: 'suppliers', now: '', startedOn: '6 Aug 2026',
      deliveryProfile: { contractValue: 152, expectedCompletion: '16 Dec 2026', siteChecksOn: '20 Aug 2026', siteChecks: 3 },
      needs: [{ label: 'Start dates for 3 projects', why: 'Voltreny is planning them', owner: 'suppliers' }],
      projects: [
        p('f3', 2, {
          visit: { state: 'done', on: '20 Aug 2026' },
          basedOn: [
            { label: 'Car park', value: 'Can take 4 chargers', source: 'Site check · 20 Aug' },
            { label: 'Electricity use', value: '286 MWh a year', source: '12 months of bills' },
            { label: 'Roof', value: 'Flat, age unknown', source: 'Site photos' },
          ],
          delivery: {
            value: 26, confirmPhase: 'phase2', expectedCompletion: { on: '18 Nov 2026', state: 'estimate' },
            phases: {
              start: { on: '12 Aug 2026', state: 'confirmed', source: 'contract_start' },
              phase1: { on: '20 Aug 2026', state: 'confirmed' },
              phase2: { on: '14 Oct 2026', state: 'from_invoice' },
              phase3: { on: '4 Nov 2026', state: 'estimate' },
              phase4: { on: '18 Nov 2026', state: 'estimate' },
            },
          },
          history: [
            { event: 'Installing started', detail: "From Voltreny's invoice — waiting for you to confirm the date.", date: '14 Oct' },
            { event: 'Site check done', detail: 'Car park can take 4 chargers.', date: '20 Aug' },
            { event: 'Start', detail: 'Contract start date', date: '12 Aug' },
            { event: 'Contract signed', detail: 'Voltreny · €26k', date: '6 Aug' },
            { event: 'Moved to Delivery', detail: 'Voltreny: best price and earliest start.', date: '6 Aug' },
            { event: 'Estimate presented', detail: '€23–28k.', date: '30 May' },
            { event: 'Joined EV charging', detail: 'Allocated from Flagship sites.', date: '20 May' },
          ],
        }),
        p('f4', 5, {
          visit: { state: 'done', on: '20 Aug 2026' },
          delivery: {
            value: 24, confirmPhase: 'complete',
            phases: {
              start: { on: '12 Aug 2026', state: 'confirmed', source: 'contract_start' },
              phase1: { on: '20 Aug 2026', state: 'confirmed' },
              phase2: { on: '1 Sep 2026', state: 'confirmed' },
              phase3: { on: '22 Sep 2026', state: 'confirmed' },
              phase4: { on: '2 Oct 2026', state: 'confirmed' },
              complete: { on: '7 Oct 2026', state: 'from_invoice' },
            },
          },
        }),
        p('f1', 5, {
          visit: { state: 'done', on: '20 Aug 2026' },
          delivery: {
            value: 25,
            phases: {
              start: { on: '12 Aug 2026', state: 'confirmed', source: 'contract_start' },
              phase1: { on: '20 Aug 2026', state: 'confirmed' },
              phase2: { on: '1 Sep 2026', state: 'confirmed' },
              phase3: { on: '18 Sep 2026', state: 'confirmed' },
              phase4: { on: '25 Sep 2026', state: 'confirmed' },
              complete: { on: '30 Sep 2026', state: 'confirmed' },
            },
          },
        }),
        p('f6', 0, { delivery: { value: 27, phases: {} } }),
        p('f10', 0, { delivery: { value: 25, phases: {} } }),
        p('f11', 0, { delivery: { value: 25, phases: {} } }),
      ],
      activity: [
        { date: '14 Oct', title: 'Installing started at Kervelstraat 14', text: "From Voltreny's invoice, confirm the date." },
        { date: '7 Oct', title: 'Speicherallee 7 complete', text: "From Voltreny's invoice, confirm the date." },
        { date: '30 Sep', title: 'Halverkamp 19 complete', text: 'Handed over.' },
        { date: '20 Aug', title: 'Site checks done', text: 'Halverkamp 19, Kervelstraat 14, Speicherallee 7.' },
        { date: '6 Aug', title: 'Package started', text: '6 projects from EV charging · Tender; Voltreny: best price and earliest start.' },
      ],
      documents: [
        { name: 'Handover pack — Halverkamp 19', type: 'PDF', meta: '30 Sep', action: 'Download' },
        { name: 'Site checks', type: '3 PDF', meta: '20 Aug', action: 'Download' },
        { name: 'Contract — Voltreny', type: 'PDF', meta: 'signed 6 Aug', action: 'Download' },
        { name: 'Files you sent', meta: 'you sent · site plans, 12 months of bills', action: 'View' },
      ],
      lead: 'Tamsin Quarrell',
    },
    // Offices
    {
      id: 'hp-ind', batchId: 'offices', name: 'Heat pumps', service: 'indicative',
      phases: route(['indicative', 'scope', 'tender', 'delivery'], 'indicative', '4 Aug 2026'),
      solution: 'ashp',
      owner: 'cquel', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'landing' },
      needs: [
        { label: 'Heat demand model — 8 buildings', why: 'From the gas bills you sent', owner: 'cquel', since: '15 Oct 2026' },
        { label: 'Gas bills, 12 months — 11 buildings', why: 'Heating load per building', owner: 'you', received: '3 Oct 2026' },
      ],
      projects: [
        ...o(2, 3, 4).map((id) => p(id, 1, { ready: true })),
        ...rows(o(5, 6, 7, 8, 9, 10, 11, 12), 1),
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'hp-be', batchId: 'offices', name: 'Heat pumps · BE offices', service: 'scope',
      phases: route(['scope', 'tender', 'delivery'], 'scope', '4 Aug 2026'),
      solution: 'ashp',
      owner: 'cquel', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'writing' },
      surveyNote: 'date to confirm',
      needs: [{ label: 'Last survey', why: 'Scope is written after it', owner: 'cquel' }],
      projects: [
        p('o1', 3, { visit: { state: 'done', on: '7 Oct 2026' } }),
        p('o23', 3, { visit: { state: 'done', on: '7 Oct 2026' } }),
        p('o24', 2, { visit: { state: 'booked', note: 'date to confirm' } }),
      ],
      activity: [
        { date: '7 Oct', title: 'Surveys done', text: 'Rue Belvaux 22 and Grand-Place 3.' },
        { date: '4 Aug', title: 'Package started', text: '3 projects allocated from Offices DE, FR and BE.' },
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'ev-ladewerk', batchId: 'offices', name: 'EV charging · Ladewerk', service: 'pricing',
      phases: route(['pricing', 'delivery'], 'pricing', '8 Sep 2026'),
      solution: 'ev', supplier: 'Ladewerk',
      owner: 'you', now: '', startedOn: '8 Sep 2026', lead: 'Rich Amos',
      next: { kind: 'sign', since: '15 Oct 2026' },
      pricing: { source: 'Incumbent', total: 196, setOn: '8 Sep 2026', setNote: 'runs your existing chargers', agreedOn: '6 Oct 2026', contractOn: '15 Oct 2026' },
      needs: [{ label: 'Contract to sign', why: 'Sent 15 Oct', owner: 'you', since: '15 Oct 2026' }],
      projects: o(13, 14, 15, 16, 17, 18).map((id) => p(id, 5, { decision: 'go', decidedOn: '6 Oct 2026' })),
      activity: [
        { date: '15 Oct', title: 'Contract sent to you', text: 'Contract sent to you.' },
        { date: '6 Oct', title: 'Price agreed — €196k for 6 projects', text: '€196k for 6 projects.' },
        { date: '8 Sep', title: 'Package started', text: '6 projects allocated from Offices DE, FR and BE; Ladewerk runs the existing chargers.' },
      ],
    },
    {
      id: 'ev-chargeo', batchId: 'offices', name: 'EV charging · Chargeo', service: 'pricing',
      phases: route(['pricing', 'delivery'], 'pricing', '22 Sep 2026'),
      solution: 'ev', supplier: 'Chargeo',
      owner: 'you', now: '', startedOn: '22 Sep 2026', lead: 'Rich Amos',
      next: { kind: 'agreePrice', since: '9 Oct 2026' },
      pricing: {
        priced: 'Per project', source: 'Incumbent', setOn: '22 Sep 2026', setNote: 'runs your existing chargers',
        requestedOn: '24 Sep 2026', receivedOn: '2 Oct 2026', analysedOn: '9 Oct 2026', analysisNote: '3 match, 1 above on groundworks',
      },
      needs: [{ label: 'Agree the price for 4 projects', why: 'Analysis sent 9 Oct', owner: 'you', since: '9 Oct 2026' }],
      projects: [
        p('o19', 4, {
          price: 38, analysis: 'Matches contract rates', decision: 'waiting',
          basedOn: [
            { label: 'Chargers', value: '6 × 22 kW', source: 'Site plan' },
            { label: 'Car park', value: 'Owned, 40 spaces', source: 'Your files' },
            { label: 'Contract rates', value: 'Chargeo, 2024 rates', source: 'Existing contract' },
          ],
          history: [
            { event: 'Analysis sent', detail: 'Matches contract rates.', date: '9 Oct' },
            { event: 'Price received', detail: '€38k from Chargeo.', date: '2 Oct' },
            { event: 'Price requested', detail: 'From Chargeo.', date: '24 Sep' },
            { event: 'Joined EV charging · Chargeo', detail: 'Allocated from Offices DE, FR and BE — Chargeo runs the existing chargers.', date: '22 Sep' },
          ],
        }),
        p('o20', 4, { price: 31, analysis: 'Matches contract rates', decision: 'waiting' }),
        p('o21', 4, { price: 34, analysis: 'Groundworks €4k above contract rate', analysisStrong: true, decision: 'waiting' }),
        p('o22', 4, { price: 29, analysis: 'Matches contract rates', decision: 'waiting' }),
      ],
      activity: [
        { date: '9 Oct', title: 'Analysis sent to you', text: '3 prices match your contract rates; Kaiserstraße 44 is €4k above on groundworks.' },
        { date: '2 Oct', title: 'Price received from Chargeo', text: '€132k for 4 projects.' },
        { date: '24 Sep', title: 'Price requested', text: 'From Chargeo, for 4 projects.' },
        { date: '22 Sep', title: 'Package started', text: '4 projects allocated from Offices DE, FR and BE — Chargeo runs the existing chargers.' },
      ],
      documents: [
        { name: 'Price analysis — EV charging · Chargeo', type: 'PDF', meta: '9 Oct', action: 'Download' },
        { name: 'Chargeo price', type: 'PDF', meta: '2 Oct', action: 'Download' },
        { name: 'Contract', meta: 'After you agree the price', muted: true },
      ],
    },
    {
      id: 'ev-be', batchId: 'offices', name: 'EV charging · BE offices', service: 'delivery',
      phases: route(['delivery'], 'delivery', '1 Oct 2026'),
      solution: 'ev', supplier: 'Voltreny',
      owner: 'suppliers', now: '', startedOn: '1 Oct 2026', lead: 'Tamsin Quarrell',
      next: { kind: 'design', n: 2, on: '16 Oct 2026' },
      deliveryProfile: { contractValue: 54, siteChecksOn: '16 Oct 2026', siteChecks: 2 },
      needs: [],
      projects: o(23, 24).map((id) => p(id, 1, {
        visit: { state: 'done', on: '16 Oct 2026' },
        delivery: {
          value: 27,
          phases: {
            start: { on: '1 Oct 2026', state: 'confirmed' },
            phase1: { on: '16 Oct 2026', state: 'confirmed' },
          },
        },
      })),
      activity: [{ date: '16 Oct', title: 'Site checks done', text: 'Grand-Place 3 and Rue Neuve 61.' }],
    },
  ],
  activity: [
    { date: '15 Oct', title: 'Heat pumps', text: 'Estimates ready for 3 more assets', batchId: 'offices' },
    { date: '8 Oct', title: 'Solar PV DE', text: 'Halverkamp 19 · roof can take panels', batchId: 'flagship' },
    { date: '3 Oct', title: 'Offices DE, FR and BE', text: '6 assets joined', batchId: 'offices' },
    { date: '2 Oct', title: 'Solar PV · Missing roof data', text: 'Roof drawings requested for 3 buildings', batchId: 'flagship' },
    {
      date: '28 Aug',
      title: 'Solar PV · Estimates split in two',
      text: "4 ready to tender, 3 missing roof data. Am Hafen 12 dropped: roof can't take panels.",
      batchId: 'flagship',
    },
  ],
  documents: [],
  momentum: [
    { month: 'Mar 26', started: 0, finished: 0 },
    { month: 'Apr 26', started: 0, finished: 0 },
    { month: 'May 26', started: 3, finished: 1 },
    { month: 'Jun 26', started: 5, finished: 1 },
    { month: 'Jul 26', started: 6, finished: 1 },
    { month: 'Aug 26', started: 13, finished: 4 },
    { month: 'Sep 26', started: 22, finished: 6 },
    { month: 'Oct 26', started: 25, finished: 6 },
  ],
}

/* ------------------------------------------------------------- Showcase */

const CINEMAS = b('c', [
  ['Bluewater (Dartford)', 'Dartford'],
  ['Leeds', 'Leeds'],
  ['Derby', 'Derby'],
  ['Nottingham', 'Nottingham'],
  ['Coventry', 'Coventry'],
  ['Avonmeads (Bristol)', 'Bristol'],
  ['Reading', 'Reading'],
  ['Peterborough', 'Peterborough'],
])
CINEMAS[0].photo = '/concept/sites/bluewater.jpg'
const c = (...n: number[]) => n.map((i) => `c${i}`)

const showcase: Account = {
  id: 'showcase',
  customer: 'Showcase Cinemas',
  user: 'Olena Mostepan',
  kind: 'pilot',
  buildings: CINEMAS,
  toReconcile: 0,
  batches: [
    {
      id: 'pilot',
      name: 'Pilot · 8 cinemas',
      goal: 'cost of EV charging and solar across 8 cinemas',
      lead: 'Tamsin Quarrell',
      filesSummary: 'Site plans and 12 months of electricity bills',
      buildingIds: CINEMAS.map((x) => x.id),
      route: ['indicative', 'scope', 'tender', 'delivery'],
      routeNotes: {
        indicative: 'Cost and payback for both, so you can decide before anything is tendered.',
        scope: 'Roof condition and grid capacity are not in the files yet.',
        tender: 'No incumbent suppliers. We match suppliers from our network.',
        pricing: "Not required — there's no existing supplier to price with.",
        delivery: 'Payment plan and install, tracked per site.',
      },
      planState: 'proposed',
      filesReceived: '9 Oct 2026',
      filesCount: 23,
      received: [
        { label: 'Site plans', date: '9 Oct' },
        { label: 'Drawings', date: '9 Oct' },
        { label: 'Electricity bills, 12 months', date: '9 Oct' },
      ],
      planProposed: '14 Oct 2026',
      upcoming: [
        { stage: 'scope', label: 'Roof surveys — 5 sites', why: "We'll book them if you go ahead with solar", owner: 'cquel' },
        { stage: 'scope', label: 'Grid connection capacity', why: "We'll check with the network operator", owner: 'cquel' },
      ],
      known: [
        { label: 'Sites', value: '8 cinemas, 6 with their own car park', source: 'Site list' },
        { label: 'Parking', value: '1,940 spaces in total', source: 'Site plans' },
        { label: 'Roofs', value: 'Flat on 5 sites, pitched or shared on 3', source: 'Drawings' },
        { label: 'Electricity', value: '12 months of bills for every site', source: 'Bills' },
      ],
      createdOn: '8 Oct 2026',
    },
  ],
  workstreams: [
    {
      id: 'pilot-ev', batchId: 'pilot', name: 'EV Charging', service: 'indicative',
      phases: (['indicative', 'scope', 'tender', 'delivery'] as ServiceId[]).map((service) => ({ service, state: 'planned' as const })),
      solution: 'ev',
      owner: 'you', proposed: true, now: '',
      gives: 'cost and payback per site',
      needs: [
        { label: 'Half-hourly electricity data, 12 months', scope: '3 sites', why: 'to size chargers', owner: 'you', since: '14 Oct 2026' },
        { label: 'Car park ownership', scope: 'Leeds, Reading', why: 'landlord consent', owner: 'you', since: '14 Oct 2026' },
      ],
      projects: rows(c(2, 4, 7), 0), lead: 'Tamsin Quarrell',
    },
    {
      id: 'pilot-solar', batchId: 'pilot', name: 'Solar PV', service: 'indicative',
      phases: (['indicative', 'scope', 'tender', 'delivery'] as ServiceId[]).map((service) => ({ service, state: 'planned' as const })),
      solution: 'solar',
      owner: 'you', proposed: true, now: '',
      gives: 'system size, cost and payback per roof',
      exclusion: 'Leeds, Nottingham and Reading left out — pitched or shared roofs',
      needs: [
        { label: 'Roof age or last re-roof', scope: '5 sites', why: 'affects payback', owner: 'you', since: '14 Oct 2026' },
      ],
      projects: c(1, 3, 5, 6, 8).map((id) =>
        id === 'c1'
          ? p(id, 0, {
              basedOn: [
                { label: 'Roof', value: 'Flat, retail park', source: 'Drawings' },
                { label: 'Electricity use', value: '12 months of bills', source: 'Bills, 9 Oct' },
                { label: 'Car park', value: 'On site', source: 'Site plans' },
              ],
            })
          : p(id, 0),
      ), lead: 'Tamsin Quarrell',
    },
  ],
  activity: [
    { date: '14 Oct', title: 'Plan proposed', text: 'EV charging · 3 sites, Solar PV · 5 sites', batchId: 'pilot' },
    { date: '9 Oct', title: 'Files received', text: '23 files', batchId: 'pilot' },
    { date: '8 Oct', title: 'Pilot set up', text: '8 cinemas', batchId: 'pilot' },
  ],
  documents: [
    { name: 'Pilot plan', type: 'PDF', meta: '14 Oct', action: 'Download', batchId: 'pilot' },
    { name: 'Your files', type: '23 files', meta: 'you sent · 9 Oct', action: 'View', batchId: 'pilot' },
    { name: 'Indicative estimates', meta: 'After Estimates', muted: true, batchId: 'pilot' },
  ],
}

export const ACCOUNTS: Account[] = [halvering, showcase]
