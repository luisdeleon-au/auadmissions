/* AU IT Advisor — chat dock controller.
 * Drives the slide-out chat panel embedded in auit.html.
 * Conversation history lives in this module only; the server is stateless. */
(function () {
    'use strict';

    const launcherEl = document.getElementById('chat-launcher');
    const backdropEl = document.getElementById('chat-backdrop');
    const panelEl    = document.getElementById('chat-panel');
    const messagesEl = document.getElementById('chat-messages');
    const typingEl   = document.getElementById('chat-typing');
    const formEl     = document.getElementById('chat-form');
    const textareaEl = document.getElementById('chat-textarea');
    const sendBtn    = document.getElementById('chat-send');
    const resetBtn   = document.getElementById('chat-reset');
    const closeBtn   = document.getElementById('chat-close');

    let history = [];
    let isSending = false;
    let isOpen = false;

    if (window.marked) {
        marked.setOptions({ breaks: true, gfm: true });
    }

    /* ── helpers ──────────────────────────────────────────── */

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderMarkdown(text) {
        if (window.marked) return marked.parse(text);
        return '<p>' + escapeHtml(text).replace(/\n/g, '<br>') + '</p>';
    }

    function currentLangPack() {
        // T and currentLang are declared with const/let in auit.html's inline
        // script — they're top-level lexical bindings, not properties of window.
        // Read them as bare identifiers, guarding against load-order surprises.
        try {
            const lang = (typeof currentLang !== 'undefined' && currentLang) || 'en';
            return (typeof T !== 'undefined' && T[lang]) || {};
        } catch (e) { return {}; }
    }

    function appendMessage(role, content, opts = {}) {
        const wrap = document.createElement('div');
        wrap.className = 'chat-msg ' + role + (opts.error ? ' error' : '');
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (role === 'assistant') {
            bubble.innerHTML = renderMarkdown(content);
        } else {
            bubble.innerHTML = '<p>' + escapeHtml(content).replace(/\n/g, '<br>') + '</p>';
        }
        wrap.appendChild(bubble);
        messagesEl.appendChild(wrap);
        scrollToBottom();
        return bubble;
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setLoading(loading) {
        isSending = loading;
        sendBtn.disabled = loading;
        sendBtn.classList.toggle('is-loading', loading);
        typingEl.classList.toggle('hidden', !loading);
        if (loading) scrollToBottom();
    }

    /* ── open / close ─────────────────────────────────────── */

    function open() {
        if (isOpen) return;
        isOpen = true;
        panelEl.classList.add('open');
        backdropEl.classList.add('open');
        panelEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('chat-open');
        setTimeout(() => textareaEl.focus(), 220);
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        panelEl.classList.remove('open');
        backdropEl.classList.remove('open');
        panelEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('chat-open');
    }

    /* ── send / reset ─────────────────────────────────────── */

    async function sendMessage(text) {
        if (!text || isSending) return;

        appendMessage('user', text);
        history.push({ role: 'user', content: text });
        setLoading(true);

        try {
            const resp = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: history.slice(0, -1)
                })
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || data.error) {
                const t = currentLangPack();
                const generic = t.chat_err_generic || '**Sorry — something went wrong.**';
                const detail = data.error || ('Request failed (' + resp.status + ').');
                appendMessage('assistant', generic + '\n\n' + detail, { error: true });
                history.pop();
                return;
            }

            const reply = data.response || '(no response)';
            appendMessage('assistant', reply);
            history.push({ role: 'assistant', content: reply });
        } catch (err) {
            const t = currentLangPack();
            appendMessage(
                'assistant',
                t.chat_err_network || '**Network error.** Could not reach the server.',
                { error: true }
            );
            history.pop();
        } finally {
            setLoading(false);
            textareaEl.focus();
        }
    }

    async function resetConversation() {
        if (isSending) return;
        try { await fetch('/reset', { method: 'POST' }); }
        catch (e) { /* non-fatal */ }
        history = [];
        messagesEl.innerHTML = '';
        const t = currentLangPack();
        appendMessage(
            'assistant',
            t.chat_cleared || '**Conversation cleared.**'
        );
    }

    /* ── wiring ───────────────────────────────────────────── */

    textareaEl.addEventListener('input', () => {
        textareaEl.style.height = 'auto';
        textareaEl.style.height = Math.min(textareaEl.scrollHeight, 180) + 'px';
    });

    textareaEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formEl.requestSubmit();
        }
    });

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = textareaEl.value.trim();
        if (!text) return;
        textareaEl.value = '';
        textareaEl.style.height = 'auto';
        sendMessage(text);
    });

    resetBtn.addEventListener('click', resetConversation);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) close();
    });

    /* React to the page-level language toggle (auit.html) */
    window.addEventListener('au:langchanged', (e) => {
        const t = (e.detail && e.detail.t) || {};
        if (t.chat_placeholder) textareaEl.placeholder = t.chat_placeholder;
    });

    /* Set initial placeholder from whichever lang pack is loaded */
    window.addEventListener('DOMContentLoaded', () => {
        const t = currentLangPack();
        if (t.chat_placeholder) textareaEl.placeholder = t.chat_placeholder;
    });

    /* Public API */
    window.AUChat = { open, close, reset: resetConversation };
})();
