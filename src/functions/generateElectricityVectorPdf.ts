import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import notoSansUrl from '../assets/Fonts/NotoSans-VariableFont_wdth,wght.ttf?url';
import i18n from '../i18n';

type PeriodData = {
  period: string;
  occupancyRate: number | null;
  operatingDays: number | null;
  rooms: number | null;
  floorArea: number | null;
};

type EnergyByPeriod = Record<string, number>;

interface PdfData {
  language: 'cs' | 'en' | 'de';
  coverTitle?: string;
  coverColor?: [number, number, number];
  accommodationProfileLabel?: string;
  facilityName?: string;
  coverLogoUrl?: string;
  coverLogoType?: 'PNG' | 'JPG' | 'JPEG';
  years: string[];
  operationalData: PeriodData[];
  energySourceOrder: string[];
  energySourceLabels: Record<string, string>;
  energyKwh: EnergyByPeriod[];
  energyEmissionsTons: EnergyByPeriod[];
  energyGj: EnergyByPeriod[];
  totalsByPeriod: { totalEnergy: number; totalEmissions: number }[];
  perPeriodIndicators: { roomNights: number | null; floorAreaM2: number | null }[];
  totalConsumption: Array<{ raw: number | null; converted: number | null; normRN: number | null; normM2: number | null }>;
  energyManagementTables: Array<{
    title: string;
    rows: Array<{ label: string; expected: string; value: string; evaluation: string; recommendation: string; status: string }>;
  }>;
  renewablesSummary: Array<{ year: string; renewableKwh: number; renewablePct: number; nonRenewableKwh: number; nonRenewablePct: number }>;
  benchmarks: {
    title: string;
    headers: string[];
    ratingHeaders: { rating: string; meaning: string; typicalProfile: string; recommendedNextSteps: string };
    rows: Array<Array<string>>;
    totals: Array<string>;
    bands: Array<string>;
    yearSummaries: Array<{ year: string; rating: string; meaning: string; typical: string; next: string }>;
  };
}

const fmtInt = (v: number | null) => (v === null ? '—' : Math.round(v).toLocaleString('cs-CZ').replace(/\u00A0/g, ' '));
const fmt2 = (v: number | null) => (v === null ? '—' : v.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' '));

let fontBase64Promise: Promise<string> | null = null;
const loadNotoSansBase64 = async () => {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(notoSansUrl)
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      });
  }
  return fontBase64Promise;
};

