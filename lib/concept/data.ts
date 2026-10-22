import type { Account, Basis, Building, ProjectRow } from './model'

/**
 * Two example accounts.
 *  - Halvering Estates (mature): the staging demo customer — two batches, twenty-five workstreams.
 *  - Showcase Cinemas (pilot): one new batch at kickoff, two proposed workstreams.
 * Dates are past events or estimates the platform already holds. Nothing is scheduled ahead.
 */

const b = (prefix: string, list: Array<[string, string]>): Building[] =>
  list.map(([name, city], i) => ({ id: `${prefix}${i + 1}`, name, city }))
const rows = (ids: string[], step: number, note?: string): ProjectRow[] =>
  ids.map((buildingId) => ({ buildingId, step, note }))
const f = (...n: number[]) => n.map((i) => `f${i}`)
const o = (...n: number[]) => n.map((i) => `o${i}`)
const range = (a: number, z: number) => Array.from({ length: z - a + 1 }, (_, i) => a + i)

const LED_BASIS: Array<[string, string]> = [
  ['Floor area', 'Floor plans'],
  ['Current lighting', 'Site photos'],
  ['Electricity use', '12 months of bills'],
  ['Operating hours', 'Your schedule'],
]
const ledBasis = (values?: string[]): Basis[] =>
  LED_BASIS.map(([label, source], i) => ({ label, source, value: values?.[i] ?? '—' }))

