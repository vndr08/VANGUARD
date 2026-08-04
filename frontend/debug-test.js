const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'log' || type === 'warn' || type === 'error') {
      logs.push(type.toUpperCase() + ': ' + msg.text());
    }
  });
  page.on('pageerror', e => logs.push('PAGE_ERROR: ' + e.message));

  console.log('Navigating to /debug-map...');
  await page.goto('http://localhost:3002/debug-map', { waitUntil: 'networkidle', timeout: 25000 });
  console.log('Waiting for map to load...');
  await page.waitForTimeout(4000);

  console.log('\n=== CONSOLE OUTPUT ===');
  logs.forEach(l => console.log(l));

  const markerCount = await page.evaluate(() => {
    return document.querySelectorAll('.maplibregl-marker').length;
  });

  // Check where markers are in the DOM
  const domAnalysis = await page.evaluate(() => {
    const results = {};

    // 1. Check map container
    const mapContainer = document.querySelector('.maplibregl-map');
    if (mapContainer) {
      results.mapChildren = Array.from(mapContainer.children).map(c => c.className);
    }

    // 2. Check canvas container (parent of canvas)
    const canvasContainer = document.querySelector('.maplibregl-canvas-container');
    if (canvasContainer) {
      results.canvasChildren = Array.from(canvasContainer.children).map(c => c.tagName + '.' + c.className);
    }

    // 3. Check marker pane specifically
    const markerPane = document.querySelector('.maplibregl-marker-pane');
    results.markerPaneExists = !!markerPane;
    if (markerPane) {
      results.markerPaneHTML = markerPane.innerHTML?.substring(0, 500);
      results.markerPaneChildren = markerPane.children.length;
    }

    // 4. Check entire document for all marker-related elements
    const all = document.querySelectorAll('*');
    results.markerElements = Array.from(all)
      .filter(el => {
        const cn = typeof el.className === 'string' ? el.className : '';
        return cn.includes('marker') || cn.includes('marker-pane');
      })
      .map(el => ({
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        parent: el.parentElement?.className || 'no-parent',
      }));

    // 5. Check if marker wrapper divs exist
    results.markerWrapper = document.querySelectorAll('.maplibregl-marker').length;
    results.anyMarkerWrapper = Array.from(document.querySelectorAll('.maplibregl-marker'));

    // 6. Get the wrapper div from inside our truck marker
    const truckMarkers = document.querySelectorAll('[style*="cursor: pointer"]');
    results.truckMarkerCount = truckMarkers.length;
    if (truckMarkers.length > 0) {
      const first = truckMarkers[0];
      results.truckMarkerParent = first.parentElement?.className;
      results.truckMarkerGrandparent = first.parentElement?.parentElement?.className;
    }

    // 7. ALL elements in maplibregl-map (full tree)
    if (mapContainer) {
      results.allMapElements = [];
      const walk = (el, depth) => {
        if (depth > 5) return;
        const cn = typeof el.className === 'string' ? el.className : '';
        results.allMapElements.push(`${'  '.repeat(depth)}${el.tagName}.${cn.substring(0, 50)}`);
        Array.from(el.children).forEach(child => walk(child, depth + 1));
      };
      walk(mapContainer, 0);
    }

    return results;
  });

  console.log('\n=== DOM ANALYSIS ===');
  console.log('mapChildren:', JSON.stringify(domAnalysis.mapChildren));
  console.log('markerPaneExists:', domAnalysis.markerPaneExists, 'markerPaneChildren:', domAnalysis.markerPaneChildren);
  console.log('markerWrapperCount:', domAnalysis.markerWrapper);
  console.log('truckMarkerCount:', domAnalysis.truckMarkerCount);
  console.log('allMapElements:', domAnalysis.allMapElements?.join('\n'));
  console.log('\n=== MARKERS ON PAGE ===');
  console.log('maplibregl-marker elements:', markerCount);
  console.log('Full DOM analysis:', JSON.stringify(domAnalysis, null, 2));

  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'NO CANVAS';
    return `canvas: ${canvas.width}x${canvas.height}`;
  });
  console.log('Canvas:', canvasInfo);

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
