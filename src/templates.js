const icon =`<svg width="27" height="27" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <!-- Background circle -->
//   <circle cx="12" cy="12" r="10" fill="#F1F3F4"/>

//   <!-- Sliders -->
//   <line x1="7" y1="9" x2="13" y2="9" stroke="#EA4335" stroke-width="1.5" stroke-linecap="round"/>
//   <circle cx="10" cy="9" r="1.5" fill="#EA4335"/>

//   <line x1="7" y1="12" x2="13" y2="12" stroke="#FBBC05" stroke-width="1.5" stroke-linecap="round"/>
//   <circle cx="9" cy="12" r="1.5" fill="#FBBC05"/>

//   <line x1="7" y1="15" x2="13" y2="15" stroke="#34A853" stroke-width="1.5" stroke-linecap="round"/>
//   <circle cx="11" cy="15" r="1.5" fill="#34A853"/>

//   <!-- Magnifying glass -->
//   <circle cx="13.5" cy="13.5" r="4" stroke="#4285F4" stroke-width="1.8"/>
//   <line x1="16.5" y1="16.5" x2="19" y2="19" stroke="#4285F4" stroke-width="1.8" stroke-linecap="round"/>
</svg>`

const form =
`<style>
  :host {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    font-family: "Segoe UI Variable", "Segoe UI", sans-serif;
    color: #0f172a;
  }

  * {
    box-sizing: border-box;
  }

  .prompt-enhancer-overlay {
    min-height: 100vh;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 42%),
      rgba(15, 23, 42, 0.28);
    backdrop-filter: blur(12px);
  }

  .prompt-enhancer-card {
    width: min(100%, 420px);
    border-radius: 24px;
    overflow: hidden;
    overflow-y:scroll;
    height: 70vh;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow:
      0 28px 80px rgba(15, 23, 42, 0.24),
      0 10px 24px rgba(15, 23, 42, 0.14);
  }

  .prompt-enhancer-header {
    position: relative;
    padding: 24px 24px 18px;
    background:
      linear-gradient(135deg, rgba(239, 246, 255, 0.96), rgba(255, 255, 255, 0.88));
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  }

  .prompt-enhancer-kicker {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #2563eb;
  }

  .prompt-enhancer-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .prompt-enhancer-subtitle {
    margin: 10px 0 0;
    max-width: 30ch;
    font-size: 0.94rem;
    line-height: 1.55;
    color: #475569;
  }

  .prompt-enhancer-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.8);
    color: #334155;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    transition: background-color 150ms ease, transform 150ms ease, border-color 150ms ease;
  }

  .prompt-enhancer-close:hover {
    background: #ffffff;
    border-color: rgba(59, 130, 246, 0.35);
    transform: translateY(-1px);
  }

  .prompt-enhancer-close:focus-visible,
  .prompt-enhancer-input:focus-visible,
  .prompt-enhancer-secondary:focus-visible,
  .prompt-enhancer-primary:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
  }

  #prompt-enhancer-form {
    padding: 22px 24px 24px;
  }

  .prompt-enhancer-question-count {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    padding: 7px 12px;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .prompt-enhancer-question-list {
    display: grid;
    gap: 14px;
  }

  .prompt-enhancer-field {
    display: grid;
    gap: 8px;
  }

  .prompt-enhancer-label {
    font-size: 0.92rem;
    line-height: 1.45;
    font-weight: 600;
    color: #1e293b;
  }

  .prompt-enhancer-input {
    width: 100%;
    padding: 14px 15px;
    border: 1px solid #d7deea;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    color: #0f172a;
    font: inherit;
    transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  }

  .prompt-enhancer-input::placeholder {
    color: #94a3b8;
  }

  .prompt-enhancer-input:hover {
    border-color: #bfdbfe;
  }

  .prompt-enhancer-input:focus {
    border-color: #60a5fa;
    transform: translateY(-1px);
  }

  .prompt-enhancer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 22px;
  }

  .prompt-enhancer-secondary,
  .prompt-enhancer-primary {
    border: none;
    border-radius: 14px;
    padding: 12px 18px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
  }

  .prompt-enhancer-secondary {
    background: #e2e8f0;
    color: #334155;
  }

  .prompt-enhancer-secondary:hover,
  .prompt-enhancer-primary:hover {
    transform: translateY(-1px);
  }

  .prompt-enhancer-primary {
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #0f62fe);
    box-shadow: 0 14px 24px rgba(37, 99, 235, 0.24);
  }

  @media (max-width: 640px) {
    .prompt-enhancer-overlay {
      padding: 16px;
      align-items: flex-end;
    }

    .prompt-enhancer-card {
      border-radius: 22px 22px 18px 18px;
    }

    .prompt-enhancer-header,
    #prompt-enhancer-form {
      padding-left: 18px;
      padding-right: 18px;
    }

    .prompt-enhancer-actions {
      flex-direction: column-reverse;
    }

    .prompt-enhancer-secondary,
    .prompt-enhancer-primary {
      width: 100%;
    }
  }
</style>
<div class="prompt-enhancer-overlay" id="prompt-enhancer-overlay">
  <div class="prompt-enhancer-card">
    <div class="prompt-enhancer-header">
      <p class="prompt-enhancer-kicker">Prompt Enhancer</p>
      <h2 class="prompt-enhancer-title">Add a bit more context</h2>
      <p class="prompt-enhancer-subtitle">Answer a few quick questions to shape the next refinement more precisely.</p>
      <button type="button" class="prompt-enhancer-close" id="prompt-enhancer-close" aria-label="Close form">&times;</button>
    </div>
    <form id="prompt-enhancer-form">
      <div class="prompt-enhancer-question-count" id="prompt-enhancer-question-count"></div>
      <div class="prompt-enhancer-question-list" id="prompt-enhancer-question-list"></div>
      <div class="prompt-enhancer-actions">
        <button type="button" class="prompt-enhancer-secondary" id="prompt-enhancer-cancel">Cancel</button>
        <button type="submit" class="prompt-enhancer-primary">Apply</button>
      </div>
    </form>
  </div>
</div>`


export { icon, form };
