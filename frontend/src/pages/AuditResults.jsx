
import {
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Clock,
  IndianRupee,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

export default function AuditResults({ result }) {
  const actualHours = result?.worklog_summary?.actual_hours;
  const estimatedHours = result?.worklog_summary?.estimated_hours;
  const agreedAmount = result?.payment_summary?.agreed_amount;
  const currency = result?.payment_summary?.currency;
  const aiText = result?.ai_analysis || result?.analysis;
  return (
    <div className="results-page">

      <div className="results-heading">
        <div>
          <p className="eyebrow">WORKSPACE / AUDIT REPORTS</p>
          <h1>AI Audit Results</h1>
          <p>Here's the analysis of your freelance project.</p>
        </div>
        <span className="sample-badge">AI REPORT</span>
      </div>

      <div className="result-success-banner">
        <div className="success-icon">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <strong>Audit completed successfully</strong>
<p>This report is based on your uploaded contract and work log.</p>
        </div>
      </div>

      <section className="score-section">
        <div className="score-card">
          <p className="result-label">HOURS DIFFERENCE</p>
<div className="score-circle">
  <div>
    <strong>{result?.worklog_summary?.hours_difference ?? "N/A"}</strong>
    <span>hrs</span>
  </div>
</div>
<span className="score-rating">
  {result?.worklog_summary?.hours_difference <= 0 ? "Within Estimate" : "Over Estimate"}
</span>
<p className="score-description">
  Recorded hours compared with the hours estimated in the contract.
</p>
        </div>

        <div className="score-details">
          <div className="result-stat">
            <div className="result-stat-icon blue"><IndianRupee /></div>
            <div>
              <span>Agreed Project Amount</span>
              <strong>₹45,000</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon green"><TrendingUp /></div>
            <div>
              <span>Estimated Fair Value</span>
              <strong>₹48,000</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon purple"><Clock /></div>
            <div>
              <span>Recorded Work Hours</span>
              <strong>{actualHours ?? "N/A"} Hours</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon orange"><FileText /></div>
            <div>
              <span>Estimated Work Hours</span>
              <strong>{estimatedHours ?? "N/A"} Hours</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="results-grid">
        <div className="result-panel">
          <div className="result-panel-heading">
            <div>
              <h3>Payment Analysis</h3>
              <p>Agreed amount compared with estimated fair value</p>
            </div>
            <IndianRupee size={20} />
          </div>

          <div className="comparison-row">
            <div>
              <span>Agreed Amount</span>
              <strong>{agreedAmount != null ? `${currency || ""} ${agreedAmount}` : "N/A"}</strong>
            </div>
            <div>
              <span>Estimated Fair Value</span>
              <strong>₹48,000</strong>
            </div>
          </div>

          <div className="difference-box">
            <div>
              <span>Estimated Difference</span>
              <strong>₹3,000</strong>
            </div>
            <span className="difference-tag">+6.67%</span>
          </div>

          <p className="result-footnote">
            The estimated fair value is higher than the agreed amount. This is
            an estimate, not a guaranteed amount owed by the client.
          </p>
        </div>

        <div className="result-panel">
          <div className="result-panel-heading">
            <div>
              <h3>Work Hours Analysis</h3>
              <p>Recorded versus estimated project time</p>
            </div>
            <Clock size={20} />
          </div>

          <div className="hours-comparison">
            <div className="hours-item">
              <div className="hours-label">
                <span>Recorded Hours</span>
                <strong>40 hrs</strong>
              </div>
              <div className="hours-track">
                <div className="hours-fill recorded-fill"></div>
              </div>
            </div>

            <div className="hours-item">
              <div className="hours-label">
                <span>Estimated Hours</span>
                <strong>42 hrs</strong>
              </div>
              <div className="hours-track">
                <div className="hours-fill estimated-fill"></div>
              </div>
            </div>
          </div>

          <div className="hours-note">
            <CheckCircle2 size={17} />
            Recorded time is close to the estimated project duration.
          </div>
        </div>
      </section>
{aiText && (
  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, padding: "8px 4px" }}>
    {aiText}
  </div>
)}
      <section className="result-panel recommendations-panel">
        <div className="result-panel-heading">
          <div>
            <h3>AI Recommendations</h3>
            <p>Suggestions based on this sample analysis</p>
          </div>
          <BrainCircuit size={22} />
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon green">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Keep your project documentation</strong>
            <p>Maintain your signed agreement and work logs as supporting records.</p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon blue">
            <Lightbulb size={19} />
          </div>
          <div>
            <strong>Review the estimated value</strong>
            <p>Compare the estimated fair value with the agreed payment before preparing your invoice.</p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon orange">
            <AlertCircle size={19} />
          </div>
          <div>
            <strong>Clarify additional work</strong>
            <p>Discuss any work outside the original agreement with your client.</p>
          </div>
        </div>
      </section>

      <div className="results-footer">
        <span>
          <ShieldCheck size={15} />
          AI-generated estimates require human review.
        </span>

        <button className="primary-button" type="button">
          Continue to Invoice <ArrowUpRight size={17} />
        </button>
      </div>

      <p className="demo-note">
        <AlertCircle size={14} />
        All figures and scores on this screen are fictional demonstration data.
      </p>

    </div>
  );
}
