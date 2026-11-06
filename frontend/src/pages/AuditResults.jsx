
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

export default function AuditResults() {
  return (
    <div className="results-page">

      <div className="results-heading">
        <div>
          <p className="eyebrow">WORKSPACE / AUDIT REPORTS</p>
          <h1>AI Audit Results</h1>
          <p>Here's the analysis of your freelance project.</p>
        </div>
        <span className="sample-badge">DEMO REPORT</span>
      </div>

      <div className="result-success-banner">
        <div className="success-icon">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <strong>Sample audit completed successfully</strong>
          <p>This is illustrative data. Actual results will come from the AI backend.</p>
        </div>
      </div>

      <section className="score-section">
        <div className="score-card">
          <p className="result-label">AI FAIRNESS SCORE</p>
          <div className="score-circle">
            <div>
              <strong>92</strong>
              <span>/100</span>
            </div>
          </div>
          <span className="score-rating">Good Fairness</span>
          <p className="score-description">
            The sample project appears reasonably aligned with the agreed amount.
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
              <strong>40 Hours</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon orange"><FileText /></div>
            <div>
              <span>Estimated Work Hours</span>
              <strong>42 Hours</strong>
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
              <strong>₹45,000</strong>
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
