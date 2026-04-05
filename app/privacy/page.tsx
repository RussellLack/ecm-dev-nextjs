import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ECM.DEV collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/70 font-barlow text-lg max-w-2xl mx-auto">
            How we collect, use, and protect your information.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Policy content */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-gray-500 font-barlow text-sm mb-12">
            Last updated: April 2026
          </p>

          <div className="space-y-10 text-ecm-gray font-barlow text-[15px] leading-relaxed">
            {/* 1 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                1. Who we are
              </h2>
              <p>
                ECM.DEV is operated by Russell Lack. When this policy refers to
                &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;, it
                means ECM.DEV and its operator. Our website address is{" "}
                <a
                  href="https://ecm.dev"
                  className="text-ecm-green underline hover:text-ecm-green-dark transition-colors"
                >
                  https://ecm.dev
                </a>
                .
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                2. Information we collect
              </h2>
              <p className="mb-3">
                We collect information in the following ways:
              </p>

              <h3 className="font-semibold text-ecm-green/80 mt-4 mb-2">
                2.1 Contact form
              </h3>
              <p>
                When you submit our contact form, we collect your name, email
                address, and the content of your message. This information is
                used solely to respond to your enquiry.
              </p>

              <h3 className="font-semibold text-ecm-green/80 mt-4 mb-2">
                2.2 Assessment tools
              </h3>
              <p>
                When you complete an assessment on our site, we collect the
                responses you provide. Assessment data is used to generate your
                results and, where you provide contact details, to follow up
                with relevant recommendations. We do not share your individual
                assessment responses with third parties.
              </p>

              <h3 className="font-semibold text-ecm-green/80 mt-4 mb-2">
                2.3 Cookies and analytics
              </h3>
              <p>
                We use cookies and similar technologies to understand how
                visitors use our site. This includes pages visited, time spent,
                and general browsing behaviour. We only set analytics cookies
                after you give your consent via our cookie banner. If you
                decline, no analytics cookies are placed.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                3. How we use your information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Respond to contact form enquiries</li>
                <li>
                  Generate and deliver assessment results
                </li>
                <li>
                  Understand how our site is used so we can improve it
                </li>
                <li>
                  Communicate relevant content or services, only where you have
                  opted in
                </li>
              </ul>
              <p className="mt-3">
                We do not sell, rent, or trade your personal information to third
                parties.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                4. Cookies
              </h2>
              <p className="mb-3">Our site uses the following types of cookies:</p>

              <h3 className="font-semibold text-ecm-green/80 mt-4 mb-2">
                Essential cookies
              </h3>
              <p>
                These are necessary for the site to function properly, such as
                remembering your cookie consent preference. They cannot be
                disabled.
              </p>

              <h3 className="font-semibold text-ecm-green/80 mt-4 mb-2">
                Analytics cookies
              </h3>
              <p>
                These help us understand how visitors interact with our site.
                They are only set after you accept cookies via our consent
                banner. You can withdraw your consent at any time by clearing
                your browser cookies and revisiting the site.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                5. Data storage and security
              </h2>
              <p>
                Your data is processed and stored securely. Our site is hosted
                on Netlify and our content is managed via Sanity. Form
                submissions are processed via Resend. We take reasonable
                technical and organisational measures to protect your information
                against unauthorised access, alteration, or loss.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                6. Third-party services
              </h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <span className="font-semibold">Netlify</span> &mdash;
                  website hosting and deployment
                </li>
                <li>
                  <span className="font-semibold">Sanity</span> &mdash; content
                  management
                </li>
                <li>
                  <span className="font-semibold">Resend</span> &mdash; email
                  delivery for contact form submissions
                </li>
              </ul>
              <p className="mt-3">
                Each of these services has its own privacy policy governing how
                they handle data. We only share the minimum information
                necessary for each service to function.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                7. Your rights
              </h2>
              <p>Under applicable data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us using the
                details below.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                8. Data retention
              </h2>
              <p>
                We retain contact form submissions and assessment data for as
                long as necessary to fulfil the purpose for which it was
                collected, or as required by law. Analytics data is retained in
                aggregate form and does not identify individual users.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                9. Changes to this policy
              </h2>
              <p>
                We may update this policy from time to time. Any changes will be
                posted on this page with an updated revision date. We encourage
                you to review this page periodically.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="text-ecm-green font-bold text-xl mb-3">
                10. Contact
              </h2>
              <p>
                If you have any questions about this privacy policy or how we
                handle your data, please contact us at{" "}
                <a
                  href="/contact"
                  className="text-ecm-green underline hover:text-ecm-green-dark transition-colors"
                >
                  ecm.dev/contact
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
