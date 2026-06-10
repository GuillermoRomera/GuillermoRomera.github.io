import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ *
 *  Sentiment Dashboard — DEMO
 *  All companies, accounts, scores, and comments below are fictional.
 *  STYLE-LOCKED TEMPLATE. Only edit the DATA block marked below.
 * ------------------------------------------------------------------ */

const C = {
  ink: "#0E1116", panel: "#161B22", panel2: "#1B212B",
  border: "#232C38", grid: "#222A35",
  text: "#E7ECF3", muted: "#8B97A7", faint: "#5C6675",
  nps: "#38BDC9",   // NPS series  (teal)
  ces: "#F2A93B",   // CES series  (amber)
  lm: "#7C74F2",    // Lumora platform accent (indigo)
  vx: "#E1623B",    // Vextra platform accent (rust)
  pos: "#4FB477", neu: "#C9A227", neg: "#D2553F",
};
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

// sentiment from score + type (logic — do not move into the DATA block)
const senti = (type, s) =>
  type === "NPS"
    ? (s >= 9 ? "Positive" : s >= 7 ? "Neutral" : "Negative")
    : (s >= 4 ? "Positive" : s === 3 ? "Neutral" : "Negative");

// ============================ DATA START ============================
// Replace ONLY the five constants below with freshly computed values.
// Keep the exact shapes. Everything outside this block is style-locked.

const MONTHS = ["Oct ’25", "Nov ’25", "Dec ’25", "Jan ’26", "Feb ’26", "Mar ’26"];

// one object per month, aligned to MONTHS. npsNet/npsN may be null where a series ended.
const LM = MONTHS.map((m, i) => ({
  m,
  npsNet: [12.4, 8.1, 15.6, 6.3, 3.9, 9.7][i],
  npsN:   [412, 388, 251, 430, 365, 198][i],
  cesAvg: [3.82, 3.71, 3.90, 3.55, 3.34, 3.61][i],
  cesN:   [260, 233, 187, 298, 211, 96][i],
}));
const VX = MONTHS.map((m, i) => ({
  m,
  npsNet: [-22.8, -31.4, -18.9, null, null, null][i],
  npsN:   [184, 159, 31, null, null, null][i],
  cesAvg: [2.41, 2.28, 2.66, 2.89, 3.05, 2.74][i],
  cesN:   [172, 121, 1180, 134, 97, 63][i],
}));

const SUMMARY = {
  LM: { npsNet: 9.3,   npsN: 2044, cesAvg: 3.7, cesN: 1285 },
  VX: { npsNet: -25.1, npsN: 374,  cesAvg: 2.7, cesN: 1767 },
};

// per-platform note shown at bottom-right of a panel (or "" for none)
const NOTES = { LM: "", VX: "VX NPS collection ends Dec 2025" };

