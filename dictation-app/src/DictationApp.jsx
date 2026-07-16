import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Volume2, RotateCcw, Settings2, Download, Upload, Check, X, Wifi, WifiOff, Sparkles } from "lucide-react";

// ---------- Word banks (British spelling) ----------
const WORD_BANKS = {
  Beginner: [
    { word: "necessary", hint: "It is ___ to check your work before submitting it." },
    { word: "separate", hint: "Please keep the invoices ___ from the receipts." },
    { word: "definitely", hint: "I will ___ finish the report by Friday." },
    { word: "believe", hint: "I ___ the meeting was moved to Tuesday." },
    { word: "February", hint: "The school term begins in ___." },
    { word: "beautiful", hint: "The garden looked ___ after the rain." },
    { word: "favourite", hint: "Jollof rice is my ___ meal." },
    { word: "colour", hint: "Choose a ___ for the cover page." },
    { word: "neighbour", hint: "My ___ waved from across the street." },
    { word: "centre", hint: "The market is in the ___ of town." },
    { word: "travelling", hint: "She is ___ to Lagos next week." },
    { word: "jewellery", hint: "The shop sells handmade ___." },
    { word: "programme", hint: "The church ___ starts at nine." },
    { word: "cheque", hint: "He paid the school fees by ___." },
    { word: "biscuit", hint: "She dipped the ___ in her tea." },
  ],
  Intermediate: [
    { word: "accommodate", hint: "The hall can ___ two hundred guests." },
    { word: "occurrence", hint: "A power cut is a common ___ here." },
    { word: "embarrassed", hint: "He felt ___ after forgetting her name." },
    { word: "rhythm", hint: "The drummer kept a steady ___." },
    { word: "government", hint: "The ___ announced a new policy." },
    { word: "restaurant", hint: "We booked a table at the ___." },
    { word: "organise", hint: "Please ___ the files by date." },
    { word: "realise", hint: "I didn't ___ the time until it was late." },
    { word: "licence", hint: "You need a ___ to drive that lorry." },
    { word: "practise", hint: "You must ___ your spelling every day." },
    { word: "aluminium", hint: "The roof is made of ___ sheeting." },
    { word: "parliament", hint: "The bill was debated in ___." },
    { word: "questionnaire", hint: "Fill in the ___ before you leave." },
    { word: "millennium", hint: "The building was completed at the turn of the ___." },
    { word: "liaise", hint: "Please ___ with the accounts team." },
  ],
  Advanced: [
    { word: "bureaucracy", hint: "Registering the business meant wading through ___." },
    { word: "surveillance", hint: "The shop installed new ___ cameras." },
    { word: "idiosyncrasy", hint: "Forgetting names is just one of his ___." },
    { word: "ophthalmology", hint: "She is training in ___ at the teaching hospital." },
    { word: "conscientious", hint: "He is a ___ worker who checks every ledger entry." },
    { word: "entrepreneur", hint: "The young ___ launched her app last year." },
    { word: "connoisseur", hint: "He is a ___ of fine Nigerian textiles." },
    { word: "silhouette", hint: "Her ___ appeared against the setting sun." },
    { word: "chrysanthemum", hint: "The ___ bloomed early this year." },
    { word: "unnecessarily", hint: "Don't complicate the report ___." },
    { word: "pronunciation", hint: "His ___ of the Yoruba word was perfect." },
    { word: "mischievous", hint: "The pupils gave a ___ grin." },
    { word: "threshold", hint: "Sales crossed the profit ___ this quarter." },
    { word: "indict", hint: "The court chose not to ___ the suspect." },
  ],
  Expert: [
    { word: "chiaroscuro", hint: "The painter used ___ to dramatic effect." },
    { word: "synecdoche", hint: "Calling the whole car a 'set of wheels' is ___." },
    { word: "onomatopoeia", hint: "'Buzz' and 'clang' are examples of ___." },
    { word: "sesquipedalian", hint: "His ___ vocabulary impressed the examiners." },
    { word: "antediluvian", hint: "That accounting method feels almost ___." },
    { word: "perspicacious", hint: "Her ___ comment settled the whole debate." },
    { word: "sycophantic", hint: "The intern's ___ praise fooled no one." },
    { word: "vicissitude", hint: "Every founder faces the ___ of business life." },
    { word: "ubiquitous", hint: "Mobile money is now ___ across the country." },
    { word: "ephemeral", hint: "The joy of a good sale can feel ___." },
    { word: "pusillanimous", hint: "It would be ___ to avoid the difficult call." },
    { word: "obfuscate", hint: "Don't let jargon ___ the real numbers." },
    { word: "cacophony", hint: "The market was a ___ of voices and horns." },
    { word: "autochthonous", hint: "The plant is ___ to that region." },
  ],
  "Spelling Bee": [
    { word: "scherenschnitte", hint: "The paper-cutting art of ___ takes a steady hand." },
    { word: "xanthophyll", hint: "___ gives autumn leaves their yellow tint." },
    { word: "chthonic", hint: "The myth describes ___ spirits beneath the earth." },
    { word: "eleemosynary", hint: "The trust exists for ___ purposes." },
    { word: "sesquicentennial", hint: "The school marked its ___ with a grand ceremony." },
    { word: "zeitgeist", hint: "The song captured the ___ of the decade." },
    { word: "apotheosis", hint: "The final report was the ___ of months of work." },
    { word: "rarefy", hint: "Mountain air begins to ___ at altitude." },
    { word: "desiccate", hint: "The sun will ___ the maize if left too long." },
    { word: "minuscule", hint: "The error was ___ but still worth fixing." },
    { word: "liquefy", hint: "The metal will ___ once it reaches that heat." },
    { word: "peregrination", hint: "His ___ across three states took a month." },
    { word: "hierophant", hint: "The novel's ___ guarded an ancient rite." },
  ],
};

