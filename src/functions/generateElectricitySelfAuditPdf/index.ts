import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import notoSansUrl from '../../assets/Fonts/NotoSans-VariableFont_wdth,wght.ttf?url';
import i18n from '../../i18n';

type CardData = {
  title: string;
  question?: string;
  description: string;
  score: number;
  ratingLabel?: string;
};

interface PdfData {
  language: 'cs' | 'en' | 'de';
  coverColor?: [number, number, number];
  coverLogoUrl?: string;
  coverLogoType?: 'PNG' | 'JPG' | 'JPEG';
  title: string;
  accommodationProfileLabel?: string;
  facilityName?: string;
  gaugeImage?: string;
  cards: CardData[];
  totalScore: number;
  totalRatingLabel?: string;
}

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

export async function generateElectricitySelfAuditPdf(data: PdfData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const marginX = 14;
  let cursorY = 14;
  const tPdf = (key: string) => i18n.t(key, { ns: 'pdf', lng: data.language });

  const fontBase64 = await loadNotoSansBase64();
  doc.addFileToVFS('NotoSans.ttf', fontBase64);
  doc.addFont('NotoSans.ttf', 'NotoSans', 'normal');
  doc.addFont('NotoSans.ttf', 'NotoSans', 'bold');
  doc.setFont('NotoSans', 'normal');

  const addTitle = (text: string, size = 12, barHeight = 8, fillColor?: [number, number, number]) => {
    const barWidth = 210 - marginX * 2;
    const color = fillColor ?? data.coverColor ?? [245, 245, 244];
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
    cursorY = (doc as any).lastAutoTable.finalY + 10;
  };

  if (data.coverColor) {
    doc.setFillColor(data.coverColor[0], data.coverColor[1], data.coverColor[2]);
    doc.rect(0, 0, 210, 297, 'F');
  }

  let logoBottomY = 150;
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
  const brandWidth = doc.getTextWidth(brand);
  doc.text(brand, (210 - brandWidth) / 2, 74);
  doc.setFont('NotoSans', 'normal');

  doc.setFontSize(12);
  const subtitle = tPdf('cover.subtitle');
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (210 - subtitleWidth) / 2, 84);

  doc.setFontSize(22);
  doc.setFont('NotoSans', 'bold');
  const titleWidth = doc.getTextWidth(data.title);
  const titleY = 223;
  if (data.facilityName) {
    const facilityLines = doc.splitTextToSize(data.facilityName, 180);
    const lineHeight = 8;
    const blockHeight = facilityLines.length * lineHeight;
    const facilityY = titleY - blockHeight - 4;
    doc.text(facilityLines, 105, facilityY, { align: 'center' });
  }
  doc.text(data.title, (210 - titleWidth) / 2, titleY);
  doc.setFont('NotoSans', 'normal');
  if (data.accommodationProfileLabel) {
    doc.setFontSize(12);
    const profileWidth = doc.getTextWidth(data.accommodationProfileLabel);
    doc.text(data.accommodationProfileLabel, (210 - profileWidth) / 2, titleY + 8);
  }

  doc.addPage();
  doc.setTextColor(0, 0, 0);
  cursorY = 14;

  addTitle(tPdf('selfAudit.resultsTitle'), 14, 10);

  const pageWidth = 210;
  const contentWidth = pageWidth - marginX * 2;
  const cardPadding = 6;
  const borderColor = data.coverColor ?? [214, 211, 209];
  const textMuted = [120, 113, 108]; // stone-500
  const textPrimary = [28, 25, 23]; // stone-900
  const accent = [250, 204, 21]; // yellow-400

  const ratingColor = (score: number) => {
    if (score >= 90) return [4, 120, 87]; // emerald
    if (score >= 70) return [22, 163, 74]; // green
    if (score >= 50) return [217, 119, 6]; // amber
    if (score >= 30) return [194, 65, 12]; // orange
    return [220, 38, 38]; // red
  };

  const drawCard = (card: CardData) => {
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(11);

    const titleLines = doc.splitTextToSize(card.title, contentWidth - cardPadding * 2);
    const questionLines = card.question
      ? doc.splitTextToSize(card.question, contentWidth - cardPadding * 2)
      : [];
    const descLines = doc.splitTextToSize(card.description, contentWidth - cardPadding * 2);

    const lineHeight = 5;
    const sliderHeight = 6;
    const scoreHeight = 6;
    const ratingHeight = card.ratingLabel ? 6 : 0;

    const cardHeight =
      cardPadding * 2 +
      titleLines.length * lineHeight +
      (questionLines.length ? lineHeight + questionLines.length * lineHeight : 0) +
      sliderHeight +
      scoreHeight +
      descLines.length * lineHeight +
      (ratingHeight ? ratingHeight + 2 : 0);

    if (cursorY + cardHeight > 280) {
      doc.addPage();
      cursorY = 14;
    }

    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.6);
    doc.setFillColor(255, 255, 255);
    (doc as any).roundedRect(marginX, cursorY, contentWidth, cardHeight, 4, 4, 'FD');

    let y = cursorY + cardPadding + lineHeight;
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFont('NotoSans', 'bold');
    doc.text(titleLines, marginX + cardPadding, y);
    y += titleLines.length * lineHeight;

    if (questionLines.length) {
      y += 2;
      doc.setFont('NotoSans', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(questionLines, marginX + cardPadding, y);
      y += questionLines.length * lineHeight;
    }

    y += 4;
    // Slider line
    const sliderX = marginX + cardPadding;
    const sliderY = y;
    const sliderW = contentWidth - cardPadding * 2 - 30;
    const scoreColor = ratingColor(card.score);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(1.2);
    doc.line(sliderX, sliderY, sliderX + sliderW, sliderY);
    doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setLineWidth(2);
    doc.line(sliderX, sliderY, sliderX + (sliderW * card.score) / 100, sliderY);

    // Score text
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${card.score} / 100`, sliderX + sliderW + 4, sliderY + 1.5);
    y += sliderHeight + 2;

    // Description
    doc.setFont('NotoSans', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(descLines, marginX + cardPadding, y);
    y += descLines.length * lineHeight;

    if (card.ratingLabel) {
      y += 4;
      doc.setFont('NotoSans', 'bold');
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(card.ratingLabel, marginX + cardPadding, y);
    }

    cursorY += cardHeight + 6;
  };

  data.cards.forEach(drawCard);

  cursorY += 10;
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(28, 25, 23);
  const overallTitle = tPdf('selfAudit.overallScore');
  const overallWidth = doc.getTextWidth(overallTitle);
  doc.text(overallTitle, (210 - overallWidth) / 2, cursorY);
  doc.setFont('NotoSans', 'normal');
  cursorY += 6;

  const ensureSpace = (height: number) => {
    if (cursorY + height > 280) {
      doc.addPage();
      cursorY = 14;
    }
  };

  const drawGauge = () => {
    const gaugeHeight = 70;
    ensureSpace(gaugeHeight);
    const centerX = 105;
    const centerY = cursorY + 46;
    const radius = 38;
    const drawArc = (startDeg: number, endDeg: number) => {
      const step = 4;
      const points: Array<[number, number]> = [];
      const dir = startDeg > endDeg ? -1 : 1;
      for (let deg = startDeg; dir > 0 ? deg <= endDeg : deg >= endDeg; deg += dir * step) {
        const rad = (deg * Math.PI) / 180;
        points.push([centerX + radius * Math.cos(rad), centerY + radius * Math.sin(rad)]);
      }
      if (points.length < 2) return;
      for (let i = 0; i < points.length - 1; i += 1) {
        doc.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
      }
    };

    // segments: red, orange, amber, green, emerald
    const segments = [
      { from: 180, to: 216, color: [220, 38, 38] },
      { from: 216, to: 252, color: [194, 65, 12] },
      { from: 252, to: 288, color: [217, 119, 6] },
      { from: 288, to: 324, color: [22, 163, 74] },
      { from: 324, to: 360, color: [4, 120, 87] },
    ];

    doc.setLineWidth(6);
    segments.forEach((seg) => {
      doc.setDrawColor(seg.color[0], seg.color[1], seg.color[2]);
      drawArc(seg.from, seg.to);
    });

    // needle
    const angle = 180 + (data.totalScore / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    const needleX = centerX + (radius - 8) * Math.cos(rad);
    const needleY = centerY + (radius - 8) * Math.sin(rad);
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(2);
    doc.line(centerX, centerY, needleX, needleY);
    doc.setFillColor(30, 30, 30);
    (doc as any).circle(centerX, centerY, 2, 'F');

    // score text
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(16);
    const scoreText = `${data.totalScore} / 100`;
    const scoreWidth = doc.getTextWidth(scoreText);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.text(scoreText, centerX - scoreWidth / 2, centerY + 22);

    if (data.totalRatingLabel) {
      doc.setFontSize(12);
      const ratingWidth = doc.getTextWidth(data.totalRatingLabel);
      const ratingColor = ratingColorFn(data.totalScore);
      doc.setTextColor(ratingColor[0], ratingColor[1], ratingColor[2]);
      doc.text(data.totalRatingLabel, centerX - ratingWidth / 2, centerY + 30);
    }

    cursorY = centerY + 36;
  };

  const ratingColorFn = (score: number) => ratingColor(score);
  if (data.gaugeImage) {
    ensureSpace(64);
    const imgWidth = 96;
    const imgHeight = 64;
    const x = (210 - imgWidth) / 2;
    const y = cursorY;
    doc.addImage(data.gaugeImage, 'PNG', x, y, imgWidth, imgHeight);
    cursorY = y + imgHeight + 6;
  } else {
    drawGauge();
  }

  doc.save('greenpack-electricity-self-audit.pdf');
}