const toBase64 = async (url: string) => {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function generateElectricityVectorPdf(data: PdfData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const lang = data.language;
  const tPdf = (key: string) => i18n.t(key, { ns: 'pdf', lng: lang });
  const marginX = 14;
  let cursorY = 14;

  const fontBase64 = await loadNotoSansBase64();
  doc.addFileToVFS('NotoSans.ttf', fontBase64);
  doc.addFont('NotoSans.ttf', 'NotoSans', 'normal');
  doc.addFont('NotoSans.ttf', 'NotoSans', 'bold');
  doc.setFont('NotoSans', 'normal');

  const addTitle = (text: string, size = 12, barHeight = 8) => {
    const barWidth = 210 - marginX * 2;
    const color = data.coverColor ?? [245, 245, 244];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(marginX, cursorY - 6, barWidth, barHeight, 'F');
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(28, 25, 23);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (210 - textWidth) / 2, cursorY);
    cursorY += barHeight;
  };

  const addTable = (options: UserOptions) => {
    autoTable(doc, {
      margin: { left: marginX, right: marginX },
      styles: { font: 'NotoSans', fontSize: 10 },
      headStyles: { fillColor: [245, 245, 244], textColor: [120, 113, 108], fontStyle: 'bold' },
      ...options,
      startY: cursorY,
    });
    cursorY = (doc as any).lastAutoTable.finalY + 12;
  };

  const percentChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const evalLabel = (pct: number | null) => {
    if (pct === null || Number.isNaN(pct)) return '—';
    const abs = Math.abs(pct);
    if (abs >= 10) {
      return pct > 0 ? tPdf('evaluation.significantIncrease') : tPdf('evaluation.significantDecrease');
    }
    if (abs >= 5) return tPdf('evaluation.moderateChange');
    return tPdf('evaluation.minorChange');
  };

  const reportCategory = (pct: number | null) => {
    if (pct === null || Number.isNaN(pct)) return 'none' as const;
    const abs = Math.abs(pct);
    if (abs >= 20) return 'key' as const;
    if (abs >= 10) return 'significant' as const;
    if (abs >= 5) return 'notable' as const;
    return 'normal' as const;
  };

  const reportText = (pct: number | null, category: 'normal' | 'notable' | 'significant' | 'key' | 'none') => {
    if (pct === null || Number.isNaN(pct)) return '—';
    const isDecrease = pct < 0;
    if (category === 'normal') return tPdf('report.stable');
    if (category === 'notable') {
      return isDecrease ? tPdf('report.slightImprovement') : tPdf('report.slightIncrease');
    }
    if (category === 'significant') {
      return isDecrease ? tPdf('report.significantImprovement') : tPdf('report.significantIncrease');
    }
    if (category === 'key') {
      return isDecrease ? tPdf('report.majorImprovement') : tPdf('report.majorDeterioration');
    }
    return '—';
  };

  if (data.coverColor && data.coverTitle) {
    doc.setFillColor(data.coverColor[0], data.coverColor[1], data.coverColor[2]);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(28, 25, 23);
    let logoBottomY = 80;
    let logoTopY = 120;
    if (data.coverLogoUrl && data.coverLogoType) {
      const logoBase64 = await toBase64(data.coverLogoUrl);
      const imageProps = (doc as any).getImageProperties(`data:image/${data.coverLogoType.toLowerCase()};base64,${logoBase64}`);
      const maxWidth = 120;
      const ratio = imageProps.width / imageProps.height;
      const width = Math.min(maxWidth, imageProps.width);
      const height = width / ratio;
      const x = (210 - width) / 2;
      const y = 148.5 - height / 2;
      doc.addImage(logoBase64, data.coverLogoType, x, y, width, height);
      logoTopY = y;
      logoBottomY = y + height;
    }
    doc.setFontSize(48);
    doc.setFont('NotoSans', 'bold');
    const brand = 'GREENPACK';
    const subtitle = tPdf('cover.subtitle');
    const brandWidth = doc.getTextWidth(brand);
    const brandY = 74;
    doc.text(brand, (210 - brandWidth) / 2, brandY);
    doc.setFont('NotoSans', 'normal');

    doc.setFontSize(12);
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (210 - subtitleWidth) / 2, brandY + 10);

    doc.setFontSize(22);
    doc.setFont('NotoSans', 'bold');
    const titleWidth = doc.getTextWidth(data.coverTitle);
    const titleY = 223;
    if (data.facilityName) {
      const facilityLines = doc.splitTextToSize(data.facilityName, 180);
      const lineHeight = 8;
      const blockHeight = facilityLines.length * lineHeight;
      const facilityY = titleY - blockHeight - 4;
      doc.text(facilityLines, 105, facilityY, { align: 'center' });
    }
    doc.text(data.coverTitle, (210 - titleWidth) / 2, titleY);
    doc.setFont('NotoSans', 'normal');
    if (data.accommodationProfileLabel) {
      doc.setFontSize(12);
      const profileWidth = doc.getTextWidth(data.accommodationProfileLabel);
      doc.text(data.accommodationProfileLabel, (210 - profileWidth) / 2, titleY + 8);
    }
    doc.addPage();
    doc.setTextColor(0, 0, 0);
  }

  // Operational Data
  addTitle(tPdf('operationalData.title'));
  addTable({
    head: [[tPdf('operationalData.metric'), ...data.years]],
    body: [
      [tPdf('operationalData.period'), ...data.operationalData.map((p) => p.period || '—')],
      [tPdf('operationalData.occupancyRate'), ...data.operationalData.map((p) => fmt2(p.occupancyRate))],
      [tPdf('operationalData.operatingDays'), ...data.operationalData.map((p) => fmtInt(p.operatingDays))],
      [tPdf('operationalData.rooms'), ...data.operationalData.map((p) => fmtInt(p.rooms))],
      [tPdf('operationalData.floorArea'), ...data.operationalData.map((p) => fmtInt(p.floorArea))],
      [tPdf('operationalData.roomNights'), ...data.perPeriodIndicators.map((p) => fmtInt(p.roomNights))],
    ],
  });

  // Energy (kWh)
  addTitle(tPdf('energy.kwhTitle'));
  const energySources = data.energySourceOrder.length ? data.energySourceOrder : Object.keys(data.energyKwh[0] || {});
  addTable({
    head: [[tPdf('energy.energySource'), ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyKwh.map((p) => fmtInt(p[key] ?? 0)),
      ]),
    ],
  });

  // Energy GJ
  addTitle(tPdf('energy.gjTitle'));
  addTable({
    head: [[tPdf('energy.energySource'), ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyGj.map((p) => fmt2(p[key] ?? 0)),
      ]),
    ],
  });

  doc.addPage();
  cursorY = 14;

  // Emissions
  addTitle(tPdf('energy.emissionsTitle'));
  addTable({
    head: [[tPdf('energy.energySource'), ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyEmissionsTons.map((p) => fmt2(p[key] ?? 0)),
      ]),
    ],
  });

  // Renewables summary
  addTitle(tPdf('renewables.title'));
  addTable({
    head: [[tPdf('renewables.year'), tPdf('renewables.renewable'), tPdf('renewables.nonRenewable')]],
    body: data.renewablesSummary.map((r) => [
      r.year,
      `${fmtInt(r.renewableKwh)} (${r.renewablePct.toFixed(1).replace('.', ',')}%)`,
      `${fmtInt(r.nonRenewableKwh)} (${r.nonRenewablePct.toFixed(1).replace('.', ',')}%)`,
    ]),
  });

  doc.addPage();
  cursorY = 14;

  // Total energy consumption per room-night / per m²
  const totalConsumption = data.totalConsumption || [];
  const years = data.years;
  const rawValues = totalConsumption.map((v) => v.raw);
  const pctValues = rawValues.map((v, idx) => (idx === 0 ? null : percentChange(v, rawValues[idx - 1] ?? null)));

  addTitle(tPdf('consumption.titleRn'));
  addTable({
    head: [[tPdf('consumption.year'), ...years]],
    body: [
      [tPdf('consumption.consumptionKwh'), ...rawValues.map((v) => fmtInt(v))],
      [tPdf('consumption.consumptionGj'), ...totalConsumption.map((v) => fmt2(v.converted))],
      [tPdf('consumption.normalizedRn'), ...totalConsumption.map((v) => fmt2(v.normRN))],
      [tPdf('consumption.percentChange'), ...pctValues.map((v) => (v === null ? '—' : `${fmt2(v)}%`))],
      [tPdf('consumption.evaluation'), ...pctValues.map((v) => evalLabel(v))],
    ],
  });

  const rnReportLines = pctValues
    .map((pct, idx) => {
      if (idx === 0) return null;
      const category = reportCategory(pct);
      const text = reportText(pct, category);
      return `${years[idx - 1]} → ${years[idx]}: ${text}`;
    })
    .filter(Boolean) as string[];

  if (rnReportLines.length) {
    doc.setFontSize(11);
    doc.setTextColor(68, 64, 60);
    doc.text(tPdf('consumption.reportTitleRn'), marginX, cursorY);
    cursorY += 6;
    doc.setFontSize(10);
    rnReportLines.forEach((line) => {
      const lines = doc.splitTextToSize(line, 210 - marginX * 2);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 5;
    });
    cursorY += 6;
  }

  addTitle(tPdf('consumption.titleM2'));
  addTable({
    head: [[tPdf('consumption.year'), ...years]],
    body: [
      [tPdf('consumption.consumptionKwh'), ...rawValues.map((v) => fmtInt(v))],
      [tPdf('consumption.consumptionGj'), ...totalConsumption.map((v) => fmt2(v.converted))],
      [tPdf('consumption.normalizedM2'), ...totalConsumption.map((v) => fmt2(v.normM2))],
      [tPdf('consumption.percentChange'), ...pctValues.map((v) => (v === null ? '—' : `${fmt2(v)}%`))],
      [tPdf('consumption.evaluation'), ...pctValues.map((v) => evalLabel(v))],
    ],
  });

  const m2ReportLines = pctValues
    .map((pct, idx) => {
      if (idx === 0) return null;
      const category = reportCategory(pct);
      const text = reportText(pct, category);
      return `${years[idx - 1]} → ${years[idx]}: ${text}`;
    })
    .filter(Boolean) as string[];

  if (m2ReportLines.length) {
    doc.setFontSize(11);
    doc.setTextColor(68, 64, 60);
    doc.text(tPdf('consumption.reportTitleM2'), marginX, cursorY);
    cursorY += 6;
    doc.setFontSize(10);
    m2ReportLines.forEach((line) => {
      const lines = doc.splitTextToSize(line, 210 - marginX * 2);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 5;
    });
    cursorY += 6;
  }

  doc.addPage();
  cursorY = 14;

  // Benchmarks
  addTitle(data.benchmarks.title);
  addTable({
    head: [data.benchmarks.headers],
    body: data.benchmarks.rows,
  });
  addTable({
    head: [[tPdf('benchmarks.totalWeightedScore'), ...data.years]],
    body: [data.benchmarks.totals],
  });
  addTable({
    head: [[tPdf('benchmarks.rating'), ...data.years]],
    body: [data.benchmarks.bands],
  });

  data.benchmarks.yearSummaries.forEach((y) => {
    addTitle(`${tPdf('benchmarks.year')} ${y.year} (${y.rating})`, 14, 10);
    const meaningHeader = data.benchmarks.ratingHeaders.meaning;
    const typicalHeader = data.benchmarks.ratingHeaders.typicalProfile;
    const nextHeader = data.benchmarks.ratingHeaders.recommendedNextSteps;
    addTable({
      head: [[meaningHeader, typicalHeader, nextHeader]],
      body: [[y.meaning, y.typical, y.next]],
    });
  });

  if (data.energyManagementTables.length) {
    const statusStyles: Record<string, { fill?: [number, number, number]; text?: [number, number, number] }> = {
      within: { fill: [209, 250, 229], text: [6, 95, 70] },
      lowEmissions: { fill: [209, 250, 229], text: [6, 95, 70] },
      slightly: { fill: [254, 243, 199], text: [146, 64, 14] },
      aboveAverage: { fill: [254, 243, 199], text: [146, 64, 14] },
      high: { fill: [254, 226, 226], text: [153, 27, 27] },
      unknown: { fill: undefined, text: [31, 41, 55] },
    };

    doc.addPage();
    cursorY = 14;
    data.energyManagementTables.forEach((table, idx) => {
      if (idx === 0) {
        addTitle(table.title, 14, 10);
      } else {
        addTitle(table.title, 14, 10);
      }

      const headers = [
        tPdf('energyManagement.metric'),
        tPdf('energyManagement.expected'),
        tPdf('energyManagement.results'),
        tPdf('energyManagement.recommendation'),
      ];

      addTable({
        head: [headers],
        body: table.rows.map((row) => [row.label, row.expected, row.value, row.recommendation]),
        didParseCell: (dataCell) => {
          if (dataCell.section !== 'body') return;
          const row = table.rows[dataCell.row.index];
          const style = statusStyles[row.status] || statusStyles.unknown;
          if (style.fill) {
            dataCell.cell.styles.fillColor = style.fill;
          }
          if (style.text) {
            dataCell.cell.styles.textColor = style.text;
          }
        },
      });
    });
  }

  doc.save('greenpack-report.pdf');
}
