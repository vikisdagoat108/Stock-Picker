function renderStockChart(containerId, data, color, unitPrefix) {
  if (unitPrefix === undefined) unitPrefix = "$";
  const fmt = (v) => unitPrefix + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const el = document.getElementById(containerId);
  const w = 600, h = 160, padX = 10, padY = 16;
  const min = Math.min(...data), max = Math.max(...data);
  const range = (max - min) || 1;
  const stepX = (w - padX * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (h - padY * 2) * (1 - (v - min) / range);
    return [x, y];
  });

  const linePath = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const areaPath = linePath +
    ` L${points[points.length - 1][0].toFixed(1)},${h - padY} L${points[0][0].toFixed(1)},${h - padY} Z`;

  const gradId = "grad-" + containerId;
  const changePct = (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1);
  const changeSign = changePct >= 0 ? "+" : "";

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${gradId})" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div class="chart-meta">
      <span>12mo ago: ${fmt(data[0])}</span>
      <span class="chart-change ${changePct >= 0 ? "pos" : "neg"}">${changeSign}${changePct}% over 12 months</span>
      <span>Today: ${fmt(data[data.length - 1])}</span>
    </div>
  `;
}
