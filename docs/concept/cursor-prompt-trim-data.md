# Cursor prompt, part 21: realistic sample data (one or two solutions per batch)

Paste everything below the line into Cursor, in the `new_concept` repo. Run it **after part 20** (Buildings). No images are needed.

This prompt is closed. It changes `lib/concept/data.ts` only, plus any copy in `data.ts` that names a removed building or workstream. No components change. If a screen breaks because it expected a removed workstream, fix the data reference in that screen, not the layout, and list what you touched.

---

## Why

The sample data is the "dream customer": every Halvering building has about four projects, and Flagship sites runs five solutions. Real accounts look different:

- **A batch has one or two solutions,** usually one.
- **A building usually has one project.** Two is rare.

The Buildings list, the building page and the batch page only read right with realistic data.

## Rules

- **Halvering only.** Showcase Cinemas (the pilot) is unchanged. Two projects per cinema there is fine.
- **Keep ids:** keep the ids of the workstreams that stay, so links, `WORKSTREAM_ALIAS` and earlier prompts still work.
- **Remove workstreams cleanly:** take each removed workstream out of `workstreams`, along with its activity entries, documents and needs. Remove account-level `activity` entries that name it or one of its projects.
- **Remove projects cleanly:** take the `ProjectRow` out of the workstream's `projects`.
  - Then fix any workstream copy that counts buildings or projects so it matches the new count. For example, "Roof drawings for 7 buildings" becomes "Roof drawings for 3 buildings".
  - Fix `history` details that name removed buildings.
- **Don't invent new data:**
  - Only remove things, or narrow a count to what's left.
  - Don't add workstreams, dates, offers or values.
  - The two goal lines below are the only new wording.
- **Batches:** each batch's `buildingIds` stays as it is, at 12 and 24 buildings.

## Flagship sites: EV charging and Solar PV

Goal unchanged: "Cut energy use at the 12 flagship sites".

| Keep | Service now | Buildings after the change |
|---|---|---|
| `ev-voltreny` · EV charging · Voltreny | Delivery | Kervelstraat 14, Speicherallee 7, Halverkamp 19, Am Hafen 12, Havenweg 30, Kanaalstraat 9 (unchanged, 6) |
| `solar-de` · Solar PV DE | Tender | Halverkamp 19, Lindenhof 3, Wiesenstraße 88, Parkring 16 (remove Speicherallee 7) |
| `solar-roof` · Solar PV · Missing roof data | Planning | Kelmsdorfer Straße 41, Brückenstraße 5, Marktplatz 2 (remove Kervelstraat 14, Am Hafen 12, Havenweg 30, Kanaalstraat 9) |

**Remove** `led-ind`, `ev-de`, `hp-kelderby`, `hp-flagship` and `led-lumora`.

**Result:** 12 buildings and 13 projects. Halverkamp 19 is the one building with two projects (EV charging and Solar PV).

## Offices DE, FR and BE: Heat pumps and EV charging

Change the goal to **"Replace gas heating and add EV charging in the office portfolio"**.

| Keep | Service now | Buildings after the change |
|---|---|---|
| `hp-ind` · Heat pumps | Estimates | Avenue Louise 140, Rue de la Loi 81, Meir 48, Rue Nationale 9, Quai Perrache 30, Rue de Rivoli 112, Boulevard Haussmann 55, Rue Sainte-Catherine 7, Place Kléber 4, Rue du Faubourg 18, Cours Mirabeau 26 (remove the six DE offices and Prager Straße 15, Breite Straße 2, Kaiserstraße 44) |
| `hp-be` · Heat pumps · BE offices | Planning | Rue Belvaux 22, Grand-Place 3, Rue Neuve 61 (unchanged) |
| `ev-ladewerk` · EV charging · Ladewerk | Pricing | Friedrichstraße 200, Königsallee 60, Zeil 106, Leopoldstraße 33, Mönckebergstraße 11, Schildergasse 72 (unchanged) |
| `ev-chargeo` · EV charging · Chargeo | Pricing | Prager Straße 15, Breite Straße 2, Kaiserstraße 44, Domplatz 8 (unchanged) |
| `ev-be` · EV charging · BE offices | Delivery | Grand-Place 3, Rue Neuve 61 (unchanged) |

**Remove** `solar-offices`, `ev-offices`, `led-offices-de`, `led-offices-frbe`, `solar-be`, `solar-fr` and `solvarek`.

**Result:** 24 buildings and 26 projects. Grand-Place 3 and Rue Neuve 61 have two projects each (Heat pumps and EV charging). Every other office has one.

## Check after the change

Run these with a small script and paste the output into your final message. Don't hard-code the expected numbers into components.

1. **Every building has a project:** each of the 36 Halvering buildings is in at least one kept workstream. List any that aren't.
2. **Projects per building:** only Halverkamp 19, Grand-Place 3 and Rue Neuve 61 have two. No building has more.
3. **Solutions per batch:** Flagship sites uses `ev` and `solar`; Offices uses `ashp` and `ev`.
4. **Every service has a live workstream:**
   - Estimates: `hp-ind`
   - Planning: `solar-roof`, `hp-be`
   - Tender: `solar-de`
   - Pricing: `ev-ladewerk`, `ev-chargeo`
   - Delivery: `ev-voltreny`, `ev-be`
5. **`servicePipeline` output:** print projects and workstreams per service, the total, and Your action. Completed will be 0 now that `led-lumora` is gone, and the Services bar skips that segment. Say so in your report; don't add a completed workstream.
6. **`checkPhases(a)`:** passes.
7. **Dangling references:** `grep -n "led-ind\|ev-de\|hp-kelderby\|hp-flagship\|led-lumora\|solar-offices\|ev-offices\|led-offices\|solar-be\|solar-fr\|solvarek" -r lib components app` returns nothing, or only `WORKSTREAM_ALIAS` entries that now point at a kept workstream. Point any alias whose target was removed at the batch's first kept workstream, and list it.
8. **Changed dot:** `buildingChanged` is true for Kervelstraat 14 only, as before.

## What will look different (expected, don't fix)

- **Tender service page:** it now shows Solar PV DE in progress and EV charging · Voltreny as passed through. The LED rows are gone.
- **Estimates:** the live example is now Heat pumps. The LED estimates example, including the Estimates tab dot, is gone from Halvering.
- **Totals:** the Overview Services bar and its totals are much smaller.
- **Earlier prompts:** expected values in parts 13, 14, 18, 19 and 20 that mention removed workstreams no longer apply. Part 20's structure still applies.

## Done when

- The checks above all pass, and their output is in your final message.
- `/concept/buildings` shows mostly single solutions, with "2 projects" only on Halverkamp 19, Grand-Place 3 and Rue Neuve 61.
- `/concept/batches/flagship` shows 3 workstreams and 12 buildings. `/concept/batches/offices` shows 5 workstreams and 24 buildings.
- The Showcase pilot is unchanged.
- `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item, and list every file you touched outside `data.ts`.
