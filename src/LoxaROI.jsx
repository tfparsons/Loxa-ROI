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
    category: p.get("category") || "Category",
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
      style={{ position: "relative", width: 100, flexShrink: 0, textAlign: "right", display: "inline-block", marginLeft: 12 }}
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
      fontSize: "var(--text-sm)", whiteSpace: "nowrap",
    }}>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{value}</span>
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
        <PopoverFigure value={revenue} color={color} />
        <PopoverFigure value={profit} color={color} />
      </div>
      {tags && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 20, maxWidth: "60%" }}>
          {tags}
        </div>
      )}
    </div>
  );
}

export default function LoxaROI() {
  const defaults = getParams();
  const [company] = useState(defaults.company);
  const category = defaults.category;
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
          .slider-panel { position: static !important; order: 1; }
          .stream-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .stream-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 4vw" }}>
        <div style={{
          background: "#000", borderRadius: 999, padding: "12px 20px 12px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src="/loxa-logo-landscape.svg" alt="Loxa" style={{ height: 56, borderRadius: 999 }} />
          </div>
          <a
            href="https://www.loxacover.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", background: "var(--purple)", color: "#000",
              borderRadius: 12, padding: "10px 28px",
              fontSize: "var(--text-base)", fontWeight: 700, fontFamily: "var(--font-heading)",
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            Make an enquiry
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 4vw 56px" }}>

        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)", lineHeight: 1.1, marginBottom: 12 }}>Partnership ROI Calculator</div>
          <div style={{ fontSize: "var(--text-lg)", color: "#666" }}>
            Prepared for <span style={{ fontWeight: 700, color: "#000", fontFamily: "var(--font-heading)" }}>{company}</span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "stretch" }}>

          {/* LEFT: Results */}
          <div style={{ background: "#000", borderRadius: 32, padding: "32px 32px 16px" }}>

              {/* Column headers + Total label */}
              <div style={{ display: "flex", alignItems: "flex-start", paddingBottom: 8 }}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em", flex: 1, fontFamily: "var(--font-heading)" }}>Total Annual<br/>Value</div>
                <div style={{ fontSize: "var(--text-sm)", color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", width: 100, flexShrink: 0, textAlign: "right", marginLeft: 12 }}>Revenue</div>
                <div style={{ fontSize: "var(--text-sm)", color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", width: 100, flexShrink: 0, textAlign: "right", marginLeft: 12 }}>Profit</div>
              </div>

              {/* Total figures */}
              <div style={{
                display: "flex", alignItems: "baseline",
                paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}>
                <div style={{ flex: 1 }} />
                <PopoverFigure value={totalRevenue} color="#fff" fontSize="var(--text-2xl)" />
                <PopoverFigure value={totalProfit} color="#fff" fontSize="var(--text-2xl)" />
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
                color="var(--peach)"
                tags={<>
                  <Tag label="Conversion increase" value={`${conversionIncrease}%`} />
                </>}
              />
              <LineItem
                title="Reduced Returns" revenue={returnsRevenue} profit={returnsProfit}
                color="var(--blue)"
                tags={<>
                  <Tag label="Return decrease" value={`${returnDecrease}%`} />
                </>}
              />
              <LineItem
                title="Claims Replacements" revenue={claimsRevenue} profit={claimsProfit}
                color="var(--lime)" isLast
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
              tooltip="Annual revenue from eligible products"
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

            <ul style={{ fontSize: "var(--text-xs)", color: "#999", lineHeight: 1.7, paddingLeft: 16, fontWeight: 400, marginTop: 20, borderTop: "1px solid #e4e4e4", paddingTop: 16 }}>
              <li>Figures are estimates — actual results will vary</li>
              <li>{category} benchmarks are based on Loxa data</li>
              <li>All revenue streams calculated net of 20% VAT</li>
              <li>Insurance profit is calculated net of 12% IPT</li>
            </ul>
          </div>
        </div>

        {/* Explanation */}
        <div style={{ marginTop: 48, padding: "40px 40px 32px", background: "#fff", borderRadius: 32 }}>
          <div style={{
            fontSize: "var(--text-3xl)", fontWeight: 400, color: "#000",
            fontFamily: "'Gelica', Georgia, serif", fontStyle: "italic",
            marginBottom: 32, lineHeight: 1.2,
          }}>
            How it works
          </div>
          <p style={{ fontSize: "var(--text-lg)", color: "#444", lineHeight: 1.6, marginBottom: 32 }}>
            Adding Loxa protection to your checkout boosts revenue in <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#000", fontSize: "var(--text-xl)" }}>4</span> ways:
          </p>

          <div className="stream-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
            marginBottom: 24,
          }}>
            {[
              { title: "Insurance Premiums", desc: "Direct revenue from protection sold at checkout, with your share calculated net of IPT.", icon: "/icons/insurance_premiums.png", bg: "var(--purple)" },
              { title: "Conversion Uplift", desc: "Customers buy with more confidence when protection is offered, increasing overall sales.", icon: "/icons/conversion_uplift.png", bg: "var(--peach)" },
              { title: "Reduced\nReturns", desc: "Protected customers are less likely to return items, saving you cost and lost stock.", icon: "/icons/reduced_returns.png", bg: "var(--blue)" },
              { title: "Claims Replacements", desc: "When claims occur, you fulfil replacement products and earn margin on each one.", icon: "/icons/claims_replacements.png", bg: "var(--lime)" },
            ].map((item) => (
              <div key={item.title} style={{
                background: item.bg, borderRadius: 20, padding: "28px 24px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                textAlign: "center",
              }}>
                <img src={item.icon} alt={item.title} style={{ width: 120, height: 120, marginBottom: 4 }} />
                <div style={{
                  fontSize: "var(--text-base)", fontWeight: 700, color: "#000",
                  fontFamily: "var(--font-heading)", textTransform: "uppercase", whiteSpace: "pre-line",
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href="https://www.loxacover.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#000", color: "var(--lime)",
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
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: "var(--text-xs)", color: "#888", lineHeight: 1.7 }}>
          Loxa is authorised and regulated by the Financial Conduct Authority (FCA).
        </div>
      </div>
    </div>
  );
}
