type CaptureOptions = {
  elementId: string;
  score: number;
  ratingLabel?: string;
};

const ratingColorForScore = (score: number) => {
  if (score >= 90) return '#047857';
  if (score >= 70) return '#16a34a';
  if (score >= 50) return '#d97706';
  if (score >= 30) return '#c2410c';
  return '#dc2626';
};

export const captureGaugePng = async ({ elementId, score, ratingLabel }: CaptureOptions) => {
  const gaugeEl = document.getElementById(elementId);
  if (!gaugeEl) return undefined;
  const svgEl = gaugeEl.querySelector('svg');
  if (!svgEl) return undefined;

  const serializer = new XMLSerializer();
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const origNodes = Array.from(svgEl.querySelectorAll('*'));
  const cloneNodes = Array.from(clone.querySelectorAll('*'));
  origNodes.forEach((node, idx) => {
    const cloneNode = cloneNodes[idx] as HTMLElement | undefined;
    if (!cloneNode) return;
    const style = window.getComputedStyle(node as Element);
    const keys = [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'font-size',
      'font-weight',
      'font-family',
      'opacity',
    ];
    const inline = keys
      .map((k) => {
        const v = style.getPropertyValue(k);
        return v ? `${k}:${v}` : '';
      })
      .filter(Boolean)
      .join(';');
    if (inline) cloneNode.setAttribute('style', inline);
  });

  clone.querySelectorAll('text').forEach((el) => el.remove());

  const rect = svgEl.getBoundingClientRect();
  clone.setAttribute('width', String(rect.width));
  clone.setAttribute('height', String(rect.height));

  let svgText = serializer.serializeToString(clone);
  if (!svgText.includes('http://www.w3.org/2000/svg')) {
    svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = url;
  }).catch(() => {
    URL.revokeObjectURL(url);
    return undefined;
  });

  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);

  const color = ratingColorForScore(score);
  ctx.fillStyle = '#1c1917';
  ctx.font = '700 18px "Noto Sans", Arial, sans-serif';
  const scoreText = `${score} / 100`;
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.fillText(scoreText, (width - scoreWidth) / 2, height / 2 + 18);

  if (ratingLabel) {
    ctx.fillStyle = color;
    ctx.font = '600 11px "Noto Sans", Arial, sans-serif';
    const labelWidth = ctx.measureText(ratingLabel).width;
    ctx.fillText(ratingLabel, (width - labelWidth) / 2, height / 2 + 32);
  }

  return canvas.toDataURL('image/png');
};
