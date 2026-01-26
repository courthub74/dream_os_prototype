function toggleSidebar(force){
      const sidebar = document.getElementById('sidebar');
      const scrim = document.getElementById('scrim');
      const burger = document.getElementById('burger');

      const willOpen = (typeof force === 'boolean') ? force : !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', willOpen);
      scrim.classList.toggle('show', willOpen);
      burger.classList.toggle('active', willOpen);
    }

    // file state pill
    (function wireFileState(){
      const input = document.getElementById('siteImage');
      const state = document.getElementById('siteImageState');
      if (!input || !state) return;
      input.addEventListener('change', () => {
        const f = input.files && input.files[0];
        state.textContent = f ? f.name : 'none selected';
      });
    })();

    function previewWebsiteUpdate(){
      const page = document.getElementById('sitePage').value;
      const block = document.getElementById('siteBlock').value;
      const file = document.getElementById('siteImage').files?.[0];
      const mode = document.getElementById('publishMode').value;

      document.getElementById('prevTarget').textContent = `${page} · ${block}`;
      document.getElementById('prevAsset').textContent = file ? file.name : 'no asset';
      document.getElementById('previewState').textContent = mode;

      alert('Stub preview updated');
    }

    function queueWebsiteUpdate(){
      const queue = document.getElementById('websiteQueue');
      if (!queue) return;

      const page = document.getElementById('sitePage').value;
      const block = document.getElementById('siteBlock').value;
      const mode = document.getElementById('publishMode').value;
      const status = mode === 'queue' ? 'pending' : 'draft';

      const item = document.createElement('div');
      item.className = 'qItem';

      item.dataset.title = 'Website update';
      item.dataset.meta = `${page} · ${block} · ${mode}`;
      item.dataset.status = status;
      item.dataset.page = page;
      item.dataset.block = block;
      item.dataset.mode = mode;
      item.dataset.notes = (document.getElementById('siteBody').value || '—').slice(0, 160);

      item.innerHTML = `
        <div class="qLeft">
          <div class="qTitle">${escapeHtml(item.dataset.title)}</div>
          <div class="qMeta">${escapeHtml(item.dataset.meta)}</div>
        </div>
        <div class="qRight">
          <div class="statusPill">${escapeHtml(item.dataset.status)}</div>
          <button class="iconBtn" type="button" onclick="openWebsiteModal(this)" aria-label="Open details">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;

      queue.prepend(item);
      alert('Hook: POST /api/site/queue');
    }

    function openWebsiteModal(btn){
      const item = btn.closest('.qItem');
      if (!item) return;

      document.getElementById('wTitle').textContent = item.dataset.title || item.querySelector('.qTitle')?.textContent?.trim() || '—';
      document.getElementById('wMeta').textContent  = item.dataset.meta  || item.querySelector('.qMeta')?.textContent?.trim()  || '—';

      document.getElementById('wPage').textContent = item.dataset.page || '—';
      document.getElementById('wBlock').textContent = item.dataset.block || '—';
      document.getElementById('wMode').textContent = item.dataset.mode || '—';
      document.getElementById('wNotes').textContent = item.dataset.notes || '—';

      const statusEl = document.getElementById('wStatus');
      const status = (item.dataset.status || '').toLowerCase();
      statusEl.textContent = status || '—';
      statusEl.classList.remove('ready','pending','draft');
      if (status) statusEl.classList.add(status);

      const statusBox = document.getElementById('wStatusBox');
      statusBox.classList.toggle('is-ready', status === 'ready');

      const modal = document.getElementById('websiteModal');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }

    function closeWebsiteModal(){
      const modal = document.getElementById('websiteModal');
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeWebsiteModal();
    });

    function escapeHtml(str){
      return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'","&#039;");
    }