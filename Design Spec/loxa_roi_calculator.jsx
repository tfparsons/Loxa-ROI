import { useState, useCallback } from "react";

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    company: p.get("company") || "Your Company",
    revenue: Number(p.get("revenue")) || 20000000,
    insurance_rate: Number(p.get("rate")) || 8,
    takeup_rate: Number(p.get("takeup")) || 30,
    avg_insured_value: Number(p.get("aiv")) || 800,
    product_margin: Number(p.get("margin")) || 50,
    claims_margin: Number(p.get("claims_margin")) || 37.5,
    insurance_margin: Number(p.get("ins_margin")) || 30,
    replacement_rate: Number(p.get("replacement")) || 1.5,
    conversion_increase: Number(p.get("conversion")) || 1.5,
    return_decrease: Number(p.get("returns")) || 5,
  };
}

function fmt(n) {
  if (Math.abs(n) >= 1000000) {
    const m = n / 1000000;
    return "\u00a3" + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "m";
  }
  if (Math.abs(n) >= 1000) return "\u00a3" + Math.round(n / 1000).toLocaleString("en-GB") + "k";
  return "\u00a3" + Math.round(n).toLocaleString("en-GB");
}

function fmtFull(n) {
  return "\u00a3" + Math.round(n).toLocaleString("en-GB");
}

function HoverFigure({ value, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 14, fontWeight: 700, color: color || "#fff",
        fontFamily: "var(--font-heading)", cursor: "default",
        minWidth: 80, textAlign: "right", display: "inline-block",
      }}
    >
      {hovered ? fmtFull(value) : fmt(value)}
    </span>
  );
}

function HoverFigureLarge({ value, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 28, fontWeight: 700, color: color || "#fff",
        fontFamily: "var(--font-heading)", cursor: "default",
        minWidth: 80, textAlign: "right", display: "inline-block",
      }}
    >
      {hovered ? fmtFull(value) : fmt(value)}
    </span>
  );
}

function Slider({ label, value, onChange, min, max, step, suffix, prefix, tooltip }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{label}</label>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)" }}>
          {prefix}{typeof value === "number" && !suffix ? value.toLocaleString("en-GB") : value}{suffix}
        </span>
      </div>
      {tooltip && <div style={{ fontSize: 11, color: "#777", marginBottom: 8, lineHeight: 1.4 }}>{tooltip}</div>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%", height: 6, borderRadius: 3, appearance: "none",
          background: `linear-gradient(to right, #000 0%, #000 ${pct}%, #ddd ${pct}%, #ddd 100%)`,
          outline: "none", cursor: "pointer",
        }}
      />
    </div>
  );
}

function Tag({ label, value }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "3px 10px",
      fontSize: 11, whiteSpace: "nowrap",
    }}>
      <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{value}</span>
    </span>
  );
}

function NoteTag({ text }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      borderRadius: 6, padding: "3px 8px",
      fontSize: 10, whiteSpace: "nowrap",
      color: "rgba(255,255,255,0.35)", fontStyle: "italic",
    }}>
      {text}
    </span>
  );
}

function LineItem({ title, revenue, profit, color, tags, isLast }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: tags ? 10 : 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", flex: 1 }}>{title}</div>
        <HoverFigure value={revenue} />
        <HoverFigure value={profit} color="#EAFFAA" />
      </div>
      {tags && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 20 }}>
          {tags}
        </div>
      )}
    </div>
  );
}

