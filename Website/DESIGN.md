# CBE Thesis Explorer design system

The central interaction follows a meeting from statement and observed policy
action to market observations and saved forecasts. The five workspaces provide
distinct research tasks. Overview is a selective entry point; exact rows and
methods remain one inspection away.

## Shared decisions

- Navy is the initial direction; light is a fully styled reading/projection
  option. Both use the same geometry and data/interaction meanings.
- IBM Plex Sans Regular, Medium and SemiBold are embedded in CSS for reliable
  local-file use. Original WOFF2 assets and the OFL license are retained in vendor/.
  System sans is the fallback. No external font request.
- Body 15–16 px; controls 14–16 px; data/axis labels 12–13 px. Important mobile
  inputs use 16 px. Main headings 24–32 px; section headings 17–20 px.
- Spacing uses 4/8 px increments with 12/16/24/32/48 tiers. Data density comes
  from clear structure and table inspection, not microscopic text.
- Use one outline icon family, quiet surfaces, limited separators and visible
  focus. No sequential section numbers on parallel workspaces, generic hero,
  decorative charts, status alerts or animated backgrounds.
- Mobile uses compact coverage and filters, focus-contained navigation and
  full-height evidence readers. Table width scrolls within its own container.

## Data meanings

| Meaning | Navy | Light | Additional cue |
| --- | --- | --- | --- |
| Banks | #65c9be | #147a72 | Solid line / named sector |
| Real Estate | #e5b974 | #9a5d13 | Dashed line / named sector |
| EGX30 | #a8b6c9 | #576b85 | Dotted line / named benchmark |
| Numbers only | #b4c0d0 | #52657e | Explicit input label |
| Numbers + text | #8daeff | #285cb2 | Dashed prediction line / explicit label |
| References | #d1be98 | #795816 | Zero dashed; past mean dotted |

Related sector/model facets share magnitude scales. Missing values and index
boundaries are not joined. Rate observations do not establish effective dates.
Before-level implications and conditional levels have text labels. Empty or
undefined scores remain unavailable, with an explicit explanation.

## State and evidence

Shared dates/action/cohort, chart viewport, selected meeting, local table filters
and saved presentation settings are distinct. Zoom alone does not recalculate
research counts. Applying the chart window explicitly changes the period.
Sources and exports identify the applicable window/population. Fixed notebook
tables and the sample transition retain their original denominators.

Source/definition actions preserve calculation, units, scope and provenance.
Exported charts include legends, context and source notes. Original descriptive
intervals appear only for their matching original evaluation dates. No model
training, live forecasting or new subset interval is part of the interface.

## Implementation boundaries

core.js owns source selection and arithmetic; charts.js owns consistent chart
options; ui.js owns shared tables/formatting; readers.js owns text/evidence and
comparison; views.js composes workspaces; app.js owns navigation, state, dialogs,
local persistence and exports. Vendor code is pinned, licensed and not modified.

Design references: Impeccable, Interface Design and Vercel Web Interface
Guidelines, as recorded in the workspace enhancement plan. Their repository
material informed targeted critique; no remote agent hooks were installed.
