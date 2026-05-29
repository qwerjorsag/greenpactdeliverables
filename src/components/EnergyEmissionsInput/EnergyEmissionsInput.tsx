import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip from '../InfoTooltip';
import DataTable from '../DataTable';

interface EnergySource {
  id: string;
  ef: number;
}

export const ENERGY_SOURCES: EnergySource[] = [
  {
    id: 'electricity_grid',
    ef: 0.432,
  },
  {
    id: 'electricity_renewable',
    ef: 0,
  },
  {
    id: 'natural_gas',
    ef: 0.202,
  },
  {
    id: 'heating_oil',
    ef: 0.267,
  },
  {
    id: 'lpg',
    ef: 0.227,
  },
  {
    id: 'biomass',
    ef: 0.02,
  },
  {
    id: 'district_heating',
    ef: 0.18,
  },
  {
    id: 'other',
    ef: 0.2,
  }
];

interface Props {
  values: Record<string, number | ''>;
  onValuesChange: (values: Record<string, number | ''>) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function EnergyEmissionsInput({ values, onValuesChange, themeColor = 'yellow' }: Props) {
  const { t } = useTranslation('electricity');

  const handleValueChange = (id: string, val: string) => {
    if (val === '') {
      onValuesChange({ ...values, [id]: '' });
      return;
    }
    const num = Math.round(parseFloat(val));
    if (!isNaN(num)) {
      onValuesChange({ ...values, [id]: num < 0 ? 0 : num });
    }
  };

  const calculateEmissions = (kwh: number | '', ef: number) => {
    if (kwh === '' || isNaN(kwh)) return 0;
    return (kwh * ef) / 1000;
  };

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const totalKwh = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const totalEmissions = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + calculateEmissions(val, source.ef);
  }, 0);

  const inputClass = 'bg-stone-50 border-stone-200 rounded-lg focus:ring-stone-200';

  const rows = [
    ...ENERGY_SOURCES.map((source) => ({ type: 'source' as const, source })),
    { type: 'total' as const },
  ];

  const columns = [
    {
      id: 'energy',
      header: t('energyEmissionsInput.energySource'),
      headerClassName: 'pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[120px] md:max-w-none',
      cellClassName: 'pl-4 pr-1 py-3',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold uppercase text-stone-900">{t('energyEmissionsInput.total')}</span>;
        }
        return (
          <span className="text-sm font-medium text-stone-800">
            {t(`energySources.${row.source.id}.name`)}
          </span>
        );
      },
    },
    {
      id: 'tooltip',
      header: '',
      headerClassName: 'px-0.5 py-3 w-6 text-center',
      cellClassName: 'px-0.5 py-3 text-xs text-stone-700 w-6',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return (
            <div className="flex justify-center">
              <InfoTooltip
                label={t('energyEmissionsInput.total')}
                content={t('energyEmissionsInput.totalTooltip')}
              />
            </div>
          );
        }
        const explanation = t(`energySources.${row.source.id}.explanation`);
        return (
          <div className="flex justify-center">
            <InfoTooltip label={t('energyEmissionsInput.explanation')} content={explanation} />
          </div>
        );
      },
    },
    {
      id: 'kwh',
      header: 'kWh',
      headerClassName: 'px-3 py-3 w-24 text-center whitespace-normal break-words',
      cellClassName: 'px-2 py-3 w-24',
      align: 'right' as const,
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold text-stone-900">{formatWithSpaces(totalKwh)}</span>;
        }
        const val = values[row.source.id];
        return (
          <input
            type="text"
            inputMode="numeric"
            min="0"
            step="1"
            value={typeof val === 'number' ? formatWithSpaces(val) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\s/g, '');
              handleValueChange(row.source.id, raw);
            }}
            className={`w-full p-1.5 text-right border rounded-lg focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            placeholder="0"
          />
        );
      },
    },
    {
      id: 'ef',
      header: 'EF (kg CO₂e/kWh)',
      headerClassName: 'px-4 py-3 text-center hidden md:table-cell whitespace-normal break-words',
      cellClassName: 'px-4 py-3 text-center hidden md:table-cell',
      align: 'center' as const,
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') return '';
        return row.source.ef.toString().replace('.', ',');
      },
    },
    {
      id: 'emissions',
      header: t('energyEmissionsInput.emissions'),
      headerClassName: 'px-4 py-3 text-center whitespace-normal break-words max-w-[120px] md:max-w-none',
      cellClassName: 'px-4 py-3 text-right',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold text-stone-900">{totalEmissions.toFixed(2).replace('.', ',')}</span>;
        }
        const val = values[row.source.id];
        const emissions = calculateEmissions(val, row.source.ef);
        return <span className="font-bold">{emissions.toFixed(2).replace('.', ',')}</span>;
      },
    },
    {
      id: 'corner',
      header: '',
      headerClassName: 'px-4 py-3 rounded-tr-xl text-center',
      cellClassName: 'px-4 py-3',
      render: () => '',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3>
            {t('energyEmissionsInput.title')}
          </h3>
          <div className="text-xs text-stone-500">
            {t('energyEmissionsInput.deprecated')}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => (row.type === 'total' ? 'total' : row.source.id)}
        getRowClassName={(row) => (row.type === 'total' ? 'font-bold bg-stone-100 text-stone-900' : undefined)}
      />
    </div>
  );
}

