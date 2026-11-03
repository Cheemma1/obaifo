import { ContactLink, LegalPage } from "@/features/legal/legal-page";
import Link from "@/i18n/link";
import { Footer } from "@/shared/layout/footer";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <>
      <LegalPage title="Terms of Use" intro="The few rules that keep Ọbaifo a good home for ifo.">
        <h2>Agreeing to these terms</h2>
        <p>
          By using Ọbaifo you agree to these terms and to our{" "}
          <Link href="/privacy" className="link font-semibold">
            Privacy Policy
          </Link>
          . If you do not agree, please do not use the site.
        </p>

        <h2>What Ọbaifo is</h2>
        <p>
          Ọbaifo is a free home for ifo, Igbo folktales. Every tale is free to read, for everyone. An account lets you like, comment, keep
          your place and, as a storyteller, publish tales. Tales are written in Igbo; the interface is available in Igbo and English.
        </p>

        <h2>Your account</h2>
        <ul>
          <li>Give a real email address and keep your password to yourself. You are responsible for what happens under your account.</li>
          <li>You should be at least 13 years old, or have a parent or guardian&apos;s permission.</li>
          <li>Pen names are welcome, but do not pretend to be another person.</li>
        </ul>

        <h2>Tales you share</h2>
        <ul>
          <li>
            <strong>You keep your rights.</strong> Your telling of a tale, its wording and any cover you make stay yours.
          </li>
          <li>
            <strong>You let us show it.</strong> When you publish, you give Ọbaifo a free, worldwide, non-exclusive permission to host,
            display and share your tale and cover on the site and in links to it, for as long as it is published. Unpublishing or deleting
            a tale ends this, apart from copies others have already shared.
          </li>
          <li>
            <strong>Only share what you may share.</strong> Ifo belong to everyone, but a particular book, recording or translation may
            not. Write the tale in your own words, or share only what you have permission to share.
          </li>
          <li>
            <strong>Tales must be ifo, in Igbo.</strong> We may refuse to publish, or take down, anything that is not an Igbo folktale.
          </li>
        </ul>

        <h2>What is not allowed</h2>
        <ul>
          <li>Hate, harassment, threats, or content that sexualises children.</li>
          <li>Copying someone else&apos;s work without permission.</li>
          <li>Spam, advertising, scams or links to harmful software.</li>
          <li>Sharing other people&apos;s private information.</li>
          <li>Trying to break, overload or get around the security of the site.</li>
        </ul>
        <p>We may remove content or suspend accounts that break these rules. Storytellers may also remove comments on their own tales.</p>

        <h2>Donations</h2>
        <p>
          Donations are voluntary, one-off gifts that help pay for hosting and building Ọbaifo. They do not buy any goods, services or
          special access. Payments are processed by Paystack. Because donations are gifts they are generally not refundable, but if you
          were charged by mistake, write to <ContactLink /> and we will put it right.
        </p>

        <h2>Reporting a problem</h2>
        <p>
          If you think something on Ọbaifo copies your work or breaks these rules, write to <ContactLink /> with a link to it and we will
          look into it promptly.
        </p>

        <h2>No guarantees</h2>
        <p>
          Ọbaifo is provided as it is. We work to keep it running and your tales safe, but we cannot promise it will always be available
          or free of errors. Keep your own copy of anything you cannot afford to lose. As far as the law allows, we are not liable for
          indirect losses from using the site.
        </p>

        <h2>Ending</h2>
        <p>
          You can stop using Ọbaifo at any time and ask us to delete your account. We may close accounts that seriously or repeatedly
          break these terms.
        </p>

        <h2>Changes and law</h2>
        <p>
          We may update these terms; the date at the top shows when. For important changes we will let account holders know before they
          take effect. These terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </LegalPage>
      <Footer />
    </>
  );
}
