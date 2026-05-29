import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Zap, Droplets, Trash2 } from 'lucide-react';
import HomeTile from '../components/HomeTile';
import tilesData from '../data/homeTiles.json';

export default function Home() {
  const { t } = useTranslation('home');

  const iconMap: Record<string, React.ReactNode> = {
    electricity: <Zap className="w-8 h-8 text-amber-600 group-hover:text-amber-700 transition-colors" />,
    water: <Droplets className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />,
    waste: <Trash2 className="w-8 h-8 text-stone-700 group-hover:text-stone-800 transition-colors" />,
  };

  const tiles = tilesData.tiles.map((tile) => ({
    ...tile,
    title: t(`tiles.${tile.id}.title`),
    description: t(`tiles.${tile.id}.description`),
    icon: iconMap[tile.icon],
    ctaLabel: tile.cta ? t(`tiles.${tile.id}.cta`) : t('ctaDefault'),
  }));

  return (
    <div className="min-h-screen bg-emerald-50/50 font-sans text-stone-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-emerald-900 text-white pt-24 pb-32 px-6">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[3.5rem] md:text-6xl font-black tracking-tighter uppercase mb-4 text-stone-200"
              >
                GreenPact
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-emerald-200 font-medium uppercase tracking-widest text-sm"
              >
                {t('subtitle')}
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight text-stone-200">
              {t('hero.headline')}
            </h2>
            <p className="text-emerald-100 text-lg mb-8 opacity-80">
              {t('hero.description')}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Tiles Section */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiles.map((tile, idx) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <HomeTile
                title={tile.title}
                description={tile.description}
                icon={tile.icon}
                path={tile.path}
                color={tile.color}
                hoverBorder={tile.hoverBorder}
                hoverShadow={tile.hoverShadow}
                ctaText={tile.ctaText}
                ctaLabel={tile.ctaLabel}
              />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
