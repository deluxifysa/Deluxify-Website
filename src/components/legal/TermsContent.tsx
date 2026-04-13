"use client";

import { LegalPage } from "./LegalPage";

const sections = [
  {
    heading: "Introduction & Acceptance",
    content: (
      <>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and Deluxify (Pty) Ltd
          (&ldquo;Deluxify&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a private company registered in South Africa. By engaging our services,
          accessing our website, or making a booking, you agree to be bound by these Terms.
        </p>
        <p>
          These Terms are governed by the laws of the Republic of South Africa, including the <strong>Consumer Protection Act 68 of 2008 (CPA)</strong>,
          the <strong>Electronic Communications and Transactions Act 25 of 2002 (ECTA)</strong>, and the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong>.
        </p>
      </>
    ),
  },
  {
    heading: "Description of Services",
    content: (
      <>
        <p>Deluxify provides the following technology and AI services:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>AI Strategy &amp; Consulting</li>
          <li>AI Automation and workflow design</li>
          <li>AI Chatbots and Virtual Agents</li>
          <li>Web, App, and SaaS Development</li>
          <li>Branding, SEO, and Digital Marketing</li>
          <li>Managed IT and Cloud Infrastructure</li>
          <li>AI Training and Upskilling</li>
        </ul>
        <p className="mt-2">Specific deliverables, timelines, and pricing are agreed in a separate <strong>Statement of Work (SOW)</strong> or project proposal for each engagement.</p>
      </>
    ),
  },
  {
    heading: "Eligibility & Account Responsibility",
    content: (
      <>
        <p>You must be at least 18 years old and legally authorised to enter into contracts under South African law. If acting on behalf of a company, you warrant that you have authority to bind that entity.</p>
        <p>You are responsible for maintaining the confidentiality of any login credentials and for all activities conducted under your account.</p>
      </>
    ),
  },
  {
    heading: "Booking & Strategy Session Terms",
    content: (
      <>
        <p>When you book a Strategy Session, a <strong>R 500 deposit</strong> is required to confirm your slot. This deposit is:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Fully refundable if cancelled at least <strong>24 hours before</strong> the scheduled session</li>
          <li>Non-refundable for cancellations made less than 24 hours before the session (unless due to Deluxify&apos;s fault)</li>
          <li>Applied as a credit toward any paid services you engage following the session</li>
        </ul>
        <p className="mt-2">In accordance with <strong>Section 17 of the CPA</strong> (right to cancel advance booking), you may cancel a confirmed booking subject to a reasonable cancellation fee as described above.</p>
      </>
    ),
  },
  {
    heading: "Fees, Payment & Invoicing",
    content: (
      <>
        <p>All prices are quoted in <strong>South African Rand (ZAR)</strong> and are exclusive of VAT unless stated otherwise.</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Invoices are payable within <strong>7 days</strong> of issue unless otherwise agreed</li>
          <li>Late payments may attract interest at the rate prescribed under the <strong>National Credit Act 34 of 2005</strong></li>
          <li>We reserve the right to suspend services for accounts overdue by more than 14 days</li>
          <li>Refunds are issued within 5–7 business days where applicable</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Consumer Rights Under the CPA",
    content: (
      <>
        <p>Nothing in these Terms limits or waives any rights you may have under the Consumer Protection Act 68 of 2008. These include:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>The right to fair, honest, and reasonable dealing</li>
          <li>The right to disclosure and information (Section 22)</li>
          <li>The right to fair and responsible marketing (Section 29)</li>
          <li>The right to fair terms and conditions in consumer agreements (Section 48)</li>
          <li>The right to quality service performed with reasonable care and skill (Section 54)</li>
          <li>The right to lodge complaints with the <strong>National Consumer Commission</strong> at <strong>thencc.org.za</strong></li>
        </ul>
      </>
    ),
  },
  {
    heading: "Intellectual Property",
    content: (
      <ul className="list-disc list-inside space-y-1.5">
        <li>All deliverables created specifically for you and <strong>fully paid for</strong> become your property upon payment</li>
        <li>All underlying frameworks, tools, and pre-existing IP remain the property of Deluxify</li>
        <li>We grant you a non-exclusive licence to use any Deluxify IP embedded in your deliverables solely for your business purposes</li>
        <li>You grant us a limited licence to use your brand and project outcomes for portfolio purposes, unless you opt out in writing</li>
      </ul>
    ),
  },
  {
    heading: "Confidentiality",
    content: (
      <p>Both parties agree to keep confidential any proprietary or sensitive information shared during an engagement. This obligation survives termination for a period of <strong>3 years</strong>.</p>
    ),
  },
  {
    heading: "Limitation of Liability",
    content: (
      <>
        <p>To the maximum extent permitted by South African law (and subject to the CPA):</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Deluxify&apos;s total liability is limited to the fees paid by you in the 3 months preceding the claim</li>
          <li>We are not liable for indirect, incidental, or consequential damages, including lost profits or data loss</li>
          <li>We make no warranty that AI outputs will be error-free or suitable for all regulatory purposes without human review</li>
        </ul>
        <p className="mt-2">These limitations do not apply to liability arising from gross negligence, fraud, or any liability that cannot be excluded under the CPA.</p>
      </>
    ),
  },
  {
    heading: "Termination",
    content: (
      <p>Either party may terminate an ongoing engagement with <strong>30 days&apos; written notice</strong>. Deluxify may terminate immediately where you breach these Terms and fail to remedy the breach within 7 days. Upon termination, all outstanding fees become immediately payable.</p>
    ),
  },
  {
    heading: "Dispute Resolution",
    content: (
      <ul className="list-disc list-inside space-y-1.5">
        <li>Contact us first at <strong>hello@deluxify.co.za</strong> — most issues can be resolved within 5 business days</li>
        <li>If unresolved, either party may refer the matter to mediation under the auspices of the Arbitration Foundation of Southern Africa (AFSA)</li>
        <li>Consumer disputes may also be referred to the <strong>National Consumer Commission</strong> or the <strong>Consumer Goods and Services Ombud (CGSO)</strong></li>
        <li>These Terms are governed by the laws of the Republic of South Africa and subject to South African court jurisdiction</li>
      </ul>
    ),
  },
  {
    heading: "Electronic Communications (ECTA)",
    content: (
      <p>In accordance with the Electronic Communications and Transactions Act 25 of 2002, communications sent electronically are legally valid and binding. Our registered physical address for service of legal process is: Deluxify (Pty) Ltd, Bloemfontein, Free State, South Africa.</p>
    ),
  },
  {
    heading: "Changes to These Terms",
    content: (
      <p>We will notify existing clients of material changes by email or through a prominent notice on our website at least <strong>14 days</strong> before changes take effect. Continued use of our services after the effective date constitutes acceptance.</p>
    ),
  },
];

export function TermsContent() {
  return (
    <LegalPage
      badge="Legal"
      title="Terms of Service"
      subtitle="Please read these Terms carefully before engaging Deluxify's services. These Terms are compliant with South African law including the Consumer Protection Act, ECTA, and POPIA."
      lastUpdated="1 April 2026"
      sections={sections}
    />
  );
}
