(() => {
  let selected = null;
  try { selected = localStorage.getItem('schoolnaam-theme'); } catch {}
  if (selected === 'light' || selected === 'dark') document.documentElement.dataset.theme = selected;
  const preferred = matchMedia('(prefers-color-scheme: dark)');
  function update() {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && preferred.matches);
    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.setAttribute('aria-label', dark ? 'Licht thema inschakelen' : 'Donker thema inschakelen');
      button.setAttribute('title', dark ? 'Licht thema' : 'Donker thema');
      button.innerHTML = dark ? '<span aria-hidden="true">☀</span>' : '<span aria-hidden="true">◐</span>';
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    update();
    document.querySelector('#theme-toggle')?.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && preferred.matches);
      const value = dark ? 'light' : 'dark';
      document.documentElement.dataset.theme = value;
      try { localStorage.setItem('schoolnaam-theme', value); } catch {}
      update();
    });
    preferred.addEventListener('change', update);
  });
})();
