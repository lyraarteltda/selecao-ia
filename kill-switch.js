/**
 * Kill Switch — reads the tools_enabled flag from the n8n verify-membership
 * webhook (which the backend returns on every call). If disabled, shows a
 * branded maintenance message and blocks the app. Load BEFORE membership-gate.js.
 *
 * The flag lives in Supabase app_config, but only n8n ever reads it — the
 * browser sees only the webhook response. To toggle:
 *   UPDATE app_config SET value='false' WHERE key='tools_enabled';  -- disable
 *   UPDATE app_config SET value='true'  WHERE key='tools_enabled';  -- enable
 */
const KillSwitch = (function() {
  const CHECK_INTERVAL = 5 * 60 * 1000; // re-check every 5 minutes
  let _isEnabled = true;
  let _checkTimer = null;

  async function checkStatus() {
    try {
      const base = (window.APP_CONFIG && window.APP_CONFIG.n8nWebhookBase) || '';
      const resp = await fetch(base + '/verify-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      const data = await resp.json();

      _isEnabled = data.tools_enabled !== false;

      if (!_isEnabled) {
        showMaintenancePage();
      }

      return _isEnabled;
    } catch {
      return true;
    }
  }

  function showMaintenancePage() {
    document.querySelectorAll('.screen').forEach(function(s) {
      s.classList.remove('active');
      s.style.display = 'none';
    });

    let overlay = document.getElementById('killswitch-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'killswitch-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#eef0ea;';
    overlay.innerHTML = '<div style="text-align:center;max-width:480px;padding:32px;">' +
      '<div style="font-size:48px;margin-bottom:24px;">🔧</div>' +
      '<h1 style="font-size:28px;font-weight:800;margin-bottom:16px;color:#10203a;text-transform:uppercase;font-family:\'Big Shoulders Display\',Impact,sans-serif;letter-spacing:.02em;">Em Manutenção</h1>' +
      '<p style="color:#44526a;font-size:16px;line-height:1.6;margin-bottom:24px;">Estamos realizando melhorias nesta ferramenta. Ela estará de volta em breve.</p>' +
      '<div style="display:inline-block;background:#10203a;color:#ffffff;padding:8px 20px;border-radius:100px;font-size:13px;font-weight:600;border:1px solid #10203a;">Maestros da IA</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function startPeriodicCheck() {
    if (_checkTimer) clearInterval(_checkTimer);
    _checkTimer = setInterval(checkStatus, CHECK_INTERVAL);
  }

  async function init() {
    const enabled = await checkStatus();
    if (enabled) {
      startPeriodicCheck();
    }
    return enabled;
  }

  return {
    init: init,
    checkStatus: checkStatus,
    isEnabled: function() { return _isEnabled; }
  };
})();

window.KillSwitch = KillSwitch;
