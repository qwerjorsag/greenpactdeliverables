import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export interface PeriodData {
  id: string;
  period: string;
  occupancyRate: number | '';
  operatingDays: number | '';
  rooms: number | '';
  floorArea: number | '';
}

interface Props {
  data: PeriodData[];
  onChange: (data: PeriodData[]) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

function HoverTooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  const updatePosition = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 220;
    const margin = 12;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, margin),
      window.innerWidth - width - margin
    );
    const top = rect.top - 8;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        updatePosition();
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onClick={() => {
        updatePosition();
        setOpen((v) => !v);
      }}
      className="relative"
    >
      {children}
      {open &&
        createPortal(
          <div
            className="fixed z-[9999] rounded-md border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg"
            style={{ top: pos.top, left: pos.left, transform: 'translateY(-100%)', width: 240 }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}

export default function PeriodDataInput({ data, onChange, themeColor = 'emerald' }: Props) {
  const { t } = useTranslation('common');

  // Ensure exactly 3 rows exist
  useEffect(() => {
    if (data.length !== 3) {
      const newData = [...data];
      while (newData.length < 3) {
        newData.push({
          id: Math.random().toString(36).substr(2, 9),
          period: '',
          occupancyRate: '',
          operatingDays: '',
          rooms: '',
          floorArea: ''
        });
      }
      if (newData.length > 3) {
        newData.length = 3;
      }
      onChange(newData);
    }
  }, [data, onChange]);

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const blockSigns = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const updatePeriod = (id: string, field: keyof PeriodData, value: string | number) => {
    let finalValue = value;
    
    if (value !== '') {
      if (field === 'occupancyRate') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else if (num > 100) finalValue = 100;
          else finalValue = num;
        }
      } else if (field === 'operatingDays') {
        const num = typeof value === 'number' ? value : parseInt(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else if (num > 366) finalValue = 366;
          else finalValue = num;
        }
      } else if (field === 'rooms' || field === 'floorArea') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else finalValue = num;
        }
      }
    }

    const newData = data.map(d => d.id === id ? { ...d, [field]: finalValue } : d);
    
    // Auto-calculate subsequent years if the first row's period is changed
    if (field === 'period' && data[0]?.id === id) {
      const baseYear = parseInt(finalValue as string, 10);
      if (!isNaN(baseYear)) {
        if (newData[1]) newData[1].period = (baseYear + 1).toString();
        if (newData[2]) newData[2].period = (baseYear + 2).toString();
      } else {
        if (newData[1]) newData[1].period = '';
        if (newData[2]) newData[2].period = '';
      }
    }
    
    onChange(newData);
  };

  const calculateRoomNight = (d: PeriodData) => {
    const occ = typeof d.occupancyRate === 'number' ? d.occupancyRate : 0;
    const days = typeof d.operatingDays === 'number' ? d.operatingDays : 0;
    const rooms = typeof d.rooms === 'number' ? d.rooms : 0;
    return (occ / 100) * days * rooms;
  };

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const currentYear = new Date().getFullYear().toString();
  const autoText = t('periodData.autoText');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{t('periodData.title')}</h3>
      </div>

      <div className="gp-table-wrap">
        <table className="w-full table-auto text-[11px] md:text-sm text-left">
          <thead className="text-[10px] md:text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
                <th className="px-2 md:px-4 py-3 md:py-4 rounded-tl-xl whitespace-normal break-words">
                  {t('periodData.period')}
                </th>
                {data.slice(0, 3).map((row, index) => (
                  <th
                    key={row.id}
                    className={`px-2 md:px-4 py-3 md:py-4 whitespace-normal break-words ${index === 2 ? 'rounded-tr-xl' : ''}`}
                  >
                    {index === 0 ? (
                      <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={row.period}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        updatePeriod(row.id, 'period', onlyDigits);
                      }}
                      onKeyDown={blockSigns}
                      placeholder={currentYear}
                        className="w-full p-1.5 md:p-2 h-[34px] md:h-[38px] bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      />
                  ) : (
                    <HoverTooltip content={autoText}>
                      <div className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-500 font-medium h-[34px] md:h-[38px] flex items-center cursor-not-allowed">
                        {row.period || '-'}
                      </div>
                    </HoverTooltip>
                  )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100">
              <td className="px-2 md:px-4 py-3 md:py-4 font-medium">
                {t('periodData.occupancyRate')}
              </td>
              {data.slice(0, 3).map((row) => (
                <td key={row.id} className="px-2 md:px-4 py-3 md:py-4 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.occupancyRate}
                      onChange={(e) => updatePeriod(row.id, 'occupancyRate', e.target.value)}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 pr-2 md:pr-8 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-medium pointer-events-none hidden md:inline">%</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-stone-100">
              <td className="px-2 md:px-4 py-3 md:py-4 font-medium">
                {t('periodData.operatingDays')}
              </td>
              {data.slice(0, 3).map((row) => (
                <td key={row.id} className="px-2 md:px-4 py-3 md:py-4 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="366"
                      value={row.operatingDays}
                      onChange={(e) => updatePeriod(row.id, 'operatingDays', e.target.value)}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                  {row.operatingDays === 366 && row.period && !isLeapYear(parseInt(row.period, 10)) && (
                    <div className="text-red-500 text-xs mt-1 font-medium">
                      {t('periodData.operatingDaysError')}
                    </div>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b border-stone-100">
              <td className="px-2 md:px-4 py-3 md:py-4 font-medium">
                {t('periodData.rooms')}
              </td>
              {data.slice(0, 3).map((row) => (
                <td key={row.id} className="px-2 md:px-4 py-3 md:py-4 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={row.rooms}
                      onChange={(e) => updatePeriod(row.id, 'rooms', e.target.value)}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-stone-100">
              <td className="px-2 md:px-4 py-3 md:py-4 font-medium">
                {t('periodData.floorArea')}
              </td>
              {data.slice(0, 3).map((row) => (
                <td key={row.id} className="px-2 md:px-4 py-3 md:py-4 align-top">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      min="0"
                      value={typeof row.floorArea === 'number' ? formatWithSpaces(row.floorArea) : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\s/g, '');
                        updatePeriod(row.id, 'floorArea', raw);
                      }}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 pr-2 md:pr-8 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <span className="absolute right-3 top-[19px] -translate-y-1/2 text-stone-400 text-xs font-medium pointer-events-none hidden md:inline">m²</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-stone-100">
              <td className="px-2 md:px-4 py-3 md:py-4 font-medium">
                {t('periodData.roomNights')}
              </td>
              {data.slice(0, 3).map((row) => (
                <td key={row.id} className="px-2 md:px-4 py-3 md:py-4 align-top bg-stone-50/50">
                  <HoverTooltip content={autoText}>
                    <div className="h-[34px] md:h-[38px] flex items-center justify-center cursor-not-allowed">
                      {Math.floor(calculateRoomNight(row)).toLocaleString('cs-CZ')}
                    </div>
                  </HoverTooltip>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


