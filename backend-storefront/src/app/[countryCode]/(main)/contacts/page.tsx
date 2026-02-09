import type { Metadata } from "next"
import { CONTACTS } from "@/lib/data/contacts-config"
import { ContactsClient } from "@modules/common/components/contacts-client"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || ""

export async function generateMetadata({
  params,
}: {
  params: { countryCode: string }
}): Promise<Metadata> {
  const cc = params.countryCode

  return {
    title: `Контакти — ${CONTACTS.companyName}`,
    description:
      "Телефони, електронна пошта, месенджери та графік роботи. Зв'яжіться з нами зручним способом.",
    alternates: {
      canonical: `/${cc}/contacts`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: CONTACTS.companyName,
    description: CONTACTS.companyDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACTS.address,
      addressLocality: "Chernihiv",
      addressCountry: "UA",
    },
    telephone: CONTACTS.phones.map((p) => p.value),
    email: CONTACTS.emails.map((e) => e.value),
    sameAs: CONTACTS.socials.map((s) => s.href),
    ...(SITE_URL ? { url: SITE_URL } : {}),
  }

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint: JSON-LD injection
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function ContactsPage() {
  return (
    <>
      <OrganizationJsonLd />
      <ContactsClient />
    </>
  )
}
