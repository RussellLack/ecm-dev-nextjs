import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact | ECM.DEV",
  description:
    "Get in touch with ECM.DEV — content infrastructure, strategy, and operations for the AI enterprise.",
};

export default function ContactPage() {
  return (
    <>
      {/* ─── HERO BANNER ─── */}
      <section className="bg-ecm-green pt-12 sm:pt-16 lg:pt-24 pb-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-6xl mb-4">
            CONTACT US
          </h1>
          <p className="text-white/80 font-barlow text-lg lg:text-xl max-w-2xl mx-auto">
            Ready to turn content into infrastructure? Let&apos;s talk.
          </p>
        </div>
      </section>

      {/* ─── CONTACT FORM (reuses the homepage component) ─── */}
      <ContactForm />
    </>
  );
}