const p = (buildingId: string, step: number, extra: Partial<ProjectRow> = {}): ProjectRow => ({ buildingId, step, ...extra })

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
      goal: 'Replace gas heating in the office portfolio',
      target: 'Jun 2028',
      buildingIds: OFFICES.map((x) => x.id),
      route: ['indicative', 'scope', 'tender', 'pricing', 'delivery'],
      planState: 'live',
      planProposed: '28 Jul 2026',
      planAgreed: '4 Aug 2026',
      changes: '6 buildings joined this month',
      createdOn: '21 Jul 2026',
    },
  ],
  workstreams: [
    // Flagship
    {
      id: 'solar-ind', batchId: 'flagship', name: 'Solar PV', service: 'indicative', solution: 'solar',
      owner: 'done', now: '',
      startedOn: '20 May 2026', completedOn: '28 Aug 2026',
      needs: [], lead: 'Tamsin Quarrell',
      projects: [
        ...['f1', 'f4', 'f5', 'f7', 'f12'].map((id) => p(id, 3, { estimate: [115, 140], decision: 'go', destination: 'tender', decidedOn: '28 Aug 2026' })),
        ...['f2', 'f3', 'f6'].map((id) => p(id, 3, { estimate: [115, 140], decision: 'scope', destination: 'scope', decidedOn: '28 Aug 2026' })),
        ...['f8', 'f9', 'f10', 'f11'].map((id) => p(id, 3, { estimate: [120, 145], decision: 'scope', destination: 'scope', decidedOn: '28 Aug 2026' })),
      ],
    },
    {
      id: 'solar-de', batchId: 'flagship', name: 'Solar PV DE', service: 'tender', solution: 'solar',
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
            { label: 'Size', value: '180 kWp', source: 'Indicative pricing' },
            { label: 'Roof', value: 'Flat, 1,400 m² usable', source: 'Site check, 8 Oct' },
            { label: 'Indicative estimate', value: '€115–140k · 7–9 yr payback', source: 'Indicative pricing, 28 Aug' },
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
        p('f4', 2, { sizeKwp: 240, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f5', 2, { sizeKwp: 220, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f7', 2, { sizeKwp: 260, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
        p('f12', 2, { sizeKwp: 190, briefLabel: 'Workstream brief', visit: { state: 'skip' } }),
      ],
      activity: [
        { date: '12 Oct', title: 'Last 3 suppliers chased', text: '8 of 11 offers in.' },
        { date: '9 Oct', title: 'Brief addition sent to suppliers', text: 'Halverkamp 19: roof access by internal stairs only.' },
        { date: '8 Oct', title: 'Site check at Halverkamp 19', text: 'The roof can take the panels.' },
        { date: '15 Sep', title: '11 suppliers invited', text: 'Matched to the brief from 57 approached.' },
        { date: '1 Sep', title: 'Workstream started', text: '5 projects from Solar PV · Indicative pricing — you decided to go ahead, 28 Aug.' },
      ],
      documents: [
        { name: 'Brief — Solar PV DE', meta: 'PDF · agreed 10 Sep', action: 'Download' },
        { name: 'Site check — Halverkamp 19', meta: 'PDF · 8 Oct', action: 'Download' },
        { name: 'Indicative estimates — Solar PV', meta: 'PDF · 28 Aug', action: 'Download' },
        { name: 'Results', meta: 'After all offers are in', muted: true },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'solar-roof', batchId: 'flagship', name: 'Solar PV · Missing roof data', service: 'scope', solution: 'solar',
      owner: 'you', now: '', startedOn: '1 Sep 2026',
      next: { kind: 'roof', since: '2 Oct 2026' },
      surveyNote: 'once drawings are in',
      found: 'No roof drawings for 7 projects — Found in Indicative pricing, 28 Aug',
      needs: [
        { label: 'Roof drawings', why: 'Shows whether each roof can take panels', owner: 'you', since: '2 Oct 2026' },
        { label: 'Roof surveys', why: 'CQuel books them once drawings are in', owner: 'cquel' },
      ],
      projects: [
        p('f2', 1, { gap: 'Roof drawings', visit: { state: 'unbooked', detail: 'CQuel books it once drawings are in' } }),
        p('f3', 1, {
          gap: 'Roof drawings',
          visit: { state: 'unbooked', detail: 'CQuel books it once drawings are in' },
          basedOn: [
            { label: 'Roof', value: 'Flat, age unknown', source: 'Site photos' },
            { label: 'Electricity use', value: '286 MWh a year', source: '12 months of bills' },
            { label: 'Indicative estimate', value: '€115–140k · 7–9 yr payback', source: 'Indicative pricing, 28 Aug' },
          ],
          history: [
            { event: 'Roof drawings requested', detail: 'By email to you.', date: '2 Oct' },
            { event: 'Moved to Scope definition', detail: 'No roof drawings; survey needed before tender.', date: '1 Sep' },
            { event: 'Estimate presented', detail: '€115–140k, 7–9 year payback.', date: '28 Aug' },
            { event: 'Joined Solar PV', detail: 'Allocated from Flagship sites.', date: '20 May' },
          ],
        }),
        ...f(6, 8, 9, 10, 11).map((id) => p(id, 1, { gap: 'Roof drawings', visit: { state: 'unbooked', detail: 'CQuel books it once drawings are in' } })),
      ],
      activity: [
        { date: '2 Oct', title: 'Roof drawings requested', text: 'For 7 buildings, by email to you.' },
        { date: '1 Sep', title: 'Workstream started', text: '7 projects moved from Indicative pricing — no roof drawings; survey needed before tender.' },
      ],
      documents: [
        { name: 'Indicative estimates — Solar PV', meta: 'PDF · 28 Aug', action: 'Download' },
        { name: 'Files you sent', meta: 'Site photos, 12 months of bills', action: 'View' },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'ev-de', batchId: 'flagship', name: 'EV charging · DE flagships', service: 'scope', solution: 'ev',
      owner: 'you', now: '', startedOn: '1 Oct 2026',
      next: { kind: 'carpark', since: '9 Oct 2026' },
      surveyNote: 'car park plans are enough',
      needs: [{ label: 'Car park ownership', why: 'Needed before the scope can be written', owner: 'you', since: '9 Oct 2026' }],
      projects: f(5, 7, 8, 12).map((id) => p(id, 1, { gap: 'Car park ownership', visit: { state: 'skip' } })),
      activity: [
        { date: '9 Oct', title: 'Car park ownership requested', text: 'For 4 buildings, by email to you.' },
        { date: '1 Oct', title: 'Workstream started', text: '4 projects allocated from Flagship sites.' },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'led-ind', batchId: 'flagship', name: 'LED', service: 'indicative', solution: 'led',
      owner: 'you', now: '', startedOn: '20 May 2026',
      next: { kind: 'decision', since: '6 Oct 2026' },
      needs: [
        { label: 'Go or no-go on the presented estimates', why: 'Estimates presented 6 Oct', owner: 'you', since: '6 Oct 2026' },
      ],
      projects: [
        p('f1', 2, { estimate: [12, 15], paybackYears: 4, decision: 'waiting', presentedOn: '6 Oct 2026', basedOn: ledBasis(['8,400 m²', 'T8 fluorescent', '412 MWh a year', 'Mon–Sat, 7:00–23:00']) }),
        p('f3', 2, { estimate: [10, 12], paybackYears: 5, decision: 'waiting', presentedOn: '6 Oct 2026', basedOn: ledBasis() }),
        p('f4', 2, { estimate: [16, 19], paybackYears: 6, decision: 'waiting', presentedOn: '6 Oct 2026', basedOn: ledBasis() }),
        p('f5', 3, { estimate: [14, 17], paybackYears: 5, decision: 'go', decidedOn: '8 Oct 2026', presentedOn: '24 Sep 2026', basedOn: ledBasis() }),
        p('f7', 3, { estimate: [12, 14], paybackYears: 4, decision: 'go', decidedOn: '8 Oct 2026', presentedOn: '24 Sep 2026', basedOn: ledBasis() }),
        p('f2', 3, { estimate: [21, 25], paybackYears: 'over12', decision: 'no', decidedOn: '8 Oct 2026', presentedOn: '24 Sep 2026', dropped: true, note: 'Not proceeding — payback over 12 years', basedOn: ledBasis() }),
        p('f6', 1, { basedOn: ledBasis() }),
        p('f8', 1, { basedOn: ledBasis() }),
        p('f9', 1, { basedOn: ledBasis() }),
      ],
      activity: [
        { date: '8 Oct', title: 'Kelmsdorfer Straße 41', text: 'Not proceeding — payback over 12 years.' },
        { date: '8 Oct', title: 'Lindenhof 3, Wiesenstraße 88', text: 'You decided to go ahead.' },
        { date: '6 Oct', title: '3 estimates presented', text: 'Halverkamp 19, Kervelstraat 14, Speicherallee 7.' },
        { date: '24 Sep', title: '3 estimates presented', text: 'Lindenhof 3, Wiesenstraße 88, Kelmsdorfer Straße 41.' },
        { date: '20 May', title: 'Workstream started', text: '9 projects allocated from Flagship sites.' },
      ],
      documents: [
        { name: 'Estimates — LED, 6 projects', meta: 'PDF · 6 Oct', action: 'Download' },
        { name: 'Files you sent', meta: 'Floor plans, site photos, 12 months of bills', action: 'View' },
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'hp-kelderby', batchId: 'flagship', name: 'Heat pumps · Kelderby', service: 'pricing', solution: 'ashp', supplier: 'Kelderby',
      owner: 'suppliers', now: '', startedOn: '24 Sep 2026',
      next: { kind: 'price', since: '1 Oct 2026', from: 'Kelderby' },
      needs: [{ label: 'Price from Kelderby', why: 'Incumbent supplier, 4 buildings', owner: 'suppliers', since: '1 Oct 2026' }],
      projects: rows(f(5, 7, 8, 12), 1), lead: 'Rich Amos',
    },
    {
      id: 'ev-tender', batchId: 'flagship', name: 'EV charging', service: 'tender', solution: 'ev', supplier: 'Voltreny',
      owner: 'done', now: '', outcome: 'Voltreny chosen',
      startedOn: '2 Jun 2026', completedOn: '5 Aug 2026', needs: [],
      tender: { invited: 10, offers: { received: 7 } },
      projects: rows(f(1, 3, 4, 6, 10, 11), 5), lead: 'Tamsin Quarrell',
    },
    {
      id: 'ev-ind', batchId: 'flagship', name: 'EV charging', service: 'indicative', solution: 'ev',
      owner: 'done', now: '',
      startedOn: '20 May 2026', completedOn: '30 May 2026',
      needs: [], lead: 'Tamsin Quarrell',
      projects: [
        ...['f1', 'f3', 'f4', 'f6'].map((id) => p(id, 3, { estimate: [23, 28], paybackYears: 6, decision: 'go', destination: 'tender', decidedOn: '30 May 2026' })),
        ...['f10', 'f11'].map((id) => p(id, 3, { estimate: [24, 29], paybackYears: 6, decision: 'go', destination: 'tender', decidedOn: '30 May 2026' })),
      ],
    },
    {
      id: 'hp-flagship', batchId: 'flagship', name: 'Heat pumps · Flagship', service: 'indicative', solution: 'ashp',
      owner: 'you', now: '', startedOn: '1 Oct 2026',
      next: { kind: 'gas', since: '1 Oct 2026' },
      needs: [{ label: 'Gas bills for 8 buildings', why: 'Heating load per building', owner: 'you', since: '1 Oct 2026' }],
      projects: rows(f(1, 2, 3, 4, 6, 9, 10, 11), 0),
      lead: 'Rich Amos',
    },
    {
      id: 'ev-voltreny', batchId: 'flagship', name: 'EV charging · Voltreny', service: 'delivery', solution: 'ev', supplier: 'Voltreny',
      owner: 'suppliers', now: '', startedOn: '6 Aug 2026',
      deliveryProfile: { contractValue: 152, expectedCompletion: '16 Dec 2026', siteChecksOn: '20 Aug 2026', siteChecks: 3 },
      needs: [{ label: 'Start dates for 3 projects', why: 'Voltreny is planning them', owner: 'suppliers' }],
      projects: [
        p('f3', 2, {
          visit: { state: 'done', on: '20 Aug 2026' },
          delivery: {
            value: 26, confirmPhase: 'phase2', expectedCompletion: { on: '18 Nov 2026', state: 'estimate' },
            phases: {
              start: { on: '12 Aug 2026', state: 'confirmed' },
              phase1: { on: '20 Aug 2026', state: 'confirmed' },
              phase2: { on: '14 Oct 2026', state: 'from_invoice' },
              phase3: { on: '4 Nov 2026', state: 'estimate' },
              phase4: { on: '18 Nov 2026', state: 'estimate' },
            },
          },
          history: [
            { event: 'Installing started', detail: "From Voltreny's invoice — waiting for you to confirm the date.", date: '14 Oct' },
            { event: 'Site check done', detail: 'Car park can take 4 chargers.', date: '20 Aug' },
            { event: 'Kick-off', detail: 'Contract signed; Voltreny planned the work.', date: '12 Aug' },
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
              start: { on: '12 Aug 2026', state: 'confirmed' },
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
              start: { on: '12 Aug 2026', state: 'confirmed' },
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
        { date: '6 Aug', title: 'Workstream started', text: '6 projects from EV charging · Tender; Voltreny: best price and earliest start.' },
      ],
      documents: [
        { name: 'Contract — Voltreny', meta: 'PDF · signed 6 Aug', action: 'Download' },
        { name: 'Site checks', meta: '3 PDFs · 20 Aug', action: 'Download' },
        { name: 'Handover pack — Halverkamp 19', meta: 'PDF · 30 Sep', action: 'Download' },
      ],
      lead: 'Tamsin Quarrell',
    },
    {
      id: 'led-lumora', batchId: 'flagship', name: 'LED · Lumora', service: 'delivery', solution: 'led', supplier: 'Lumora',
      owner: 'done', now: 'Installed', outcome: 'handed over', startedOn: '2 Jun 2026', completedOn: '30 Sep 2026',
      deliveryProfile: { contractValue: 48 },
      needs: [],
      projects: f(10, 11, 12).map((id) => p(id, 5, {
        delivery: { value: 16, phases: { complete: { on: '30 Sep 2026', state: 'confirmed' } } },
      })),
      lead: 'Tamsin Quarrell',
    },
    // Offices
    {
      id: 'hp-ind', batchId: 'offices', name: 'Heat pumps', service: 'indicative', solution: 'ashp',
      owner: 'cquel', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'landing' },
      needs: [
        { label: 'Heat demand model — 8 buildings', why: 'From the gas bills you sent', owner: 'cquel', since: '15 Oct 2026' },
        { label: 'Gas bills, 12 months — 20 buildings', why: 'Heating load per building', owner: 'you', received: '3 Oct 2026' },
      ],
      projects: [
        ...o(2, 3, 4).map((id) => p(id, 1, { ready: true })),
        ...rows(o(5, 6, 7, 8, 9, 10, 11, 12, 13), 1),
        ...rows(o(14, 15, 16, 17, 18, 19, 20, 21), 0),
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'solar-offices', batchId: 'offices', name: 'Solar PV · Offices DE', service: 'indicative', solution: 'solar',
      owner: 'you', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'decision', since: '9 Oct 2026' },
      needs: [{ label: 'Go or no-go on the presented estimates', why: 'Estimates presented 9 Oct', owner: 'you', since: '9 Oct 2026' }],
      lead: 'Rich Amos',
      projects: [
        p('o13', 2, { estimate: [80, 92], paybackYears: 7, decision: 'waiting', presentedOn: '9 Oct 2026' }),
        p('o14', 2, { estimate: [65, 74], paybackYears: 8, decision: 'waiting', presentedOn: '9 Oct 2026' }),
        p('o15', 2, { estimate: [72, 82], paybackYears: 9, decision: 'waiting', presentedOn: '9 Oct 2026' }),
        p('o16', 2, { estimate: [58, 66], paybackYears: 7, decision: 'waiting', presentedOn: '9 Oct 2026' }),
        p('o17', 2, { estimate: [77, 88], paybackYears: 8, decision: 'waiting', presentedOn: '9 Oct 2026' }),
        p('o18', 2, { estimate: [68, 78], paybackYears: 9, decision: 'waiting', presentedOn: '9 Oct 2026' }),
      ],
    },
    {
      id: 'ev-offices', batchId: 'offices', name: 'EV charging · Offices', service: 'indicative', solution: 'ev',
      owner: 'you', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'decision', since: '14 Oct 2026' },
      needs: [{ label: 'Go or no-go on the presented estimates', why: 'Estimates presented 14 Oct', owner: 'you', since: '14 Oct 2026' }],
      lead: 'Tamsin Quarrell',
      projects: [
        ...o(...range(1, 10)).map((id) => p(id, 2, { estimate: [26, 30], paybackYears: 6, decision: 'waiting', presentedOn: '14 Oct 2026' })),
        ...o(11, 12).map((id) => p(id, 2, { estimate: [25, 30], paybackYears: 6, decision: 'waiting', presentedOn: '14 Oct 2026' })),
      ],
    },
    {
      id: 'led-offices-de', batchId: 'offices', name: 'LED · Offices DE', service: 'tender', solution: 'led',
      owner: 'you', now: '', startedOn: '1 Sep 2026', lead: 'Rich Amos',
      next: { kind: 'choose', since: '13 Oct 2026' },
      needs: [{ label: 'Your choice of supplier', why: 'Results sent 13 Oct', owner: 'you', since: '13 Oct 2026' }],
      tender: {
        approached: 38,
        invited: 9,
        invitedOn: '15 Sep 2026',
        offers: { received: 6, declined: 2, noResponse: 1 },
      },
      projects: o(13, 14, 15, 16, 17, 18).map((id) => p(id, 4)),
      activity: [{ date: '1 Sep', title: 'Workstream started', text: '6 projects allocated from Offices DE, FR and BE.' }],
    },
    {
      id: 'led-offices-frbe', batchId: 'offices', name: 'LED · Offices FR and BE', service: 'tender', solution: 'led',
      owner: 'you', now: '', startedOn: '1 Sep 2026', lead: 'Rich Amos',
      next: { kind: 'brief', since: '14 Oct 2026' },
      needs: [{ label: 'Brief to agree', why: 'Sent 14 Oct', owner: 'you', since: '14 Oct 2026' }],
      projects: o(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 23, 24).map((id) => p(id, 0)),
      activity: [{ date: '1 Sep', title: 'Workstream started', text: '18 projects allocated from Offices DE, FR and BE.' }],
    },
    {
      id: 'solar-be', batchId: 'offices', name: 'Solar PV · BE offices', service: 'tender', solution: 'solar',
      owner: 'cquel', now: '', startedOn: '15 Sep 2026', lead: 'Tamsin Quarrell',
      next: { kind: 'shortlist', on: '9 Oct 2026' },
      needs: [{ label: 'Supplier shortlist', why: 'CQuel is matching suppliers', owner: 'cquel', since: '9 Oct 2026' }],
      tender: { approached: 41, briefAgreedOn: '9 Oct 2026' },
      projects: o(2, 3, 4, 19, 20, 21).map((id) => p(id, 1)),
      activity: [{ date: '15 Sep', title: 'Workstream started', text: '6 projects allocated from Offices DE, FR and BE.' }],
    },
    {
      id: 'solar-fr', batchId: 'offices', name: 'Solar PV · FR offices', service: 'scope', solution: 'solar',
      owner: 'you', now: '', startedOn: '4 Aug 2026',
      next: { kind: 'agree', since: '10 Oct 2026' },
      surveyNote: 'last on 3 Oct',
      surveyDocs: true,
      needs: [{ label: 'Agree scope for 8 projects', why: 'Scope sent 10 Oct', owner: 'you', since: '10 Oct 2026' }],
      projects: o(5, 6, 7, 8, 9, 10, 11, 12).map((id) => p(id, 3, { decision: 'waiting', visit: { state: 'done' } })),
      activity: [
        { date: '10 Oct', title: 'Scope sent', text: '8 projects, waiting for you to agree.' },
        { date: '3 Oct', title: 'Surveys finished', text: 'Last survey on 3 Oct.' },
        { date: '4 Aug', title: 'Workstream started', text: '8 projects allocated from Offices DE, FR and BE.' },
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'hp-be', batchId: 'offices', name: 'Heat pumps · BE offices', service: 'scope', solution: 'ashp',
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
        { date: '4 Aug', title: 'Workstream started', text: '3 projects allocated from Offices DE, FR and BE.' },
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'solar-frbe-scope', batchId: 'offices', name: 'Solar PV FR/BE · scope', service: 'scope', solution: 'solar',
      owner: 'done', now: '', startedOn: '1 Jul 2026', completedOn: '2 Aug 2026',
      surveyNote: 'July',
      surveyDocs: true,
      movedTo: { workstreamId: 'solvarek-quote', reason: 'Scope agreed' },
      needs: [],
      projects: o(1, 22, 23, 24).map((id) => p(id, 4, { decision: 'go', decidedOn: '2 Aug 2026', destination: 'pricing', visit: { state: 'done', note: 'July' } })),
      activity: [
        { date: '2 Aug', title: 'Scope agreed', text: '4 projects moved to Pricing. Scope agreed.' },
        { date: '1 Jul', title: 'Workstream started', text: '4 projects allocated from Offices DE, FR and BE.' },
      ],
      lead: 'Rich Amos',
    },
    {
      id: 'ev-ladewerk', batchId: 'offices', name: 'EV charging · Ladewerk', service: 'pricing', solution: 'ev', supplier: 'Ladewerk',
      owner: 'you', now: '', startedOn: '8 Sep 2026', lead: 'Rich Amos',
      next: { kind: 'sign', since: '15 Oct 2026' },
      pricing: { source: 'Incumbent', total: 196, setOn: '8 Sep 2026', setNote: 'runs your existing chargers', agreedOn: '6 Oct 2026', contractOn: '15 Oct 2026' },
      needs: [{ label: 'Contract to sign', why: 'Sent 15 Oct', owner: 'you', since: '15 Oct 2026' }],
      projects: o(13, 14, 15, 16, 17, 18).map((id) => p(id, 5, { decision: 'go', decidedOn: '6 Oct 2026' })),
      activity: [
        { date: '15 Oct', title: 'Contract sent to you', text: 'Contract sent to you.' },
        { date: '6 Oct', title: 'Price agreed — €196k for 6 projects', text: '€196k for 6 projects.' },
        { date: '8 Sep', title: 'Workstream started', text: '6 projects allocated from Offices DE, FR and BE; Ladewerk runs the existing chargers.' },
      ],
    },
    {
      id: 'ev-chargeo', batchId: 'offices', name: 'EV charging · Chargeo', service: 'pricing', solution: 'ev', supplier: 'Chargeo',
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
        { date: '22 Sep', title: 'Workstream started', text: '4 projects allocated from Offices DE, FR and BE — Chargeo runs the existing chargers.' },
      ],
      documents: [
        { name: 'Price analysis — EV charging · Chargeo', meta: 'PDF · 9 Oct', action: 'Download' },
        { name: 'Chargeo price', meta: 'PDF · 2 Oct', action: 'Download' },
        { name: 'Contract', meta: 'After you agree the price', muted: true },
      ],
    },
    {
      id: 'solvarek-quote', batchId: 'offices', name: 'Solar PV FR/BE · Solvarek quote', service: 'pricing', solution: 'solar', supplier: 'Solvarek',
      owner: 'done', now: 'Price agreed, contract signed', outcome: 'Contract signed 15 Sep', startedOn: '4 Aug 2026', completedOn: '15 Sep 2026',
      pricing: { total: 214 },
      needs: [], projects: rows(o(1, 22, 23, 24), 5), lead: 'Rich Amos',
    },
    {
      id: 'ev-be', batchId: 'offices', name: 'EV charging · BE offices', service: 'delivery', solution: 'ev', supplier: 'Voltreny',
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
    {
      id: 'solvarek', batchId: 'offices', name: 'Solar PV FR/BE · Solvarek', service: 'delivery', solution: 'solar', supplier: 'Solvarek',
      owner: 'suppliers', now: '', startedOn: '16 Sep 2026',
      next: { kind: 'overdue', place: 'Grand-Place 3', due: '10 Oct 2026' }, needs: [],
      activity: [{ date: '9 Oct', title: 'Rue Belvaux 22 completed', text: 'Rue Belvaux 22 completed.' }],
      projects: [
        p('o1', 5, { delivery: { phases: { complete: { on: '9 Oct 2026', state: 'confirmed' } } } }),
        p('o23', 2, { delivery: { overdueDue: '10 Oct 2026', phases: { phase2: { on: '22 Sep 2026', state: 'confirmed' } } } }),
        p('o22', 0, { delivery: { phases: {} } }),
        p('o24', 0, { delivery: { phases: {} } }),
      ],
      lead: 'Rich Amos',
    },
  ],
  activity: [
    { date: '15 Oct', title: 'Heat pumps', text: 'Estimates ready for 3 more buildings', batchId: 'offices' },
    { date: '9 Oct', title: 'Solar PV FR/BE · Solvarek', text: 'Rue Belvaux 22 completed', batchId: 'offices' },
    { date: '8 Oct', title: 'LED', text: 'Kelmsdorfer Straße 41 not proceeding · payback over 12 years', batchId: 'flagship' },
    { date: '8 Oct', title: 'Solar PV DE', text: 'Halverkamp 19 · roof can take panels', batchId: 'flagship' },
    { date: '6 Oct', title: 'LED', text: '3 estimates presented', batchId: 'flagship' },
    { date: '3 Oct', title: 'Offices DE, FR and BE', text: '6 buildings joined', batchId: 'offices' },
    { date: '2 Oct', title: 'Solar PV · Missing roof data', text: 'Roof drawings requested for 7 buildings', batchId: 'flagship' },
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
        pricing: "Not needed — there's no existing supplier to price with.",
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
      id: 'pilot-ev', batchId: 'pilot', name: 'EV Charging', service: 'indicative', solution: 'ev',
      owner: 'you', proposed: true, now: '',
      gives: 'cost and payback per site',
      needs: [
        { label: 'Half-hourly electricity data, 12 months', scope: '8 sites', why: 'to size chargers', owner: 'you', since: '14 Oct 2026' },
        { label: 'Car park ownership', scope: 'Leeds, Reading', why: 'landlord consent', owner: 'you', since: '14 Oct 2026' },
      ],
      projects: rows(c(1, 2, 3, 4, 5, 6, 7, 8), 0), lead: 'Tamsin Quarrell',
    },
    {
      id: 'pilot-solar', batchId: 'pilot', name: 'Solar PV', service: 'indicative', solution: 'solar',
      owner: 'you', proposed: true, now: '',
      gives: 'system size, cost and payback per roof',
      exclusion: 'Leeds, Nottingham and Reading left out — pitched or shared roofs',
      needs: [
        { label: 'Roof age or last re-roof', scope: '5 sites', why: 'affects payback', owner: 'you', since: '14 Oct 2026' },
      ],
      projects: rows(c(1, 3, 5, 6, 8), 0), lead: 'Tamsin Quarrell',
    },
  ],
  activity: [
    { date: '14 Oct', title: 'Plan proposed', text: 'EV charging · 8 sites, Solar PV · 5 sites', batchId: 'pilot' },
    { date: '9 Oct', title: 'Files received', text: '23 files', batchId: 'pilot' },
    { date: '8 Oct', title: 'Pilot set up', text: '8 cinemas', batchId: 'pilot' },
  ],
  documents: [
    { name: 'Pilot plan', meta: 'PDF · 14 Oct', action: 'Download', batchId: 'pilot' },
    { name: 'Your files', meta: '23 files · 9 Oct', action: 'View', batchId: 'pilot' },
    { name: 'Indicative estimates', meta: 'After Indicative pricing', batchId: 'pilot' },
  ],
}

export const ACCOUNTS: Account[] = [halvering, showcase]
