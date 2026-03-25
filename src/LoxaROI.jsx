import { useState } from "react";

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

function PopoverFigure({ value, color, fontSize = "var(--text-lg)" }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", minWidth: 90, textAlign: "right", display: "inline-block", marginLeft: 12 }}
      onClick={() => setShow((s) => !s)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        style={{
          fontSize, fontWeight: 700, color: color || "#fff",
          fontFamily: "var(--font-heading)", cursor: "pointer",
        }}
      >
        {fmt(value)}
      </span>
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", right: 0,
          background: "#fff", color: "#1a1a1a", fontFamily: "var(--font-heading)",
          fontSize: "var(--text-sm)", fontWeight: 700, padding: "6px 12px", borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)", whiteSpace: "nowrap",
          zIndex: 10,
        }}>
          {fmtFull(value)}
          <span style={{
            position: "absolute", top: "100%", right: 16,
            width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderTop: "6px solid #fff",
          }} />
        </span>
      )}
    </span>
  );
}

function Slider({ label, value, onChange, min, max, step, suffix, prefix, tooltip }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "#1a1a1a" }}>{label}</label>
        <span style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)" }}>
          {prefix}{typeof value === "number" && !suffix ? value.toLocaleString("en-GB") : value}{suffix}
        </span>
      </div>
      {tooltip && <div style={{ fontSize: "var(--text-xs)", color: "#777", marginBottom: 8, lineHeight: 1.4 }}>{tooltip}</div>}
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
      fontSize: "var(--text-xs)", whiteSpace: "nowrap",
    }}>
      <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{value}</span>
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
        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "rgba(255,255,255,0.85)", flex: 1 }}>{title}</div>
        <PopoverFigure value={revenue} color="var(--blue)" />
        <PopoverFigure value={profit} color="var(--peach)" />
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
      "--font-heading": "'Neulis Sans', 'Poppins', sans-serif",
      "--font-body": "'DM Sans', sans-serif",
      "--text-xs": "12px",
      "--text-sm": "14px",
      "--text-base": "16px",
      "--text-lg": "18px",
      "--text-xl": "20px",
      "--text-2xl": "28px",
      "--text-3xl": "48px",
      "--lime": "#EAFFAA",
      "--purple": "#DBBCEC",
      "--blue": "#B7F0EF",
      "--peach": "#FFBE92",
      minHeight: "100vh",
      background: "var(--lime)",
      fontFamily: "var(--font-body)",
      color: "#1a1a1a",
    }}>
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
      <div style={{ padding: "16px 4vw" }}>
        <div style={{
          background: "#000", borderRadius: 999, padding: "12px 12px 12px 12px",
          display: "flex", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src="/loxa-logo-landscape.svg" alt="Loxa" style={{ height: 56, borderRadius: 999 }} />
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "#fff", fontFamily: "var(--font-heading)" }}>Partnership ROI Calculator</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 4vw 56px" }}>

        {/* Company name */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Prepared for</div>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>{company}</div>
        </div>

        {/* Two column layout */}
        <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "stretch" }}>

          {/* LEFT: Results */}
          <div style={{ background: "#000", borderRadius: 32, padding: "32px 32px 16px" }}>

              {/* Column headers */}
              <div style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: "var(--text-sm)", color: "var(--blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 90, textAlign: "right", marginLeft: 12 }}>Revenue</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--peach)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 90, textAlign: "right", marginLeft: 12 }}>Profit</div>
              </div>

              {/* Totals */}
              <div style={{
                display: "flex", alignItems: "baseline",
                paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em", flex: 1, fontFamily: "var(--font-heading)" }}>Total Annual Value</div>
                <PopoverFigure value={totalRevenue} color="var(--blue)" fontSize="var(--text-2xl)" />
                <PopoverFigure value={totalProfit} color="var(--peach)" fontSize="var(--text-2xl)" />
              </div>

              {/* Line items */}
              <LineItem
                title="Insurance Premiums" revenue={insuranceRevenue} profit={insuranceProfit}
                color="var(--purple)"
                tags={<>
                  <Tag label="Pricing" value={`${insuranceRate}%`} />
                  <Tag label="Take-up" value={`${takeupRate}%`} />
                  <Tag label="Retailer share" value={`${insuranceMargin}%`} />
                </>}
              />
              <LineItem
                title="Conversion Uplift" revenue={conversionRevenue} profit={conversionProfit}
                color="var(--purple)"
                tags={<>
                  <Tag label="Conversion increase" value={`${conversionIncrease}%`} />
                </>}
              />
              <LineItem
                title="Reduced Returns" revenue={returnsRevenue} profit={returnsProfit}
                color="var(--purple)"
                tags={<>
                  <Tag label="Return decrease" value={`${returnDecrease}%`} />
                </>}
              />
              <LineItem
                title="Claims Replacements" revenue={claimsRevenue} profit={claimsProfit}
                color="var(--purple)" isLast
                tags={<>
                  <Tag label="Replacement rate" value={`${replacementRate}%`} />
                  <Tag label="Est. claims" value={Math.round(numClaims).toLocaleString("en-GB")} />
                </>}
              />
            </div>

          {/* RIGHT: Sliders */}
          <div className="slider-panel" style={{
            background: "#fff", borderRadius: 32, padding: "32px 32px 28px",
            border: "1px solid #e4e4e4",
          }}>

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

        {/* Explanation */}
        <div style={{
          marginTop: 32, padding: "28px 32px",
          fontSize: "var(--text-base)", color: "#444", lineHeight: 1.7,
          maxWidth: 800,
        }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)", marginBottom: 12 }}>How it works</div>
          <p style={{ marginBottom: 12 }}>
            Loxa protection creates value across four streams. <strong>Insurance premiums</strong> generate direct revenue from protection sold at checkout, with your share calculated net of 12% IPT. Offering protection at the point of sale drives a <strong>conversion uplift</strong> — customers buy with more confidence, increasing overall sales. Insured products see <strong>fewer returns</strong>, as protected customers are less likely to send items back. When claims do occur, you fulfil <strong>replacement products</strong> and earn margin on each one.
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "#777" }}>
            All product revenue streams are calculated net of 20% VAT. Benchmarks are based on Loxa category data. Figures are estimates — actual results will vary.
          </p>
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
              border: "none", borderRadius: 999,
              padding: "16px 48px", fontSize: "var(--text-lg)", fontWeight: 700,
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
        <div style={{ textAlign: "center", marginTop: 24, fontSize: "var(--text-xs)", color: "#888", lineHeight: 1.7 }}>
          Loxa is authorised and regulated by the Financial Conduct Authority (FCA).
          <div style={{ marginTop: 6, fontWeight: 600, color: "#555", fontSize: "var(--text-sm)" }}>www.loxacover.com</div>
        </div>
      </div>
    </div>
  );
}
