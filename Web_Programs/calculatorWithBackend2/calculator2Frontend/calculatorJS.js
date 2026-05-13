/**
     * ─────────────────────────────────────────────────────────────
     *  CALCULATOR STATE
     * ─────────────────────────────────────────────────────────────
     * We build an expression string and ship it to the Django API.
     * JavaScript does ZERO arithmetic — just string/UI management.
     */

    // ── CONFIG ──────────────────────────────────────────────────────
    // Point this to your Django server. During local development this
    // is typically http://127.0.0.1:8000 or http://localhost:8000.
    // In production replace with your deployed domain.
    const API_URL = 'http://127.0.0.1:8000/api/calculate/';

    // ── STATE ────────────────────────────────────────────────────────
    let currentInput  = '';   // number being typed
    let operator      = '';   // pending operator (+, -, *, /)
    let previousInput = '';   // left-hand operand
    let justCalculated = false; // did we just get a result?

    // ── DOM REFS ─────────────────────────────────────────────────────
    const resultEl   = document.getElementById('result');
    const expressEl  = document.getElementById('expression');
    const loaderBar  = document.getElementById('loaderBar');
    const statusBadge = document.getElementById('statusBadge');
    const btnGrid    = document.getElementById('btnGrid');
    const allBtns    = () => btnGrid.querySelectorAll('.btn');

    // ── DISPLAY HELPERS ──────────────────────────────────────────────
    function setResult(val, state = '') {
      resultEl.textContent = val;
      resultEl.className   = 'result ' + state;
    }

    function setExpression(val) {
      expressEl.textContent = val;
    }

    function showStatus(text, type) {          // type: waiting | done | err
      statusBadge.textContent = text;
      statusBadge.className   = `status-badge show ${type}`;
      if (type !== 'waiting')
        setTimeout(() => statusBadge.className = 'status-badge', 2000);
    }

    function hideStatus() {
      statusBadge.className = 'status-badge';
    }

    // ── LOADER BAR ───────────────────────────────────────────────────
    let loaderInterval;
    function startLoader() {
      let pct = 0;
      loaderBar.style.width = '0%';
      loaderBar.classList.add('active');
      loaderInterval = setInterval(() => {
        // Crawls to 90%, then stalls — real completion snaps it to 100%
        pct = pct < 90 ? pct + (90 - pct) * 0.08 : pct;
        loaderBar.style.width = pct + '%';
      }, 50);
    }
    function stopLoader() {
      clearInterval(loaderInterval);
      loaderBar.style.width = '100%';
      setTimeout(() => {
        loaderBar.classList.remove('active');
        loaderBar.style.width = '0%';
      }, 300);
    }

    // ── LOCK / UNLOCK BUTTONS ────────────────────────────────────────
    function lockButtons()   { allBtns().forEach(b => b.disabled = true); }
    function unlockButtons() { allBtns().forEach(b => b.disabled = false); }

    // ── API CALL ─────────────────────────────────────────────────────
    /**
     * Sends { expression } to Django. Django evaluates it with Python's
     * decimal arithmetic and returns { result } or { error }.
     *
     * We include credentials: 'include' so Django session cookies are
     * sent (needed if you add Django auth later). CORS is handled on
     * the Django side with django-cors-headers.
     */
    async function calculate(expression) {
      lockButtons();
      startLoader();
      setResult('…', 'loading pulsing');
      showStatus('⏳ Calculating…', 'waiting');

      try {
        const response = await fetch(API_URL, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            // The Django view uses csrf_exempt for the API endpoint,
            // so we don't need the CSRF token here. If you remove
            // csrf_exempt, fetch it via a /api/csrf/ endpoint first.
          },
          body: JSON.stringify({ expression }),
        });

        if (!response.ok) {
          // HTTP-level error (404, 500 etc.)
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          setResult(data.error, 'error');
          showStatus('✗ Error', 'err');
          setExpression(expression);
        } else {
          setResult(data.result, 'success');
          showStatus('✓ Done', 'done');
          setExpression(expression + ' =');
          // Store result so next number starts fresh
          currentInput   = String(data.result);
          previousInput  = '';
          operator       = '';
          justCalculated = true;
        }

      } catch (err) {
        // Network error or JSON parse failure
        setResult('Network Error', 'error');
        showStatus('✗ Network', 'err');
        setExpression(expression);
        console.error('[Calculator] Fetch error:', err);
      } finally {
        stopLoader();
        unlockButtons();
      }
    }

    // ── BUTTON ACTIONS ───────────────────────────────────────────────
    function handleNumber(val) {
      if (justCalculated) {
        // Start fresh after a result
        currentInput   = val;
        justCalculated = false;
        operator       = '';
        previousInput  = '';
      } else {
        currentInput = currentInput === '0' ? val : currentInput + val;
      }
      setResult(currentInput);
      hideStatus();
    }

    function handleOperator(op) {
      justCalculated = false;
      if (currentInput === '' && previousInput === '') return;

      // Chained operator: user presses 3 + 4 * — calculate 3+4 first
      if (currentInput !== '' && previousInput !== '' && operator !== '') {
        const expr = `${previousInput}${operator}${currentInput}`;
        previousInput = ''; // will be updated after async call
        // We just update display expression; full chain goes to =
      }

      previousInput = currentInput !== '' ? currentInput : previousInput;
      operator      = op;
      currentInput  = '';

      const opSymbols = { '+':'+', '-':'−', '*':'×', '/':'÷' };
      setExpression(`${previousInput} ${opSymbols[op] || op}`);
      hideStatus();
    }

    function handleEquals() {
      if (previousInput === '' || currentInput === '' || operator === '') return;
      const expr = `${previousInput}${operator}${currentInput}`;
      setExpression(`${previousInput} ${({'+'  :'+','-':'−','*':'×','/':'÷'}[operator])} ${currentInput}`);
      calculate(expr);
    }

    function handleClear() {
      currentInput   = '';
      operator       = '';
      previousInput  = '';
      justCalculated = false;
      setResult('0');
      setExpression('');
      hideStatus();
    }

    function handleSign() {
      if (!currentInput) return;
      currentInput = String(parseFloat(currentInput) * -1);
      setResult(currentInput);
    }

    function handlePercent() {
      if (!currentInput) return;
      // Send percentage to backend as division by 100
      const expr = `${currentInput}/100`;
      calculate(expr);
    }

    function handleDecimal() {
      if (justCalculated) { currentInput = '0'; justCalculated = false; }
      if (currentInput.includes('.')) return;
      currentInput = (currentInput || '0') + '.';
      setResult(currentInput);
    }

    // ── EVENT DELEGATION ─────────────────────────────────────────────
    btnGrid.addEventListener('click', e => {
      const btn    = e.target.closest('.btn');
      if (!btn || btn.disabled) return;
      const action = btn.dataset.action;

      switch (action) {
        case 'num':     handleNumber(btn.dataset.val);  break;
        case 'op':      handleOperator(btn.dataset.op); break;
        case 'equals':  handleEquals();                  break;
        case 'clear':   handleClear();                   break;
        case 'sign':    handleSign();                    break;
        case 'percent': handlePercent();                 break;
        case 'decimal': handleDecimal();                 break;
      }
    });

    // ── KEYBOARD SUPPORT ─────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      else if (e.key === '+')  handleOperator('+');
      else if (e.key === '-')  handleOperator('-');
      else if (e.key === '*')  handleOperator('*');
      else if (e.key === '/')  { e.preventDefault(); handleOperator('/'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Escape' || e.key === 'c') handleClear();
      else if (e.key === '.')  handleDecimal();
      else if (e.key === '%')  handlePercent();
    });