// comment rows: [platform, type, date, score, account|null, text]
const raw = [
  ["LM","NPS","2026-03-12",10,null,"Love it. The new search finds exactly what I need on the first try."],
  ["LM","NPS","2026-03-11",2,null,"My workspace settings reset every time the app updates. Please fix this."],
  ["LM","NPS","2026-03-10",9,null,"Reliable, fast, and the template gallery keeps getting better."],
  ["LM","NPS","2026-03-09",0,null,"The dashboard is cluttered and slow. Finding anything takes three clicks too many."],
  ["LM","NPS","2026-03-07",10,null,"Switched our whole team over last quarter — no regrets."],
  ["LM","NPS","2026-03-05",3,null,"It doesn't do anything I can't already do with free alternatives."],
  ["LM","NPS","2026-02-27",8,null,"Solid product overall. Exports could be faster on large projects."],
  ["LM","NPS","2026-02-20",9,null,"Support resolved my billing issue in under an hour. Impressive."],
  ["LM","CES","2026-03-10",2,null,"Stop suggesting add-ons I didn't ask for. I'll find them myself if I need them."],
  ["LM","CES","2026-03-06",1,null,"Assets that synced fine for months suddenly show as missing. I spent half a day re-linking everything."],
  ["LM","CES","2026-03-04",3,null,"The smart-match feature is close, but the results could be more precise."],
  ["LM","CES","2026-03-02",4,null,"Occasionally signs me out without warning, but otherwise smooth."],
  ["LM","CES","2026-02-14",5,null,"Huge library, great preview tools, and the site is genuinely easy to navigate."],
  ["VX","CES","2026-03-11",4,null,"Moving the sync button to the top bar was a big improvement over the old dropdown."],
  ["VX","CES","2026-03-06",4,null,"Would love clearer guidance on cleaning up old libraries — mine have grown messy over the years."],
  ["VX","CES","2026-03-03",1,null,"I miss the classic interface. The redesign buried everything I use daily."],
  ["VX","CES","2026-02-24",1,null,"Constant bugs. Items deactivate on their own and sometimes won't re-activate at all."],
  ["VX","CES","2026-02-12",2,null,"The previous desktop app was faster and simpler. This version feels clunky in comparison."],
  ["VX","NPS","2025-12-08",9,"Brightline Studio","Really easy to pull in exactly the assets my team needs."],
  ["VX","NPS","2025-12-06",1,"Cobalt & Pine Ltd","Too expensive and too clunky. Every update breaks the plugin integrations again."],
  ["VX","NPS","2025-12-02",10,"Harbor Mill Press","Very useful. Does what it promises."],
  ["VX","NPS","2025-11-29",2,"Atlas Print Co","The web client lags on open, logs me out constantly, and never remembers my password manager."],
  ["VX","NPS","2025-11-28",1,"Fieldstone Creative","It keeps turning off items I've pinned as permanent. 'Permanent' should mean permanent."],
];

// ============================= DATA END =============================

const COMMENTS = raw.map(([platform, type, date, score, account, text], id) => ({
  id, platform, type, date, score, account, text, sentiment: senti(type, score),
}));

/* ----------------------------- UI bits ----------------------------- */

function Eyebrow({ children, color = C.muted }) {
  return (
    <div style={{ font: `600 10.5px/1 ${MONO}`, letterSpacing: "0.18em",
      textTransform: "uppercase", color }}>{children}</div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const row = (c, lbl, val, n) => val == null ? null : (
    <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, margin: "3px 0" }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
      <span style={{ color: C.muted, fontSize: 12, minWidth: 78 }}>{lbl}</span>
      <span style={{ color: C.text, fontSize: 12, fontFamily: MONO }}>{val}</span>
      <span style={{ color: C.faint, fontSize: 11 }}>· n={n}</span>
    </div>
  );
  return (
    <div style={{ background: "#0B0E13", border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "9px 11px", boxShadow: "0 8px 24px rgba(0,0,0,.45)" }}>
      <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>{label}</div>
      {row(C.nps, "NPS (net)", p.npsNet == null ? null : p.npsNet.toFixed(1), p.npsN)}
      {row(C.ces, "CES (avg)", p.cesAvg == null ? null : p.cesAvg.toFixed(2) + " /5", p.cesN)}
    </div>
  );
}

