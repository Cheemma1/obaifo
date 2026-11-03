import { ContactLink, LegalPage } from "@/features/legal/legal-page";
import Link from "@/i18n/link";
import { Footer } from "@/shared/layout/footer";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <LegalPage title="Privacy Policy" intro="What Ọbaifo collects, why, and what you can do about it.">
        <h2>Who we are</h2>
        <p>
          Ọbaifo is a home for ifo, Igbo folktales, written down so others can read them. This policy explains how we handle personal
          information when you read, write or give on Ọbaifo. Questions go to <ContactLink />.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your name or pen name, email address and password when you create an account. Passwords are
            stored only as a one-way hash; we never see or keep the password itself.
          </li>
          <li>
            <strong>Profile:</strong> the bio you choose to add, and whether you joined as a reader or a storyteller.
          </li>
          <li>
            <strong>What you write:</strong> tales, chapters, covers you upload, and comments.
          </li>
          <li>
            <strong>Reading activity:</strong> the tales you like and where you stopped reading, so your shelf can keep your place. We also
            count how many times a tale is read.
          </li>
          <li>
            <strong>Donations:</strong> the name, email and amount you enter when you give. Card and bank details are entered on
            Paystack&apos;s checkout and never reach our servers.
          </li>
        </ul>
        <p>You can read every tale without an account, and we do not ask for your phone number, address or date of birth.</p>

        <h2>How we use it</h2>
        <ul>
          <li>To run your account, keep you signed in and keep your place in each tale.</li>
          <li>To show your name, bio, tales, likes and comments to other readers where you chose to share them.</li>
          <li>To process and confirm donations and keep basic financial records.</li>
          <li>To keep the site safe, prevent abuse and fix problems.</li>
        </ul>
        <p>We do not sell your information, show advertising, or use third-party tracking or analytics.</p>

        <h2>What is public</h2>
        <p>
          Your name or pen name appears next to anything you publish or comment on. If you are a storyteller, your name, bio and published
          tales appear on your storyteller page. Drafts stay private to you. Your email address is never shown to other people.
        </p>

        <h2>Cookies and storage</h2>
        <ul>
          <li>
            <strong>Session cookie:</strong> keeps you signed in for up to 30 days. It is essential and cannot be switched off while you are
            signed in.
          </li>
          <li>
            <strong>Language cookie:</strong> remembers whether you chose Igbo or English.
          </li>
          <li>
            <strong>Reader settings:</strong> your reading preferences are saved in your own browser and are not sent to us.
          </li>
        </ul>

        <h2>Who we share it with</h2>
        <ul>
          <li>
            <strong>Paystack</strong>, to take donations. Paystack receives your email, the amount and a reference, and handles payment
            under its own privacy policy.
          </li>
          <li>
            <strong>Our hosting providers</strong>, who store data on our behalf and may not use it for anything else.
          </li>
          <li>
            <strong>Authorities</strong>, only when the law requires it.
          </li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          We keep your account and what you write for as long as your account exists. When an account is deleted, its tales, comments,
          likes and reading progress are deleted with it. Donation records are kept as long as we need them for accounting and legal
          reasons, but are no longer linked to a deleted account.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          You can change your name and bio at any time on your{" "}
          <Link href="/account" className="link font-semibold">
            profile
          </Link>
          , and delete your own comments. You can also ask us for a copy of your information, ask us to correct it, or ask us to delete
          your account by writing to <ContactLink />. We handle personal data in line with the Nigeria Data Protection Act 2023 and will
          answer within 30 days. If you are unhappy with our answer, you may complain to the Nigeria Data Protection Commission.
        </p>

        <h2>Security</h2>
        <p>
          Passwords are hashed, the session cookie cannot be read by scripts on the page, and payments are handled by Paystack. No system is
          perfectly secure; if something goes wrong that affects you, we will tell you.
        </p>

        <h2>Children</h2>
        <p>
          Ifo are for everyone, and anyone can read without an account. To create an account you should be at least 13, or have a parent or
          guardian&apos;s permission.
        </p>

        <h2>Changes</h2>
        <p>
          If we change this policy we will update the date at the top, and for important changes we will let account holders know before
          they take effect.
        </p>
      </LegalPage>
      <Footer />
    </>
  );
}
