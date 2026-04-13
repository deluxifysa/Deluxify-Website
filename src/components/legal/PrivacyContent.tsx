"use client";

import { LegalPage } from "./LegalPage";

const sections = [
  {
    heading: "Who We Are & Who This Policy Applies To",
    content: (
      <>
        <p>
          Deluxify (Pty) Ltd (&ldquo;Deluxify&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a private company
          registered in South Africa, operating as an AI and technology solutions provider. We are the
          &ldquo;Responsible Party&rdquo; as defined in the Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;).
        </p>
        <p>
          This Privacy Policy applies to all individuals whose personal information we process, including website
          visitors, clients, prospective clients, and anyone who contacts us or uses our services.
        </p>
      </>
    ),
  },
  {
    heading: "Legal Basis — POPIA Compliance",
    content: (
      <>
        <p>We process personal information in accordance with POPIA (Act 4 of 2013) and the eight Conditions for Lawful Processing:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Accountability</strong> — We are responsible for ensuring compliance.</li>
          <li><strong>Processing Limitation</strong> — We only collect what is necessary.</li>
          <li><strong>Purpose Specification</strong> — We collect for specific, defined purposes.</li>
          <li><strong>Further Processing Limitation</strong> — We do not repurpose data without consent.</li>
          <li><strong>Information Quality</strong> — We keep your data accurate and up to date.</li>
          <li><strong>Openness</strong> — We are transparent about our processing activities.</li>
          <li><strong>Security Safeguards</strong> — We protect your information appropriately.</li>
          <li><strong>Data Subject Participation</strong> — You have the right to access and correct your data.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Personal Information We Collect",
    content: (
      <>
        <p>We may collect the following categories of personal information:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Identity information:</strong> Full name, job title, company name</li>
          <li><strong>Contact information:</strong> Email address, phone number, physical address</li>
          <li><strong>Payment information:</strong> Billing details processed via our payment gateway (we do not store card details)</li>
          <li><strong>Technical information:</strong> IP address, browser type, device information, cookies</li>
          <li><strong>Usage data:</strong> Pages visited, time on site, referral source</li>
          <li><strong>Communications:</strong> Messages, enquiries, support requests sent to us</li>
          <li><strong>Business information:</strong> Information shared during strategy calls or project engagements</li>
        </ul>
        <p className="mt-2">We do not intentionally collect <strong>special personal information</strong> (race, health, religion, biometric data).</p>
      </>
    ),
  },
  {
    heading: "How We Use Your Information",
    content: (
      <ul className="list-disc list-inside space-y-1.5">
        <li>To provide, administer, and improve our services</li>
        <li>To communicate with you regarding your enquiries, projects, or bookings</li>
        <li>To process payments and issue invoices</li>
        <li>To send service-related notifications and updates (with your consent)</li>
        <li>To send marketing communications where you have opted in</li>
        <li>To comply with legal and regulatory obligations</li>
        <li>To detect and prevent fraud or misuse of our services</li>
        <li>To analyse website usage and improve user experience</li>
        <li>For AI model training where explicit, separate consent has been obtained</li>
      </ul>
    ),
  },
  {
    heading: "AI & Automated Processing",
    content: (
      <>
        <p>Where automated decisions are made that have a <strong>significant effect on you</strong>, we will:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Inform you that automated processing is taking place</li>
          <li>Provide you the right to request human review of any such decision</li>
          <li>Not use your personal data to train third-party AI models without your explicit consent</li>
        </ul>
        <p className="mt-2">We comply with South Africa&apos;s National AI Policy Framework (August 2024) which emphasises ethical AI, transparency, and privacy protection.</p>
      </>
    ),
  },
  {
    heading: "Sharing of Personal Information",
    content: (
      <>
        <p>We do not sell your personal information. We may share it with:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Service providers:</strong> Cloud hosting, payment processors, email platforms — all bound by data processing agreements</li>
          <li><strong>Professional advisors:</strong> Lawyers, accountants, auditors under confidentiality obligations</li>
          <li><strong>Regulatory authorities:</strong> Where required by law or court order</li>
        </ul>
        <p className="mt-2"><strong>Cross-border transfers:</strong> Where personal information is transferred outside South Africa, we ensure adequate protection as required by Section 72 of POPIA.</p>
      </>
    ),
  },
  {
    heading: "Data Retention",
    content: (
      <p>We retain personal information only as long as necessary. Client engagement data is retained for a minimum of 5 years in compliance with the Companies Act 71 of 2008 and the Tax Administration Act 28 of 2011. Marketing data is retained until you withdraw consent. After the retention period, data is securely deleted or anonymised.</p>
    ),
  },
  {
    heading: "Your Rights as a Data Subject",
    content: (
      <>
        <p>Under POPIA, you have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>Access</strong> — Request a copy of the personal information we hold about you</li>
          <li><strong>Correction</strong> — Request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion</strong> — Request deletion of your personal information (subject to legal retention obligations)</li>
          <li><strong>Objection</strong> — Object to processing for direct marketing at any time</li>
          <li><strong>Withdraw consent</strong> — Where processing is based on consent, withdraw it at any time</li>
          <li><strong>Complain</strong> — Lodge a complaint with the Information Regulator of South Africa at <strong>inforegulator.org.za</strong></li>
        </ul>
        <p className="mt-2">To exercise any of these rights, email us at <strong>privacy@deluxify.co.za</strong>. We will respond within 30 days as required by POPIA.</p>
      </>
    ),
  },
  {
    heading: "Security",
    content: (
      <p>We implement appropriate technical and organisational security measures including encrypted data transmission (TLS/HTTPS), access controls, regular security assessments, and staff training. In the event of a data breach that poses a risk to you, we will notify you and the Information Regulator as required by Section 22 of POPIA.</p>
    ),
  },
  {
    heading: "Cookies",
    content: (
      <p>Our website uses cookies to improve your experience. For full details, please refer to our <a href="/cookies" className="underline">Cookie Policy</a>.</p>
    ),
  },
  {
    heading: "Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy from time to time. The most current version will always be published on this page with the effective date. Continued use of our services after any update constitutes acceptance of the revised policy.</p>
    ),
  },
];

export function PrivacyContent() {
  return (
    <LegalPage
      badge="Legal"
      title="Privacy Policy"
      subtitle="We take your privacy seriously. This policy explains how Deluxify (Pty) Ltd collects, uses, and protects your personal information in full compliance with the Protection of Personal Information Act (POPIA) of South Africa."
      lastUpdated="1 April 2026"
      sections={sections}
    />
  );
}
