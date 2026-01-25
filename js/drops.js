// Sidebar toggle (matches your burger/scrim pattern)
    function toggleSidebar(force){
      const sidebar = document.getElementById('sidebar');
      const scrim = document.getElementById('scrim');
      const burger = document.getElementById('burger');

      const willOpen = (typeof force === 'boolean') ? force : !sidebar.classList.contains('open');

      sidebar.classList.toggle('open', willOpen);
      scrim.classList.toggle('show', willOpen);
      burger.classList.toggle('active', willOpen);
    }

    // ---- Drops: stubs for "choose artwork" (wire to library later)
    function chooseDropArtwork(){
      // Placeholder: fake selection
      const title = document.getElementById('dropName');
      document.getElementById('dropArtworkState').textContent = 'selected';
      document.getElementById('dropArtworkPreviewRow').style.display = 'flex';
      document.getElementById('dropArtworkName').textContent = 'Selected Artwork (stub)';
      document.getElementById('dropArtworkMeta').textContent = 'local · draft';
      // Optional: set a thumb if you have one
      // document.getElementById('dropArtworkThumb').src = './img/sample.jpg';
      if (!title.value) title.value = 'Selected Artwork · Drop';
      updateHealth();
    }

    function dropDryRun(){
      const payload = readDropForm();
      alert('Dry run (no schedule)\n\n' + JSON.stringify(payload, null, 2));
    }

    function readDropForm(){
      const checks = Array.from(document.querySelectorAll('#checks input[type="checkbox"]'));
      const ready = checks.filter(c => c.checked).length;

      return {
        artwork: document.getElementById('dropArtworkName')?.textContent || null,
        dropName: document.getElementById('dropName').value || null,
        collection: document.getElementById('dropCollection').value || null,
        dropType: document.getElementById('dropType').value,
        date: document.getElementById('dropDate').value || null,
        time: document.getElementById('dropTime').value || null,
        marketplace: document.getElementById('dropMarket').value,
        price: document.getElementById('dropPrice').value || null,
        edition: document.getElementById('dropEdition').value || '1',
        royalties: document.getElementById('dropRoyalties').value || '0',
        description: document.getElementById('dropDescription').value || null,
        captions: {
          x: document.getElementById('capX').value || null,
          ig: document.getElementById('capIG').value || null,
          bs: document.getElementById('capBS').value || null,
        },
        readiness: { done: ready, total: checks.length }
      };
    }

    function queueDrop(){
      const p = readDropForm();
      addDropItem(p);
      updateEmptyState();
      updateHealth();
      alert('Hook: POST /api/drops/queue\n\n' + JSON.stringify(p, null, 2));
    }

    function prettyType(t){
      if (t === '1of1') return '1/1';
      if (t === 'edition') return 'Edition';
      if (t === 'open') return 'Open Edition';
      return t || '—';
    }

    function statusFromReady(done, total){
      if (!total) return 'draft';
      if (done === total) return 'scheduled';
      if (done >= Math.ceil(total * 0.6)) return 'packing';
      return 'draft';
    }

    function addDropItem(p){
      const queue = document.getElementById('dropQueue');

      const dropName = (p.dropName || 'Untitled Drop').trim();
      const when = (p.date && p.time) ? `${p.date} ${p.time}` : 'unscheduled';
      const meta = `${statusFromReady(p.readiness.done, p.readiness.total)} · ${when} · ${p.marketplace} · ${p.price || '—'}`;

      const item = document.createElement('div');
      item.className = 'qItem';

      item.dataset.dropname = dropName;
      item.dataset.artwork = p.artwork || '—';
      item.dataset.when = when;
      item.dataset.market = p.marketplace || '—';
      item.dataset.price = p.price || '—';
      item.dataset.type = p.dropType || '—';
      item.dataset.edition = String(p.edition || '—');
      item.dataset.royalties = (p.royalties !== '' ? `${p.royalties}%` : '—');
      item.dataset.status = statusFromReady(p.readiness.done, p.readiness.total);
      item.dataset.desc = p.description || '—';
      item.dataset.ready = String(p.readiness.done || 0);
      item.dataset.readytotal = String(p.readiness.total || 0);

      const status = item.dataset.status;
      const pillClass = (status === 'scheduled') ? 'statusPill on' : 'statusPill';

      item.innerHTML = `
        <div class="qLeft">
          <div class="qTitle">${escapeHtml(dropName)}</div>
          <div class="qMeta">${escapeHtml(meta)}</div>
        </div>
        <div class="qRight">
          <div class="${pillClass}">${escapeHtml(status)}</div>
          <button class="iconBtn" type="button" onclick="openDropModal(this)" aria-label="Open drop details">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;

      queue.prepend(item);
    }

    function escapeHtml(str){
      return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'","&#039;");
    }

    let activeDropItem = null;

    function openDropModal(btn){
      const item = btn.closest('.qItem');
      if (!item) return;
      activeDropItem = item;

      const name = item.dataset.dropname || '—';
      const meta = `${item.dataset.status || '—'} · ${item.dataset.when || '—'} · ${item.dataset.market || '—'} · ${item.dataset.price || '—'}`;

      document.getElementById('dTitle').textContent = name;
      document.getElementById('dMeta').textContent = meta;

      document.getElementById('dWhen').textContent = item.dataset.when || '—';
      document.getElementById('dMarket').textContent = item.dataset.market || '—';
      document.getElementById('dType').textContent = prettyType(item.dataset.type);
      document.getElementById('dEdition').textContent = item.dataset.edition || '—';
      document.getElementById('dRoyalties').textContent = item.dataset.royalties || '—';
      document.getElementById('dPrice').textContent = item.dataset.price || '—';
      document.getElementById('dDesc').textContent = item.dataset.desc || '—';

      const done = Number(item.dataset.ready || 0);
      const total = Number(item.dataset.readytotal || 0);
      document.getElementById('dReady').textContent = total ? `${done}/${total}` : '—';

      // status styling
      const statusEl = document.getElementById('dStatus');
      const status = (item.dataset.status || '').toLowerCase();
      statusEl.textContent = status || '—';
      statusEl.classList.remove('scheduled','packing','draft');
      if (status) statusEl.classList.add(status);

      const statusBox = document.getElementById('dStatusBox');
      statusBox.classList.toggle('is-ready', status === 'scheduled');

      const modal = document.getElementById('dropModal');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }

    function closeDropModal(){
      const modal = document.getElementById('dropModal');
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      activeDropItem = null;
    }

    function removeActiveDrop(){
      if (!activeDropItem) return;
      activeDropItem.remove();
      closeDropModal();
      updateEmptyState();
      updateHealth();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropModal();
    });

    function updateEmptyState(){
      const queue = document.getElementById('dropQueue');
      const empty = document.getElementById('dropEmpty');
      const count = queue.querySelectorAll('.qItem').length;
      empty.hidden = (count !== 0);
    }

    // Health: show nearest scheduled item + readiness average
    function updateHealth(){
      const items = Array.from(document.querySelectorAll('#dropQueue .qItem'));
      const scheduled = items
        .filter(i => (i.dataset.status || '').toLowerCase() === 'scheduled' && (i.dataset.when || '') !== 'unscheduled')
        .sort((a,b) => (a.dataset.when || '').localeCompare(b.dataset.when || ''));

      if (scheduled.length){
        document.getElementById('hNext').textContent = scheduled[0].dataset.dropname || '—';
        document.getElementById('hNextMeta').textContent = `${scheduled[0].dataset.when} · ${scheduled[0].dataset.market} · ${scheduled[0].dataset.price}`;
      } else {
        document.getElementById('hNext').textContent = '—';
        document.getElementById('hNextMeta').textContent = 'No scheduled drops';
      }

      let doneSum = 0, totalSum = 0;
      items.forEach(i => {
        doneSum += Number(i.dataset.ready || 0);
        totalSum += Number(i.dataset.readytotal || 0);
      });

      const pct = totalSum ? Math.round((doneSum / totalSum) * 100) : 0;
      document.getElementById('hReady').textContent = pct + '%';
      document.getElementById('hFill').style.width = pct + '%';
      document.getElementById('hReadyMeta').textContent = items.length ? `${items.length} drop(s) tracked` : 'Nothing queued';

      const platforms = new Set(items.map(i => i.dataset.market).filter(Boolean));
      document.getElementById('hPlatforms').textContent = platforms.size ? Array.from(platforms).join(' · ') : '—';
    }

    // init
    updateEmptyState();
    updateHealth();