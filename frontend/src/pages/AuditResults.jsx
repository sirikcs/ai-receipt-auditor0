
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  // Read values from the backend response.
  const actualHours = result?.worklog_summary?.actual_hours;

  const estimatedHours =
    result?.worklog_summary?.estimated_hours ??
    result?.contract_details?.estimated_hours;

  const agreedAmount =
    result?.payment_summary?.agreed_amount ??
    result?.contract_details?.agreed_amount;

  const currency =
    result?.payment_summary?.currency ||
    result?.contract_details?.currency ||
    "USD";

  const aiText = result?.ai_analysis || result?.analysis;

  // Calculate the hours difference only when both values exist.
  const hoursDifference =
    result?.worklog_summary?.hours_difference ??
    (actualHours != null && estimatedHours != null
      ? Number(actualHours) - Number(estimatedHours)
      : null);

  const formatHours = (hours) => {
    if (hours == null || !Number.isFinite(Number(hours))) {
      return "Not available";
    }

    return Number(hours).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const formatAmount = (amount) => {
    if (amount == null || !Number.isFinite(Number(amount))) {
      return "Not available";
    }

    return `${currency} ${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const actual = Number(actualHours ?? 0);
  const estimated = Number(estimatedHours ?? 0);
  const maxHours = Math.max(actual, estimated, 1);

  const hasHoursDifference = hoursDifference != null;

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
                {hasHoursDifference
                  ? formatHours(hoursDifference)
                  : "—"}
              </strong>
              <span>hrs</span>
            </div>
          </div>

          <span className="score-rating">
            {!hasHoursDifference
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
              <strong>Not calculated</strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon purple">
              <Clock />
            </div>

            <div>
              <span>Recorded Work Hours</span>
              <strong>
                {formatHours(actualHours)} Hours
              </strong>
            </div>
          </div>

          <div className="result-stat">
            <div className="result-stat-icon orange">
              <FileText />
            </div>

            <div>
              <span>Estimated Work Hours</span>
              <strong>
                {formatHours(estimatedHours)} Hours
              </strong>
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
              <strong>Not calculated</strong>
            </div>
          </div>

          <div className="difference-box">
            <div>
              <span>Estimated Difference</span>
              <strong>Not calculated</strong>
            </div>
          </div>

          <p className="result-footnote">
            Fair value and payment difference are not calculated
            by the current backend. No financial estimate is
            displayed without a verified calculation.
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
                <strong>{formatHours(actualHours)} hrs</strong>
              </div>

              <div className="hours-track">
                <div
                  className="hours-fill recorded-fill"
                  style={{
                    width:
                      actualHours != null
                        ? `${(actual / maxHours) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="hours-item">
              <div className="hours-label">
                <span>Estimated Hours</span>
                <strong>{formatHours(estimatedHours)} hrs</strong>
              </div>

              <div className="hours-track">
                <div
                  className="hours-fill estimated-fill"
                  style={{
                    width:
                      estimatedHours != null
                        ? `${(estimated / maxHours) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

          </div>

          <div className="hours-note">
            <CheckCircle2 size={17} />

            {actualHours != null && estimatedHours != null
              ? "Recorded and estimated work hours are displayed for comparison."
              : "Some work-hour information is missing from the audit response."}
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
            className="ai-markdown-content"
            style={{
              lineHeight: 1.7,
              padding: "8px 4px",
              overflowWrap: "anywhere",
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {String(aiText)}
            </ReactMarkdown>
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
          AI-generated analysis requires human review.
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
