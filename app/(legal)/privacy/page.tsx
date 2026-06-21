import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for MyPaperPop by Good Creator LLC.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Effective Date: February 26, 2026</p>
      <p>
        Good Creator LLC (&quot;MyPaperPop,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the MyPaperPop
        website and service at <strong>mypaperpop.com</strong>. This Privacy Policy explains how we collect, use, share,
        and protect your personal information when you use our service.
      </p>
      <p>
        <strong>Data Controller:</strong> Good Creator LLC, 1401 21st ST #15039, Sacramento, CA 95811, USA.
        Email: <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a>
      </p>
      <p>
        By using MyPaperPop, you agree to the collection and use of information in accordance with this policy. If you
        are in the European Economic Area (EEA), United Kingdom (UK), Canada, or India, please see the region-specific
        sections below for additional rights and disclosures.
      </p>

      <hr />

      <h2>1. Information We Collect</h2>

      <h3>Account Information (via Google OAuth)</h3>
      <p>When you sign in with Google, we receive and store:</p>
      <ul>
        <li>Your name</li>
        <li>Email address</li>
        <li>Profile picture URL</li>
        <li>Google account ID</li>
      </ul>

      <h3>Content You Provide</h3>
      <ul>
        <li><strong>Text prompts</strong> — descriptions you type to generate coloring pages</li>
        <li><strong>Chat messages</strong> — conversations with our AI assistant to refine your prompts</li>
        <li><strong>Generated images</strong> — the coloring page sketches created from your prompts</li>
        <li><strong>Uploaded photos</strong> — if you use the &quot;Color &amp; Show&quot; feature, photos you upload of your colored-in pages</li>
      </ul>

      <h3>Color &amp; Show (Uploaded Photos)</h3>
      <p>
        If you use the &quot;Color &amp; Show&quot; feature, you can upload a photo of a colored-in page. When you upload a photo:
      </p>
      <ul>
        <li>Your photo is stored in our cloud storage (Railway S3-compatible storage in the USA)</li>
        <li>We process the photo automatically: crop white borders, enhance colors and contrast, resize to a standard resolution</li>
        <li>We generate a side-by-side &quot;before &amp; after&quot; composite image combining the original sketch with your colored version</li>
      </ul>
      <p>
        Uploaded photos and composites persist even if you delete the associated conversation &mdash; they are only permanently deleted when you delete your account (or by removing the colored photo from the conversation).
        No AI models are trained on your uploaded photos.
        We recommend ensuring uploaded photos do not contain faces, personal addresses, or other identifying information.
      </p>

      <h3>Payment Information</h3>
      <p>
        If you purchase a coloring page pack, payment is processed by <strong>Stripe</strong>. We store your Stripe
        customer ID and purchase history. We do <strong>not</strong> store your credit card number, bank account,
        or other payment credentials — Stripe handles this directly.
      </p>

      <h3>Automatically Collected Information</h3>
      <ul>
        <li>IP address</li>
        <li>Browser type and device information</li>
        <li>Activity logs (sign-in events, account actions)</li>
        <li>Pages visited and interactions (via analytics, if you consent — see Section 4)</li>
      </ul>

      <h2>2. Lawful Basis for Processing (EEA/UK Users)</h2>
      <p>If you are located in the EEA or UK, we process your personal data under the following legal bases:</p>
      <table>
        <thead>
          <tr>
            <th>Processing Activity</th>
            <th>Lawful Basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account creation and authentication</td>
            <td>Performance of contract (Terms of Service)</td>
          </tr>
          <tr>
            <td>Generating coloring pages from prompts</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Processing payments</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Enforcing usage quotas</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Processing uploaded photos (Color &amp; Show)</td>
            <td>Performance of contract</td>
          </tr>
          <tr>
            <td>Content safety filtering</td>
            <td>Legitimate interest (child safety)</td>
          </tr>
          <tr>
            <td>Security and abuse prevention</td>
            <td>Legitimate interest</td>
          </tr>
          <tr>
            <td>Analytics (PostHog)</td>
            <td>Consent (opt-in via cookie banner)</td>
          </tr>
          <tr>
            <td>Responding to support requests</td>
            <td>Legitimate interest</td>
          </tr>
        </tbody>
      </table>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li><strong>Provide the service</strong> — generate coloring pages from your prompts, store your conversations and images, process uploaded photos (crop, enhance, generate before/after composites)</li>
        <li><strong>Process payments</strong> — handle coloring page pack purchases through Stripe</li>
        <li><strong>Enforce quotas</strong> — track usage to apply free and paid tier limits</li>
        <li><strong>Improve security</strong> — detect and prevent unauthorized access or abuse</li>
        <li><strong>Analytics</strong> — understand how the service is used to improve it (only with your consent where required by law)</li>
        <li><strong>Communicate with you</strong> — respond to support requests or account-related notices</li>
      </ul>

      <h2>4. Cookies and Tracking Technologies</h2>

      <h3>Essential Cookies (No Consent Required)</h3>
      <p>We use the following cookies that are strictly necessary for the service to function:</p>
      <ul>
        <li><strong>session</strong> — JWT authentication token (httpOnly, secure, 24-hour expiry)</li>
        <li><strong>oauth_state</strong> — CSRF protection during Google sign-in (httpOnly, 10-minute expiry)</li>
        <li><strong>pending_redirect / pending_priceId</strong> — preserves checkout intent during sign-in (httpOnly, 10-minute expiry)</li>
        <li><strong>pending_referral</strong> — captures referral code from invite links (httpOnly, 1-hour expiry)</li>
        <li><strong>cookie_consent</strong> — stores your cookie consent preferences (1-year expiry)</li>
      </ul>

      <h3>Analytics Cookies (Consent Required)</h3>
      <p>
        With your consent, we use <strong>PostHog</strong>, a product analytics platform, to understand how people
        use MyPaperPop so we can improve the service. PostHog may set the following cookies:
      </p>
      <ul>
        <li><strong>ph_*</strong> — anonymous session and user identification for product analytics</li>
      </ul>
      <p>
        PostHog analytics are <strong>only loaded after you give consent</strong> via our cookie banner. You can
        change your consent preferences at any time by clicking &quot;Cookie Settings&quot; in the footer of any page.
        We do <strong>not</strong> use advertising cookies or share analytics data with advertisers.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>We share data with the following third-party services as necessary to operate MyPaperPop:</p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Data Shared</th>
            <th>Purpose</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Google OAuth</td>
            <td>Authentication tokens</td>
            <td>Sign-in and account creation</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>xAI (Grok Imagine API)</td>
            <td>Text prompts, reference images</td>
            <td>AI image generation</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>Google Gemini API</td>
            <td>Chat conversation history</td>
            <td>AI chat refinement and content safety classification</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>Railway</td>
            <td>Generated images, uploaded photos, composite images</td>
            <td>Image storage</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Email, customer ID, payment info</td>
            <td>Payment processing</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>PostHog (with consent)</td>
            <td>Page views, anonymized usage events</td>
            <td>Product analytics</td>
            <td>USA</td>
          </tr>
          <tr>
            <td>Cloudflare</td>
            <td>IP address (for geo-detection)</td>
            <td>CDN, DNS proxy, localized pricing</td>
            <td>USA / Global edge</td>
          </tr>
        </tbody>
      </table>

      <p>
        We do <strong>not</strong> sell your personal information to third parties. We do not share data with
        advertising networks or data brokers.
      </p>

      <h2>6. International Data Transfers</h2>
      <p>
        MyPaperPop is operated from the United States. If you are accessing the service from outside the United States —
        including from the EEA, UK, Canada, or India — your personal data will be transferred to and processed in the
        United States, where our servers and third-party service providers are located.
      </p>
      <p>
        For EEA and UK users, these transfers are protected by Standard Contractual Clauses (SCCs) approved by the
        European Commission, or by other appropriate safeguards as required under the GDPR. By using the service, you
        acknowledge and consent to the transfer of your data to the United States.
      </p>

      <h2>7. Data Retention</h2>
      <p>We retain your data for the following periods:</p>
      <table>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Retention Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account information (name, email)</td>
            <td>Until you delete your account</td>
          </tr>
          <tr>
            <td>Conversations and messages</td>
            <td>Until you delete your account (or delete individual conversations)</td>
          </tr>
          <tr>
            <td>Generated images</td>
            <td>Until you delete your account (or delete individual conversations)</td>
          </tr>
          <tr>
            <td>Uploaded photos and composites (Color &amp; Show)</td>
            <td>Until you delete your account (persists through conversation deletion)</td>
          </tr>
          <tr>
            <td>Purchase history</td>
            <td>7 years after purchase (for tax and legal compliance)</td>
          </tr>
          <tr>
            <td>Activity logs</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Analytics data (PostHog)</td>
            <td>Retained by PostHog per their retention policy; anonymized after 90 days</td>
          </tr>
        </tbody>
      </table>
      <p>
        When you delete your account, all conversations, messages, generated images, and uploaded photos (including
        composites) are permanently deleted from our database and storage. Your user record is removed.
      </p>

      <h2>8. Your Privacy Rights</h2>

      <h3>8a. All Users</h3>
      <p>Regardless of your location, you can:</p>
      <ul>
        <li>Delete your account and all associated data from the Account settings page</li>
        <li>Delete individual conversations and their generated images</li>
        <li>Change your cookie consent preferences at any time</li>
        <li>Contact us to request information about the data we hold about you</li>
      </ul>

      <h3>8b. California Residents (CCPA/CPRA)</h3>
      <p>Under the California Consumer Privacy Act and California Privacy Rights Act, you have the right to:</p>
      <ul>
        <li><strong>Right to Know</strong> — Request what personal information we collect, use, and disclose about you, including the categories of personal information, the sources, the business purposes, and the categories of third parties with whom we share it.</li>
        <li><strong>Right to Delete</strong> — Request deletion of your personal information. You can delete your account from the Account settings page, which removes all your data.</li>
        <li><strong>Right to Correct</strong> — Request correction of inaccurate personal information.</li>
        <li><strong>Right to Opt-Out of Sale/Sharing</strong> — We do not sell or share your personal information for cross-context behavioral advertising.</li>
        <li><strong>Right to Limit Use of Sensitive PI</strong> — We do not use sensitive personal information for purposes beyond what is necessary to provide the service.</li>
        <li><strong>Right to Non-Discrimination</strong> — We will not discriminate against you for exercising your privacy rights.</li>
      </ul>
      <p>
        <strong>Categories of Personal Information Collected</strong> (as defined by CCPA): Identifiers (name, email, IP address, Google ID);
        Commercial information (purchase history); Internet or electronic network activity (browsing history, interactions);
        Inferences drawn from the above.
      </p>
      <p>
        <strong>How to Exercise Your Rights:</strong> Email us at{' '}
        <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a> with the subject line &quot;CCPA Request.&quot;
        We will verify your identity by matching the email address on your request with the email address associated
        with your account. You may also designate an authorized agent to submit a request on your behalf by providing
        written authorization.
      </p>
      <p>We will respond to verifiable requests within 45 days.</p>

      <h3>8c. European Economic Area and United Kingdom (GDPR / UK GDPR)</h3>
      <p>If you are in the EEA or UK, you have the following rights under the General Data Protection Regulation:</p>
      <ul>
        <li><strong>Right of Access</strong> (Art. 15) — Request a copy of your personal data.</li>
        <li><strong>Right to Rectification</strong> (Art. 16) — Request correction of inaccurate data.</li>
        <li><strong>Right to Erasure</strong> (Art. 17) — Request deletion of your personal data. You can do this from the Account settings page.</li>
        <li><strong>Right to Restrict Processing</strong> (Art. 18) — Request that we limit the processing of your data.</li>
        <li><strong>Right to Data Portability</strong> (Art. 20) — Request a machine-readable copy of the data you provided to us.</li>
        <li><strong>Right to Object</strong> (Art. 21) — Object to processing based on legitimate interest.</li>
        <li><strong>Right to Withdraw Consent</strong> — Where processing is based on consent (e.g., analytics), you may withdraw consent at any time via the cookie settings.</li>
        <li><strong>Right to Lodge a Complaint</strong> (Art. 77) — You have the right to lodge a complaint with your local data protection supervisory authority.</li>
      </ul>
      <p>
        To exercise these rights, email us at{' '}
        <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a> with the subject line &quot;GDPR Request.&quot;
        We will respond within 30 days.
      </p>

      <h3>8d. Canada (PIPEDA and Quebec Law 25)</h3>
      <p>If you are in Canada, you have the following rights under the Personal Information Protection and Electronic Documents Act (PIPEDA) and, for Quebec residents, Quebec&apos;s Law 25:</p>
      <ul>
        <li><strong>Right to Access</strong> — Request access to your personal information held by us.</li>
        <li><strong>Right to Correction</strong> — Request correction of inaccurate or incomplete information.</li>
        <li><strong>Right to Withdraw Consent</strong> — Withdraw consent for the collection, use, or disclosure of your personal information, subject to legal or contractual restrictions.</li>
        <li><strong>Right to File a Complaint</strong> — File a complaint with the Office of the Privacy Commissioner of Canada (OPC) or, for Quebec residents, the Commission d&apos;acc&egrave;s &agrave; l&apos;information du Qu&eacute;bec (CAI).</li>
      </ul>
      <p>
        Your personal data is transferred to and stored in the United States. By using our service, you consent to this transfer.
        To exercise your rights, email us at{' '}
        <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a> with the subject line &quot;PIPEDA Request.&quot;
      </p>

      <h3>8e. India (Digital Personal Data Protection Act, 2023)</h3>
      <p>If you are in India, you have the following rights under the Digital Personal Data Protection Act, 2023 (DPDPA):</p>
      <ul>
        <li><strong>Right to Access</strong> — Request a summary of your personal data and processing activities.</li>
        <li><strong>Right to Correction and Erasure</strong> — Request correction of inaccurate data or deletion of your data.</li>
        <li><strong>Right to Grievance Redressal</strong> — You may raise a grievance with us. If you are not satisfied with our response, you may escalate to the Data Protection Board of India.</li>
        <li><strong>Right to Nominate</strong> — You may nominate another person to exercise your rights in the event of your death or incapacity.</li>
      </ul>
      <p>
        <strong>Data Fiduciary:</strong> Good Creator LLC, 1401 21st ST #15039, Sacramento, CA 95811, USA.
      </p>
      <p>
        Your personal data is transferred to and processed in the United States. By using our service, you consent to this
        cross-border transfer of your data. To exercise your rights or file a grievance, email us at{' '}
        <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a> with the subject line &quot;DPDPA Request.&quot;
      </p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        MyPaperPop is a tool designed for <strong>parents and teachers</strong> to create coloring pages for children.
        The service is not directed at, and is not intended to be used by, children under the age of 13 (or under 16
        in the EEA/UK, or under 18 in India).
      </p>
      <p>
        We do not knowingly collect personal information from children under the applicable minimum age in their
        jurisdiction. If you believe a child has provided us with personal information, please contact us at{' '}
        <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a> and we will promptly delete that
        information.
      </p>

      <h2>10. Data Security</h2>
      <p>
        We implement reasonable security measures to protect your data, including:
      </p>
      <ul>
        <li>Encrypted JWT sessions with httpOnly, secure cookies</li>
        <li>CSRF protection on authentication flows</li>
        <li>Time-limited signed URLs for image access</li>
        <li>Server-side ownership checks on all data operations</li>
        <li>HTTPS encryption for all data in transit</li>
      </ul>
      <p>
        No method of transmission or storage is 100% secure. While we strive to protect your information,
        we cannot guarantee absolute security.
      </p>

      <h2>11. Data Breach Notification</h2>
      <p>
        In the event of a data breach that poses a risk to your rights and freedoms, we will notify affected users
        and the relevant supervisory authorities as required by applicable law. For EEA/UK users, we will notify the
        relevant data protection authority within 72 hours of becoming aware of a qualifying breach.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by posting the
        updated policy on this page and updating the &quot;Effective Date&quot; above. For material changes that affect
        how we process your data, we will provide prominent notice (such as a banner on the site or an email notification)
        before the changes take effect. Your continued use of the service after changes are posted constitutes
        acceptance of the updated policy.
      </p>

      <h2>13. Contact Us</h2>
      <p>If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us at:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a></li>
        <li><strong>Company:</strong> Good Creator LLC</li>
        <li><strong>Address:</strong> 1401 21st ST #15039, Sacramento, CA 95811, USA</li>
      </ul>
    </article>
  );
}
