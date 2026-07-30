(function () {
  const FINNHUB_API_KEY = "d9lsge9r01qhk6k60smgd9lsge9r01qhk6k60sn0";

  async function fetchQuote(ticker) {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_API_KEY}`);
      if (!res.ok) throw new Error("Finnhub request failed: " + res.status);
      const data = await res.json();
      if (!data || typeof data.c !== "number" || data.c === 0) throw new Error("No live data for " + ticker);
      return { price: data.c, change: data.d, changePct: data.dp };
    } catch (e) {
      console.warn("Live price fetch failed for " + ticker + ":", e.message);
      return null;
    }
  }

  function formatChange(changePct) {
    const sign = changePct >= 0 ? "+" : "";
    return `${sign}${changePct.toFixed(1)}% today`;
  }

  // Updates a single detail-page price row (picks/*.html) and re-draws its chart
  // with the live price swapped in as the final data point.
  function applyToDetailPage(ticker, opts) {
    fetchQuote(ticker).then((q) => {
      if (!q) return;
      const priceEl = document.getElementById("livePrice");
      const changeEl = document.getElementById("liveChange");
      if (priceEl) priceEl.textContent = "$" + q.price.toFixed(2);
      if (changeEl) {
        changeEl.textContent = formatChange(q.changePct);
        changeEl.className = "change " + (q.changePct >= 0 ? "pos" : "neg");
      }
      if (opts && opts.chartData && opts.chartId && opts.color && window.renderStockChart) {
        // Rescale the whole illustrative shape to end on the real live price,
        // instead of swapping just the last point (which would fabricate a
        // "% over 12 months" by mixing a fictional start with a real end).
        const original = opts.chartData;
        const scale = q.price / original[original.length - 1];
        const rescaled = original.map((v) => v * scale);
        window.renderStockChart(opts.chartId, rescaled, opts.color);
      }
      const label = document.getElementById("liveLabel");
      if (label) label.textContent = "🟢 Live price";
    });
  }

  // Updates every card in a rendered pick-grid (long-term.html / short-term.html),
  // matched by a data-ticker attribute on the card's price/change elements.
  function applyToGrid(tickers) {
    tickers.forEach((ticker) => {
      fetchQuote(ticker).then((q) => {
        if (!q) return;
        const priceEl = document.querySelector(`[data-live-price="${ticker}"]`);
        const changeEl = document.querySelector(`[data-live-change="${ticker}"]`);
        if (priceEl) priceEl.textContent = "$" + q.price.toFixed(2);
        if (changeEl) {
          changeEl.textContent = formatChange(q.changePct);
          changeEl.className = "change " + (q.changePct >= 0 ? "pos" : "neg");
        }
      });
    });
  }

  window.LivePrice = { fetchQuote, applyToDetailPage, applyToGrid };
})();
