(() => {
                "use strict";
                const $ = (id) => document.getElementById(id),
                    ROWS = 84,
                    NH = 14,
                    BARS = 64,
                    KW = 52,
                    TOP = 107;
                let LANE = 52,
                    PX = 10,
                    RW = 28,
                    A = null,
                    M = null,
                    IMP = null,
                    N = {},
                    drag = null,
                    SS = 0,
                    NT = 0,
                    Q = [],
                    stopAt = 0,
                    tmr = 0,
                    uc = 0,
                    LH = 330;
                const uid = () => "i" + (++uc).toString(36) + Date.now().toString(36).slice(-4);
                const NM = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
                    blk = (m) => [1, 3, 6, 8, 10].includes(m % 12),
                    pname = (m) => NM[m % 12] + (Math.floor(m / 12) - 1);
                const COL = ["#e8742c", "#2aa5c4", "#58b04e", "#b565bd", "#dd6592", "#cfae35", "#6f8fd6", "#4fb59f"];
                const SF =
                    "acoustic_grand_piano,bright_acoustic_piano,electric_grand_piano,honkytonk_piano,electric_piano_1,electric_piano_2,harpsichord,clavinet,celesta,glockenspiel,music_box,vibraphone,marimba,xylophone,tubular_bells,dulcimer,drawbar_organ,percussive_organ,rock_organ,church_organ,reed_organ,accordion,harmonica,tango_accordion,acoustic_guitar_nylon,acoustic_guitar_steel,electric_guitar_jazz,electric_guitar_clean,electric_guitar_muted,overdriven_guitar,distortion_guitar,guitar_harmonics,acoustic_bass,electric_bass_finger,electric_bass_pick,fretless_bass,slap_bass_1,slap_bass_2,synth_bass_1,synth_bass_2,violin,viola,cello,contrabass,tremolo_strings,pizzicato_strings,orchestral_harp,timpani,string_ensemble_1,string_ensemble_2,synth_strings_1,synth_strings_2,choir_aahs,voice_oohs,synth_choir,orchestra_hit,trumpet,trombone,tuba,muted_trumpet,french_horn,brass_section,synth_brass_1,synth_brass_2,soprano_sax,alto_sax,tenor_sax,baritone_sax,oboe,english_horn,bassoon,clarinet,piccolo,flute,recorder,pan_flute,blown_bottle,shakuhachi,whistle,ocarina,lead_1_square,lead_2_sawtooth,lead_3_calliope,lead_4_chiff,lead_5_charang,lead_6_voice,lead_7_fifths,lead_8_bass__lead,pad_1_new_age,pad_2_warm,pad_3_polysynth,pad_4_choir,pad_5_bowed,pad_6_metallic,pad_7_halo,pad_8_sweep,fx_1_rain,fx_2_soundtrack,fx_3_crystal,fx_4_atmosphere,fx_5_brightness,fx_6_goblins,fx_7_echoes,fx_8_scifi,sitar,banjo,shamisen,koto,kalimba,bagpipe,fiddle,shanai,tinkle_bell,agogo,steel_drums,woodblock,taiko_drum,melodic_tom,synth_drum,reverse_cymbal,guitar_fret_noise,breath_noise,seashore,bird_tweet,telephone_ring,helicopter,applause,gunshot".split(
                        ","
                    );
                const gmL = (n) => n.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                    esc = (s) =>
                        String(s).replace(
                            /[&<>"']/g,
                            (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
                        ),
                    clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
                    say = (m) => ($("msg").textContent = m);
                const S = {
                    bpm: 120,
                    spb: 16,
                    playing: 0,
                    rec: 0,
                    loop: 1,
                    met: 0,
                    kb: 0,
                    step: 0,
                    tracks: [],
                    pats: {},
                    clips: [],
                    at: "",
                    sel: new Set(),
                    sc: null,
                    cs: new Set(),
                    mq: null,
                    cond: 0,
                    foc: "pl",
                    h: [],
                    f: [],
                    vfx: 1,
                    vro: 1,
                };
                const T = (id) => S.tracks.find((t) => t.id === id),
                    P = (id) => S.pats[id],
                    ti = (id) => S.tracks.findIndex((t) => t.id === id),
                    ct = () => T(S.at),
                    cp = () => P(ct()?.pat),
                    TOT = () => BARS * S.spb,
                    SN = () => +$("snap").value || 1;
                const D = { pl: 1, rl: 1, ro: 1, k: 1 },
                    dirty = (...k) => k.forEach((a) => (D[a] = 1)),
                    dirtyAll = () => dirty("pl", "rl", "ro", "k");
                const dump = () => JSON.stringify({ tracks: S.tracks, pats: S.pats, clips: S.clips, at: S.at });
                function hist() {
                    S.h.push(dump());
                    if (S.h.length > 80) S.h.shift();
                    S.f = [];
                }
                function restore(r) {
                    Object.assign(S, JSON.parse(r));
                    S.sel = new Set();
                    S.sc = null;
                    S.cs = new Set();
                    if (A) {
                        S.tracks.forEach((t) => {
                            if (!N[t.id]) build(t);
                            upd(t);
                        });
                    }
                    all();
                }
                function undo() {
                    if (!S.h.length) return;
                    S.f.push(dump());
                    restore(S.h.pop());
                }
                function redo() {
                    if (!S.f.length) return;
                    S.h.push(dump());
                    restore(S.f.pop());
                }
                const mkTrack = (name, color) => ({
                    id: uid(),
                    name,
                    color,
                    wave: "sawtooth",
                    gmProgram: 0,
                    soundfont: "FluidR3_GM",
                    useGM: true,
                    muted: false,
                    solo: false,
                    volume: 0.8,
                    pan: 0,
                    cutoff: 12000,
                    resonance: 0.7,
                    reverb: 0,
                    delay: 0,
                    delayFeedback: 0.25,
                    distortion: 0,
                    fx: ["filter", "reverb", "delay", "distortion"],
                    pat: "",
                    engine: "gm",
                    ftype: "lowpass",
                    dtime: 0.75,
                    rdecay: 1.7,
                    dmode: "soft",
                    eqlo: 0,
                    eqmid: 0,
                    eqfreq: 1000,
                    eqhi: 0,
                    cth: -24,
                    cratio: 4,
                    catk: 0.01,
                    crel: 0.2,
                    trate: 5,
                    tdepth: 0.5,
                    op: defOp(),
                    drum: defDrum(),
                });
                function mkPat(t, steps) {
                    const id = uid(),
                        n = Object.values(S.pats).filter((p) => p.tid === t.id).length + 1;
                    S.pats[id] = { id, tid: t.id, name: "Pattern " + n, steps: steps || S.spb, notes: [] };
                    t.pat = id;
                    return S.pats[id];
                }
                function init() {
                    const a = mkTrack("Synth Lead", COL[0]),
                        b = mkTrack("Bassline", COL[1]);
                    b.wave = "square";
                    S.tracks.push(a, b);
                    const pa = mkPat(a),
                        pb = mkPat(b);
                    pa.notes = [
                        [60, 0],
                        [64, 4],
                        [67, 8],
                        [71, 12],
                    ].map(([p, s]) => ({ id: uid(), pitch: p, step: s, duration: 2, velocity: 0.9 }));
                    pb.notes = [
                        [36, 0],
                        [36, 8],
                    ].map(([p, s]) => ({ id: uid(), pitch: p, step: s, duration: 4, velocity: 0.9 }));
                    S.clips = [
                        { id: uid(), tid: a.id, pid: pa.id, start: 0, len: 32 },
                        { id: uid(), tid: b.id, pid: pb.id, start: 0, len: 32 },
                    ];
                    S.at = a.id;
                    all();
                    setTimeout(() => $("oct").onchange(), 0);
                }
                /* ---------- audio ---------- */
                function ensureAudio() {
                    if (A) return;
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) {
                        say("Web Audio is not supported in this browser.");
                        return;
                    }
                    A = new AC();
                    M = A.createGain();
                    M.gain.value = 0.8;
                    M.connect(A.destination);
                    const L = A.sampleRate * 1.7,
                        b = A.createBuffer(2, L, A.sampleRate);
                    for (let c = 0; c < 2; c++) {
                        const d = b.getChannelData(c);
                        for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.2);
                    }
                    IMP = b;
                    S.tracks.forEach(build);
                    $("au").textContent = "AUDIO READY";
                }
                function build(t) {
                    const g = () => A.createGain(),
                        B = () => A.createBiquadFilter(),
                        inp = g(),
                        lo = B(),
                        md = B(),
                        hi = B(),
                        flt = B(),
                        ds = A.createWaveShaper(),
                        cmp = A.createDynamicsCompressor(),
                        tr = g(),
                        lf = A.createOscillator(),
                        lg = g(),
                        dl = A.createDelay(3),
                        fb = g(),
                        dw = g(),
                        cv = A.createConvolver(),
                        rw = g(),
                        pn = A.createStereoPanner(),
                        out = g();
                    lo.type = "lowshelf";
                    lo.frequency.value = 200;
                    md.type = "peaking";
                    hi.type = "highshelf";
                    hi.frequency.value = 4000;
                    lf.connect(lg);
                    lg.connect(tr.gain);
                    lf.start();
                    inp.connect(lo);
                    lo.connect(md);
                    md.connect(hi);
                    hi.connect(flt);
                    flt.connect(ds);
                    ds.connect(cmp);
                    cmp.connect(tr);
                    tr.connect(pn);
                    tr.connect(dl);
                    dl.connect(fb);
                    fb.connect(dl);
                    dl.connect(dw);
                    dw.connect(pn);
                    tr.connect(cv);
                    cv.connect(rw);
                    rw.connect(pn);
                    pn.connect(out);
                    out.connect(M);
                    N[t.id] = { inp, lo, md, hi, flt, ds, cmp, tr, lf, lg, dl, fb, dw, cv, rw, pn, out, dc: "", rd: 0 };
                    upd(t);
                }
                const impulse = (s) => {
                    const L = Math.ceil(A.sampleRate * s),
                        b = A.createBuffer(2, L, A.sampleRate);
                    for (let c = 0; c < 2; c++) {
                        const d = b.getChannelData(c);
                        for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.2);
                    }
                    return b;
                };
                const anySolo = () => S.tracks.some((t) => t.solo),
                    audible = (t) => !t.muted && (!anySolo() || t.solo);
                function upd(t) {
                    const n = N[t.id];
                    if (!n) return;
                    const c = A.currentTime,
                        h = (k) => t.fx.includes(k),
                        s = (p, v) => p.setTargetAtTime(v, c, 0.015),
                        e = h("eq");
                    s(n.out.gain, audible(t) ? t.volume : 0);
                    s(n.pn.pan, t.pan);
                    s(n.lo.gain, e ? t.eqlo : 0);
                    s(n.md.gain, e ? t.eqmid : 0);
                    s(n.md.frequency, t.eqfreq);
                    s(n.hi.gain, e ? t.eqhi : 0);
                    n.flt.type = t.ftype;
                    s(n.flt.frequency, h("filter") ? t.cutoff : t.ftype === "highpass" ? 10 : 22000);
                    s(n.flt.Q, h("filter") ? t.resonance : 0.0001);
                    const k = h("comp");
                    n.cmp.threshold.value = k ? t.cth : 0;
                    n.cmp.ratio.value = k ? t.cratio : 1;
                    n.cmp.attack.value = t.catk;
                    n.cmp.release.value = t.crel;
                    const d = h("tremolo") ? t.tdepth : 0;
                    s(n.lg.gain, d / 2);
                    n.tr.gain.value = 1 - d / 2;
                    n.lf.frequency.value = t.trate;
                    s(n.dw.gain, h("delay") ? t.delay : 0);
                    s(n.fb.gain, t.delayFeedback);
                    s(n.dl.delayTime, (60 / S.bpm) * t.dtime);
                    s(n.rw.gain, h("reverb") ? t.reverb : 0);
                    if (n.rd !== t.rdecay) {
                        n.rd = t.rdecay;
                        n.cv.buffer = impulse(t.rdecay);
                    }
                    const dk = h("distortion") ? t.distortion + t.dmode : "";
                    if (n.dc !== dk) {
                        n.dc = dk;
                        if (!t.distortion || !h("distortion")) n.ds.curve = null;
                        else {
                            const K = 1 + t.distortion * 14,
                                cv = new Float32Array(1024),
                                hard = t.dmode === "hard";
                            for (let i = 0; i < 1024; i++) {
                                const x = i / 511.5 - 1;
                                cv[i] = hard ? clamp(x * K, -1, 1) : Math.tanh(x * K) / Math.tanh(K);
                            }
                            n.ds.curve = cv;
                        }
                    }
                }
                const updAll = () => {
                    if (A) S.tracks.forEach(upd);
                };
                let SP = new Map(),
                    SL = new Map();
                const BAD = new Set(),
                    gk = (t) => (t.soundfont || "FluidR3_GM") + ":" + SF[t.gmProgram | 0] + ":" + t.id;
                function loadGM(t) {
                    const k = gk(t);
                    if (SP.has(k)) return Promise.resolve(SP.get(k));
                    if (BAD.has(k) || !A || !window.Soundfont) return Promise.reject(Error("unavailable"));
                    if (SL.has(k)) return SL.get(k);
                    $("au").textContent = "LOADING GM";
                    const pr = Soundfont.instrument(A, SF[t.gmProgram | 0], {
                        soundfont: t.soundfont || "FluidR3_GM",
                        format: "mp3",
                        nameToUrl: (n, sf, f) => `https://gleitz.github.io/midi-js-soundfonts/${sf}/${n}-${f}.js`,
                        destination: N[t.id]?.inp || M,
                    })
                        .then((pl) => {
                            SP.set(k, pl);
                            SL.delete(k);
                            $("au").textContent = "GM READY";
                            return pl;
                        })
                        .catch((e) => {
                            SL.delete(k);
                            BAD.add(k);
                            $("au").textContent = "SYNTH FALLBACK";
                            say("GM samples unavailable (needs internet); using the oscillator.");
                            throw e;
                        });
                    SL.set(k, pr);
                    return pr;
                }
                function noteOn(t, p, v, time, dur) {
                    if (!A) return;
                    const n = N[t.id];
                    if (!n) return;
                    time = Math.max(time, A.currentTime);
                    dur = Math.max(0.05, dur);
                    const e = eng(t);
                    if (e === "drum") {
                        drumHit(t, p, v, time);
                        return;
                    }
                    if (e === "op") {
                        opNote(t, p, v, time, dur);
                        return;
                    }
                    if (e === "gm" && window.Soundfont) {
                        const pl = SP.get(gk(t));
                        if (pl) {
                            pl.play(p, time, { duration: dur, gain: Math.max(0.02, v) });
                            return;
                        }
                        loadGM(t).catch(() => {});
                    }
                    const o = A.createOscillator(),
                        g = A.createGain();
                    o.type = t.wave || "sawtooth";
                    o.frequency.value = 440 * 2 ** ((p - 69) / 12);
                    g.gain.setValueAtTime(0.0001, time);
                    g.gain.linearRampToValueAtTime(Math.max(0.01, v * 0.2), time + 0.01);
                    g.gain.setTargetAtTime(0.0001, time + Math.max(0.03, dur - 0.04), 0.04);
                    o.connect(g);
                    g.connect(n.inp);
                    o.start(time);
                    o.stop(time + dur + 0.3);
                }
                const free = (tid, st, len, ex) =>
                        !S.clips.some(
                            (c) =>
                                (ex instanceof Set ? !ex.has(c) : c !== ex) &&
                                c.tid === tid &&
                                st < c.start + c.len &&
                                c.start < st + len
                        ),
                    clipAt = (tid, s) => S.clips.find((c) => c.tid === tid && s >= c.start && s < c.start + c.len);
                const endStep = () => {
                    const m = Math.max(0, ...S.clips.map((c) => c.start + c.len));
                    return Math.max(S.spb, Math.ceil(m / S.spb) * S.spb);
                };
                function tick(step, time) {
                    if (S.met && step % 4 === 0) {
                        const o = A.createOscillator(),
                            g = A.createGain();
                        o.frequency.value = step % S.spb === 0 ? 1300 : 850;
                        g.gain.setValueAtTime(0.12, time);
                        g.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
                        o.connect(g);
                        g.connect(M);
                        o.start(time);
                        o.stop(time + 0.04);
                    }
                    const sd = 60 / S.bpm / 4;
                    S.clips.forEach((c) => {
                        if (step < c.start || step >= c.start + c.len) return;
                        const t = T(c.tid),
                            p = P(c.pid);
                        if (!t || !p || !audible(t)) return;
                        const l = (step - c.start) % p.steps;
                        p.notes.forEach((n) => {
                            if (n.step === l)
                                noteOn(t, n.pitch, n.velocity, time, Math.min(n.duration, p.steps - l) * sd);
                        });
                    });
                }
                function sched() {
                    if (!S.playing || SS < 0) return;
                    while (NT < A.currentTime + 0.14) {
                        tick(SS, NT);
                        Q.push([NT, SS]);
                        NT += 60 / S.bpm / 4;
                        SS++;
                        if (SS >= endStep()) {
                            if (S.loop) SS = 0;
                            else {
                                stopAt = NT;
                                SS = -1;
                                break;
                            }
                        }
                    }
                }
                async function start() {
                    if (S.playing || S.busy) return;
                    ensureAudio();
                    if (!A) return;
                    S.busy = 1;
                    await A.resume();
                    say("Loading instruments…");
                    const used = new Set(S.clips.map((c) => c.tid));
                    try {
                        await Promise.race([
                            Promise.all(
                                S.tracks
                                    .filter((t) => used.has(t.id) && eng(t) === "gm")
                                    .map((t) => loadGM(t).catch(() => {}))
                            ),
                            new Promise((r) => setTimeout(r, 3000)),
                        ]);
                    } catch (e) {}
                    S.busy = 0;
                    S.playing = 1;
                    $("play").classList.add("on");
                    SS = S.step;
                    NT = A.currentTime + 0.06;
                    Q = [];
                    tmr = setInterval(sched, 25);
                    say("Playing");
                }
                function stop(rst) {
                    S.playing = 0;
                    clearInterval(tmr);
                    Q = [];
                    stopAt = 0;
                    $("play").classList.remove("on");
                    if (rst) S.step = 0;
                    ph();
                }
                function setStep(s) {
                    S.step = clamp(s, 0, TOT() - 1);
                    if (S.playing && A) {
                        Q = [];
                        SS = S.step;
                        NT = A.currentTime + 0.04;
                    }
                    ph();
                }
                const posT = (s) =>
                    `${String(Math.floor(s / S.spb) + 1).padStart(3, "0")}.${String(Math.floor((s % S.spb) / 4) + 1).padStart(2, "0")}.${String((s % 4) + 1).padStart(2, "0")}`;
                function ph() {
                    const x = S.step * PX;
                    $("phl").style.transform = `translateX(${x}px)`;
                    $("rph").style.transform = `translateX(${x - $("plw").scrollLeft}px)`;
                    $("pos").textContent = posT(S.step);
                    const t = ct(),
                        c = t && clipAt(t.id, S.step),
                        p = cp(),
                        r = $("rphl");
                    if (c && p && S.playing) {
                        r.style.display = "block";
                        r.style.transform = `translateX(${((S.step - c.start) % p.steps) * RW}px)`;
                    } else r.style.display = "none";
                }
                /* ---------- drawing (viewport only, on demand) ---------- */
                const plw = $("plw"),
                    rw = $("rw"),
                    pl = $("pl"),
                    rc = $("rc"),
                    kc = $("kc"),
                    rl = $("rl"),
                    rlw = $("rlw");
                function fit(c, w, h) {
                    const d = devicePixelRatio || 1,
                        W = Math.round(w * d),
                        H = Math.round(h * d);
                    if (c.width !== W || c.height !== H) {
                        c.width = W;
                        c.height = H;
                        c.style.width = w + "px";
                        c.style.height = h + "px";
                    }
                    const x = c.getContext("2d");
                    x.setTransform(d, 0, 0, d, 0, 0);
                    return x;
                }
                function drawRuler() {
                    const W = rlw.clientWidth;
                    if (!W) return;
                    const x = fit(rl, W, 24),
                        sx = plw.scrollLeft;
                    x.fillStyle = TH.rb;
                    x.fillRect(0, 0, W, 24);
                    x.font = "10px Tahoma";
                    const s0 = Math.floor(sx / PX),
                        s1 = Math.ceil((sx + W) / PX);
                    for (let s = s0; s <= s1; s++) {
                        const bar = s % S.spb === 0;
                        if (!bar && !(s % 4 === 0 && PX >= 5)) continue;
                        x.fillStyle = bar ? TH.tb : TH.tbt;
                        x.fillRect(s * PX - sx, bar ? 4 : 15, 1, bar ? 20 : 9);
                        if (bar && (PX * S.spb >= 28 || (s / S.spb) % 4 === 0)) {
                            x.fillStyle = TH.tx;
                            x.fillText(s / S.spb + 1, s * PX - sx + 3, 12);
                        }
                    }
                    x.fillStyle = TH.ac;
                    x.fillRect(endStep() * PX - sx - 1, 0, 2, 24);
                }
                function drawPL() {
                    const W = plw.clientWidth,
                        H = plw.clientHeight;
                    if (!W) return;
                    const x = fit(pl, W, H),
                        sx = plw.scrollLeft,
                        sy = plw.scrollTop;
                    x.fillStyle = TH.bg;
                    x.fillRect(0, 0, W, H);
                    S.tracks.forEach((t, i) => {
                        const y = i * LANE - sy;
                        if (y > H || y + LANE < 0) return;
                        x.fillStyle = t.id === S.at ? TH.ls : i % 2 ? TH.l1 : TH.l0;
                        x.fillRect(0, y, W, LANE);
                        x.fillStyle = TH.ln;
                        x.fillRect(0, y + LANE - 1, W, 1);
                    });
                    const s0 = Math.floor(sx / PX),
                        s1 = Math.ceil((sx + W) / PX);
                    for (let s = s0; s <= s1; s++) {
                        const bar = s % S.spb === 0;
                        if (!bar && !(s % 4 === 0 && PX >= 5)) continue;
                        x.fillStyle = bar ? TH.gb : TH.gt;
                        x.fillRect(s * PX - sx, 0, 1, H);
                    }
                    S.clips.forEach((c) => {
                        const i = ti(c.tid),
                            p = P(c.pid);
                        if (i < 0 || !p) return;
                        const t = S.tracks[i],
                            x0 = c.start * PX - sx,
                            w = c.len * PX - 1,
                            y = i * LANE - sy + (S.cond ? 2 : 3),
                            h = LANE - (S.cond ? 4 : 7);
                        if (x0 > W || x0 + w < 0 || y > H || y + h < 0) return;
                        x.save();
                        x.beginPath();
                        x.rect(x0, y, w, h);
                        x.clip();
                        x.fillStyle = t.color;
                        x.globalAlpha = S.cond ? 0.85 : 0.3;
                        x.fillRect(x0, y, w, h);
                        x.globalAlpha = 1;
                        if (!S.cond) x.fillRect(x0, y, w, 13);
                        else {
                            x.fillStyle = "#fff6";
                            x.fillRect(x0, y, w, 1);
                            x.fillRect(x0, y, 1, h);
                            x.fillStyle = "#0007";
                            x.fillRect(x0, y + h - 1, w, 1);
                            x.fillRect(x0 + w - 1, y, 1, h);
                        }
                        for (let r = p.steps; r < c.len; r += p.steps) {
                            x.fillStyle = "#0007";
                            x.fillRect(x0 + r * PX, y + (S.cond ? 0 : 13), 1, h - (S.cond ? 0 : 13));
                        }
                        if (p.notes.length) {
                            let lo = 127,
                                hi = 0;
                            p.notes.forEach((n) => {
                                lo = Math.min(lo, n.pitch);
                                hi = Math.max(hi, n.pitch);
                            });
                            const rg = Math.max(8, hi - lo + 1),
                                mid = (hi + lo) / 2,
                                bh = S.cond ? h - 4 : h - 19,
                                rh = Math.max(1.5, Math.min(4, bh / rg));
                            x.fillStyle = S.cond ? "#000" : "#fff";
                            x.globalAlpha = 0.8;
                            for (let r = 0; r * p.steps < c.len; r++) {
                                const o = x0 + r * p.steps * PX;
                                if (o > W) break;
                                if (o + p.steps * PX < 0) continue;
                                p.notes.forEach((n) => {
                                    const pos = r * p.steps + n.step;
                                    if (pos >= c.len || n.step >= p.steps) return;
                                    const ny = y + (S.cond ? 2 : 15) + (1 - ((n.pitch - mid) / rg + 0.5)) * (bh - rh);
                                    x.fillRect(
                                        x0 + pos * PX,
                                        ny,
                                        Math.max(1.5, Math.min(n.duration, p.steps - n.step, c.len - pos) * PX - 0.5),
                                        rh
                                    );
                                });
                            }
                            x.globalAlpha = 1;
                        }
                        x.fillStyle = "#111";
                        x.font = "bold 10px Tahoma";
                        x.fillText(p.name, x0 + 4, S.cond ? y + h - 4 : y + 10);
                        x.restore();
                        x.strokeStyle = c === S.sc || S.cs.has(c.id) ? (TH.bg === "#fff" ? "#06f" : "#fff") : "#000a";
                        x.strokeRect(x0 + 0.5, y + 0.5, w - 1, h - 1);
                        if (w > 16) {
                            x.fillStyle = "#0006";
                            x.fillRect(x0 + w - 5, y + 16, 2, h - 22);
                        }
                    });
                    if (S.dp) {
                        const i = ti(S.dp.tid);
                        x.fillStyle = "#4a90d9aa";
                        x.fillRect(S.dp.start * PX - sx, i * LANE - sy + 3, S.dp.len * PX - 1, LANE - 7);
                    }
                    mqd(x, "pl", sx, sy);
                }
                function drawKeys() {
                    const H = rw.clientHeight;
                    if (!H) return;
                    const x = fit(kc, KW, H),
                        sy = rw.scrollTop;
                    x.font = "9px Tahoma";
                    for (let r = Math.floor(sy / NH); r <= Math.min(ROWS - 1, Math.ceil((sy + H) / NH)); r++) {
                        const m = TOP - r,
                            y = r * NH - sy;
                        x.fillStyle = blk(m) ? "#2b2d31" : "#e6e8ea";
                        x.fillRect(0, y, KW, NH - 1);
                        x.fillStyle = "#000";
                        x.fillRect(0, y + NH - 1, KW, 1);
                        if (m % 12 === 0 || (isD() && DP[m])) {
                            x.fillStyle = "#222";
                            x.fillText(lab(m), isD() ? 2 : KW - 22, y + 10);
                        }
                    }
                }
                function drawRoll() {
                    const W = rw.clientWidth,
                        H = rw.clientHeight;
                    if (!W) return;
                    const x = fit(rc, W, H),
                        sx = rw.scrollLeft,
                        sy = rw.scrollTop,
                        p = cp(),
                        t = ct(),
                        ins = inS();
                    x.fillStyle = TH.r0;
                    x.fillRect(0, 0, W, H);
                    for (let r = Math.floor(sy / NH); r <= Math.min(ROWS - 1, Math.ceil((sy + H) / NH)); r++) {
                        const m = TOP - r,
                            y = r * NH - sy;
                        x.fillStyle = blk(m) ? TH.rk : TH.rw;
                        x.fillRect(0, y, W, NH);
                        if (!ins(m)) {
                            x.fillStyle = "#0006";
                            x.fillRect(0, y, W, NH);
                        }
                        x.fillStyle = m % 12 === 0 ? TH.rc : TH.rl;
                        x.fillRect(0, y + NH - 1, W, 1);
                    }
                    if (!p) {
                        x.fillStyle = TH.tb;
                        x.fillText("No pattern. Use + Pattern.", 12, 20);
                        return;
                    }
                    const e = p.steps * RW - sx;
                    if (e < W) {
                        x.fillStyle = "#000a";
                        x.fillRect(Math.max(0, e), 0, W, H);
                    }
                    for (let s = Math.floor(sx / RW); s <= Math.min(p.steps, Math.ceil((sx + W) / RW)); s++) {
                        const bar = s % S.spb === 0,
                            beat = s % 4 === 0;
                        if (!bar && !beat && RW < 10) continue;
                        x.fillStyle = bar ? TH.gB : beat ? TH.gb2 : TH.gs;
                        x.fillRect(s * RW - sx, 0, 1, H);
                    }
                    p.notes.forEach((n) => {
                        if (n.step >= p.steps) return;
                        const x0 = n.step * RW - sx,
                            w = Math.max(3, Math.min(n.duration, p.steps - n.step) * RW - 1),
                            y = (TOP - n.pitch) * NH - sy;
                        if (x0 > W || x0 + w < 0 || y > H || y + NH < 0) return;
                        const sel = S.sel.has(n.id);
                        x.globalAlpha = 0.4 + 0.6 * n.velocity;
                        x.fillStyle = sel ? TH.ns : t.color;
                        x.fillRect(x0, y + 1, w, NH - 2);
                        x.globalAlpha = 1;
                        x.strokeStyle = sel ? "#ffb000" : "#000a";
                        x.strokeRect(x0 + 0.5, y + 1.5, w - 1, NH - 3);
                        if (w > 26) {
                            x.fillStyle = sel ? "#000" : "#fff";
                            x.fillText(lab(n.pitch), x0 + 3, y + 10);
                        }
                    });
                    mqd(x, "ro", sx, sy);
                }
                function frame() {
                    if (S.playing && A) {
                        const t = A.currentTime;
                        let ch = 0;
                        while (Q.length && Q[0][0] <= t) {
                            S.step = Q.shift()[1];
                            ch = 1;
                        }
                        if (ch) {
                            ph();
                            const x = S.step * PX;
                            if (x > plw.scrollLeft + plw.clientWidth - 30 || x < plw.scrollLeft)
                                plw.scrollLeft = Math.max(0, x - 60);
                        }
                        if (stopAt && t >= stopAt) stop(1);
                    }
                    if (D.rl) {
                        D.rl = 0;
                        drawRuler();
                    }
                    if (D.pl) {
                        D.pl = 0;
                        drawPL();
                    }
                    if (D.ro) {
                        D.ro = 0;
                        drawRoll();
                    }
                    if (D.k) {
                        D.k = 0;
                        drawKeys();
                    }
                    requestAnimationFrame(frame);
                }
                /* ---------- UI ---------- */
                const tl = $("tl");
                function tlui() {
                    tl.innerHTML =
                        S.tracks
                            .map(
                                (t) =>
                                    `<div class="tr${t.id === S.at ? " sel" : ""}" data-id="${t.id}"><i style="background:${t.color}"></i><span class="nm" title="Double-click to rename">${esc(t.name)}</span><small>${esc(eng(t) === "gm" ? gmL(SF[t.gmProgram | 0]) : { op: "Operator", drum: "Drum synth", osc: "Oscillator" }[eng(t)])}</small><button data-b="m" class="${t.muted ? "on" : ""}" title="Mute">M</button><button data-b="s" class="${t.solo ? "on" : ""}" title="Solo">S</button><button data-b="c" title="Instrument / mixer">⋯</button></div>`
                            )
                            .join("") + '<div style="height:80px"></div>';
                    tl.scrollTop = plw.scrollTop;
                }
                const DIV = [
                    ["1/16", 0.25],
                    ["1/8", 0.5],
                    ["dotted 1/8", 0.75],
                    ["1/4", 1],
                    ["dotted 1/4", 1.5],
                    ["1/2", 2],
                ];
                const FXD = [
                    [
                        "eq",
                        "EQ",
                        [
                            ["eqlo", "Low", -18, 18, 0.5, "dB"],
                            ["eqmid", "Mid", -18, 18, 0.5, "dB"],
                            ["eqfreq", "Mid freq", 100, 8000, 1, "Hz"],
                            ["eqhi", "High", -18, 18, 0.5, "dB"],
                        ],
                    ],
                    [
                        "filter",
                        "Filter",
                        [
                            ["ftype", "Type", 0, 0, 0, "", ["lowpass", "highpass", "bandpass", "notch"]],
                            ["cutoff", "Frequency", 20, 18000, 1, "Hz"],
                            ["resonance", "Resonance", 0.1, 18, 0.1, "Q"],
                        ],
                    ],
                    [
                        "distortion",
                        "Overdrive",
                        [
                            ["dmode", "Mode", 0, 0, 0, "", ["soft", "hard"]],
                            ["distortion", "Drive", 0, 1, 0.01, "%"],
                        ],
                    ],
                    [
                        "comp",
                        "Compressor",
                        [
                            ["cth", "Threshold", -60, 0, 1, "dB"],
                            ["cratio", "Ratio", 1, 20, 0.5, "x"],
                            ["catk", "Attack", 0.001, 0.3, 0.001, "s"],
                            ["crel", "Release", 0.02, 1, 0.01, "s"],
                        ],
                    ],
                    [
                        "tremolo",
                        "Tremolo",
                        [
                            ["trate", "Rate", 0.2, 20, 0.1, "Hz"],
                            ["tdepth", "Depth", 0, 1, 0.01, "%"],
                        ],
                    ],
                    [
                        "delay",
                        "Echo",
                        [
                            ["dtime", "Time", 0, 0, 0, "", DIV],
                            ["delay", "Wet", 0, 1, 0.01, "%"],
                            ["delayFeedback", "Feedback", 0, 0.88, 0.01, "%"],
                        ],
                    ],
                    [
                        "reverb",
                        "Reverb",
                        [
                            ["reverb", "Wet", 0, 1, 0.01, "%"],
                            ["rdecay", "Decay", 0.3, 5, 0.1, "s"],
                        ],
                    ],
                ];
                const fmt = (v, u) =>
                    u === "%"
                        ? Math.round(v * 100) + "%"
                        : u === "Hz"
                          ? Math.round(v) + " Hz"
                          : (+v).toFixed(u === "s" ? 2 : 1) + " " + u;
                function fxui() {
                    const t = ct(),
                        w = $("fxc");
                    $("fxn").textContent = t ? t.name : "Devices";
                    w.innerHTML = "";
                    if (!t) return;
                    FXD.filter((d) => t.fx.includes(d[0])).forEach(([id, title, ctl]) => {
                        const c = document.createElement("div");
                        c.className = "fc";
                        c.innerHTML =
                            `<b>${title}<button title="Remove device">×</button></b>` +
                            ctl
                                .map(([k, l, mn, mx, st, u, o]) =>
                                    o
                                        ? `<label><span>${l}</span></label><select data-k="${k}">${o
                                              .map((x) => {
                                                  const [a, b] = Array.isArray(x) ? x : [x, x];
                                                  return `<option value="${b}"${t[k] == b ? " selected" : ""}>${a}</option>`;
                                              })
                                              .join("")}</select>`
                                        : `<label><span>${l}</span><span>${fmt(t[k], u)}</span></label><input type="range" min="${mn}" max="${mx}" step="${st}" value="${t[k]}" data-k="${k}" data-u="${u}">`
                                )
                                .join("");
                        c.querySelector("button").onclick = () => {
                            t.fx = t.fx.filter((f) => f !== id);
                            if (A) upd(t);
                            fxui();
                        };
                        c.querySelectorAll("input").forEach(
                            (i) =>
                                (i.oninput = () => {
                                    t[i.dataset.k] = +i.value;
                                    i.previousElementSibling.lastElementChild.textContent = fmt(+i.value, i.dataset.u);
                                    if (A) upd(t);
                                })
                        );
                        c.querySelectorAll("select").forEach(
                            (i) =>
                                (i.onchange = () => {
                                    t[i.dataset.k] = isNaN(+i.value) ? i.value : +i.value;
                                    if (A) upd(t);
                                })
                        );
                        w.appendChild(c);
                    });
                }
                function patui() {
                    const t = ct(),
                        p = cp(),
                        ps = Object.values(S.pats).filter((q) => q.tid === S.at);
                    $("psel").innerHTML = ps
                        .map((q) => `<option value="${q.id}"${q === p ? " selected" : ""}>${esc(q.name)}</option>`)
                        .join("");
                    $("rt").textContent = p ? `Piano roll · ${p.name} · ${t.name}` : "Piano roll";
                    if (p) {
                        const b = p.steps / S.spb,
                            l = [1, 2, 3, 4, 6, 8, 16, b].filter((v, i, a) => a.indexOf(v) === i).sort((x, y) => x - y);
                        $("plen").innerHTML = l
                            .map(
                                (v) =>
                                    `<option value="${v}"${v === b ? " selected" : ""}>${+v.toFixed(2)} bar${v === 1 ? "" : "s"}</option>`
                            )
                            .join("");
                    }
                }
                function layout() {
                    $("plsp").style.width = TOT() * PX + "px";
                    $("plsp").style.height = S.tracks.length * LANE + 60 + "px";
                    const p = cp();
                    $("rsp").style.width = (p ? p.steps * RW + RW * 2 : 0) + "px";
                    $("rsp").style.height = ROWS * NH + "px";
                    dirtyAll();
                    ph();
                }
                const all = () => {
                    tlui();
                    fxui();
                    patui();
                    pvui();
                    layout();
                };
                function vis() {
                    $("fxb").style.display = S.vfx ? "flex" : "none";
                    $("rh").style.display = $("rb").style.display = S.vro ? "flex" : "none";
                    const on = S.vfx || S.vro;
                    $("lower").style.display = $("rz").style.display = on ? "flex" : "none";
                    $("lower").style.height = S.vro ? LH + "px" : "auto";
                    dirtyAll();
                }
                const cm = $("cm"),
                    hideMenu = () => {
                        cm.classList.remove("show");
                        $("tpop").style.display = "none";
                    };
                function menu(x, y, items) {
                    cm.innerHTML = "";
                    items.forEach((it) => {
                        if (!it) {
                            cm.insertAdjacentHTML("beforeend", "<hr>");
                            return;
                        }
                        const b = document.createElement("button");
                        b.textContent = it[0];
                        b.onclick = () => {
                            hideMenu();
                            it[1]();
                        };
                        cm.appendChild(b);
                    });
                    cm.classList.add("show");
                    const r = cm.getBoundingClientRect();
                    cm.style.left = clamp(x, 4, innerWidth - r.width - 4) + "px";
                    cm.style.top = clamp(y, 4, innerHeight - r.height - 4) + "px";
                }
                document.addEventListener("pointerdown", (e) => {
                    if (!e.target.closest("#cm,#tpop")) hideMenu();
                });
                function rename(t) {
                    const v = prompt("Track name", t.name)?.trim();
                    if (v) {
                        hist();
                        t.name = v;
                        all();
                    }
                }
                function addTrack(k) {
                    hist();
                    const i = S.tracks.length,
                        t = mkTrack(
                            ({ drum: "Drums ", op: "Operator " }[k] || "Track ") + (i + 1),
                            COL[i % COL.length]
                        );
                    if (k === "drum" || k === "op") {
                        t.engine = k;
                        t.useGM = false;
                    }
                    S.tracks.push(t);
                    mkPat(t);
                    if (A) build(t);
                    S.at = t.id;
                    all();
                }
                function addPat(src) {
                    const t = ct();
                    if (!t) return;
                    hist();
                    const p = mkPat(t, src?.steps);
                    if (src) {
                        p.notes = JSON.parse(JSON.stringify(src.notes));
                        p.notes.forEach((k) => (k.id = uid()));
                        p.name = src.name + " copy";
                    }
                    S.sel.clear();
                    all();
                    say("New pattern on " + t.name + " — click its lane in the playlist to place it.");
                }
                function delPat(p) {
                    if (!p || !confirm("Delete this pattern and all of its clips?")) return;
                    hist();
                    const t = T(p.tid);
                    delete S.pats[p.id];
                    S.clips = S.clips.filter((c) => c.pid !== p.id);
                    S.sc = null;
                    t.pat = Object.values(S.pats).find((q) => q.tid === t.id)?.id || mkPat(t).id;
                    all();
                }
                function dupTrack(t) {
                    hist();
                    const n = JSON.parse(JSON.stringify(t)),
                        mp = {};
                    n.id = uid();
                    n.name = t.name + " copy";
                    Object.values(S.pats)
                        .filter((p) => p.tid === t.id)
                        .forEach((p) => {
                            const q = JSON.parse(JSON.stringify(p));
                            q.id = uid();
                            q.tid = n.id;
                            q.notes.forEach((k) => (k.id = uid()));
                            S.pats[q.id] = q;
                            mp[p.id] = q.id;
                        });
                    n.pat = mp[t.pat];
                    S.clips
                        .filter((c) => c.tid === t.id)
                        .forEach((c) => S.clips.push({ ...c, id: uid(), tid: n.id, pid: mp[c.pid] }));
                    S.tracks.push(n);
                    if (A) {
                        build(n);
                    }
                    S.at = n.id;
                    all();
                }
                function delTrack(t) {
                    if (S.tracks.length < 2) return say("Keep at least one track.");
                    hist();
                    S.tracks = S.tracks.filter((q) => q !== t);
                    Object.values(S.pats).forEach((p) => {
                        if (p.tid === t.id) delete S.pats[p.id];
                    });
                    S.clips = S.clips.filter((c) => c.tid !== t.id);
                    S.sc = null;
                    if (S.at === t.id) S.at = S.tracks[0].id;
                    all();
                }
                const trackMenu = (e, t) =>
                    menu(e.clientX, e.clientY, [
                        ["Rename", () => rename(t)],
                        ["Instrument / mixer…", () => openTp(t, e.clientX, e.clientY)],
                        [
                            "Change color",
                            () => {
                                t.color = COL[(COL.indexOf(t.color) + 1) % COL.length];
                                all();
                            },
                        ],
                        [
                            "Add pattern",
                            () => {
                                S.at = t.id;
                                addPat();
                            },
                        ],
                        ["Duplicate track", () => dupTrack(t)],
                        null,
                        ["Delete track", () => delTrack(t)],
                    ]);
                const sel1 = (id, pid) => {
                    if (S.at !== id || (pid && T(id).pat !== pid)) {
                        S.at = id;
                        if (pid) T(id).pat = pid;
                        S.sel.clear();
                        all();
                    }
                };
                tl.onclick = (e) => {
                    const r = e.target.closest(".tr");
                    if (!r) return;
                    const t = T(r.dataset.id),
                        b = e.target.dataset.b;
                    if (b === "m" || b === "s") {
                        t[b === "m" ? "muted" : "solo"] = !t[b === "m" ? "muted" : "solo"];
                        updAll();
                        tlui();
                        return;
                    }
                    if (b === "c") {
                        openTp(t, e.clientX, e.clientY);
                        return;
                    }
                    sel1(t.id);
                };
                tl.ondblclick = (e) => {
                    if (e.target.classList.contains("nm")) rename(T(e.target.closest(".tr").dataset.id));
                };
                tl.oncontextmenu = (e) => {
                    e.preventDefault();
                    const r = e.target.closest(".tr");
                    if (r) trackMenu(e, T(r.dataset.id));
                };
                tl.onwheel = (e) => {
                    plw.scrollTop += e.deltaY;
                };
                function openTp(t, x, y) {
                    const p = $("tpop");
                    p.style.display = "block";
                    p.style.left = clamp(x, 4, innerWidth - 262) + "px";
                    p.style.top = clamp(y, 4, innerHeight - 310) + "px";
                    p.innerHTML = `<b>${esc(t.name)} — instrument & mixer</b><label>Volume<input type="range" min="0" max="1.5" step=".01" value="${t.volume}" data-k="volume"></label><label>Pan<input type="range" min="-1" max="1" step=".01" value="${t.pan}" data-k="pan"></label><label>Engine<select data-k="engine"><option value="gm">GM SoundFont</option><option value="osc">Basic oscillator</option><option value="op">Operator synth</option><option value="drum">Drum synth</option></select></label><label>Oscillator<select data-k="wave"><option>sawtooth</option><option>sine</option><option>square</option><option>triangle</option></select></label><label>Sound bank<select data-k="soundfont"><option>FluidR3_GM</option><option>MusyngKite</option></select></label><label>Instrument<select data-k="gmProgram">${SF.map((n, i) => `<option value="${i}">${String(i + 1).padStart(3, "0")} ${gmL(n)}</option>`).join("")}</select></label><div class="row"><button id="tpt">▶ Test</button><button id="tpi">Designer…</button><button id="tpx">Close</button></div>`;
                    const g = (k) => p.querySelector(`[data-k=${k}]`);
                    g("wave").value = t.wave;
                    g("engine").value = eng(t);
                    g("soundfont").value = t.soundfont;
                    g("gmProgram").value = t.gmProgram;
                    p.querySelectorAll("input").forEach(
                        (i) =>
                            (i.oninput = () => {
                                t[i.dataset.k] = +i.value;
                                if (A) upd(t);
                            })
                    );
                    p.querySelectorAll("select").forEach(
                        (s) =>
                            (s.onchange = () => {
                                const k = s.dataset.k;
                                t[k] = k === "gmProgram" ? +s.value : s.value;
                                if (k === "engine") {
                                    t.useGM = s.value === "gm";
                                    if (s.value === "op" || s.value === "drum") openIns(t);
                                }
                                if (A) {
                                    ensureAudio();
                                    eng(t) === "gm" && loadGM(t).catch(() => {});
                                }
                                tlui();
                            })
                    );
                    $("tpt").onclick = () => {
                        ensureAudio();
                        A.resume();
                        noteOn(t, eng(t) === "drum" ? 36 : 60, 0.85, A.currentTime, 0.7);
                    };
                    $("tpi").onclick = () => {
                        hideMenu();
                        openIns(t);
                    };
                    $("tpx").onclick = hideMenu;
                }
                /* ---------- playlist ---------- */
                const plPt = (e) => {
                    const r = pl.getBoundingClientRect();
                    return { x: e.clientX - r.left + plw.scrollLeft, y: e.clientY - r.top + plw.scrollTop };
                };
                pl.oncontextmenu = (e) => e.preventDefault();
                pl.onpointerdown = (e) => {
                    S.foc = "pl";
                    const q = plPt(e),
                        s = Math.floor(q.x / PX),
                        t = S.tracks[Math.floor(q.y / LANE)];
                    if (!t) return;
                    const c = clipAt(t.id, s);
                    if (e.button === 2) {
                        if (e.shiftKey)
                            return c
                                ? clipMenu(e, c)
                                : menu(e.clientX, e.clientY, [
                                      ["Place pattern here", () => placeClip(t, s)],
                                      [
                                          "Add pattern",
                                          () => {
                                              S.at = t.id;
                                              addPat();
                                          },
                                      ],
                                      ["Rename track", () => rename(t)],
                                  ]);
                        let h = 0;
                        const del = (k) => {
                            if (!h) {
                                hist();
                                h = 1;
                            }
                            S.clips.splice(S.clips.indexOf(k), 1);
                            if (S.sc === k) S.sc = null;
                            dirty("pl", "rl");
                        };
                        if (c) del(c);
                        drag = {
                            m(ev) {
                                const k = plPt(ev),
                                    t2 = S.tracks[Math.floor(k.y / LANE)],
                                    c2 = t2 && clipAt(t2.id, Math.floor(k.x / PX));
                                if (c2) del(c2);
                            },
                        };
                        return;
                    }
                    if (e.button !== 0) return;
                    if (e.ctrlKey || e.metaKey) return mq("pl", q, e);
                    if (c && e.shiftKey) {
                        S.cs.has(c.id) ? S.cs.delete(c.id) : S.cs.add(c.id);
                        S.sc = c;
                        dirty("pl");
                        return;
                    }
                    let cl = c;
                    if (c) {
                        S.sc = c;
                        if (!S.cs.has(c.id)) S.cs = new Set([c.id]);
                        sel1(t.id, c.pid);
                    } else {
                        cl = placeClip(t, s);
                        if (!cl) return;
                        S.cs = new Set([cl.id]);
                    }
                    hist();
                    const G = S.clips.filter((k) => S.cs.has(k.id) || k === cl),
                        GS = new Set(G),
                        oo = G.map((k) => [k, k.start]),
                        l = cl.len,
                        x0 = q.x,
                        edge = c && (cl.start + cl.len) * PX - q.x < 7;
                    drag = {
                        m(ev) {
                            const dx = Math.round((plPt(ev).x - x0) / PX / 4) * 4;
                            if (edge) {
                                const nl = Math.max(4, l + dx);
                                if (free(t.id, cl.start, nl, cl) && cl.start + nl <= TOT()) cl.len = nl;
                            } else {
                                const d = Math.max(dx, -Math.min(...oo.map((a) => a[1])));
                                if (oo.every(([k, s0]) => free(k.tid, s0 + d, k.len, GS) && s0 + d + k.len <= TOT()))
                                    oo.forEach(([k, s0]) => (k.start = s0 + d));
                            }
                            dirty("pl", "rl");
                        },
                    };
                    dirty("pl");
                };
                function placeClip(t, s) {
                    const p = P(t.pat) || mkPat(t),
                        st = Math.floor(s / 4) * 4;
                    let len = p.steps;
                    const nx = S.clips
                        .filter((k) => k.tid === t.id && k.start >= st)
                        .map((k) => k.start)
                        .sort((a, b) => a - b)[0];
                    if (nx !== undefined) len = Math.min(len, nx - st);
                    if (len < 4 || st + len > TOT() || !free(t.id, st, len)) return null;
                    hist();
                    const c = { id: uid(), tid: t.id, pid: p.id, start: st, len };
                    S.clips.push(c);
                    S.sc = c;
                    sel1(t.id);
                    dirty("pl", "rl");
                    return c;
                }
                const clipMenu = (e, c) =>
                    menu(e.clientX, e.clientY, [
                        [
                            "Delete clip",
                            () => {
                                hist();
                                S.clips = S.clips.filter((k) => k !== c);
                                dirty("pl", "rl");
                            },
                        ],
                        ["Duplicate clip", () => dupClip(c)],
                        [
                            "Set clip length…",
                            () => {
                                const v = Math.round(+prompt("Clip length in 16th steps", c.len));
                                if (v >= 4 && free(c.tid, c.start, v, c)) {
                                    hist();
                                    c.len = v;
                                    dirty("pl", "rl");
                                }
                            },
                        ],
                        [
                            "Rename pattern",
                            () => {
                                ACT.renp(P(c.pid));
                            },
                        ],
                        null,
                        ["Delete pattern and its clips", () => delPat(P(c.pid))],
                    ]);
                function dupClip(c) {
                    if (!free(c.tid, c.start + c.len, c.len)) return say("No room after this clip.");
                    hist();
                    S.clips.push({ ...c, id: uid(), start: c.start + c.len });
                    dirty("pl", "rl");
                }
                rlw.onpointerdown = (e) => {
                    const f = (ev) =>
                        setStep(Math.floor((ev.clientX - rlw.getBoundingClientRect().left + plw.scrollLeft) / PX));
                    f(e);
                    drag = { m: f };
                };
                /* ---------- piano roll ---------- */
                const rPt = (e) => {
                        const r = rc.getBoundingClientRect();
                        return { x: e.clientX - r.left + rw.scrollLeft, y: e.clientY - r.top + rw.scrollTop };
                    },
                    noteAt = (p, s, m) =>
                        p.notes.find(
                            (n) => n.pitch === m && s >= n.step && s < n.step + n.duration && n.step < p.steps
                        );
                const play = (m) => {
                    const t = ct();
                    if (A && t) noteOn(t, m, 0.8, A.currentTime, 0.25);
                };
                rc.oncontextmenu = (e) => e.preventDefault();
                rc.onpointerdown = (e) => {
                    S.foc = "ro";
                    const p = cp();
                    if (!p) return;
                    const q = rPt(e),
                        s = Math.floor(q.x / RW),
                        m = TOP - Math.floor(q.y / NH);
                    if (m < 24 || m > TOP || s < 0 || s >= p.steps) return;
                    const n = noteAt(p, s, m);
                    if (e.button === 2) {
                        if (e.shiftKey) return rollMenu(e, p, n, m, s);
                        let h = 0;
                        const del = (k) => {
                            if (!h) {
                                hist();
                                h = 1;
                            }
                            p.notes.splice(p.notes.indexOf(k), 1);
                            S.sel.delete(k.id);
                            dirty("ro", "pl");
                        };
                        if (n) del(n);
                        drag = {
                            m(ev) {
                                const k = rPt(ev),
                                    n2 = noteAt(p, Math.floor(k.x / RW), TOP - Math.floor(k.y / NH));
                                if (n2) del(n2);
                            },
                        };
                        return;
                    }
                    if (e.button !== 0) return;
                    if (e.ctrlKey || e.metaKey) return mq("ro", q, e);
                    ensureAudio();
                    A?.resume();
                    let nn = n,
                        mode = "mv";
                    if (!nn) {
                        hist();
                        if (!e.shiftKey) S.sel.clear();
                        const st = Math.floor(s / SN()) * SN();
                        nn = {
                            id: uid(),
                            pitch: m,
                            step: st,
                            duration: Math.max(1, Math.min(+$("nl").value, p.steps - st)),
                            velocity: 0.8,
                        };
                        p.notes.push(nn);
                        S.sel.add(nn.id);
                        play(m);
                    } else {
                        if (e.shiftKey) S.sel.has(nn.id) ? S.sel.delete(nn.id) : S.sel.add(nn.id);
                        else if (!S.sel.has(nn.id)) S.sel = new Set([nn.id]);
                        if (!S.sel.has(nn.id)) {
                            dirty("ro");
                            return;
                        }
                        hist();
                        if ((nn.step + nn.duration) * RW - q.x < 7) mode = "rs";
                        else play(nn.pitch);
                    }
                    const o = p.notes
                            .filter((k) => S.sel.has(k.id))
                            .map((k) => ({ k, s: k.step, p: k.pitch, d: k.duration })),
                        x0 = q.x,
                        y0 = q.y;
                    let ld = 0;
                    drag = {
                        m(ev) {
                            const k = rPt(ev);
                            let dx = Math.round((k.x - x0) / RW / SN()) * SN(),
                                dy = -Math.round((k.y - y0) / NH);
                            if (mode === "rs") o.forEach((a) => (a.k.duration = clamp(a.d + dx, 1, p.steps - a.s)));
                            else {
                                dx = clamp(
                                    dx,
                                    -Math.min(...o.map((a) => a.s)),
                                    p.steps - Math.max(...o.map((a) => a.s + a.d))
                                );
                                dy = clamp(
                                    dy,
                                    24 - Math.min(...o.map((a) => a.p)),
                                    TOP - Math.max(...o.map((a) => a.p))
                                );
                                o.forEach((a) => {
                                    a.k.step = a.s + dx;
                                    a.k.pitch = a.p + dy;
                                });
                                if (dy !== ld) {
                                    ld = dy;
                                    play(nn.pitch);
                                }
                            }
                            dirty("ro", "pl");
                        },
                    };
                    dirty("ro", "pl");
                };
                const rollMenu = (e, p, n, m, s) =>
                    menu(
                        e.clientX,
                        e.clientY,
                        n
                            ? [
                                  [
                                      "Delete note",
                                      () => {
                                          hist();
                                          p.notes.splice(p.notes.indexOf(n), 1);
                                          dirty("ro", "pl");
                                      },
                                  ],
                                  [
                                      "Duplicate note",
                                      () => {
                                          if (n.step + n.duration < p.steps) {
                                              hist();
                                              p.notes.push({ ...n, id: uid(), step: n.step + n.duration });
                                              dirty("ro", "pl");
                                          }
                                      },
                                  ],
                                  [
                                      "Set velocity…",
                                      () => {
                                          const v = +prompt("Velocity 1–127", Math.round(n.velocity * 127));
                                          if (v >= 1 && v <= 127) {
                                              hist();
                                              n.velocity = v / 127;
                                              dirty("ro");
                                          }
                                      },
                                  ],
                              ]
                            : [
                                  ["Quantize pattern", () => ACT.quant()],
                                  ["Select all notes", () => ACT.sall()],
                              ]
                    );
                kc.onpointerdown = (e) => {
                    ensureAudio();
                    A?.resume();
                    play(TOP - Math.floor((e.offsetY + rw.scrollTop) / NH));
                };
                function zoom(w, get, set, mn, mx) {
                    w.addEventListener(
                        "wheel",
                        (e) => {
                            if (!e.ctrlKey) return;
                            e.preventDefault();
                            const r = w.getBoundingClientRect(),
                                st = (e.clientX - r.left + w.scrollLeft) / get();
                            set(clamp(get() * (e.deltaY < 0 ? 1.15 : 1 / 1.15), mn, mx));
                            layout();
                            w.scrollLeft = st * get() - (e.clientX - r.left);
                        },
                        { passive: false }
                    );
                }
                zoom(
                    plw,
                    () => PX,
                    (v) => (PX = v),
                    2,
                    48
                );
                zoom(
                    rw,
                    () => RW,
                    (v) => (RW = v),
                    8,
                    80
                );
                plw.onscroll = () => {
                    tl.scrollTop = plw.scrollTop;
                    dirty("pl", "rl");
                    ph();
                };
                rw.onscroll = () => dirty("ro", "k");
                new ResizeObserver(dirtyAll).observe(plw);
                new ResizeObserver(dirtyAll).observe(rw);
                /* ---------- file I/O ---------- */
                function dl(name, data, type) {
                    const a = document.createElement("a"),
                        u = URL.createObjectURL(new Blob([data], { type }));
                    a.href = u;
                    a.download = name;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(u), 1000);
                }
                const vlq = (v) => {
                    const o = [v & 127];
                    while ((v >>= 7)) o.unshift((v & 127) | 128);
                    return o;
                };
                function exportMIDI() {
                    const ev = [],
                        ch = (i) => (i < 9 ? i : i + 1) % 16,
                        u = Math.round(6e7 / S.bpm),
                        ts = { 16: [4, 2], 12: [S.spb === 12 ? 3 : 6, 2] }[S.spb] || [4, 2];
                    ev.push(
                        { k: 0, o: -1, b: [255, 81, 3, (u >> 16) & 255, (u >> 8) & 255, u & 255] },
                        { k: 0, o: -1, b: [255, 88, 4, ts[0], ts[1], 24, 8] }
                    );
                    S.tracks.forEach((t, i) => {
                        const c = ch(i);
                        ev.push({ k: 0, o: 0, b: [0xc0 | c, t.gmProgram | 0] });
                        S.clips
                            .filter((k) => k.tid === t.id)
                            .forEach((cl) => {
                                const p = P(cl.pid);
                                if (!p) return;
                                for (let r = 0; r * p.steps < cl.len; r++)
                                    p.notes.forEach((n) => {
                                        const pos = r * p.steps + n.step;
                                        if (n.step >= p.steps || pos >= cl.len) return;
                                        const a = (cl.start + pos) * 120,
                                            e = a + Math.min(n.duration, p.steps - n.step, cl.len - pos) * 120;
                                        ev.push(
                                            {
                                                k: a,
                                                o: 1,
                                                b: [0x90 | c, n.pitch, Math.max(1, Math.round(n.velocity * 127))],
                                            },
                                            { k: e, o: 0, b: [0x80 | c, n.pitch, 0] }
                                        );
                                    });
                            });
                    });
                    ev.sort((a, b) => a.k - b.k || a.o - b.o);
                    let d = [],
                        last = 0;
                    ev.forEach((e) => {
                        d.push(...vlq(e.k - last), ...e.b);
                        last = e.k;
                    });
                    d.push(0, 255, 47, 0);
                    const L = d.length;
                    dl(
                        "workbench-export.mid",
                        new Uint8Array([
                            77,
                            84,
                            104,
                            100,
                            0,
                            0,
                            0,
                            6,
                            0,
                            0,
                            0,
                            1,
                            1,
                            224,
                            77,
                            84,
                            114,
                            107,
                            (L >>> 24) & 255,
                            (L >>> 16) & 255,
                            (L >>> 8) & 255,
                            L & 255,
                            ...d,
                        ]),
                        "audio/midi"
                    );
                }
                function parseMIDI(b) {
                    const v = new DataView(b);
                    if (v.getUint32(0) !== 0x4d546864) throw Error("Not a MIDI file");
                    const ppq = v.getUint16(12) || 480;
                    let pos = 8 + v.getUint32(4);
                    const out = [];
                    while (pos + 8 <= v.byteLength) {
                        const id = v.getUint32(pos),
                            len = v.getUint32(pos + 4);
                        pos += 8;
                        const end = pos + len;
                        if (id !== 0x4d54726b) {
                            pos = end;
                            continue;
                        }
                        let tk = 0,
                            run = 0;
                        const on = {},
                            rv = () => {
                                let d = 0,
                                    c;
                                do {
                                    c = v.getUint8(pos++);
                                    d = (d << 7) | (c & 127);
                                } while (c & 128 && pos < end);
                                return d;
                            };
                        while (pos < end) {
                            tk += rv();
                            let st = v.getUint8(pos);
                            if (st < 128) st = run;
                            else {
                                pos++;
                                if (st < 0xf0) run = st;
                            }
                            if (st === 255) {
                                pos++;
                                pos += rv();
                                continue;
                            }
                            if (st === 0xf0 || st === 0xf7) {
                                pos += rv();
                                continue;
                            }
                            const cmd = st & 0xf0,
                                d1 = v.getUint8(pos++),
                                d2 = cmd === 0xc0 || cmd === 0xd0 ? 0 : v.getUint8(pos++),
                                k = (st & 15) + ":" + d1;
                            if (cmd === 0x90 && d2) on[k] = { t: tk, v: d2 };
                            else if (cmd === 0x80 || (cmd === 0x90 && !d2)) {
                                const a = on[k];
                                if (a) {
                                    out.push({ t: a.t, d: tk - a.t, p: d1, v: a.v });
                                    delete on[k];
                                }
                            }
                        }
                        pos = end;
                    }
                    if (!out.length) throw Error("No notes found");
                    return { out, q: ppq / 4 };
                }
                function importMIDI(buf) {
                    const t = ct(),
                        { out, q } = parseMIDI(buf);
                    hist();
                    const notes = out
                            .filter((n) => n.p >= 24 && n.p <= TOP)
                            .map((n) => ({
                                id: uid(),
                                pitch: n.p,
                                step: Math.round(n.t / q),
                                duration: Math.max(1, Math.round(n.d / q)),
                                velocity: n.v / 127,
                            })),
                        mx = Math.max(...notes.map((n) => n.step + n.duration)),
                        steps = clamp(Math.ceil(mx / S.spb) * S.spb, S.spb, TOT()),
                        p = mkPat(t, steps);
                    p.name = "Imported";
                    p.notes = notes.filter((n) => n.step < steps);
                    p.notes.forEach((n) => (n.duration = Math.min(n.duration, steps - n.step)));
                    let st = Math.floor(S.step / S.spb) * S.spb;
                    while (!free(t.id, st, steps) && st < TOT()) st += S.spb;
                    if (st + steps <= TOT()) S.clips.push({ id: uid(), tid: t.id, pid: p.id, start: st, len: steps });
                    all();
                    say(`Imported ${p.notes.length} notes into a new pattern on ${t.name}`);
                }
                $("mo").onchange = async (e) => {
                    const f = e.target.files[0];
                    if (f)
                        try {
                            importMIDI(await f.arrayBuffer());
                        } catch (x) {
                            alert("MIDI import failed: " + x.message);
                        }
                    e.target.value = "";
                };
                $("fo").onchange = async (e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    try {
                        loadProj(JSON.parse(await f.text()));
                    } catch (x) {
                        alert("Could not open project: " + x.message);
                    }
                    e.target.value = "";
                };
                function loadProj(d) {
                    stop(1);
                    hist();
                    S.bpm = d.bpm || 120;
                    S.spb = d.spb || 16;
                    S.tracks = (d.tracks || []).map((t) => ({ ...mkTrack("", ""), ...t }));
                    S.sc = null;
                    S.cs = new Set();
                    S.sel = new Set();
                    if (d.notes) {
                        S.pats = {};
                        S.clips = [];
                        const mp = {};
                        S.tracks.forEach((t) => {
                            Object.values(d.patterns || {}).forEach((op) => {
                                const ns = d.notes[t.id]?.[op.id] || [];
                                if (
                                    ns.length ||
                                    (d.clips || []).some((c) => c.trackId === t.id && c.patternId === op.id)
                                ) {
                                    const p = mkPat(t, op.steps);
                                    p.name = op.name;
                                    p.notes = ns.map((n) => ({ ...n, id: uid() }));
                                    mp[op.id + t.id] = p.id;
                                }
                            });
                        });
                        S.clips = (d.clips || [])
                            .filter((c) => mp[c.patternId + c.trackId])
                            .map((c) => ({
                                id: uid(),
                                tid: c.trackId,
                                pid: mp[c.patternId + c.trackId],
                                start: c.start,
                                len: c.length,
                            }));
                    } else {
                        S.pats = d.pats || {};
                        S.clips = d.clips || [];
                    }
                    S.tracks.forEach((t) => {
                        if (!P(t.pat)) {
                            const p = Object.values(S.pats).find((q) => q.tid === t.id);
                            t.pat = p ? p.id : mkPat(t).id;
                        }
                    });
                    if (!S.tracks.length) {
                        const t = mkTrack("Track 1", COL[0]);
                        S.tracks.push(t);
                        mkPat(t);
                    }
                    S.at = S.tracks[0].id;
                    $("bpm").value = S.bpm;
                    $("sig").value = S.spb === 12 ? "3/4" : "4/4";
                    if (A) {
                        N = {};
                        S.tracks.forEach(build);
                    }
                    all();
                }
                /* ---------- input ---------- */
                const H = {},
                    KM = "awsedftgyhujkolp";
                function hit(m, v) {
                    ensureAudio();
                    const t = ct();
                    if (!t || !A) return;
                    noteOn(t, m, v, A.currentTime, 0.35);
                    if (!S.rec || !S.playing) return;
                    let c = clipAt(t.id, S.step),
                        p = P(t.pat);
                    if (!p) return;
                    if (!c) {
                        const st = Math.floor(S.step / S.spb) * S.spb;
                        if (!free(t.id, st, p.steps)) return;
                        hist();
                        c = { id: uid(), tid: t.id, pid: p.id, start: st, len: p.steps };
                        S.clips.push(c);
                    } else p = P(c.pid);
                    const n = { id: uid(), pitch: m, step: (S.step - c.start) % p.steps, duration: 1, velocity: v };
                    p.notes.push(n);
                    H[m] = { n, a: S.step, p };
                    dirty("ro", "pl");
                }
                function rel(m) {
                    const h = H[m];
                    if (!h) return;
                    h.n.duration = clamp(S.step - h.a + 1, 1, h.p.steps - h.n.step);
                    delete H[m];
                    dirty("ro", "pl");
                }
                async function initMIDI() {
                    if (!navigator.requestMIDIAccess)
                        return say("Web MIDI is unavailable. Use Chrome or Edge over HTTPS or localhost.");
                    try {
                        const a = await navigator.requestMIDIAccess();
                        let n = 0;
                        a.inputs.forEach((i) => {
                            n++;
                            i.onmidimessage = (ev) => {
                                const [st, p, v] = ev.data,
                                    c = st & 0xf0;
                                if (c === 0x90 && v) hit(p, v / 127);
                                else if (c === 0x80 || (c === 0x90 && !v)) rel(p);
                            };
                        });
                        say(`MIDI ready: ${n} input device(s) connected.`);
                    } catch (e) {
                        say("Could not access MIDI: " + e.message);
                    }
                }
                function quant() {
                    const p = cp();
                    if (!p) return;
                    hist();
                    const s = SN();
                    p.notes
                        .filter((n) => !S.sel.size || S.sel.has(n.id))
                        .forEach((n) => (n.step = clamp(Math.round(n.step / s) * s, 0, p.steps - n.duration)));
                    dirty("ro", "pl");
                }
                const ACT = {
                    new() {
                        if (!confirm("Start a new project? Unsaved changes will be lost.")) return;
                        stop(1);
                        S.tracks = [];
                        S.pats = {};
                        S.clips = [];
                        S.h = [];
                        S.f = [];
                        S.sc = null;
                        const t = mkTrack("Track 1", COL[0]);
                        S.tracks.push(t);
                        mkPat(t);
                        S.at = t.id;
                        if (A) {
                            N = {};
                            S.tracks.forEach(build);
                        }
                        all();
                    },
                    save() {
                        dl(
                            "workbench-project.json",
                            JSON.stringify({
                                version: 3,
                                bpm: S.bpm,
                                spb: S.spb,
                                tracks: S.tracks,
                                pats: S.pats,
                                clips: S.clips,
                            }),
                            "application/json"
                        );
                    },
                    load() {
                        $("fo").click();
                    },
                    mexp: exportMIDI,
                    mimp() {
                        $("mo").click();
                    },
                    undo,
                    redo,
                    sall() {
                        const p = cp();
                        if (p) S.sel = new Set(p.notes.map((n) => n.id));
                        S.foc = "ro";
                        dirty("ro");
                    },
                    quant,
                    addt: addTrack,
                    addp() {
                        addPat();
                    },
                    dupp() {
                        const p = cp();
                        if (p) addPat(p);
                    },
                    renp(p) {
                        p = p && p.id ? p : cp();
                        if (!p) return;
                        const v = prompt("Pattern name", p.name)?.trim();
                        if (v) {
                            hist();
                            p.name = v;
                            all();
                        }
                    },
                    delp() {
                        delPat(cp());
                    },
                    met() {
                        S.met = !S.met;
                        $("met").classList.toggle("on", !!S.met);
                        say("Metronome " + (S.met ? "on" : "off"));
                    },
                    mdev: initMIDI,
                    kb() {
                        S.kb = !S.kb;
                        say(
                            S.kb
                                ? "Computer keyboard on: A–L row plays notes, W/E/T/Y/U/O/P are the black keys."
                                : "Computer keyboard off"
                        );
                    },
                    side() {
                        $("main").classList.toggle("flip");
                    },
                    fx() {
                        S.vfx = !S.vfx;
                        vis();
                    },
                    roll() {
                        S.vro = !S.vro;
                        vis();
                    },
                };
                /* ===== v4 additions ===== */
                const eng = (t) => t.engine || (t.useGM === false ? "osc" : "gm");
                const DD = {
                    kick: { tune: 55, decay: 0.45, punch: 0.6, click: 0.3, vol: 1 },
                    snare: { tune: 190, decay: 0.22, noise: 0.7, tone: 1800, vol: 1 },
                    clap: { decay: 0.25, tone: 1300, vol: 1 },
                    chat: { decay: 0.05, tone: 7500, vol: 1 },
                    ohat: { decay: 0.35, tone: 7500, vol: 1 },
                    crash: { decay: 1.3, tone: 6000, vol: 1 },
                    tom: { tune: 110, decay: 0.35, vol: 1 },
                };
                const DK = {
                    tune: ["Tune", 20, 400, 1, "Hz"],
                    decay: ["Decay", 0.03, 2, 0.01, "s"],
                    punch: ["Punch", 0, 1, 0.01, "%"],
                    click: ["Click", 0, 1, 0.01, "%"],
                    noise: ["Noise", 0, 1, 0.01, "%"],
                    tone: ["Tone", 300, 12000, 10, "Hz"],
                    vol: ["Level", 0, 1.5, 0.01, "%"],
                };
                const DP = { 36: "kick", 38: "snare", 39: "clap", 42: "chat", 46: "ohat", 49: "crash", 45: "tom" },
                    DN = {
                        kick: "Kick",
                        snare: "Snare",
                        clap: "Clap",
                        chat: "C.Hat",
                        ohat: "O.Hat",
                        crash: "Crash",
                        tom: "Tom",
                    };
                const defOp = () => ({
                        alg: 0,
                        ops: [
                            [1, 0.8],
                            [2, 0.3],
                            [3, 0.3],
                            [1, 0.3],
                        ].map(([r, l]) => ({ w: "sine", r, f: 0, l, a: 0.005, d: 0.3, s: 0.6, rl: 0.2 })),
                    }),
                    defDrum = () => JSON.parse(JSON.stringify(DD));
                const OPS = [
                    ["r", "Ratio", 0.25, 16, 0.25, "x"],
                    ["f", "Fine", -100, 100, 1, "¢"],
                    ["l", "Level", 0, 1, 0.01, "%"],
                    ["a", "Attack", 0.001, 2, 0.001, "s"],
                    ["d", "Decay", 0.01, 2, 0.01, "s"],
                    ["s", "Sustain", 0, 1, 0.01, "%"],
                    ["rl", "Release", 0.01, 3, 0.01, "s"],
                ];
                const ALG = [
                    [
                        "D›C›B›A",
                        [
                            [3, 2],
                            [2, 1],
                            [1, 0],
                        ],
                        [0],
                    ],
                    [
                        "(C+D)›B›A",
                        [
                            [3, 1],
                            [2, 1],
                            [1, 0],
                        ],
                        [0],
                    ],
                    [
                        "D›C›(A+B)",
                        [
                            [3, 2],
                            [2, 0],
                            [2, 1],
                        ],
                        [0, 1],
                    ],
                    [
                        "(D›C)+(B›A)",
                        [
                            [3, 2],
                            [1, 0],
                        ],
                        [0, 2],
                    ],
                    [
                        "D›(A+B+C)",
                        [
                            [3, 0],
                            [3, 1],
                            [3, 2],
                        ],
                        [0, 1, 2],
                    ],
                    ["A+B+C+D (additive)", [], [0, 1, 2, 3]],
                ];
                function opNote(t, p, v, time, dur) {
                    const n = N[t.id],
                        o = t.op,
                        al = ALG[o.alg],
                        f0 = 440 * 2 ** ((p - 69) / 12),
                        os = [],
                        gs = [];
                    o.ops.forEach((x, i) => {
                        const s = A.createOscillator(),
                            g = A.createGain(),
                            fr = f0 * x.r * 2 ** (x.f / 1200),
                            car = al[2].includes(i),
                            pk = car ? x.l * v * 0.35 : x.l * fr * 4;
                        s.type = x.w;
                        s.frequency.value = fr;
                        g.gain.setValueAtTime(0, time);
                        g.gain.linearRampToValueAtTime(pk, time + x.a);
                        g.gain.setTargetAtTime(pk * x.s, time + x.a, Math.max(0.01, x.d / 3));
                        g.gain.setTargetAtTime(0, time + Math.max(dur, x.a + 0.01), Math.max(0.01, x.rl / 3));
                        s.connect(g);
                        os.push(s);
                        gs.push(g);
                        if (car) g.connect(n.inp);
                    });
                    al[1].forEach(([a, b]) => gs[a].connect(os[b].frequency));
                    os.forEach((s, i) => {
                        s.start(time);
                        s.stop(time + dur + o.ops[i].rl * 1.5 + 0.4);
                    });
                }
                const nz = () =>
                    A._nb ||
                    (A._nb = (() => {
                        const b = A.createBuffer(1, A.sampleRate, A.sampleRate),
                            d = b.getChannelData(0);
                        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
                        return b;
                    })());
                function drumHit(t, pi, v, T0) {
                    const id = DP[pi];
                    if (!id) return;
                    const d = t.drum[id],
                        n = N[t.id],
                        g = A.createGain(),
                        vl = v * d.vol;
                    g.connect(n.inp);
                    const env = (e, pk, dc, at, t0) => {
                        e.gain.setValueAtTime(0, t0);
                        e.gain.linearRampToValueAtTime(pk, t0 + at);
                        e.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dc);
                    };
                    const osc = (ty, f0, f1, sw, dc, pk) => {
                        const o = A.createOscillator(),
                            e = A.createGain();
                        o.type = ty;
                        o.frequency.setValueAtTime(f0, T0);
                        o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), T0 + sw);
                        env(e, pk, dc, 0.002, T0);
                        o.connect(e);
                        e.connect(g);
                        o.start(T0);
                        o.stop(T0 + dc + 0.05);
                    };
                    const nse = (ft, fq, dc, pk, t0 = T0, q = 1) => {
                        const s = A.createBufferSource(),
                            f = A.createBiquadFilter(),
                            e = A.createGain();
                        s.buffer = nz();
                        s.loop = true;
                        f.type = ft;
                        f.frequency.value = fq;
                        f.Q.value = q;
                        env(e, pk, dc, 0.001, t0);
                        s.connect(f);
                        f.connect(e);
                        e.connect(g);
                        s.start(t0);
                        s.stop(t0 + dc + 0.05);
                    };
                    const mtl = (fq, dc, pk) => {
                        const f = A.createBiquadFilter(),
                            e = A.createGain();
                        f.type = "highpass";
                        f.frequency.value = fq;
                        env(e, pk, dc, 0.001, T0);
                        f.connect(e);
                        e.connect(g);
                        [1, 1.4471, 1.617, 1.9265, 2.5028, 2.6637].forEach((r) => {
                            const o = A.createOscillator();
                            o.type = "square";
                            o.frequency.value = 205.3 * r;
                            o.connect(f);
                            o.start(T0);
                            o.stop(T0 + dc + 0.05);
                        });
                    };
                    if (id === "kick") {
                        osc("sine", d.tune * (1 + d.punch * 5), d.tune, 0.07, d.decay, vl);
                        nse("highpass", 3000, 0.015, vl * d.click);
                    } else if (id === "snare") {
                        osc("triangle", d.tune * 1.4, d.tune, 0.04, d.decay * 0.7, vl * 0.6);
                        nse("highpass", d.tone, d.decay, vl * d.noise);
                    } else if (id === "clap") {
                        [0, 0.012, 0.026].forEach((o) => nse("bandpass", d.tone, 0.02, vl, T0 + o, 1.5));
                        nse("bandpass", d.tone, d.decay, vl * 0.8, T0 + 0.04, 1.5);
                    } else if (id === "tom") osc("sine", d.tune * 1.6, d.tune, 0.1, d.decay, vl);
                    else {
                        mtl(d.tone, d.decay, vl * 0.35);
                        nse("highpass", d.tone, d.decay, vl * 0.4);
                    }
                }
                const isD = () => {
                        const t = ct();
                        return !!t && eng(t) === "drum";
                    },
                    lab = (m) => (isD() && DP[m] ? DN[DP[m]] : pname(m));
                const SC = [
                    ["Chromatic", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
                    ["Major", [0, 2, 4, 5, 7, 9, 11]],
                    ["Minor", [0, 2, 3, 5, 7, 8, 10]],
                    ["Dorian", [0, 2, 3, 5, 7, 9, 10]],
                    ["Pentatonic", [0, 2, 4, 7, 9]],
                    ["Blues", [0, 3, 5, 6, 7, 10]],
                ];
                const inS = () => {
                    const s = SC[$("ss").value | 0][1],
                        r = +$("sk").value;
                    return (m) => s.includes((((m - r) % 12) + 12) % 12);
                };
                $("sk").innerHTML = NM.map((n, i) => `<option value="${i}">${n}</option>`).join("");
                $("ss").innerHTML = SC.map((s, i) => `<option value="${i}">${s[0]}</option>`).join("");
                $("sk").onchange = $("ss").onchange = () => dirty("ro");
                /*
                 * THEME CONFIGURATION
                 * -------------------
                 * To create a theme:
                 *  1. Add a new entry to THEMES below.
                 *  2. Copy the `ui` section from flstudio and change its values.
                 *  3. Add a matching menu action if you want it selectable from View.
                 *
                 * `canvas` controls the sequencer's drawn colors.
                 * `ui` controls the complete HTML interface: colors, corners, spacing,
                 * borders, shadows and typography. All measurements accept CSS values.
                 *
                 * Graphite, Basic and Vindows Vista intentionally keep their original
                 * canvas palettes and their existing CSS styling.
                 */
                const THEMES = {
                    graphite: {
                        bg: "#1c1d20",
                        l0: "#26282c",
                        l1: "#222428",
                        ls: "#2b2e33",
                        ln: "#111",
                        gb: "#4a4e55",
                        gt: "#2f3237",
                        rb: "#2e3135",
                        tb: "#8a9099",
                        tbt: "#555a62",
                        tx: "#cfd3d8",
                        ac: "#ffb000",
                        r0: "#1b1c1f",
                        rk: "#212225",
                        rw: "#2a2c30",
                        rl: "#18191b",
                        rc: "#565b63",
                        gB: "#656a73",
                        gb2: "#41454b",
                        gs: "#2f3236",
                        ns: "#fff",
                    },
                    basic: {
                        bg: "#c0c0c0",
                        l0: "#c0c0c0",
                        l1: "#b4b4b4",
                        ls: "#d4d4d4",
                        ln: "#000",
                        gb: "#404040",
                        gt: "#909090",
                        rb: "#c0c0c0",
                        tb: "#000",
                        tbt: "#404040",
                        tx: "#000",
                        ac: "#000",
                        r0: "#fff",
                        rk: "#c8c8c8",
                        rw: "#fff",
                        rl: "#808080",
                        rc: "#000",
                        gB: "#000",
                        gb2: "#808080",
                        gs: "#d8d8d8",
                        ns: "#ff0",
                    },
                    vista: {
                        bg: "#fff",
                        l0: "#f4f7fc",
                        l1: "#fff",
                        ls: "#e3effc",
                        ln: "#c9d4e4",
                        gb: "#a9b8cf",
                        gt: "#e1e8f2",
                        rb: "#e9eff8",
                        tb: "#33425b",
                        tbt: "#a9b8cf",
                        tx: "#1b2a41",
                        ac: "#1c7fe0",
                        r0: "#fff",
                        rk: "#e3ebf6",
                        rw: "#fff",
                        rl: "#d5deeb",
                        rc: "#8fa3c0",
                        gB: "#8fa3c0",
                        gb2: "#c5d1e2",
                        gs: "#e8eef6",
                        ns: "#a8d4ff",
                    },
                    flstudio: {
                        canvas: {
                            bg: "#202629", l0: "#303a3e", l1: "#293337",
                            ls: "#3b484d", ln: "#182125", gb: "#66747a",
                            gt: "#39464b", rb: "#303a3e", tb: "#b2bec2",
                            tbt: "#65747a", tx: "#d7dfe1", ac: "#ff9b35",
                            r0: "#20282c", rk: "#293438", rw: "#354247",
                            rl: "#1d272b", rc: "#718087", gB: "#89969b",
                            gb2: "#4a585e", gs: "#303c41", ns: "#ffb45e"
                        },
                        ui: {
                            /* Main surfaces */
                            outside: "#202629",
                            panel: "#303a3e",
                            card: "#39464b",
                            header: "#39464b",
                            toolbar: "#303a3e",
                            row: "#303a3e",
                            popup: "#354247",
                            input: "#20282c",
                            display: "#171e21",

                            /* Text and accents */
                            text: "#d7dfe1",
                            dim: "#9aa8ad",
                            accent: "#ff9b35",
                            selected: "#4b5a60",
                            selectedText: "#ffffff",
                            selectedBorder: "#ff9b35",
                            inputText: "#e4ebed",
                            buttonText: "#e0e7e9",
                            buttonActiveText: "#171e21",
                            popupText: "#e0e7e9",
                            popupHoverText: "#ffffff",
                            displayText: "#ffad55",
                            ruler: "#293438",
                            divider: "#1d272b",
                            playhead: "#ff9b35",

                            /* Shape, spacing and typography */
                            fontFamily: '"Segoe UI", Tahoma, sans-serif',
                            fontSize: "11px",
                            titlebar: "linear-gradient(#596267, #465158)",
                            titlebarText: "#e1e8ea",
                            titlebarHeight: "28px",
                            titlebarPadding: "0 0 0 9px",
                            titlebarRadius: "0",
                            titlebarButton: "linear-gradient(#59666c, #465158)",
                            titlebarButtonText: "#d9e1e5",
                            closeButton: "linear-gradient(#b94c3d, #87362d)",
                            appBorder: "0",
                            appRadius: "0",
                            appShadow: "none",
                            radius: "3px",
                            controlRadius: "3px",
                            cardPadding: "5px 7px",
                            buttonPadding: "3px 9px",
                            inputPadding: "2px 5px",
                            menuPadding: "5px 11px",
                            popupPadding: "3px",
                            popupItemPadding: "5px 10px",
                            popupShadow: "0 4px 12px #0008",
                            buttonShadow: "inset 0 1px 0 #ffffff12",
                            buttonActiveShadow: "inset 0 1px 3px #0006",
                            button: "linear-gradient(#4b585e, #3b484d)",
                            buttonHover: "linear-gradient(#59686e, #46545a)",
                            buttonActive: "linear-gradient(#ffb45e, #e8892e)"
                        }
                    }
                };

                /* Legacy themes use their original palette object directly. */
                let TH = THEMES.graphite.canvas;

                function applyThemeUI(theme) {
                    const ui = theme.ui;
                    const body = document.body;
                    body.style.removeProperty("--theme-ui-enabled");
                    for (const prop of [...body.style]) {
                        if (prop.startsWith("--ui-")) body.style.removeProperty(prop);
                    }
                    if (!ui) return;

                    const cssNames = {
                        outside: "outside", panel: "panel", card: "card",
                        header: "header", toolbar: "toolbar", row: "row",
                        popup: "popup", input: "input", display: "display",
                        text: "text", dim: "dim", accent: "accent",
                        selected: "selected", selectedText: "selected-text",
                        selectedBorder: "selected-border", inputText: "input-text",
                        buttonText: "button-text", buttonActiveText: "button-active-text",
                        popupText: "popup-text", popupHoverText: "popup-hover-text",
                        displayText: "display-text", ruler: "ruler", divider: "divider",
                        playhead: "playhead", fontFamily: "font-family", fontSize: "font-size",
                        titlebar: "titlebar", titlebarText: "titlebar-text",
                        titlebarHeight: "titlebar-height", titlebarPadding: "titlebar-padding",
                        titlebarRadius: "titlebar-radius", titlebarButton: "titlebar-button",
                        titlebarButtonText: "titlebar-button-text", closeButton: "close-button",
                        appBorder: "app-border", appRadius: "app-radius", appShadow: "app-shadow",
                        radius: "radius", controlRadius: "control-radius",
                        cardPadding: "card-padding", buttonPadding: "button-padding",
                        inputPadding: "input-padding", menuPadding: "menu-padding",
                        popupPadding: "popup-padding", popupItemPadding: "popup-item-padding",
                        popupShadow: "popup-shadow", buttonShadow: "button-shadow",
                        buttonActiveShadow: "button-active-shadow", button: "button",
                        buttonHover: "button-hover", buttonActive: "button-active"
                    };
                    for (const [key, value] of Object.entries(ui)) {
                        const cssKey = cssNames[key];
                        if (cssKey) body.style.setProperty("--ui-" + cssKey, value);
                    }
                    body.style.setProperty("--theme-ui-enabled", "1");
                    body.style.setProperty("--ui-dim", ui.dim || "inherit");
                }

                function setTheme(k) {
                    const theme = THEMES[k];
                    if (!theme) return;
                    TH = theme.canvas || theme;
                    document.body.dataset.th = k;
                    applyThemeUI(theme);
                    try { localStorage.wth = k; } catch (e) {}
                    dirtyAll();
                }
                /* rubber-band selection (Ctrl+drag) */
                function mq(w, q, e) {
                    const base = e.shiftKey ? new Set(w === "pl" ? S.cs : S.sel) : new Set(),
                        get = w === "pl" ? plPt : rPt;
                    S.mq = { w, x0: q.x, y0: q.y, x1: q.x, y1: q.y };
                    drag = {
                        m(ev) {
                            const k = get(ev),
                                m = S.mq;
                            m.x1 = k.x;
                            m.y1 = k.y;
                            const a = Math.min(m.x0, m.x1),
                                b = Math.max(m.x0, m.x1),
                                c = Math.min(m.y0, m.y1),
                                d = Math.max(m.y0, m.y1),
                                R = new Set(base);
                            if (w === "pl")
                                S.clips.forEach((cl) => {
                                    const i = ti(cl.tid),
                                        y = i * LANE;
                                    if (
                                        i >= 0 &&
                                        cl.start * PX < b &&
                                        (cl.start + cl.len) * PX > a &&
                                        y < d &&
                                        y + LANE > c
                                    )
                                        R.add(cl.id);
                                });
                            else {
                                const p = cp();
                                p &&
                                    p.notes.forEach((n) => {
                                        const y = (TOP - n.pitch) * NH;
                                        if (n.step * RW < b && (n.step + n.duration) * RW > a && y < d && y + NH > c)
                                            R.add(n.id);
                                    });
                            }
                            if (w === "pl") {
                                S.cs = R;
                                S.sc = null;
                            } else S.sel = R;
                            dirty("pl", "ro");
                        },
                        u() {
                            S.mq = null;
                            dirty("pl", "ro");
                        },
                    };
                }
                const mqd = (x, w, sx, sy) => {
                    const m = S.mq;
                    if (!m || m.w !== w) return;
                    x.fillStyle = "#4a90d955";
                    x.strokeStyle = "#4a90d9";
                    const a = Math.min(m.x0, m.x1) - sx,
                        b = Math.min(m.y0, m.y1) - sy,
                        cw = Math.abs(m.x1 - m.x0),
                        ch = Math.abs(m.y1 - m.y0);
                    x.fillRect(a, b, cw, ch);
                    x.strokeRect(a + 0.5, b + 0.5, cw, ch);
                };
                /* note tools */
                const nsel = () => {
                    const p = cp();
                    return p ? p.notes.filter((n) => !S.sel.size || S.sel.has(n.id)) : [];
                };
                const nop = (f) => {
                    const p = cp(),
                        l = nsel();
                    if (!p || !l.length) return;
                    hist();
                    f(l, p);
                    dirty("ro", "pl");
                };
                const curClips = () => S.clips.filter((c) => c === S.sc || S.cs.has(c.id));
                let CB = null;
                Object.assign(ACT, {
                    rev() {
                        nop((l) => {
                            const a = Math.min(...l.map((n) => n.step)),
                                b = Math.max(...l.map((n) => n.step + n.duration));
                            l.forEach((n) => (n.step = a + b - n.step - n.duration));
                        });
                    },
                    inv() {
                        nop((l) => {
                            const a = Math.min(...l.map((n) => n.pitch)),
                                b = Math.max(...l.map((n) => n.pitch));
                            l.forEach((n) => (n.pitch = a + b - n.pitch));
                        });
                    },
                    leg() {
                        nop((l, p) => {
                            const s = [...l].sort((x, y) => x.step - y.step);
                            s.forEach((n) => {
                                const k = s.find((o) => o.step > n.step);
                                n.duration = k ? k.step - n.step : p.steps - n.step;
                            });
                        });
                    },
                    hum() {
                        nop((l) =>
                            l.forEach((n) => (n.velocity = clamp(n.velocity + (Math.random() - 0.5) * 0.3, 0.1, 1)))
                        );
                    },
                    x2() {
                        nop((l, p) => l.forEach((n) => (n.duration = Math.min(n.duration * 2, p.steps - n.step))));
                    },
                    h2() {
                        nop((l) => l.forEach((n) => (n.duration = Math.max(1, Math.round(n.duration / 2)))));
                    },
                    vel() {
                        const v = +prompt("Velocity 1–127 for the selected notes (or all)", 100);
                        if (v >= 1 && v <= 127) nop((l) => l.forEach((n) => (n.velocity = v / 127)));
                    },
                    copy() {
                        if (S.foc === "ro") {
                            const l = nsel().filter((n) => S.sel.has(n.id));
                            if (l.length) CB = { k: "n", d: JSON.parse(JSON.stringify(l)) };
                        } else {
                            const l = curClips();
                            if (l.length) CB = { k: "c", d: JSON.parse(JSON.stringify(l)) };
                        }
                        say(CB ? "Copied" : "Nothing selected");
                    },
                    cut() {
                        ACT.copy();
                        delSel();
                    },
                    del: delSel,
                    dup() {
                        dispatchEvent(new KeyboardEvent("keydown", { key: "d", ctrlKey: true }));
                    },
                    paste() {
                        if (!CB) return;
                        if (CB.k === "n") {
                            const p = cp(),
                                t = ct(),
                                c = t && clipAt(t.id, S.step);
                            if (!p) return;
                            hist();
                            const a = Math.min(...CB.d.map((n) => n.step)),
                                off = c ? (S.step - c.start) % p.steps : 0;
                            S.sel = new Set(
                                CB.d
                                    .map((n) => {
                                        const k = { ...n, id: uid(), step: n.step - a + off };
                                        if (k.step >= p.steps) return null;
                                        k.duration = Math.min(k.duration, p.steps - k.step);
                                        p.notes.push(k);
                                        return k.id;
                                    })
                                    .filter(Boolean)
                            );
                            dirty("ro", "pl");
                        } else {
                            const a = Math.min(...CB.d.map((c) => c.start)),
                                st = Math.floor(S.step / 4) * 4;
                            hist();
                            S.cs = new Set();
                            CB.d.forEach((c) => {
                                const k = { ...c, id: uid(), start: c.start - a + st };
                                if (T(k.tid) && P(k.pid) && free(k.tid, k.start, k.len) && k.start + k.len <= TOT()) {
                                    S.clips.push(k);
                                    S.cs.add(k.id);
                                }
                            });
                            dirty("pl", "rl");
                        }
                    },
                    snone() {
                        S.sel = new Set();
                        S.cs = new Set();
                        S.sc = null;
                        dirty("ro", "pl");
                    },
                    sinv() {
                        const p = cp();
                        if (p) S.sel = new Set(p.notes.filter((n) => !S.sel.has(n.id)).map((n) => n.id));
                        dirty("ro");
                    },
                    addd() {
                        addTrack("drum");
                    },
                    addo() {
                        addTrack("op");
                    },
                    clrp() {
                        const p = cp();
                        if (p && confirm("Remove every note in this pattern?")) {
                            hist();
                            p.notes = [];
                            dirty("ro", "pl");
                        }
                    },
                    rent() {
                        const t = ct();
                        t && rename(t);
                    },
                    dupt() {
                        const t = ct();
                        t && dupTrack(t);
                    },
                    delt() {
                        const t = ct();
                        t && delTrack(t);
                    },
                    ins() {
                        openIns(ct());
                    },
                    mall() {
                        S.tracks.forEach((t) => (t.muted = true));
                        updAll();
                        tlui();
                    },
                    umall() {
                        S.tracks.forEach((t) => (t.muted = false));
                        updAll();
                        tlui();
                    },
                    csolo() {
                        S.tracks.forEach((t) => (t.solo = false));
                        updAll();
                        tlui();
                    },
                    pp() {
                        $("play").click();
                    },
                    stop() {
                        stop(1);
                    },
                    home() {
                        setStep(0);
                    },
                    end() {
                        setStep(endStep() - 1);
                    },
                    loop() {
                        $("loop").click();
                    },
                    rec() {
                        $("rec").click();
                    },
                    tempo() {
                        const v = +prompt("Tempo (BPM)", S.bpm);
                        if (v >= 40 && v <= 240) {
                            S.bpm = v;
                            $("bpm").value = v;
                            updAll();
                        }
                    },
                    cond() {
                        S.cond = !S.cond;
                        LANE = S.cond ? 24 : 52;
                        document.body.classList.toggle("cond", !!S.cond);
                        document.documentElement.style.setProperty("--lane", LANE + "px");
                        layout();
                        tlui();
                    },
                    pv() {
                        const e = $("pv");
                        e.style.display = e.style.display === "none" ? "flex" : "none";
                        dirtyAll();
                    },
                    zi() {
                        PX = Math.min(48, PX * 1.25);
                        layout();
                    },
                    zo() {
                        PX = Math.max(2, PX / 1.25);
                        layout();
                    },
                    th0() {
                        setTheme("graphite");
                    },
                    th1() {
                        setTheme("basic");
                    },
                    th2() {
                        setTheme("vista");
                    },
                    th3() {
                        setTheme("flstudio");
                    },
                    help() {
                        alert(
                            "Left-click: draw, select, move\nRight-click: delete (drag to erase)\nShift+Right-click: context menu\nCtrl+drag: rubber-band select notes or clips\nShift+click: add to selection\nDelete: remove selection\nCtrl+C/X/V/D: copy, cut, paste, duplicate\nArrow Up/Down: transpose selected notes (Shift = octave)\nCtrl+wheel: zoom\nSpace: play/pause\nDrag a pattern from the Pattern Browser onto its track lane to place it"
                        );
                    },
                    xwav() {
                        xport("wav");
                    },
                    xflac() {
                        xport("flac");
                    },
                    xmp3() {
                        xport("mp3");
                    },
                });
                [1, -1, 12, -12].forEach(
                    (d) =>
                        (ACT["t" + (d > 0 ? "+" : "") + d] = () =>
                            nop((l) => {
                                if (l.every((n) => n.pitch + d >= 24 && n.pitch + d <= TOP)) {
                                    l.forEach((n) => (n.pitch += d));
                                    play(l[0].pitch);
                                }
                            }))
                );
                /* menus */
                const MN = [
                    [
                        "File",
                        [
                            ["New Project", "new"],
                            ["Open Project…", "load"],
                            ["Save Project", "save"],
                            null,
                            ["Import MIDI…", "mimp"],
                            ["Export MIDI…", "mexp"],
                            null,
                            ["Export WAV…", "xwav"],
                            ["Export FLAC…", "xflac"],
                            ["Export MP3…", "xmp3"],
                        ],
                    ],
                    [
                        "Edit",
                        [
                            ["Undo", "undo", "Ctrl+Z"],
                            ["Redo", "redo", "Ctrl+Y"],
                            null,
                            ["Cut", "cut", "Ctrl+X"],
                            ["Copy", "copy", "Ctrl+C"],
                            ["Paste", "paste", "Ctrl+V"],
                            ["Delete", "del", "Del"],
                            ["Duplicate", "dup", "Ctrl+D"],
                            null,
                            ["Select All", "sall", "Ctrl+A"],
                            ["Select None", "snone"],
                            ["Invert Selection", "sinv"],
                        ],
                    ],
                    [
                        "Notes",
                        [
                            ["Transpose +1", "t+1", "↑"],
                            ["Transpose −1", "t-1", "↓"],
                            ["Transpose +Octave", "t+12", "Shift+↑"],
                            ["Transpose −Octave", "t-12", "Shift+↓"],
                            null,
                            ["Reverse", "rev"],
                            ["Flip Pitch", "inv"],
                            ["Legato", "leg"],
                            ["Humanize Velocity", "hum"],
                            ["Double Length", "x2"],
                            ["Halve Length", "h2"],
                            ["Quantize", "quant"],
                            ["Set Velocity…", "vel"],
                        ],
                    ],
                    [
                        "Create",
                        [
                            ["Insert MIDI Track", "addt"],
                            ["Insert Drum Track", "addd"],
                            ["Insert Operator Track", "addo"],
                            null,
                            ["New Pattern", "addp"],
                            ["Duplicate Pattern", "dupp"],
                            ["Rename Pattern", "renp"],
                            ["Clear Pattern", "clrp"],
                            ["Delete Pattern", "delp"],
                        ],
                    ],
                    [
                        "Track",
                        [
                            ["Rename Track", "rent"],
                            ["Duplicate Track", "dupt"],
                            ["Delete Track", "delt"],
                            ["Instrument Designer…", "ins"],
                            null,
                            ["Mute All", "mall"],
                            ["Unmute All", "umall"],
                            ["Clear Solo", "csolo"],
                        ],
                    ],
                    [
                        "Transport",
                        [
                            ["Play / Pause", "pp", "Space"],
                            ["Stop", "stop"],
                            ["Go to Start", "home", "Home"],
                            ["Go to End", "end"],
                            ["Loop", "loop"],
                            ["Record Arm", "rec"],
                            ["Metronome", "met"],
                            null,
                            ["Set Tempo…", "tempo"],
                        ],
                    ],
                    [
                        "Options",
                        [
                            ["MIDI Input / Output", "mdev"],
                            ["Computer Keyboard", "kb"],
                        ],
                    ],
                    [
                        "View",
                        [
                            ["Condensed Track View", "cond"],
                            ["Pattern Browser", "pv"],
                            ["Devices", "fx"],
                            ["Piano Roll", "roll"],
                            ["Move Track List", "side"],
                            null,
                            ["Zoom In", "zi"],
                            ["Zoom Out", "zo"],
                            null,
                            ["Theme: Graphite", "th0"],
                            ["Theme: Basic", "th1"],
                            ["Theme: Vindows Vista", "th2"],
                            ["Theme: FL Studio", "th3"],
                        ],
                    ],
                    ["Help", [["Shortcuts & Tips", "help"]]],
                ];
                $("mb").innerHTML =
                    MN.map(
                        ([n, it]) =>
                            `<div class="menu"><b>${n}</b><div class="pop">${it.map((i) => (i ? `<button data-x="${i[1]}">${i[0]}${i[2] ? `<span style="float:right;margin-left:26px;color:var(--dim)">${i[2]}</span>` : ""}</button>` : "<hr>")).join("")}</div></div>`
                    ).join("") + '<span id="brand">Archetype - Version 1.0</span>';
                document.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => ACT[b.dataset.r]()));
                /* pattern browser (view finder): drag to playlist, resize */
                function pvui() {
                    $("pl2").innerHTML = S.tracks
                        .map((t) => {
                            const ps = Object.values(S.pats).filter((p) => p.tid === t.id);
                            return (
                                `<div class="pg" style="border-left:5px solid ${t.color}">${esc(t.name)}</div>` +
                                ps
                                    .map(
                                        (p) =>
                                            `<div class="pi${p.id === t.pat && t.id === S.at ? " sel" : ""}" data-p="${p.id}" title="Drag onto this track's lane in the playlist"><span>${esc(p.name)}</span><small>${Math.round((p.steps / S.spb) * 10) / 10}b · ${p.notes.length}n</small><button data-q="d" title="Duplicate">⧉</button><button data-q="x" title="Delete">×</button></div>`
                                    )
                                    .join("")
                            );
                        })
                        .join("");
                }
                const dropAt = (ev, p) => {
                    if (document.elementFromPoint(ev.clientX, ev.clientY) !== pl) return null;
                    const k = plPt(ev),
                        t = S.tracks[Math.floor(k.y / LANE)];
                    if (!t || t.id !== p.tid) return null;
                    const st = Math.max(0, Math.floor(k.x / PX / 4) * 4);
                    return free(t.id, st, p.steps) && st + p.steps <= TOT()
                        ? { tid: t.id, start: st, len: p.steps }
                        : null;
                };
                $("pl2").onpointerdown = (e) => {
                    if (e.button !== 0) return;
                    const r = e.target.closest(".pi");
                    if (!r) return;
                    const p = P(r.dataset.p),
                        q = e.target.dataset.q;
                    if (q === "d") {
                        sel1(p.tid, p.id);
                        addPat(P(p.id));
                        return;
                    }
                    if (q === "x") {
                        delPat(p);
                        return;
                    }
                    const sx = e.clientX,
                        sy = e.clientY;
                    let gh = null;
                    S.foc = "pl";
                    sel1(p.tid, p.id);
                    drag = {
                        m(ev) {
                            if (!gh) {
                                if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
                                gh = document.createElement("div");
                                gh.id = "gh";
                                gh.textContent = p.name;
                                gh.style.background = T(p.tid).color;
                                document.body.appendChild(gh);
                            }
                            gh.style.left = ev.clientX + 12 + "px";
                            gh.style.top = ev.clientY + 8 + "px";
                            S.dp = dropAt(ev, p);
                            gh.classList.toggle("bad", !S.dp);
                            dirty("pl");
                        },
                        u(ev) {
                            const h = S.dp;
                            S.dp = null;
                            dirty("pl");
                            if (!gh) return;
                            gh.remove();
                            if (h) placeClip(T(p.tid), h.start);
                            else if (document.elementFromPoint(ev.clientX, ev.clientY) === pl)
                                say("A pattern can only be placed on its own track lane, in free space.");
                        },
                    };
                };
                $("pl2").oncontextmenu = (e) => {
                    e.preventDefault();
                    const r = e.target.closest(".pi");
                    if (!r) return;
                    const p = P(r.dataset.p);
                    sel1(p.tid, p.id);
                    menu(e.clientX, e.clientY, [
                        ["Rename", () => ACT.renp(P(p.id))],
                        [
                            "Duplicate",
                            () => {
                                sel1(p.tid, p.id);
                                addPat(P(p.id));
                            },
                        ],
                        ["Place at playhead", () => placeClip(T(p.tid), S.step)],
                        null,
                        ["Delete", () => delPat(P(p.id))],
                    ]);
                };
                $("pvn").onclick = () => addPat();
                $("pvr").onpointerdown = (e) => {
                    e.preventDefault();
                    drag = {
                        m(ev) {
                            const fl = $("main").classList.contains("flip");
                            $("pv").style.width = clamp(fl ? ev.clientX : innerWidth - ev.clientX, 130, 520) + "px";
                        },
                    };
                };
                /* instrument designer */
                let INS = null;
                function openIns(t) {
                    if (!t) return;
                    ensureAudio();
                    INS = t;
                    const e = eng(t),
                        w = $("inb"),
                        sl = (o, k, l, mn, mx, st, u) =>
                            `<label><span>${l}</span><span>${fmt(o[k], u)}</span></label><input type="range" min="${mn}" max="${mx}" step="${st}" value="${o[k]}" data-k="${k}" data-u="${u}">`;
                    $("int").textContent =
                        t.name +
                        " · " +
                        { op: "Operator synth", drum: "Drum synth", osc: "Oscillator", gm: "GM SoundFont" }[e];
                    $("ins").style.display = "flex";
                    let b = `<div class="op" style="width:100%"><label>Engine <select id="eng">${[
                        ["gm", "GM SoundFont"],
                        ["osc", "Basic oscillator"],
                        ["op", "Operator synth"],
                        ["drum", "Drum synth"],
                    ]
                        .map(([v, n]) => `<option value="${v}"${v === e ? " selected" : ""}>${n}</option>`)
                        .join(
                            ""
                        )}</select>${e === "op" ? `<span>Algorithm</span><select id="alg">${ALG.map((a, i) => `<option value="${i}"${i === t.op.alg ? " selected" : ""}>${a[0]}</option>`).join("")}</select><button id="opt">▶ Test chord</button>` : ""}</label></div>`;
                    if (e === "op")
                        b += t.op.ops
                            .map(
                                (x, i) =>
                                    `<div class="op" data-i="${i}"><b>Operator ${"ABCD"[i]}</b><label>Wave<select data-k="w">${["sine", "triangle", "sawtooth", "square"].map((v) => `<option${v === x.w ? " selected" : ""}>${v}</option>`).join("")}</select></label>${OPS.map((o) => sl(x, ...o)).join("")}</div>`
                            )
                            .join("");
                    else if (e === "drum")
                        b += Object.keys(t.drum)
                            .map(
                                (id) =>
                                    `<div class="op" data-v="${id}"><b><span>${DN[id]} · ${pname(+Object.keys(DP).find((k) => DP[k] === id))}</span><button data-test="${id}">▶</button></b>${Object.keys(
                                        t.drum[id]
                                    )
                                        .map((k) => sl(t.drum[id], k, ...DK[k]))
                                        .join("")}</div>`
                            )
                            .join("");
                    else
                        b +=
                            '<div class="op" style="width:100%">Choose “Operator synth” or “Drum synth” above to design sounds here. GM and oscillator tracks are tuned in the track mixer (⋯ button).</div>';
                    w.innerHTML = b;
                }
                $("inb").oninput = (e) => {
                    const el = e.target,
                        k = el.dataset.k;
                    if (!k || !INS) return;
                    const c = el.closest(".op"),
                        o = c.dataset.i !== undefined ? INS.op.ops[c.dataset.i] : INS.drum[c.dataset.v];
                    o[k] = el.tagName === "SELECT" ? el.value : +el.value;
                    if (el.type === "range")
                        el.previousElementSibling.lastElementChild.textContent = fmt(+el.value, el.dataset.u);
                };
                $("inb").onchange = (e) => {
                    const el = e.target;
                    if (el.id === "alg") INS.op.alg = +el.value;
                    if (el.id === "eng") {
                        INS.engine = el.value;
                        INS.useGM = el.value === "gm";
                        tlui();
                        openIns(INS);
                    }
                };
                $("inb").onclick = (e) => {
                    const b = e.target;
                    if (!A) return;
                    if (b.id === "opt") [60, 64, 67].forEach((p) => noteOn(INS, p, 0.8, A.currentTime, 1.2));
                    if (b.dataset.test)
                        drumHit(INS, +Object.keys(DP).find((k) => DP[k] === b.dataset.test), 0.9, A.currentTime);
                };
                $("inx").onclick = () => ($("ins").style.display = "none");
                $("insb").onclick = () => openIns(ct());
                /* audio export: offline render + WAV / FLAC / MP3 */
                async function render() {
                    stop(0);
                    const o = { A, M, N, SP, SL, met: S.met },
                        sd = 60 / S.bpm / 4,
                        n = endStep(),
                        sr = 44100;
                    try {
                        A = new OfflineAudioContext(2, Math.ceil((n * sd + 3) * sr), sr);
                        M = A.createGain();
                        M.gain.value = 0.8;
                        M.connect(A.destination);
                        N = {};
                        SP = new Map();
                        SL = new Map();
                        S.met = 0;
                        S.tracks.forEach(build);
                        say("Loading instruments…");
                        await Promise.all(
                            S.tracks
                                .filter((t) => eng(t) === "gm" && S.clips.some((c) => c.tid === t.id))
                                .map((t) => loadGM(t).catch(() => {}))
                        );
                        say("Rendering audio…");
                        for (let s = 0; s < n; s++) tick(s, s * sd);
                        return await A.startRendering();
                    } finally {
                        ({ A, M, N, SP, SL } = o);
                        S.met = o.met;
                    }
                }
                const pcm = (b) =>
                    [0, 1].map((k) => {
                        const d = b.getChannelData(k),
                            o = new Int16Array(b.length);
                        for (let i = 0; i < o.length; i++) o[i] = Math.round(clamp(d[i], -1, 1) * 32767);
                        return o;
                    });
                function wav(b) {
                    const [l, r] = pcm(b),
                        L = b.length,
                        v = new DataView(new ArrayBuffer(44 + L * 4)),
                        w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
                    w(0, "RIFF");
                    v.setUint32(4, 36 + L * 4, true);
                    w(8, "WAVEfmt ");
                    v.setUint32(16, 16, true);
                    v.setUint16(20, 1, true);
                    v.setUint16(22, 2, true);
                    v.setUint32(24, b.sampleRate, true);
                    v.setUint32(28, b.sampleRate * 4, true);
                    v.setUint16(32, 4, true);
                    v.setUint16(34, 16, true);
                    w(36, "data");
                    v.setUint32(40, L * 4, true);
                    for (let i = 0; i < L; i++) {
                        v.setInt16(44 + i * 4, l[i], true);
                        v.setInt16(46 + i * 4, r[i], true);
                    }
                    return v.buffer;
                }
                function flac(b) {
                    const [l, r] = pcm(b),
                        L = b.length,
                        BS = 4096,
                        sr = b.sampleRate;
                    const c8 = (a) => {
                            let c = 0;
                            for (const x of a) {
                                c ^= x;
                                for (let i = 0; i < 8; i++) c = c & 128 ? ((c << 1) ^ 7) & 255 : (c << 1) & 255;
                            }
                            return c;
                        },
                        c16 = (a) => {
                            let c = 0;
                            for (const x of a) {
                                c ^= x << 8;
                                for (let i = 0; i < 8; i++)
                                    c = c & 32768 ? ((c << 1) ^ 0x8005) & 65535 : (c << 1) & 65535;
                            }
                            return c;
                        },
                        u8 = (n) =>
                            n < 128
                                ? [n]
                                : n < 2048
                                  ? [192 | (n >> 6), 128 | (n & 63)]
                                  : [224 | (n >> 12), 128 | ((n >> 6) & 63), 128 | (n & 63)];
                    const parts = [
                        new Uint8Array([
                            102,
                            76,
                            97,
                            67,
                            128,
                            0,
                            0,
                            34,
                            BS >> 8,
                            BS & 255,
                            BS >> 8,
                            BS & 255,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            (sr >> 12) & 255,
                            (sr >> 4) & 255,
                            ((sr & 15) << 4) | 2,
                            0xf0,
                            (L >>> 24) & 255,
                            (L >>> 16) & 255,
                            (L >>> 8) & 255,
                            L & 255,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                        ]),
                    ];
                    for (let f = 0, pos = 0; pos < L; f++, pos += BS) {
                        const n = Math.min(BS, L - pos),
                            h = [255, 248, n === BS ? 0xc9 : 0x79, 0x18, ...u8(f)];
                        if (n !== BS) h.push((n - 1) >> 8, (n - 1) & 255);
                        h.push(c8(h));
                        const fr = h;
                        [l, r].forEach((ch) => {
                            fr.push(2);
                            for (let i = 0; i < n; i++) {
                                const v = ch[pos + i];
                                fr.push((v >> 8) & 255, v & 255);
                            }
                        });
                        const c = c16(fr);
                        fr.push(c >> 8, c & 255);
                        parts.push(Uint8Array.from(fr));
                    }
                    return new Blob(parts, { type: "audio/flac" });
                }
                async function mp3(b) {
                    if (!window.lamejs)
                        await new Promise((ok, no) => {
                            const s = document.createElement("script");
                            s.src = "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js";
                            s.onload = ok;
                            s.onerror = () => no(Error("could not load the MP3 encoder (needs internet)"));
                            document.head.appendChild(s);
                        });
                    const [l, r] = pcm(b),
                        e = new lamejs.Mp3Encoder(2, b.sampleRate, 192),
                        o = [];
                    for (let i = 0; i < l.length; i += 1152) {
                        const x = e.encodeBuffer(l.subarray(i, i + 1152), r.subarray(i, i + 1152));
                        if (x.length) o.push(new Uint8Array(x));
                    }
                    o.push(new Uint8Array(e.flush()));
                    return new Blob(o, { type: "audio/mpeg" });
                }
                async function xport(k) {
                    if (!S.clips.length) return say("Nothing to export: place some clips first.");
                    try {
                        const b = await render(),
                            d =
                                k === "wav"
                                    ? new Blob([wav(b)], { type: "audio/wav" })
                                    : k === "flac"
                                      ? flac(b)
                                      : await mp3(b);
                        dl("workbench-export." + k, d, d.type);
                        say("Exported " + k.toUpperCase() + " (" + Math.round(b.duration) + " s)");
                    } catch (e) {
                        say("Export failed: " + e.message);
                    }
                }
                document.querySelectorAll("[data-x]").forEach(
                    (b) =>
                        (b.onclick = () => {
                            ACT[b.dataset.x]();
                            b.closest(".menu").classList.add("shut");
                        })
                );
                document.querySelectorAll(".menu").forEach((m) => (m.onmouseleave = () => m.classList.remove("shut")));
                $("play").onclick = () => (S.playing ? stop(0) : start());
                $("stop").onclick = () => stop(1);
                $("loop").onclick = () => {
                    S.loop = !S.loop;
                    $("loop").classList.toggle("on", !!S.loop);
                };
                $("met").onclick = ACT.met;
                $("flip").onclick = ACT.side;
                $("np").onclick = () => addPat();
                $("nt").onclick = addTrack;
                $("rec").onclick = () => {
                    S.rec = !S.rec;
                    $("rec").classList.toggle("on", !!S.rec);
                    say(
                        S.rec
                            ? "Record armed. Press play, then use a MIDI keyboard (Options) or the computer keyboard."
                            : "Record off"
                    );
                };
                $("bpm").onchange = () => {
                    S.bpm = clamp(+$("bpm").value || 120, 40, 240);
                    $("bpm").value = S.bpm;
                    updAll();
                };
                $("sig").onchange = () => {
                    S.spb = $("sig").value === "4/4" ? 16 : 12;
                    layout();
                    patui();
                };
                $("psel").onchange = () => {
                    ct().pat = $("psel").value;
                    S.sel.clear();
                    all();
                };
                $("plen").onchange = () => {
                    const p = cp();
                    if (p) {
                        hist();
                        p.steps = Math.round(+$("plen").value * S.spb);
                        layout();
                    }
                };
                $("oct").onchange = () => {
                    rw.scrollTop = clamp((TOP - ($("oct").value * 12 + 18)) * NH - rw.clientHeight / 2, 0, ROWS * NH);
                };
                $("addfx").onclick = (e) => {
                    const t = ct(),
                        c = FXD.filter((d) => !t.fx.includes(d[0]));
                    if (!c.length) return say("All devices are already on this track.");
                    menu(
                        e.clientX,
                        e.clientY,
                        c.map((d) => [
                            d[1],
                            () => {
                                t.fx.push(d[0]);
                                if (A) upd(t);
                                fxui();
                            },
                        ])
                    );
                };
                $("rz").onpointerdown = () => {
                    drag = {
                        m(ev) {
                            LH = clamp(innerHeight - ev.clientY - 20, 160, innerHeight * 0.75);
                            $("lower").style.height = LH + "px";
                        },
                    };
                };
                addEventListener("pointermove", (e) => drag && drag.m(e));
                addEventListener("pointerup", (e) => {
                    if (drag) {
                        drag.u && drag.u(e);
                        drag = null;
                    }
                });
                function delSel() {
                    if (S.foc === "ro") {
                        const p = cp();
                        if (p && S.sel.size) {
                            hist();
                            p.notes = p.notes.filter((n) => !S.sel.has(n.id));
                            S.sel.clear();
                            dirty("ro", "pl");
                        }
                    } else if (S.sc || S.cs.size) {
                        hist();
                        S.clips = S.clips.filter((c) => c !== S.sc && !S.cs.has(c.id));
                        S.sc = null;
                        S.cs = new Set();
                        dirty("pl", "rl");
                    }
                }
                addEventListener("keydown", (e) => {
                    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
                    const k = e.key.toLowerCase(),
                        mod = e.ctrlKey || e.metaKey;
                    if (e.code === "Space") {
                        e.preventDefault();
                        S.playing ? stop(0) : start();
                        return;
                    }
                    if (e.key === "Escape") hideMenu();
                    if (mod && k === "z") {
                        e.preventDefault();
                        e.shiftKey ? redo() : undo();
                    } else if (mod && k === "y") {
                        e.preventDefault();
                        redo();
                    } else if (mod && k === "a") {
                        e.preventDefault();
                        ACT.sall();
                    } else if (mod && k === "d") {
                        e.preventDefault();
                        if (S.foc === "pl" && S.sc) dupClip(S.sc);
                        else {
                            const p = cp(),
                                s = p?.notes.filter((n) => S.sel.has(n.id));
                            if (s?.length) {
                                const a = Math.min(...s.map((n) => n.step)),
                                    b = Math.max(...s.map((n) => n.step + n.duration));
                                if (b + (b - a) <= p.steps) {
                                    hist();
                                    S.sel = new Set(
                                        s.map((n) => {
                                            const c = { ...n, id: uid(), step: n.step + b - a };
                                            p.notes.push(c);
                                            return c.id;
                                        })
                                    );
                                    dirty("ro", "pl");
                                }
                            }
                        }
                    } else if (mod && k === "c") ACT.copy();
                    else if (mod && k === "x") ACT.cut();
                    else if (mod && k === "v") ACT.paste();
                    else if (e.key === "Home") setStep(0);
                    else if (S.foc === "ro" && S.sel.size && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                        e.preventDefault();
                        ACT["t" + (e.key === "ArrowUp" ? "+" : "-") + (e.shiftKey ? 12 : 1)]();
                    } else if (e.key === "Delete" || e.key === "Backspace") delSel();
                    else if (S.kb && !mod && !e.altKey && !e.repeat) {
                        const i = KM.indexOf(k);
                        if (i >= 0) hit(($("oct").value * 1 + 1) * 12 + i, 0.8);
                    }
                });
                addEventListener("keyup", (e) => {
                    if (S.kb) {
                        const i = KM.indexOf(e.key.toLowerCase());
                        if (i >= 0) rel(($("oct").value * 1 + 1) * 12 + i);
                    }
                });
                try {
                    setTheme(THEMES[localStorage.wth] ? localStorage.wth : "graphite");
                } catch (e) {
                    setTheme("graphite");
                }
                init();
                requestAnimationFrame(frame);
            })();