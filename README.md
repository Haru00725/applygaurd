# ApplyGuard 🛡️

> **Evidence-based job and internship scam checker.**  
> Built with Next.js 15, Tailwind CSS v4, and Google Gemini Multimodal API.

ApplyGuard helps students, freshers, and job seekers evaluate suspicious recruitment offers, WhatsApp recruiter messages, task scams, and fake offer letters before they pay, reply, or sign.

---

## Features

- **Multi-Modal Analysis**: Checks direct URLs (with SSRF protection), text transcripts (WhatsApp, Telegram, email), and documents (screenshots, photos, PDFs up to 6MB) directly via Gemini.
- **Evidence-Based Reporting**: Strictly requires quoted evidence from the submitted material—no arbitrary fraud probabilities or hallucinated scores.
- **Heuristic Pattern Signals**: Pre-screens for high-risk flags including free-mail recruiters (`@gmail.com`), upfront registration/training fees, WhatsApp/Telegram interview traps, task/crypto pay structures, and suspicious domain TLDs.
- **Actionable Verification Plan**: Generates specific, localized verification steps (e.g., MCA21 lookup in India, official career portal direct check, WHOIS domain age inspection).
- **Interactive Checklist**: Users can tick off verification milestones directly in the report.
- **Export & Share**: Instant "Copy Summary" to clipboard and clean "Print / Save as PDF" styling for documentation.
- **Zero-Storage Privacy**: No data is persisted in a database; content is analyzed in-memory and immediately discarded.
- **Built-in Rate Limiting & Security Headers**: In-memory sliding-window IP rate limiting, SSRF IP blocking, and production HTTP security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18.18 or higher (v20+ recommended)
- **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 2. Installation
```bash
git clone https://github.com/your-username/applyguard.git
cd applyguard
npm install
```

### 3. Environment Setup
Create a `.env` or `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
*(If `gemini-2.5-flash` is not enabled on your key, ApplyGuard automatically falls back to `gemini-2.0-flash` or `gemini-1.5-flash`.)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## Production Deployment

### Option A: Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GEMINI_MODEL`: `gemini-2.5-flash` (or `gemini-2.0-flash`)
4. Deploy!

### Option B: Railway / Node Server
1. Deploy from GitHub to [Railway](https://railway.app).
2. Set Environment Variables: `GEMINI_API_KEY`, `PORT=3000`.
3. Start command: `npm run start`.

---

## Important Helplines & Resources

If you or someone you know has already transferred money to a fraudulent recruiter:
- **India**: Call **1930** immediately and file a complaint at [cybercrime.gov.in](https://cybercrime.gov.in).
- **United States**: File a report with the FTC at [reportfraud.ftc.gov](https://reportfraud.ftc.gov) and FBI IC3 at [ic3.gov](https://ic3.gov).
- **United Kingdom**: Report to Action Fraud at [actionfraud.police.uk](https://actionfraud.police.uk) (0300 123 2040).
- Contact your bank immediately to reverse unauthorized transfers.