const TIER_ORDER = ["Beginner", "Intermediate", "Advanced", "Expert", "Spelling Bee"];
const MASTER_STREAK = 3;

// ---------- Tally mark component (signature element) ----------
function TallyGroup({ count, colorVar }) {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  const strokes = [];
  for (let g = 0; g < groups; g++) strokes.push(5);
  if (remainder > 0) strokes.push(remainder);
  if (strokes.length === 0) strokes.push(0);

  return (
    <div className="tally-row" aria-hidden="true">
      {strokes.map((n, i) => (
        <svg key={i} width={n === 5 ? 26 : Math.max(n * 5, 4)} height="22" viewBox={`0 0 ${n === 5 ? 26 : Math.max(n * 5, 4)} 22`} className="tally-svg">
          {Array.from({ length: Math.min(n, 4) }).map((_, k) => (
            <line key={k} x1={4 + k * 6} y1="2" x2={4 + k * 6} y2="20" stroke={`var(${colorVar})`} strokeWidth="2.4" strokeLinecap="round" />
          ))}
          {n === 5 && <line x1="2" y1="20" x2="24" y2="2" stroke={`var(${colorVar})`} strokeWidth="2.4" strokeLinecap="round" />}
        </svg>
      ))}
    </div>
  );
}

export default function DictationApp() {
  const [tier, setTier] = useState("Beginner");
  const [onlineWords, setOnlineWords] = useState([]); // {word, hint}
  const [stats, setStats] = useState({}); // word -> {streak, wrong, mastered, seen}
  const [currentEntry, setCurrentEntry] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // {correct, correctWord, hint}
  const [rate, setRate] = useState(0.85);
  const [showSettings, setShowSettings] = useState(false);
  const [netStatus, setNetStatus] = useState("idle"); // idle | loading | online | offline
  const [voices, setVoices] = useState([]);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeList = useMemo(() => {
    if (tier === "Online") return onlineWords;
    return WORD_BANKS[tier];
  }, [tier, onlineWords]);

  // Load voices
  useEffect(() => {
    function loadVoices() {
      setVoices(window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
    }
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const britishVoice = useMemo(() => {
    return (
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang && v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang && v.lang.startsWith("en")) ||
      null
    );
  }, [voices]);

  const speak = useCallback(
    (word) => {
      if (!window.speechSynthesis || !word) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-GB";
      utter.rate = rate;
      if (britishVoice) utter.voice = britishVoice;
      window.speechSynthesis.speak(utter);
    },
    [rate, britishVoice]
  );

  const pickNext = useCallback(
    (list) => {
      if (!list || list.length === 0) return null;
      const notMastered = list.filter((e) => !(stats[e.word] && stats[e.word].mastered));
      const pool = notMastered.length > 0 ? notMastered : list;
      const weights = pool.map((e) => {
        const s = stats[e.word];
        const wrong = s ? s.wrong : 0;
        return 1 + wrong * 3;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) return pool[i];
      }
      return pool[pool.length - 1];
    },
    [stats]
  );

  // Advance to a new word whenever tier/list changes
  useEffect(() => {
    const next = pickNext(activeList);
    setCurrentEntry(next);
    setFeedback(null);
    setInput("");
    if (next) setTimeout(() => speak(next.word), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, onlineWords.length]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentEntry]);

  function maskHint(hint, word) {
    if (!hint) return null;
    const re = new RegExp(word, "ig");
    return hint.replace(re, "_____");
  }

  function submit() {
    if (!currentEntry || feedback) return;
    const guess = input.trim().toLowerCase();
    const correctWord = currentEntry.word.toLowerCase();
    const isCorrect = guess === correctWord;

    setStats((prev) => {
      const cur = prev[currentEntry.word] || { streak: 0, wrong: 0, mastered: false, seen: 0 };
      const streak = isCorrect ? cur.streak + 1 : 0;
      const wrong = isCorrect ? cur.wrong : cur.wrong + 1;
      const mastered = streak >= MASTER_STREAK;
      return {
        ...prev,
        [currentEntry.word]: { streak, wrong, mastered, seen: cur.seen + 1 },
      };
    });

    setFeedback({ correct: isCorrect, correctWord: currentEntry.word, hint: currentEntry.hint });
  }

  function nextWord() {
    const next = pickNext(activeList);
    setCurrentEntry(next);
    setFeedback(null);
    setInput("");
    if (next) setTimeout(() => speak(next.word), 200);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (feedback) nextWord();
      else submit();
    }
  }

  async function fetchOnlineWords() {
    setNetStatus("loading");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("https://random-word-api.herokuapp.com/word?number=10", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("word list unavailable");
      const words = await res.json();

      const enriched = [];
      for (const w of words) {
        if (!/^[a-zA-Z]{4,}$/.test(w)) continue;
        try {
          const dRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_GB/${encodeURIComponent(w)}`);
          if (!dRes.ok) continue;
          const dData = await dRes.json();
          const meaning = dData?.[0]?.meanings?.[0];
          const example = meaning?.definitions?.find((d) => d.example)?.example;
          enriched.push({
            word: w.toLowerCase(),
            hint: example ? example : `Spell the word you hear: "${meaning?.partOfSpeech || "word"}".`,
          });
        } catch {
          // skip words the dictionary can't confirm
        }
      }

      if (enriched.length === 0) throw new Error("no words verified");
      setOnlineWords((prev) => [...prev, ...enriched]);
      setNetStatus("online");
      setTier("Online");
    } catch (err) {
      setNetStatus("offline");
    }
  }

  function exportProgress() {
    const payload = { stats, onlineWords, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dictation-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProgress(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.stats) setStats(data.stats);
        if (data.onlineWords) setOnlineWords(data.onlineWords);
      } catch {
        // ignore malformed file
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const tallyCorrect = Object.values(stats).reduce((sum, s) => sum + (s.seen - s.wrong > 0 ? 0 : 0), 0);
  // compute simple aggregate counts
  const totalCorrect = Object.values(stats).reduce((sum, s) => sum + Math.max(s.seen - s.wrong, 0), 0);
  const totalWrong = Object.values(stats).reduce((sum, s) => sum + s.wrong, 0);
  const totalMastered = Object.values(stats).filter((s) => s.mastered).length;

  return (
    <div className="wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        :root {
          --chalk-bg: #1f2e2b;
          --chalk-bg-2: #24352f;
          --chalk-paper: #f5f3e7;
          --brass: #c9a227;
          --pencil-red: #b33f3f;
          --sage: #6b8f71;
          --slate: #5b7c8d;
          --line: rgba(245, 243, 231, 0.14);
        }
        * { box-sizing: border-box; }
        .wrap {
          min-height: 100%;
          background: var(--chalk-bg);
          background-image:
            repeating-linear-gradient(var(--chalk-bg) 0px, var(--chalk-bg) 27px, var(--line) 28px);
          color: var(--chalk-paper);
          font-family: 'Inter', sans-serif;
          padding: 28px 16px 40px;
          display: flex;
          justify-content: center;
        }
        .card {
          width: 100%;
          max-width: 640px;
        }
        .header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .title {
          font-family: 'Fraunces', serif;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: 0.2px;
          margin: 0;
        }
        .title span { color: var(--brass); }
        .subtitle {
          font-size: 13px;
          color: rgba(245,243,231,0.6);
          margin: 2px 0 20px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .net-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 4px 9px;
          border-radius: 20px;
          border: 1px solid var(--line);
        }
        .net-badge.online { color: var(--sage); border-color: var(--sage); }
        .net-badge.offline { color: rgba(245,243,231,0.5); }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          padding: 7px 12px;
          border: 1px solid var(--line);
          border-radius: 3px;
          background: transparent;
          color: rgba(245,243,231,0.75);
          cursor: pointer;
          letter-spacing: 0.3px;
        }
        .tab.active {
          border-color: var(--brass);
          color: var(--brass);
          background: rgba(201,162,39,0.08);
        }
        .tab.online-tab { border-style: dashed; }

        .panel {
          background: var(--chalk-bg-2);
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 28px 26px 24px;
        }

        .hint-line {
          font-size: 15px;
          color: rgba(245,243,231,0.75);
          font-style: italic;
          min-height: 22px;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .speak-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
        }
        .speak-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--brass);
          color: #1f2e2b;
          border: none;
          padding: 12px 18px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .speak-btn:hover { filter: brightness(1.08); }
        .icon-btn {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--chalk-paper);
          padding: 11px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .icon-btn:hover { border-color: var(--brass); }

        .input-row { margin-bottom: 16px; }
        .dictation-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid var(--brass);
          color: var(--chalk-paper);
          font-family: 'Fraunces', serif;
          font-size: 24px;
          padding: 6px 2px 10px;
          outline: none;
        }
        .dictation-input:disabled { color: rgba(245,243,231,0.5); }
        .dictation-input::placeholder { color: rgba(245,243,231,0.3); font-family: 'Inter', sans-serif; font-size: 15px; }

        .actions-row { display: flex; gap: 10px; margin-bottom: 6px; }
        .primary-btn {
          background: var(--slate);
          color: var(--chalk-paper);
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .primary-btn:hover { filter: brightness(1.1); }

        .feedback {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 5px;
          font-size: 14px;
          line-height: 1.6;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .feedback.correct { background: rgba(107,143,113,0.12); border: 1px solid var(--sage); }
        .feedback.incorrect { background: rgba(179,63,63,0.12); border: 1px solid var(--pencil-red); }
        .feedback b { font-family: 'Fraunces', serif; font-size: 17px; }

        .stats-row {
          display: flex;
          gap: 22px;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          flex-wrap: wrap;
        }
        .stat-block { display: flex; flex-direction: column; gap: 4px; }
        .stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(245,243,231,0.5);
        }
        .stat-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: rgba(245,243,231,0.7);
        }
        .tally-row { display: flex; gap: 6px; align-items: center; min-height: 22px; }

        .settings-panel {
          margin-top: 16px;
          padding: 16px;
          border: 1px dashed var(--line);
          border-radius: 5px;
          font-size: 13px;
        }
        .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        input[type="range"] { accent-color: var(--brass); }

        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 22px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .link-btn {
          background: none;
          border: none;
          color: rgba(245,243,231,0.6);
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .link-btn:hover { color: var(--chalk-paper); }

        .empty-state {
          text-align: center;
          padding: 30px 10px;
          color: rgba(245,243,231,0.7);
        }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
        .visually-hidden {
          position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);
        }
      `}</style>

      <div className="card">
        <div className="header">
          <div>
            <h1 className="title">Dictation<span>.</span></h1>
          </div>
          <span className={`net-badge ${netStatus === "online" ? "online" : netStatus === "offline" ? "offline" : ""}`}>
            {netStatus === "online" ? <Wifi size={13} /> : <WifiOff size={13} />}
            {netStatus === "loading" ? "fetching…" : netStatus === "online" ? "online words loaded" : netStatus === "offline" ? "offline — saved lists" : "British English"}
          </span>
        </div>
        <p className="subtitle">Listen, then spell it. Five tiers, British spelling throughout.</p>

        <div className="tabs" role="tablist" aria-label="Word tier">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tier === t}
              className={`tab ${tier === t ? "active" : ""}`}
              onClick={() => setTier(t)}
            >
              {t}
            </button>
          ))}
          <button
            role="tab"
            aria-selected={tier === "Online"}
            className={`tab online-tab ${tier === "Online" ? "active" : ""}`}
            onClick={() => (onlineWords.length > 0 ? setTier("Online") : fetchOnlineWords())}
          >
            {onlineWords.length > 0 ? `Online (${onlineWords.length})` : "Fetch online words"}
          </button>
        </div>

        <div className="panel">
          {!currentEntry && (
            <div className="empty-state">
              {netStatus === "loading" ? "Fetching fresh words…" : "No words loaded yet. Try another tier or fetch online words."}
            </div>
          )}

          {currentEntry && (
            <>
              <p className="hint-line">{maskHint(currentEntry.hint, currentEntry.word) || "Type the word you hear."}</p>

              <div className="speak-row">
                <button className="speak-btn" onClick={() => speak(currentEntry.word)} aria-label="Speak the word">
                  <Volume2 size={17} /> Speak word
                </button>
                <button className="icon-btn" onClick={() => speak(currentEntry.word)} aria-label="Replay word" title="Replay">
                  <RotateCcw size={16} />
                </button>
                <button className="icon-btn" onClick={() => setShowSettings((s) => !s)} aria-label="Settings" title="Settings">
                  <Settings2 size={16} />
                </button>
              </div>

              {showSettings && (
                <div className="settings-panel">
                  <div className="settings-row">
                    <label htmlFor="rate">Speech rate</label>
                    <input
                      id="rate"
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="settings-row">
                    <span>Voice</span>
                    <span style={{ color: "rgba(245,243,231,0.6)" }}>{britishVoice ? britishVoice.name : "system default"}</span>
                  </div>
                </div>
              )}

              <div className="input-row">
                <label htmlFor="spelling-input" className="visually-hidden">Type the spelling of the word you heard</label>
                <input
                  id="spelling-input"
                  ref={inputRef}
                  className="dictation-input"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  placeholder="Type what you hear…"
                  value={input}
                  disabled={!!feedback}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="actions-row">
                {!feedback ? (
                  <button className="primary-btn" onClick={submit}>Check spelling</button>
                ) : (
                  <button className="primary-btn" onClick={nextWord}>Next word</button>
                )}
              </div>

              <div aria-live="polite">
                {feedback && (
                  <div className={`feedback ${feedback.correct ? "correct" : "incorrect"}`}>
                    {feedback.correct ? <Check size={18} /> : <X size={18} />}
                    <div>
                      <div><b>{feedback.correctWord}</b></div>
                      {feedback.correct ? "Correct." : "Not quite — here's the right spelling above."}
                      {stats[feedback.correctWord]?.mastered && (
                        <div style={{ marginTop: 4, color: "var(--brass)" }}>
                          <Sparkles size={13} style={{ display: "inline", marginRight: 4 }} />
                          Mastered — three correct in a row.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="stats-row">
                <div className="stat-block">
                  <span className="stat-label">Correct</span>
                  <TallyGroup count={totalCorrect} colorVar="--sage" />
                </div>
                <div className="stat-block">
                  <span className="stat-label">Missed</span>
                  <TallyGroup count={totalWrong} colorVar="--pencil-red" />
                </div>
                <div className="stat-block">
                  <span className="stat-label">Mastered</span>
                  <TallyGroup count={totalMastered} colorVar="--brass" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="footer-row">
          <button className="link-btn" onClick={exportProgress}>
            <Download size={12} /> Export progress
          </button>
          <button className="link-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={12} /> Import progress
          </button>
          <input type="file" accept="application/json" ref={fileInputRef} onChange={importProgress} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}
