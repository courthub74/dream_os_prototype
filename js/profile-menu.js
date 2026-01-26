
  // Account menu logic
  document.addEventListener('DOMContentLoaded', () => { 
      const accountFooter = document.querySelector('.account-footer');
      const accountBtn = accountFooter.querySelector('#accountBtn');
      const accountMenu = accountFooter.querySelector('#accountMenu');

      function closeAccountMenu(){
        accountMenu.classList.remove('show');
        accountBtn.setAttribute('aria-expanded', 'false');
      }

      accountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = accountMenu.classList.toggle('show');
        accountBtn.setAttribute('aria-expanded', String(isOpen));
      });

      accountMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('[data-go]');
        if (!btn) return;
        closeAccountMenu();
        window.location.href = btn.dataset.go;
      });

      document.addEventListener('click', (e) => {
        if (!accountMenu.classList.contains('show')) return;
        if (accountFooter.contains(e.target)) return;
        closeAccountMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAccountMenu();
      });


      // escape closes
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAccountMenu();
      });

      // menu navigation
      accountMenu?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-go]');
        if(!btn) return;
        closeAccountMenu();
        window.location.href = btn.dataset.go;
      });
  });