function PlatformPanel({ name, accent, data, summary, note }) {
  const fmtNet = (v) => (v > 0 ? "+" : "") + v.toFixed(1);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden", flex: "1 1 440px", minWidth: 320 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px",
        borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${accent}` }}>
        <div>
          <Eyebrow color={accent}>Platform</Eyebrow>
          <div style={{ color: C.text, fontSize: 20, fontWeight: 750, marginTop: 3 }}>{name}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
          <Kpi label="NPS · 6-mo net" value={fmtNet(summary.npsNet)} n={summary.npsN} color={C.nps} />
          <Kpi label="CES · 6-mo avg" value={summary.cesAvg.toFixed(1)} suffix="/5" n={summary.cesN} color={C.ces} />
        </div>
      </div>

      {/* chart */}
      <div style={{ padding: "14px 10px 6px" }}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={C.grid} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="m" tick={{ fill: C.muted, fontSize: 11 }}
              axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis yAxisId="nps" domain={[-60, 30]} ticks={[-60, -40, -20, 0, 20]}
              tick={{ fill: C.nps, fontSize: 10, fontFamily: MONO }}
              axisLine={false} tickLine={false} width={34} />
            <YAxis yAxisId="ces" orientation="right" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}
              tick={{ fill: C.ces, fontSize: 10, fontFamily: MONO }}
              axisLine={false} tickLine={false} width={26} />
            <ReferenceLine yAxisId="nps" y={0} stroke={C.faint} strokeDasharray="4 3" />
            <Tooltip content={<ChartTip />} cursor={{ stroke: C.faint, strokeWidth: 1 }} />
            <Line yAxisId="nps" type="monotone" dataKey="npsNet" name="NPS"
              stroke={C.nps} strokeWidth={2.4} connectNulls={false}
              dot={{ r: 3, fill: C.ink, stroke: C.nps, strokeWidth: 2 }}
              activeDot={{ r: 5 }} />
            <Line yAxisId="ces" type="monotone" dataKey="cesAvg" name="CES"
              stroke={C.ces} strokeWidth={2.4} strokeDasharray="6 4" connectNulls={false}
              dot={{ r: 3, fill: C.ink, stroke: C.ces, strokeWidth: 2 }}
              activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "4px 18px 16px",
        flexWrap: "wrap" }}>
        <LegendDot color={C.nps} solid label="NPS — net promoter score (−100…+100)" />
        <LegendDot color={C.ces} label="CES — average effort score (1–5)" />
        {note && <div style={{ color: C.faint, fontSize: 11.5, marginLeft: "auto" }}>{note}</div>}
      </div>
    </div>
  );
}

function Kpi({ label, value, suffix, n, color }) {
  return (
    <div style={{ textAlign: "right" }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ marginTop: 4, color, fontSize: 22, fontWeight: 750, fontFamily: MONO, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 12, color: C.muted }}>{suffix}</span>
      </div>
      <div style={{ color: C.faint, fontSize: 10.5, marginTop: 3 }}>{n.toLocaleString()} responses</div>
    </div>
  );
}

function LegendDot({ color, label, solid }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4"
        stroke={color} strokeWidth="2.4" strokeDasharray={solid ? "0" : "6 4"} /></svg>
      <span style={{ color: C.muted, fontSize: 11.5 }}>{label}</span>
    </div>
  );
}

const sentiColor = (s) => (s === "Positive" ? C.pos : s === "Neutral" ? C.neu : C.neg);

function CommentCard({ c }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${sentiColor(c.sentiment)}`, borderRadius: 10, padding: "11px 13px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <Chip bg={c.platform === "LM" ? C.lm : C.vx}>{c.platform}</Chip>
        <Chip bg={c.type === "NPS" ? C.nps : C.ces} dark>{c.type}</Chip>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700,
          color: sentiColor(c.sentiment) }}>{c.score}{c.type === "NPS" ? "/10" : "/5"}</span>
        <span style={{ color: C.faint, fontSize: 11.5, marginLeft: "auto", fontFamily: MONO }}>{c.date}</span>
      </div>
      <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.5 }}>{c.text}</div>
      {c.account && <div style={{ color: C.faint, fontSize: 11.5, marginTop: 6 }}>— {c.account}</div>}
    </div>
  );
}

function Chip({ children, bg, dark }) {
  return (
    <span style={{ background: bg, color: dark ? "#0B0E13" : "#fff",
      font: `700 10px/1 ${MONO}`, letterSpacing: "0.05em", padding: "3px 6px",
      borderRadius: 5, textTransform: "uppercase" }}>{children}</span>
  );
}

function Seg({ options, value, onChange, accent = C.text }) {
  return (
    <div style={{ display: "inline-flex", background: C.ink, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: 2 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: 6,
            font: `600 12px ${SANS}`, color: on ? "#0B0E13" : C.muted,
            background: on ? accent : "transparent", transition: "all .12s" }}>{o}</button>
        );
      })}
    </div>
  );
}

/* ----------------------------- App ----------------------------- */

