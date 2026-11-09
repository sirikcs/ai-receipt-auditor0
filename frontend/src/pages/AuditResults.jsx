
import {
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Clock,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

export default function AuditResults({ result, onContinue }) {
  const actualHours = result?.worklog_summary?.actual_hours;
  const estimatedHours = result?.worklog_summary?.estimated_hours;
  const agreedAmount = result?.payment_summary?.agreed_amount;
  const currency = result?.payment_summary?.currency;

  const aiText = result?.ai_analysis || result?.analysis;

  const actual = Number(actualHours ?? 0);
  const estimated = Number(estimatedHours ?? 0);
  const maxHours = Math.max(actual, estimated, 1);

  const hoursDifference =
    result?.worklog_summary?.hours_difference ??
    (actualHours != null && estimatedHours != null
      ? actual - estimated
      : null);

  const formatAmount = (amount) => {
    if (amount == null) return "N/A";
    return `${currency || ""} ${amount}`;
  };

  return (
    <div className="results-page">

      <div className="results-heading">
        <div>
          <p className="eyebrow">WORKSPACE / AUDIT REPORTS</p>
          <h1>AI Audit Results</h1>
          <p>Here's the analysis of your freelance project.</p>
        </div>
      </div>

      <div className="result-success-banner">
        <div className="success-icon">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <strong>Audit completed successfully</strong>
          <p>
            Results are based on the information available
            in your uploaded contract and work log.
          </p>
        </div>
      </div>

      <section className="score-section">
        <div className="score-card">
          <p className="result-label">HOURS DIFFERENCE</p>

          <div className="score-circle">
            <div>
              <strong>
                {hoursDifference ?? "N/A"}
              </strong>
              <span>hrs</span>
            </div>
          </div>

          <span className="score-rating">
            {hoursDifference == null
              ? "Not available"
              : hoursDifference <= 0
                ? "Within Estimate"
                : "Over Estimate"}
          </span>

          <p className="score-description">
            Recorded hours compared with the hours estimated
            in the contract.
          </p>
        </div>

        <div className="score-details">

          <div className="result-stat">
            <div className="result-stat-icon blue">
              <FileText />
            </div>
            <div>
              <span>Agreed Project Amount</span>
              <strong>{formatAmount(agreedAmount)}</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon green">
              <TrendingUp />
            </div>
            <div>
              <span>Estimated Fair Value</span>
              <strong>N/A</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon purple">
              <Clock />
            </div>
            <div>
              <span>Recorded Work Hours</span>
              <strong>{actualHours ?? "N/A"} Hours</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon orange">
              <FileText />
            </div>
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
              <p>Payment information extracted from the audit</p>
            </div>
            <FileText size={20} />
          </div>

          <div className="comparison-row">
            <div>
              <span>Agreed Amount</span>
              <strong>{formatAmount(agreedAmount)}</strong>
            </div>

            <div>
              <span>Estimated Fair Value</span>
              <strong>N/A</strong>
            </div>
          </div>

          <div className="difference-box">
            <div>
              <span>Estimated Difference</span>
              <strong>N/A</strong>
            </div>
          </div>

          <p className="result-footnote">
            An estimated fair value and payment difference are
            not available in the current audit response.
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
                <strong>{actualHours ?? "N/A"} hrs</strong>
              </div>

              <div className="hours-track">
                <div
                  className="hours-fill recorded-fill"
                  style={{
                    width: `${(actual / maxHours) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="hours-item">
              <div className="hours-label">
                <span>Estimated Hours</span>
                <strong>{estimatedHours ?? "N/A"} hrs</strong>
              </div>

              <div className="hours-track">
                <div
                  className="hours-fill estimated-fill"
                  style={{
                    width: `${(estimated / maxHours) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

          </div>

          <div className="hours-note">
            <CheckCircle2 size={17} />
            {actualHours != null && estimatedHours != null
              ? "Recorded and estimated work hours are displayed for comparison."
              : "Work-hour information is incomplete in the audit response."}
          </div>

        </div>

      </section>

      {aiText && (
        <section className="result-panel">
          <div className="result-panel-heading">
            <div>
              <h3>AI Analysis</h3>
              <p>Analysis returned by the backend</p>
            </div>
            <BrainCircuit size={22} />
          </div>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              padding: "8px 4px",
            }}
          >
            {aiText}
          </div>
        </section>
      )}

      <section className="result-panel recommendations-panel">

        <div className="result-panel-heading">
          <div>
            <h3>Project Review Checklist</h3>
            <p>Things to verify before creating an invoice</p>
          </div>
          <BrainCircuit size={22} />
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon green">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Keep project documentation</strong>
            <p>
              Retain your signed agreement and work logs
              for future reference.
            </p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon blue">
            <Lightbulb size={19} />
          </div>
          <div>
            <strong>Review the audit results</strong>
            <p>
              Check the extracted amounts and work hours
              before creating an invoice.
            </p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon orange">
            <AlertCircle size={19} />
          </div>
          <div>
            <strong>Confirm additional work</strong>
            <p>
              Discuss work outside the original agreement
              with your client.
            </p>
          </div>
        </div>

      </section>

      <div className="results-footer">
        <span>
          <ShieldCheck size={15} />
          AI-generated estimates require human review.
        </span>

        <button
          className="primary-button"
          type="button"
          onClick={onContinue}
        >
          Continue to Invoice <ArrowUpRight size={17} />
        </button>
      </div>

    </div>
  );
}
