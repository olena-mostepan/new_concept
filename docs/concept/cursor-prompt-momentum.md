# Cursor prompt, part 29: Momentum chart

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/momentum-trendchart.png`. It shows the chart with September in focus.

This prompt is closed. It changes only how the Momentum card in `components/concept/dashboard.tsx` looks. It keeps recharts, and it doesn't change the data, the card's place on the dashboard, or `CustomerPortfolioView.tsx`.

---

## Why

Momentum today is two black lines and a default recharts tooltip with a grey border. Nothing draws the eye, and hovering adds only a plain box. Started is the line that shows work moving, so it becomes the one orange accent. Hovering a month gets a clear focus.

## 1. Lines (`Momentum` in `dashboard.tsx`)

Switch `LineChart` to `ComposedChart` so one series can have a fill. Import `Area` and `ComposedChart` from recharts.

- **Started:**
  - An `Area`: `type="monotone"`, `dataKey="started"`, `stroke="var(--brand-6)"`, `strokeWidth={2.5}`, `fill="url(#momentum-started)"`, `dot={false}`, `isAnimationActive={false}`.
  - Add a `<defs>` with `linearGradient id="momentum-started"`, vertical, `brand-6` at opacity 0.16 at the top fading to 0 at the bottom.
- **Finished:** keep the `Line`, `black-7`, 2px, `strokeDasharray="4 3"`, `dot={false}`.
- Draw Finished before Started, so the orange line sits on top.

## 2. Axes and grid

- Keep the grid as it is (`border-light`, horizontal only).
- Ticks: `fontSize: 12` (p7), `fill: var(--text-tertiary)`, with tabular figures on the y axis.
- Give the y axis 5 even ticks from 0: `domain={[0, max]}` and `ticks` at 0, ¼, ½, ¾ and the full max, with max rounded up to a multiple of 4.
- The x tick of the hovered month turns `var(--text-primary)`. Use a custom `tick` that reads the active index from state set in `onMouseMove`.

## 3. Focus on hover

- **Guide:** `Tooltip cursor={{ stroke: "var(--black-3)", strokeDasharray: "3 3" }}`.
- **Started point** (`activeDot` on the Area): a custom shape. Draw an 8px-radius `brand-1` halo circle, then a 4.5px `brand-6` circle with a 2px white stroke.
- **Finished point** (`activeDot` on the Line): `r: 4`, `fill: var(--black-7)`, `stroke: white`, `strokeWidth: 2`.
- **Tooltip:** a custom `content` component, `MomentumTip`.
  - The box: `bg-bg-container rounded-md shadow-floating px-3 pt-2 pb-3 min-w-[180px]`, no border.
  - First line: the month in full ("September 2026") in `h9 text-text-tertiary`. Add a `monthLong` field to the momentum data, or format it from `month`.
  - Then one row per series, Started first: `mt-1.5 flex items-center gap-2 p7 text-text-secondary`, with its legend key, the name, and the value pushed right in `h8 text-text-primary tabular-nums`.
  - Set `wrapperStyle={{ outline: "none" }}` and `allowEscapeViewBox={{ x: false, y: true }}`.

## 4. Legend

Keep the legend above the chart, but change the keys:

- **Started:** a 14×3 `brand-6` bar with rounded ends.
- **Finished:** the dashed `black-7` 14×2 line, as now.

Use the same two keys in the tooltip rows. Put them in one small `LegendKey` component.

## Check

- **Dashboard:** Started is orange with a soft fill under it, and Finished is dark and dashed under it.
- **Hover September:**
  - a dashed grey guide;
  - an orange dot with a white ring and a light orange halo;
  - a dark dot on Finished;
  - "Sep 26" in dark text on the axis;
  - a floating white tooltip with "September 2026", then "Started 22" and "Finished 6", the numbers right-aligned.
- **Keyboard:** no change. The chart isn't focusable today, so keep it that way.
- `npm run build` passes.

## Done when

The only orange in the Momentum card is the Started line, its fill, its legend key and its hover dot. The tooltip has no border and uses `shadow-floating`.
