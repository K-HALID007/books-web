// --- PrivacyPolicy.jsx ---
"use client";

import { motion } from "framer-motion";

function PrivacyPolicy() {
  return (
    <section className="bg-[#F4EDE4] px-6 md:px-16 py-20 text-[#5D4037]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">
          Privacy <span className="text-[#A47148]">Policy</span>
        </h1>

        <p>
          At BookVault, we respect your privacy and are committed to protecting the personal
          information you share with us. This policy outlines how we collect, use, and safeguard
          your data, and ensures transparency on how your information is handled.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Personal Information:</strong> Name, email address, account credentials, and user preferences.</li>
          <li><strong>Book Data:</strong> Book titles, authors, genres, reviews, ratings, and reading history.</li>
          <li><strong>Device Info:</strong> Device identifiers, operating system, browser type, and session activity.</li>
          <li><strong>Usage Patterns:</strong> Interactions with the platform, features accessed, and user behavior data.</li>
          <li><strong>Location Info:</strong> Approximate location to improve recommendations and regional settings.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To provide access to personalized features and your digital library.</li>
          <li>To recommend books, authors, or genres tailored to your preferences.</li>
          <li>To manage your account, preferences, and reading history.</li>
          <li>To analyze performance, detect issues, and improve functionality.</li>
          <li>To send optional updates, newsletters, and platform announcements.</li>
          <li>To comply with applicable laws, enforce our terms, and protect our rights.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Sharing Your Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>We do not sell, rent, or trade your personal information.</li>
          <li>We may share limited information with trusted partners to host, operate, or improve our services.</li>
          <li>We may disclose information if required by law, regulation, or legal process.</li>
          <li>In cases of a merger, acquisition, or asset sale, your data may be transferred as part of the transaction.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">4. Cookies and Tracking Technologies</h2>
        <p>
          Cookies are used to improve site performance, remember preferences, and collect analytics. You can adjust cookie settings or disable them in your browser. We also use technologies like local storage and pixel tags.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Your Rights and Choices</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You can review, update, or delete your profile and associated data.</li>
          <li>You can export your reading history and account data anytime.</li>
          <li>You may opt out of newsletters or marketing communications from your profile settings.</li>
          <li>Contact us for privacy-related requests or questions regarding your data.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">6. Data Security</h2>
        <p>
          We implement strong encryption, firewalls, secure access protocols, and data minimization techniques. Regular audits and vulnerability assessments help protect your information.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. Third-Party Services</h2>
        <p>
          We may include links to or integrations with third-party services (e.g., payment providers, analytics tools). Their use of your data is governed by their privacy policies.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Children's Privacy</h2>
        <p>
          BookVault is not designed for children under 13. We do not knowingly collect data from minors. If informed of such data, we promptly delete it.
        </p>

        <h2 className="text-2xl font-semibold mt-8">9. International Users</h2>
        <p>
          Your data may be stored or processed in countries outside of your own, including jurisdictions with different data protection laws. We apply appropriate safeguards to ensure compliance.
        </p>

        <h2 className="text-2xl font-semibold mt-8">10. Data Retention Policy</h2>
        <p>
          Your data is retained for as long as your account is active or as necessary for service provision. Upon account deletion or inactivity, we securely erase your personal data, unless required to retain it by law.
        </p>

        <h2 className="text-2xl font-semibold mt-8">11. Policy Updates</h2>
        <p>
          We may update this Privacy Policy periodically. Major updates will be communicated through email or in-app notifications. The effective date will be revised accordingly.
        </p>

        <h2 className="text-2xl font-semibold mt-8">12. Contacting Us</h2>
        <p>
          If you have questions, requests, or concerns regarding this Privacy Policy or your personal data, please contact our support team at
          <a href="mailto:privacy@bookvault.com" className="text-[#A47148] underline ml-1">privacy@bookvault.com</a>.
        </p>
      </motion.div>
    </section>
  );
}

export default PrivacyPolicy;
