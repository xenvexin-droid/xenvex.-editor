(function(){
    // Theme control module - provides a floating panel to adjust --primary/--accent/--secondary
    // and simple animation helpers. Saves theme to localStorage ('xenvex_theme') and can
    // watch editor page theme via localStorage key 'xenvex_editor_theme'.

    const DEFAULTS = { primary: '#6366f1', accent: '#f0abfc', secondary: '#60a5fa', animated: true };
    let state = Object.assign({}, DEFAULTS);
    let watchingEditor = false;
    let editorPollId = null;

    // inject styles
    const css = `
    .theme-btn { position: fixed; right: 18px; bottom: 18px; z-index: 9999; background: var(--primary); color: white; border: none; padding: 10px 14px; border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.35); cursor: pointer; display:flex;align-items:center;gap:8px;font-weight:700; }
    .theme-panel { position: fixed; right: 18px; bottom: 72px; z-index: 9999; width: 280px; max-width: calc(100vw - 40px); background: rgba(13,18,30,0.9); border-radius: 12px; color: var(--light); padding: 12px; box-shadow: 0 12px 36px rgba(0,0,0,0.5); transform-origin: bottom right; transition: transform .24s cubic-bezier(.2,.9,.3,1), opacity .18s; opacity:0; transform: translateY(12px) scale(.98); pointer-events:none; }
    .theme-panel.open { opacity:1; transform: translateY(0) scale(1); pointer-events:auto; }
    .theme-panel h4{ margin:0 0 8px 0;font-size:0.95rem }
    .theme-row{ display:flex;gap:8px;align-items:center;margin-bottom:8px }
    .theme-row input[type=color]{ width:46px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);padding:0 }
    .theme-row label{ flex:1;font-size:0.92rem }
    .theme-row .small{font-size:0.82rem;color:var(--gray)}
    .theme-actions{display:flex;gap:8px;margin-top:10px}
    .theme-actions button{flex:1;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--light);cursor:pointer}
    .theme-panel .toggle{display:flex;gap:8px;align-items:center}
    .theme-note{font-size:0.82rem;color:var(--gray);margin-top:8px}

    /* subtle entrance for tool cards when theme changes */
    .theme-animated .tool-card{ transition: transform .28s cubic-bezier(.2,.9,.3,1), box-shadow .32s; }
    `;
    const style = document.createElement('style'); style.id = 'theme-module-styles'; style.textContent = css; document.head.appendChild(style);

    // helpers
    function save() { localStorage.setItem('xenvex_theme', JSON.stringify(state)); }
    function load() { try{ const s = JSON.parse(localStorage.getItem('xenvex_theme')); if (s) Object.assign(state, s); }catch(e){} }
    function applyTheme(s){ const r = document.documentElement.style; if (s.primary) r.setProperty('--primary', s.primary); if (s.accent) r.setProperty('--accent', s.accent); if (s.secondary) r.setProperty('--secondary', s.secondary); if (s.animated !== undefined) toggleAnimated(s.animated); }
    function toggleAnimated(val){ if(val){ document.documentElement.classList.add('theme-animated'); } else { document.documentElement.classList.remove('theme-animated'); } }

    // build UI
    const btn = document.createElement('button'); btn.className = 'theme-btn'; btn.title = 'Theme'; btn.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--accent)"></span>Theme';
    const panel = document.createElement('div'); panel.className = 'theme-panel'; panel.innerHTML = `
        <h4>Theme & Animations</h4>
        <div class="theme-row"><label>Primary</label><input id="theme_primary" type="color"></div>
        <div class="theme-row"><label>Accent</label><input id="theme_accent" type="color"></div>
        <div class="theme-row"><label>Secondary</label><input id="theme_secondary" type="color"></div>
        <div class="theme-row toggle"><input id="theme_animated" type="checkbox"><label class="small">Enable smooth animations</label></div>
        <div class="theme-row toggle"><input id="theme_watch" type="checkbox"><label class="small">Watch editor colors (sync)</label></div>
        <div class="theme-actions"><button id="theme_reset">Reset</button><button id="theme_close">Close</button></div>
        <div class="theme-note">Tip: Use the editor to set colors and enable "Watch" to sync automatically.</div>
    `;

    document.body.appendChild(panel); document.body.appendChild(btn);

    const primaryInput = panel.querySelector('#theme_primary');
    const accentInput = panel.querySelector('#theme_accent');
    const secondaryInput = panel.querySelector('#theme_secondary');
    const animatedInput = panel.querySelector('#theme_animated');
    const watchInput = panel.querySelector('#theme_watch');
    const resetBtn = panel.querySelector('#theme_reset');
    const closeBtn = panel.querySelector('#theme_close');

    function initUI(){ load(); applyTheme(state); primaryInput.value = state.primary; accentInput.value = state.accent; secondaryInput.value = state.secondary; animatedInput.checked = !!state.animated; watchInput.checked = !!watchingEditor; }

    function updateFromInputs(){ state.primary = primaryInput.value; state.accent = accentInput.value; state.secondary = secondaryInput.value; state.animated = animatedInput.checked; applyTheme(state); save(); flashPanel(); }

    function flashPanel(){ panel.classList.add('open'); setTimeout(()=> panel.classList.remove('open'), 400); }

    btn.addEventListener('click', () => { panel.classList.toggle('open'); primaryInput.focus(); });
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    [primaryInput, accentInput, secondaryInput].forEach(inp => inp.addEventListener('input', updateFromInputs));
    animatedInput.addEventListener('change', () => { state.animated = animatedInput.checked; toggleAnimated(state.animated); save(); });

    resetBtn.addEventListener('click', () => { state = Object.assign({}, DEFAULTS); applyTheme(state); initUI(); save(); });

    // Watch editor colors sync
    function startWatchingEditor(){ if (editorPollId) return; watchingEditor = true; watchInput.checked = true; editorPollId = setInterval(()=>{
            try {
                const raw = localStorage.getItem('xenvex_editor_theme');
                if (!raw) return;
                const eo = JSON.parse(raw);
                if (!eo) return;
                if (eo.primary && eo.primary !== state.primary){ state.primary = eo.primary; primaryInput.value = eo.primary; applyTheme(state); save(); }
                if (eo.accent && eo.accent !== state.accent){ state.accent = eo.accent; accentInput.value = eo.accent; applyTheme(state); save(); }
                if (eo.secondary && eo.secondary !== state.secondary){ state.secondary = eo.secondary; secondaryInput.value = eo.secondary; applyTheme(state); save(); }
            } catch(e){}
        }, 800); }
    function stopWatchingEditor(){ if (!editorPollId) return; watchingEditor = false; watchInput.checked = false; clearInterval(editorPollId); editorPollId = null; }
    watchInput.addEventListener('change', (e)=>{ if (e.target.checked) startWatchingEditor(); else stopWatchingEditor(); });

    // respond to storage events (cross-tab)
    window.addEventListener('storage', (e)=>{ if (e.key === 'xenvex_editor_theme' && watchingEditor && e.newValue){ try{ const eo = JSON.parse(e.newValue); if (eo.primary) { state.primary = eo.primary; primaryInput.value = eo.primary; } if (eo.accent) { state.accent = eo.accent; accentInput.value = eo.accent; } if (eo.secondary) { state.secondary = eo.secondary; secondaryInput.value = eo.secondary; } applyTheme(state); save(); }catch(e){} } });

    // small entrance animation trigger for tool cards
    function animateToolCards(){ const cards = document.querySelectorAll('.tool-card'); cards.forEach((c, i)=>{ c.style.transitionDelay = (i*20)+'ms'; c.style.transform = 'translateY(8px)'; c.style.opacity = '0'; setTimeout(()=>{ c.style.transform = ''; c.style.opacity='1'; }, 80 + i*20); setTimeout(()=>{ c.style.transitionDelay = ''; }, 700); }); }

    // init on DOM ready
    document.addEventListener('DOMContentLoaded', () => { initUI(); if (state.animated) toggleAnimated(true); setTimeout(()=> animateToolCards(), 120); });

})();