export default function App() {
  const [platform, setPlatform] = useState("All");
  const [type, setType] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => COMMENTS.filter((c) =>
    (platform === "All" || c.platform === platform) &&
    (type === "All" || c.type === type) &&
    (sentiment === "All" || c.sentiment === sentiment) &&
    (q.trim() === "" || (c.text + " " + (c.account || "")).toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => (a.date < b.date ? 1 : -1)), [platform, type, sentiment, q]);

  const counts = useMemo(() => {
    const t = { Positive: 0, Neutral: 0, Negative: 0 };
    filtered.forEach((c) => t[c.sentiment]++);
    return t;
  }, [filtered]);

  // window label derived from MONTHS (first … last)
  const windowLabel = MONTHS.length ? `${MONTHS[0].replace("’", "20")} – ${MONTHS[MONTHS.length - 1].replace("’", "20")}` : "";

  return (
    <div style={{ background: C.ink, minHeight: "100vh", fontFamily: SANS, color: C.text,
      padding: "26px clamp(14px,4vw,40px) 56px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap",
          paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
          <div>
            <Eyebrow color={C.faint}>Voice of customer · Demo data</Eyebrow>
            <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em" }}>
              Sentiment Dashboard
            </h1>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: C.muted, fontSize: 12.5 }}>Window</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: C.text }}>{windowLabel}</div>
          </div>
        </div>

        {/* Platform panels */}
        <div style={{ display: "flex", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
          <PlatformPanel name="Lumora" accent={C.lm} data={LM} summary={SUMMARY.LM} note={NOTES.LM} />
          <PlatformPanel name="Vextra" accent={C.vx} data={VX} summary={SUMMARY.VX} note={NOTES.VX} />
        </div>

        {/* Reading note */}
        <div style={{ marginTop: 16, background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "11px 14px", color: C.muted, fontSize: 12.5, lineHeight: 1.55 }}>
          Each panel plots two metrics on independent axes. <strong style={{ color: C.nps }}>NPS</strong> is the
          net promoter score (% promoters minus % detractors, −100…+100); higher is better, the dashed grey line marks zero.
          <strong style={{ color: C.ces }}> CES</strong> is the average customer-effort score on a 1–5 scale; higher means a smoother experience.
        </div>

        {/* Comments */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow color={C.faint}>Verbatim comments</Eyebrow>
          <h2 style={{ margin: "6px 0 14px", fontSize: 19, fontWeight: 750 }}>
            What customers said
            <span style={{ color: C.faint, fontWeight: 500, fontSize: 14, marginLeft: 10 }}>
              {filtered.length} shown
            </span>
          </h2>

          {/* Filters */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
            <FilterGroup label="Platform">
              <Seg options={["All", "LM", "VX"]} value={platform} onChange={setPlatform} accent={C.lm} />
            </FilterGroup>
            <FilterGroup label="Score type">
              <Seg options={["All", "NPS", "CES"]} value={type} onChange={setType} accent={C.nps} />
            </FilterGroup>
            <FilterGroup label="Sentiment">
              <Seg options={["All", "Positive", "Neutral", "Negative"]} value={sentiment}
                onChange={setSentiment} accent={sentiment === "All" ? C.text : sentiColor(sentiment)} />
            </FilterGroup>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comments…"
              style={{ marginLeft: "auto", background: C.ink, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "8px 12px", color: C.text, font: `13px ${SANS}`,
                minWidth: 200, outline: "none" }} />
          </div>

          {/* sentiment tally */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {["Positive", "Neutral", "Negative"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: sentiColor(s) }} />
                <span style={{ color: C.muted, fontSize: 12.5 }}>{s}</span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.text }}>{counts[s]}</span>
              </div>
            ))}
          </div>

          {/* list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 12 }}>
            {filtered.map((c) => <CommentCard key={c.id} c={c} />)}
          </div>
          {filtered.length === 0 && (
            <div style={{ color: C.faint, fontSize: 13, padding: "30px 0", textAlign: "center" }}>
              No comments match these filters. Try widening the selection.
            </div>
          )}
        </div>

        <div style={{ marginTop: 34, paddingTop: 14, borderTop: `1px solid ${C.border}`,
          color: C.faint, fontSize: 11.5, lineHeight: 1.6 }}>
          Sources: <span style={{ fontFamily: MONO }}>NPS Email Survey</span> ·
          <span style={{ fontFamily: MONO }}> CES In-app Poll</span> ·
          <span style={{ fontFamily: MONO }}> NPS Account Upload</span>.
          All data on this page is synthetic demo data — companies, accounts, scores, and comments are fictional.
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <Eyebrow color={C.faint}>{label}</Eyebrow>
      {children}
    </div>
  );
}
