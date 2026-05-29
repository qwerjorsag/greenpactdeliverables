import React from 'react';

type Props = {
  className?: string;
};

const mapSrc =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.8611760048575!2d14.432716341867666!3d50.08888597164389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470becc9f1b257c3%3A0x3d576e1add7e1937!2zSG9zcG9kw6HFmXNrw6Ega29tb3JhIMSMZXNrw6kgcmVwdWJsaWt5!5e0!3m2!1scs!2scz!4v1774717567098!5m2!1scs!2scz';

const openInMapsUrl = 'https://maps.google.com/?q=Hospod%C3%A1%C5%99sk%C3%A1%20komora%20%C4%8Cesk%C3%A9%20republiky';

export default function MapEmbed({ className }: Props) {
  return (
    <div className={className}>
      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="relative w-full aspect-[4/3]">
          <iframe
            title="Florentinum map"
            src={mapSrc}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <a
          href={openInMapsUrl}
          className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-2 text-xs font-bold uppercase tracking-widest text-emerald-700 transition-all hover:bg-emerald-700 hover:text-white hover:scale-105"
          target="_blank"
          rel="noreferrer"
        >
          Otevřít v aplikaci map
        </a>
      </div>
    </div>
  );
}