export default function LoxaROI() {
  const defaults = getParams();
  const [company] = useState(defaults.company);
  const [revenue, setRevenue] = useState(defaults.revenue);
  const [avgInsuredValue, setAvgInsuredValue] = useState(defaults.avg_insured_value);
  const [productMargin, setProductMargin] = useState(defaults.product_margin);
  const [claimsMargin, setClaimsMargin] = useState(defaults.claims_margin);

  const insuranceRate = defaults.insurance_rate;
  const takeupRate = defaults.takeup_rate;
  const insuranceMargin = defaults.insurance_margin;
  const conversionIncrease = defaults.conversion_increase;
  const returnDecrease = defaults.return_decrease;
  const replacementRate = defaults.replacement_rate;

  // Compute
  const insuredProductValue = revenue * (takeupRate / 100);
  const insuranceRevenue = insuredProductValue * (insuranceRate / 100);
  const insuranceProfit = (insuranceRevenue / 1.12) * (insuranceMargin / 100);
  const conversionRevenue = revenue * (conversionIncrease / 100);
  const conversionProfit = (conversionRevenue / 1.2) * (productMargin / 100);
  const returnsRevenue = insuredProductValue * (returnDecrease / 100);
  const returnsProfit = (returnsRevenue / 1.2) * (productMargin / 100);
  const numClaims = (insuredProductValue / avgInsuredValue) * (replacementRate / 100);
  const claimsRevenue = numClaims * avgInsuredValue;
  const claimsProfit = (claimsRevenue / 1.2) * (claimsMargin / 100);
  const totalRevenue = insuranceRevenue + conversionRevenue + returnsRevenue + claimsRevenue;
  const totalProfit = insuranceProfit + conversionProfit + returnsProfit + claimsProfit;

  const revenueStep = revenue < 1000000 ? 100000 : revenue < 10000000 ? 500000 : 5000000;

  return (
    <div style={{
      "--font-heading": "'Poppins', sans-serif",
      "--font-body": "'DM Sans', sans-serif",
      "--lime": "#EAFFAA",
      "--purple": "#DBBCEC",
      "--blue": "#B7F0EF",
      "--peach": "#FFBE92",
      minHeight: "100vh",
      background: "var(--lime)",
      fontFamily: "var(--font-body)",
      color: "#1a1a1a",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #EAFFAA; border: 2px solid #000; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #EAFFAA; border: 2px solid #000; cursor: pointer;
        }
        @media (max-width: 860px) {
          .roi-grid { grid-template-columns: 1fr !important; }
          .slider-panel { position: static !important; order: -1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 800,
            fontSize: 10, lineHeight: 1.1, textAlign: "center",
          }}>LO<br/>XA</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)" }}>Partnership ROI Calculator</div>
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>www.loxacover.com</div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 32px 56px" }}>

        {/* Company name */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Prepared for</div>
          <div style={{ fontSize: 38, fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>{company}</div>
        </div>

        {/* Two column layout */}
        <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* LEFT: Results */}
          <div>
            <div style={{ background: "#000", borderRadius: 20, padding: "28px 28px 12px" }}>

              {/* Column headers */}
              <div style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 80, textAlign: "right" }}>Revenue</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 80, textAlign: "right" }}>Profit</div>
              </div>

              {/* Totals */}
              <div style={{
                display: "flex", alignItems: "baseline",
                paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.04em", flex: 1 }}>Total Annual Value</div>
                <HoverFigureLarge value={totalRevenue} />
                <HoverFigureLarge value={totalProfit} color="var(--lime)" />
              </div>

              {/* Line items */}
              <LineItem
                title="Insurance Premiums" revenue={insuranceRevenue} profit={insuranceProfit}
                color="var(--lime)"
                tags={<>
                  <Tag label="Pricing" value={`${insuranceRate}%`} />
                  <Tag label="Take-up" value={`${takeupRate}%`} />
                  <Tag label="Retailer share" value={`${insuranceMargin}%`} />
                  <NoteTag text="Profit net of 12% IPT" />
                </>}
              />
              <LineItem
                title="Conversion Uplift" revenue={conversionRevenue} profit={conversionProfit}
                color="var(--purple)"
                tags={<>
                  <Tag label="Conversion increase" value={`${conversionIncrease}%`} />
                  <NoteTag text="Net of 20% VAT" />
                </>}
              />
              <LineItem
                title="Reduced Returns" revenue={returnsRevenue} profit={returnsProfit}
                color="var(--blue)"
                tags={<>
                  <Tag label="Return decrease" value={`${returnDecrease}%`} />
                  <NoteTag text="On insured products only" />
                </>}
              />
              <LineItem
                title="Claims Replacements" revenue={claimsRevenue} profit={claimsProfit}
                color="var(--peach)" isLast
                tags={<>
                  <Tag label="Replacement rate" value={`${replacementRate}%`} />
                  <Tag label="Est. claims" value={Math.round(numClaims).toLocaleString("en-GB")} />
                  <NoteTag text="Net of 20% VAT" />
                </>}
              />
            </div>

            {/* Methodology note */}
            <div style={{
              padding: "14px 20px", marginTop: 12,
              fontSize: 11, color: "#777", lineHeight: 1.5,
            }}>
              Insurance profit calculated net of 12% Insurance Premium Tax (IPT). Product revenue streams (conversion, returns, claims) calculated net of 20% VAT. Insured product value: {fmtFull(insuredProductValue)}.
            </div>
          </div>

          {/* RIGHT: Sliders */}
          <div className="slider-panel" style={{
            background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
            border: "1px solid #e4e4e4", position: "sticky", top: 24,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)", marginBottom: 4 }}>Your Business</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Adjust to match your numbers</div>

            <Slider
              label="Total Insurable Revenue" value={revenue} onChange={setRevenue}
              min={500000} max={500000000} step={revenueStep}
              prefix={"\u00a3"} suffix=""
              tooltip="Annual revenue from physical products eligible for protection"
            />
            <Slider
              label="Avg Insured Product Value" value={avgInsuredValue} onChange={setAvgInsuredValue}
              min={50} max={5000} step={50}
              prefix={"\u00a3"} suffix=""
            />
            <Slider
              label="Average Product Margin" value={productMargin} onChange={setProductMargin}
              min={10} max={80} step={1} prefix="" suffix="%"
            />
            <Slider
              label="Claims Replacement Margin" value={claimsMargin} onChange={setClaimsMargin}
              min={10} max={60} step={0.5} prefix="" suffix="%"
              tooltip="Your margin on replacement items fulfilled under claims"
            />
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a
            href="https://www.loxacover.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#000", color: "#fff",
              border: "none", borderRadius: 12,
              padding: "16px 48px", fontSize: 16, fontWeight: 700,
              fontFamily: "var(--font-heading)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Make an enquiry
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#888", lineHeight: 1.7 }}>
          This calculator provides estimates based on the assumptions shown. Actual results will vary.<br />
          Loxa is authorised and regulated by the Financial Conduct Authority (FCA).
          <div style={{ marginTop: 6, fontWeight: 600, color: "#555", fontSize: 12 }}>www.loxacover.com</div>
        </div>
      </div>
    </div>
  );
}
