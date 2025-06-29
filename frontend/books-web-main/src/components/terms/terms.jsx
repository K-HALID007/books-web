// --- TermsAndConditions.jsx ---
"use client";

import { motion } from "framer-motion";

function TermsAndConditions() {
  return (
    <section className="bg-[#F4EDE4] px-6 md:px-16 py-20 text-[#5D4037]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">
          Terms & <span className="text-[#A47148]">Conditions</span>
        </h1>

        <p>
          Welcome to BookVault. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully. If you do not agree to these terms, you may not use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Use of Platform</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You must be at least 13 years old to create an account or use BookVault.</li>
          <li>You are responsible for maintaining the confidentiality of your account and password.</li>
          <li>You agree not to use the platform for any unlawful or prohibited activities.</li>
          <li>BookVault reserves the right to modify, suspend, or terminate access to the platform at any time.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">2. User-Generated Content</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>By uploading content (e.g., books, reviews), you grant BookVault a non-exclusive, royalty-free license to use and display it.</li>
          <li>You retain ownership of your content but are responsible for ensuring it does not infringe on copyrights or laws.</li>
          <li>We reserve the right to remove content that violates these terms or is deemed inappropriate.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Intellectual Property</h2>
        <p>
          All trademarks, logos, designs, and software used on BookVault are the property of their respective owners and protected under intellectual property laws. You may not reproduce or distribute any part of the service without written permission.
        </p>

        <h2 className="text-2xl font-semibold mt-8">4. Termination</h2>
        <p>
          We may suspend or terminate your access to BookVault at any time, without prior notice or liability, for conduct we believe violates these Terms or is harmful to other users or us.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Limitation of Liability</h2>
        <p>
          BookVault and its affiliates will not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. The service is provided "as-is" and "as-available" without warranties of any kind.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. Third-Party Links</h2>
        <p>
          Our platform may contain links to third-party websites or services. We do not control and are not responsible for their content, privacy policies, or practices.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. Changes to Terms</h2>
        <p>
          BookVault reserves the right to modify these Terms at any time. We will notify users of any material changes via email or platform notifications. Continued use of the platform after updates constitutes acceptance of the new Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Governing Law</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of India. Disputes arising under these terms will be resolved exclusively by the courts in Mumbai.
        </p>

        <h2 className="text-2xl font-semibold mt-8">9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          <a href="mailto:support@bookvault.com" className="text-[#A47148] underline ml-1">support@bookvault.com</a>.
        </p>

        <p className="text-sm text-center mt-10">Last updated: June 26, 2025</p>
      </motion.div>
    </section>
  );
}

export default TermsAndConditions;
