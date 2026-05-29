import React from 'react';
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoCz from '../../assets/logos/hk_cr_logo_cz-logo_bile.png';
import logoEn from '../../assets/logos/hk_cr_logo_aj-logo_white.png';

type FooterCopy = {
  join: string;
  about: string;
  activities: string;
  communities: string;
  map: string;
  career: string;
  portals: string;
  follow: string;
  media: string;
  dataBox: string;
  memberLinePrefix: string;
  rights: string;
  consent: string;
  privacy: string;
};

const footerCopy: Record<'cs' | 'en' | 'de', FooterCopy> = {
  cs: {
    join: 'Stát se členem',
    about: 'Kdo jsme',
    activities: 'Co děláme',
    communities: 'Seznam společenstev',
    map: 'Mapa komor',
    career: 'Kariéra',
    portals: 'Naše portály',
    follow: 'Sledujte nás',
    media: 'Kontakt pro novináře',
    dataBox: 'Datová schránka',
    memberLinePrefix: 'Jsme členem',
    rights: '© Všechna práva vyhrazena, Hospodářská komora ČR',
    consent: 'Spravovat souhlas',
    privacy: 'Ochrana osobních údajů GDPR',
  },
  en: {
    join: 'Become a member',
    about: 'Who we are',
    activities: 'What we do',
    communities: 'Community list',
    map: 'Chamber map',
    career: 'Career',
    portals: 'Our portals',
    follow: 'Follow us',
    media: 'Press contact',
    dataBox: 'Data box',
    memberLinePrefix: 'We are members of',
    rights: '© All rights reserved, Chamber of Commerce of the Czech Republic',
    consent: 'Manage consent',
    privacy: 'GDPR privacy policy',
  },
  de: {
    join: 'Mitglied werden',
    about: 'Wer wir sind',
    activities: 'Was wir tun',
    communities: 'Liste der Gemeinschaften',
    map: 'Kammerkarte',
    career: 'Karriere',
    portals: 'Unsere Portale',
    follow: 'Folgen Sie uns',
    media: 'Pressekontakt',
    dataBox: 'Datenbox',
    memberLinePrefix: 'Wir sind Mitglied von',
    rights: '© Alle Rechte vorbehalten, Wirtschaftskammer der Tschechischen Republik',
    consent: 'Einwilligung verwalten',
    privacy: 'Datenschutz GDPR',
  },
};

const quickLinks = {
  join: 'https://clenstvi.komora.cz/',
  about: 'https://www.komora.cz/o-nas/',
  activities: 'https://www.komora.cz/o-nas/#co-delame',
  communities: 'https://www.komora.cz/o-nas/oborova-cast/',
  map: 'https://www.komora.cz/regionalni-cast/',
  career: 'https://www.komora.cz/kariera/',
  media: 'https://www.komora.cz/pro-media/',
  consent: 'https://www.komora.cz/ochrana-osobnich-udaju/#gdpr-modal',
  privacy: 'https://www.komora.cz/ochrana-osobnich-udaju/',
  officeMail: 'mailto:office@komora.cz',
  phone: 'tel:+420266721300',
  dataBox: 'https://www.mojedatovaschranka.cz/',
  icc: 'https://www.icc-cr.cz/',
  eurochambers: 'https://www.eurochambres.eu/',
  cds: 'https://www.czechdigitalsolutions.cz/',
  ecert: 'https://e-certifikaty.cz/',
  facebook: 'https://www.facebook.com/komora.cz/',
  x: 'https://www.facebook.com/komora.cz/',
  youtube: 'https://www.youtube.com/channel/UCt0D9EbQfm_KZKX1FXO8duw',
  linkedin: 'https://www.linkedin.com/company/6417616',
  instagram: 'https://www.instagram.com/hospodarskakomoracr/',
};

const portalAssets = {
  cdsLogo: 'https://www.komora.cz/app/uploads/2024/06/logo_white_Ne0apMm-3.png',
  ecertLogo: 'https://www.komora.cz/app/uploads/2024/03/e-certifikaty-logo.png',
};

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}

function DataBoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.25h14.5a1.5 1.5 0 0 1 1.5 1.5v7a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2v-7a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 8.25V7a5 5 0 0 1 10 0v1.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.75 11.25h12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.25 14.25h7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.5 16.75h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 4.25a2.75 2.75 0 0 1 2.75 2.75v1.25h-5.5V7A2.75 2.75 0 0 1 12 4.25Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M10.75 5.75h2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 4.7v2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 12.6 9.8 13.8l1.2 1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13 12.6 1.2 1.2-1.2 1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.35 12.2 11.65 15.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PortalCard({
  href,
  title,
  accent,
  accentImageSrc,
}: {
  href: string;
  title: string;
  accent: React.ReactNode;
  accentImageSrc?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-[72px] items-center gap-4 bg-[#232d42] px-5 py-4 transition-colors hover:bg-[#2a3650]"
    >
      <div className="flex h-10 w-auto shrink-0 items-center justify-center text-[#f8d574]">
        {accentImageSrc ? (
          <img src={accentImageSrc} alt="" className="h-6 w-auto object-contain" />
        ) : (
          accent
        )}
      </div>
      <div>
        <div className="text-base font-semibold text-white md:text-lg">
          {title}
        </div>
      </div>
    </a>
  );
}

export default function Footer2() {
  const { i18n } = useTranslation('common');
  const locale = (i18n.language?.slice(0, 2) ?? 'cs') as 'cs' | 'en' | 'de';
  const copy = footerCopy[locale] ?? footerCopy.cs;
  const logoSrc = locale === 'cs' ? logoCz : logoEn;

  return (
    <footer className="relative overflow-hidden bg-[#121a28] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,157,0.34),_transparent_36%),linear-gradient(135deg,_#141c2a_0%,_#101722_58%,_#17243a_100%)]" />
      <div className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10 lg:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <a href="https://www.komora.cz/" target="_blank" rel="noreferrer" className="mx-auto inline-flex w-fit transition-opacity hover:opacity-90 lg:mx-0">
            <img
              src={logoSrc}
              alt="Hospodářská komora České republiky"
              className="h-auto w-[220px] md:w-[260px]"
            />
          </a>
          <a
            href={quickLinks.join}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3 text-base font-bold text-[#182235] transition-colors hover:bg-[#c43a32] hover:text-white md:text-lg"
          >
            {copy.join}
          </a>
        </div>

        <div className="mt-10 border-t border-white/14" />

        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-9 text-center md:gap-x-14">
          <a href={quickLinks.about} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white transition-colors hover:text-[#4ea0ff]">
            {copy.about}
          </a>
          <a href={quickLinks.activities} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white transition-colors hover:text-[#4ea0ff]">
            {copy.activities}
          </a>
          <a href={quickLinks.communities} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white transition-colors hover:text-[#4ea0ff]">
            {copy.communities}
          </a>
          <a href={quickLinks.map} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white transition-colors hover:text-[#4ea0ff]">
            {copy.map}
          </a>
          <a href={quickLinks.career} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white transition-colors hover:text-[#4ea0ff]">
            {copy.career}
          </a>
        </nav>

        <div className="border-t border-white/14" />

        <div className="grid gap-12 py-10 lg:grid-cols-[1.15fr_1.05fr_0.95fr]">
          <div className="space-y-4 text-center text-[15px] leading-7 text-[#ebf0f8] lg:text-left">
            <div>
              <p className="text-inherit">Hospodářská komora ČR</p>
              <p className="text-inherit">Florentinum, recepce A</p>
              <p className="text-inherit">Na Florenci 2116/15</p>
              <p className="text-inherit">110 00 Praha 1</p>
            </div>
            <div className="pt-3 text-[#d7deea]">
              <p className="text-inherit">IČO: 49279530</p>
              <p className="text-inherit">DIČ: CZ49279530</p>
              <p className="text-inherit">Registrace u Městského soudu v Praze</p>
              <p className="text-inherit">Spisová značka: A 8179</p>
            </div>
          </div>

          <div className="space-y-6 text-center lg:text-left">
            <a href={quickLinks.phone} className="flex items-start justify-center gap-4 text-[#2990ff] transition-colors hover:text-[#64b2ff] lg:justify-start">
              <Phone className="mt-1 hidden h-6 w-6 shrink-0 text-white/45 sm:block" />
              <span className="text-[20px] font-medium tracking-[0.01em]">+420 266 721 300</span>
            </a>
            <a href={quickLinks.officeMail} className="flex items-start justify-center gap-4 text-[#2990ff] transition-colors hover:text-[#64b2ff] lg:justify-start">
              <Mail className="mt-1 hidden h-6 w-6 shrink-0 text-white/45 sm:block" />
              <span className="text-[20px] font-medium tracking-[0.01em]">office@komora.cz</span>
            </a>
            <a href={quickLinks.dataBox} target="_blank" rel="noreferrer" className="flex items-start justify-center gap-4 text-[#2990ff] transition-colors hover:text-[#64b2ff] lg:justify-start">
              <DataBoxIcon className="mt-1 hidden h-6 w-6 shrink-0 text-white/45 sm:block" />
              <span className="leading-tight text-center lg:text-left">
                <span className="block text-base text-[#aebad0]">{copy.dataBox}</span>
                <span className="block text-[20px] font-medium tracking-[0.01em]">9nqab6b</span>
              </span>
            </a>
            <a
              href={quickLinks.media}
              target="_blank"
              rel="noreferrer"
              className="mx-auto inline-flex min-h-11 items-center justify-center border border-white/70 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:border-[#c43a32] hover:bg-[#c43a32] hover:text-white lg:mx-0"
            >
              {copy.media}
            </a>
          </div>

          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#41506d]">
              {copy.portals}
            </h3>
            <div className="space-y-5">
              <PortalCard
                href={quickLinks.cds}
                title="Czech Digital Solutions"
                accent={<span className="text-lg font-black tracking-tight">D</span>}
                accentImageSrc={portalAssets.cdsLogo}
              />
              <PortalCard
                href={quickLinks.ecert}
                title="E-certifikáty"
                accent={<span />}
                accentImageSrc={portalAssets.ecertLogo}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl text-lg text-[#ecf3fc]">
            {copy.memberLinePrefix}{' '}
            <a href={quickLinks.icc} target="_blank" rel="noreferrer" className="font-semibold text-[#2990ff] transition-colors hover:text-[#6cb6ff]">
              ICC Czech Republic
            </a>{' '}
            a{' '}
            <a href={quickLinks.eurochambers} target="_blank" rel="noreferrer" className="font-semibold text-[#2990ff] transition-colors hover:text-[#6cb6ff]">
              Eurochambers
            </a>
            .
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#41506d]">
              {copy.follow}
            </h3>
            <div className="flex flex-wrap items-center gap-6 text-[#2990ff]">
              <a href={quickLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="transition-colors hover:text-[#7ac0ff]">
                <Facebook className="h-6 w-6" />
              </a>
              <a href={quickLinks.x} target="_blank" rel="noreferrer" aria-label="X" className="transition-colors hover:text-[#7ac0ff]">
                <XIcon className="h-6 w-6" />
              </a>
              <a href={quickLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="transition-colors hover:text-[#7ac0ff]">
                <Youtube className="h-6 w-6" />
              </a>
              <a href={quickLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-[#7ac0ff]">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href={quickLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-[#7ac0ff]">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/14 pt-5 text-sm text-[#aeb8ca]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
              <span>{copy.rights}</span>
              <span className="hidden text-white/30 md:inline">|</span>
              <a href={quickLinks.consent} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                {copy.consent}
              </a>
              <span className="hidden text-white/30 md:inline">|</span>
              <a href={quickLinks.privacy} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                {copy.privacy}
              </a>
            </div>
            <a
              href="https://goconsulting.cz/"
              target="_blank"
              rel="noreferrer"
              aria-label="GO Consulting"
              className="inline-flex w-fit items-center gap-2 text-[#41506d] transition-colors hover:text-[#6f82a6]"
            >
              <span className="text-xl font-bold tracking-tight">GO</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              <span className="text-lg font-light tracking-wide">Consulting</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
