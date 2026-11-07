
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

export default function NewAudit() {
  const [contract, setContract] = useState(null);
  const [worklog, setWorklog] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");

  const FileUpload = ({ title, description, accept, file, setFile, icon: Icon }) => (
    <div className="upload-card">
      <div className="upload-card-heading">
        <div className="upload-icon"><Icon size={22} /></div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {file ? (
        <div className="selected-file">
          <FileText size={20} />
          <span>{file.name}</span>
          <button type="button" onClick={() => setFile(null)}><X size={17} /></button>
        </div>
      ) : (
        <label className="upload-area">
          <UploadCloud size={30} />
          <strong>Click to upload or drag your file here</strong>
          <span>Supported format: {accept}</span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      )}
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your audit form is ready! AI analysis will be connected in a later step.");
  };

  return (
    <div className="audit-page">
      <div className="audit-page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / NEW AUDIT</p>
          <h1>Create New AI Audit</h1>
          <p>Upload your project documents to check invoice fairness.</p>
        </div>
        <div className="secure-label">
          <ShieldCheck size={17} /> Secure document submission
        </div>
      </div>

      <div className="audit-intro">
        <div className="intro-icon"><BrainCircuit size={27} /></div>
        <div>
          <strong>Let AI review your freelance work</strong>
          <p>We'll compare your agreed payment, project details and recorded work hours to identify possible discrepancies.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <section className="audit-form-panel">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>Project Information</h2>
              <p>Tell us a little about this freelance project.</p>
            </div>
          </div>

          <div className="audit-input-grid">
            <label className="field">
              Project Name
              <input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Website Redesign"
              />
            </label>

            <label className="field">
              Client Name
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. ABC Technologies"
              />
            </label>

            <label className="field full-field">
              Agreed Project Amount (₹)
              <input
                required
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 45000"
              />
            </label>
          </div>
        </section>

        <section className="audit-form-panel">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>Upload Project Documents</h2>
              <p>Provide the documents required for AI analysis.</p>
            </div>
          </div>

          <div className="upload-grid">
            <FileUpload
              title="Client Agreement"
              description="Upload your signed contract or agreement."
              accept=".pdf,.doc,.docx"
              file={contract}
              setFile={setContract}
              icon={FileText}
            />

            <FileUpload
              title="Work Log"
              description="Upload your recorded project hours."
              accept=".csv,.xlsx,.xls"
              file={worklog}
              setFile={setWorklog}
              icon={FileSpreadsheet}
            />
          </div>
        </section>

        <div className="audit-submit-area">
          <div className="upload-progress">
            <CheckCircle2 size={17} />
            Your documents stay ready for review.
          </div>

          <button className="primary-button audit-submit" type="submit">
            Continue to AI Analysis <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
