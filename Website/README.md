# Hosted release — 5 November 2026

The public web release preserves the local research workstation and accepted
saved-data snapshot. Current files are served from the parent project path.
The owner explicitly confirmed permission to publish the full included data
and study files. The instructions below also describe use of a local copy.

# CBE Thesis Explorer — research workstation

Open **index.html** in a browser, or double-click **Open_Explorer.command** on
macOS. The complete Website folder contains the data, PDFs, scripts, chart
library and fonts. No installation, account or third-party connection is needed.
Keep Website beside the current report, notebook, workbook and presentation so
**Current files** links work when the handover folder is moved.

## Five workspaces

- **Overview** connects policy observations and market history on one calendar
  timeline. Choose a meeting to read its statement and inspect rates, closes,
  first-session sector returns and saved forecasts.
- **Policy & statements** searches the retained text, language and document type.
  The statement appears first. Market observations, Forecasts and Source details
  provide the matching evidence. Before-rate levels are labelled implied; the
  November 2009 level remains conditional. Original PDFs are bundled.
- **Markets** offers rebased/raw index histories, daily returns, daily histograms
  and boxplots, exact statistics, first-session outcomes and daily source records.
- **Forecast results** compares all four numerical/text model families in both
  sectors. Choose the evaluation and MAE/RMSE/direction measure. A detailed model
  selector controls paired MAE differences and individual saved predictions.
- **Data & methods** contains selected-period annual/action summaries, the fixed
  full-study sample transition, all seven original notebook reference tables,
  definitions, sources and current study files.

## Period, filters and chart windows

Use the period button or **Filters**. Year shortcuts and exact dates are
inclusive; the range is applied only when valid. Active action/cohort filters
are shown as removable chips. The default view begins in 2020. Full record and
Notebook period presets are available.

Documents, event outcomes and predictions use the recorded meeting date. Daily
market context uses observation dates and the period only. Action/cohort filters
restrict announcement-linked evidence. A first session after an eligible meeting
can fall outside the meeting-date upper bound. Fixed notebook reference tables
and the full-study sample flow keep their original populations; they are labelled.

Chart zoom is independent of the research selection. **Focus selected meeting**
shows a local window. **Reset zoom** restores the chart. **Use visible dates as
filter** explicitly commits that interval to the research selection. Expanded
charts preserve the window. Source previews and chart exports identify any
zoomed window and retain the distinction from the full selection.

## Reading, comparison and keyboard access

Select a date to open the statement-first inspector. Older/newer controls follow
the filtered meetings. Search wording, move between matches, read the original
PDF, or compare two same-language texts. **Exact changes** preserves case and
punctuation. **Side by side** supports synchronized reading. Earlier documents
outside the period are clearly labelled. Comparison dates/mode and selected
records can survive route reload; Back/Close returns to the investigation.

All main controls support keyboard operation. Focus a chart and use left/right
or Home/End to inspect exact values. Enter opens a linked announcement or selects
a model where relevant. Source tables provide a numerical alternative. Mobile
navigation has a focus-contained drawer and Escape/Close controls. Navy/light
themes and reduced motion are supported.

## Tables, saved views and exports

Sort a column heading, choose a column preset or Columns, and search records.
Daily tables add instrument, eligibility and return-value filters. Select rows
with checkboxes. Export rows includes all matching pages, or the explicitly
selected rows when selection is active. Original numerical precision, text,
missing values and source flags are retained; screen values are rounded.

Save a useful view in this browser. **Export → Portable view settings** creates
a JSON file for another local copy; **Saved views → Import settings** restores
it. Settings contain filters/presentation choices, not the dataset. Storage
failure has an in-session fallback. Browser-local saved views may differ between
file locations or browsers; use JSON to move them reliably.

Chart actions offer expansion, CSV/source inspection, SVG, PNG and metadata.
SVG/PNG exports include series legends where needed, period, units, source and
interpretation notes. A zoomed chart exports its visible date window; the global
Export action uses the full research selection. Table search/selection is local
to table exports. Current workspace print styles retain selection/source context.

## Definitions and retained limits

The full inventory has 176 documents, 155 matched meetings and 310 sector
outcomes. The two overlapping evaluations contain 119 and 36 forecast meetings
per sector, yielding 3,100 repeated prediction rows, 40 original metric groups
and 16 paired comparisons. Repeated rows are not independent observations.

Price lines break at the 2020 sector-definition boundary, missing closes and
gaps over seven days. Rebased series share a first common eligible date within
each selected pre/post-2020 segment, including EGX30. Select EGX30 alone for its
longer history. Daily-return summaries require both endpoints inside the period;
the notebook comparison interval is 3 January 2007–18 October 2026. SD uses n−1;
quartiles use linear interpolation. Boxplots use 1.5 IQR whiskers and retain
outliers, with minima/maxima separately available in statistics.

Selected forecast scores are descriptive arithmetic on saved predictions. Models
are not refitted. Original descriptive intervals appear only for their exact
original evaluation dates. No subset uncertainty interval is generated.
Direction excludes flat actual returns; balanced direction requires both actual
classes. The before-rate is an implication, not an independently observed rate.
5 November 2009's 8.25% level remains conditional continuity. The excluded
5 October 2005 deposit hold/lending cut retains its source-review note.

The study is retrospective/exploratory. Original release clocks and text vintages
are unverified; prior inspection, dependent/overlapping samples and the index
boundary limit interpretation. There is no causal wording, measured-surprise,
live-forecast or profitability claim. The inventory is not a certified complete
CBE archive. The owner confirmed permission for this public academic-review release. No
blanket redistribution license for the underlying data is granted. Original CBE web links require internet; bundled
PDFs and normal exploration use local assets.

## Implementation and evidence

App source: index.html, style.css, core.js, charts.js, ui.js, readers.js, views.js
and app.js. Snapshot bundles: data.js, market-data.js, descriptive-data.js.
Vendor versions, hashes and licenses are under vendor/. Current file links and
supervisor order come from the descriptive snapshot manifest. No remote fonts,
tracking, model training or automatic external requests are used.

Workspace builder/checks: 05_analysis/explorer_redesign_2026-11-04/.
Evidence: 04_data/verification/explorer_redesign_2026-11-04/.
The earlier Website remains preserved in the 3 November handover. Consult the
final review record for checks actually run and any verification bounds.
