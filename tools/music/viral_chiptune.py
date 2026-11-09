# "Loudest in the 209" - an original 16-bit chiptune theme for The Viral Voice.
# Built to match the feel of his entrance song (about 108 BPM, bluesy A rock, quiet build then full energy),
# with all-new melodies. Pulse leads, a 4-bit triangle bass and noise drums, like a SNES/NES sound chip.
import numpy as np, re, subprocess, wave

SR = 44100
BPM = 108
S16 = 60 / BPM / 4                     # one 16th note in seconds
BAR = 16 * S16
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}

def hz(name):
    m = re.match(r'([A-G]#?)(\d)', name)
    midi = 12 * (int(m.group(2)) + 1) + NOTE[m.group(1)]
    return 440 * 2 ** ((midi - 69) / 12)

def parse(bar):
    """'A4:2 .:1 C5:2' -> [(freq or None, length in 16ths)], must add up to 16."""
    out = []
    for tok in bar.split():
        n, l = tok.split(':')
        out.append((None if n == '.' else hz(n), int(l)))
    assert sum(l for _, l in out) == 16, bar
    return out

# ---------------- oscillators ----------------
def osc(kind, f, n, t0=0.0, vib=False, duty=0.5):
    t = np.arange(n) / SR
    fr = np.full(n, f)
    if vib:  # delayed vibrato on long notes
        fr = fr * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.15) / 0.1, 0, 1))
    ph = np.cumsum(fr) / SR
    if kind == 'pulse':
        return np.where((ph % 1) < duty, 1.0, -1.0)
    if kind == 'tri':  # 4-bit stepped triangle, like the NES
        tri = 2 * np.abs(2 * (ph % 1) - 1) - 1
        return np.round(tri * 7.5) / 7.5
    raise ValueError(kind)

def env(n, a=0.004, d=0.08, s=0.7, r=0.04, total=None):
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, np.maximum(s, 1 - (1 - s) * (t - a) / d))
    held = (total or n / SR) - r
    rel = np.clip(1 - (t - held) / r, 0, 1)
    return e * np.where(t > held, rel, 1)

class Track:
    def __init__(self, bars):
        self.buf = np.zeros(int(bars * BAR * SR) + SR * 3)
    def note(self, start, f, length16, kind, vol, duty=0.5):
        dur = length16 * S16
        n = int((dur + 0.04) * SR)
        i = int(start * SR)
        w = osc(kind, f, n, vib=length16 >= 4, duty=duty) * env(n, total=dur + 0.04) * vol
        self.buf[i:i + n] += w
    def line(self, start, bars, kind, vol, duty=0.5, transpose=1.0):
        t = start
        for bar in bars:
            for f, l in parse(bar):
                if f: self.note(t, f * transpose, l, kind, vol, duty)
                t += l * S16
        return t

# ---------------- drums (noise channel + a pitched kick) ----------------
rng = np.random.default_rng(209)
def noise(n, hold):
    v = rng.choice([-1.0, 1.0], size=n // hold + 1)
    return np.repeat(v, hold)[:n]

def kick(buf, t, vol=0.55):
    n = int(0.16 * SR); tt = np.arange(n) / SR
    f = 150 * np.exp(-tt * 28) + 45
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18)
    buf[int(t * SR):int(t * SR) + n] += w * vol

def snare(buf, t, vol=0.32):
    n = int(0.14 * SR); tt = np.arange(n) / SR
    w = (noise(n, 2) * 0.8 + 0.4 * np.sin(2 * np.pi * 190 * tt)) * np.exp(-tt * 26)
    buf[int(t * SR):int(t * SR) + n] += w * vol

def hat(buf, t, vol=0.07, open_=False):
    n = int((0.16 if open_ else 0.035) * SR); tt = np.arange(n) / SR
    w = noise(n, 1) * np.exp(-tt * (14 if open_ else 90))
    buf[int(t * SR):int(t * SR) + n] += w * vol

def crash(buf, t, vol=0.11):
    n = int(1.4 * SR); tt = np.arange(n) / SR
    w = noise(n, 1) * np.exp(-tt * 2.8)
    buf[int(t * SR):int(t * SR) + n] += w * vol

def tom(buf, t, f, vol=0.3):
    n = int(0.2 * SR); tt = np.arange(n) / SR
    ff = f * np.exp(-tt * 6)
    w = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 12)
    buf[int(t * SR):int(t * SR) + n] += w * vol

def drum_bar(buf, t, style, fill=False, crash_=False):
    if crash_: crash(buf, t)
    for s in range(16):
        x = t + s * S16
        if style == 'rock':
            if s in (0, 6, 8, 10 if s == 10 and False else -1): kick(buf, x)
            if s in (4, 12): snare(buf, x)
            if s % 2 == 0 and s not in (4, 12): hat(buf, x)
            if s == 14: hat(buf, x, open_=True)
        elif style == 'stomp':   # heavier chorus groove
            if s in (0, 3, 6, 8, 11): kick(buf, x)
            if s in (4, 12): snare(buf, x, 0.36)
            if s % 2 == 0: hat(buf, x, 0.08)
        elif style == 'build':
            if s in (0, 8): kick(buf, x, 0.35)
            if s % 4 == 2: hat(buf, x, 0.05)
        elif style == 'pulse':   # intro: just a heartbeat kick
            if s in (0, 8): kick(buf, x, 0.25)
        elif style == 'half':    # breakdown
            if s == 0: kick(buf, x)
            if s == 8: snare(buf, x, 0.36)
            if s % 4 == 0: hat(buf, x, 0.06)
    if fill:  # snare + tom run into the next section
        for s in range(12, 16):
            tom(buf, t + s * S16, [220, 180, 140, 110][s - 12])
            snare(buf, t + s * S16, 0.18)

# ---------------- the composition (all original) ----------------
# chords for each section, one root per bar
RIFF_CH   = ['A2', 'G2', 'D2', 'A2']
CHORUS_CH = ['C3', 'D3', 'A2', 'A2']
BRIDGE_CH = ['F2', 'G2', 'A2', 'A2']

HOOK = ["A4:2 .:1 A4:1 C5:2 A4:2 D5:3 C5:1 A4:2 G4:2",
        "G4:2 .:1 G4:1 B4:2 G4:2 D5:4 B4:2 G4:2",
        "F#4:2 .:1 A4:1 D5:2 E5:2 F#5:3 E5:1 D5:2 A4:2",
        "E5:4 C#5:2 A4:2 .:4 E4:2 G4:2"]
VERSE = ["E4:3 E4:1 A4:2 .:2 C5:2 A4:2 G4:4",
         "D4:2 .:2 G4:2 A4:2 B4:4 A4:2 G4:2",
         "F#4:2 A4:2 D5:4 C5:2 A4:2 F#4:2 E4:2",
         "A4:8 .:4 C5:2 C#5:2",
         "E4:3 E4:1 A4:2 .:2 C5:2 A4:2 G4:4",
         "D4:2 .:2 G4:2 A4:2 B4:4 A4:2 G4:2",
         "F#4:2 A4:2 D5:4 C5:2 A4:2 F#4:2 E4:2",
         "A4:4 G4:2 E4:2 A4:8"]
CHORUS = ["E5:4 G5:2 E5:2 C5:2 D5:2 E5:4",
          "F#5:4 A5:2 F#5:2 D5:2 E5:2 F#5:4",
          "A5:6 G5:2 E5:2 C5:2 A4:4",
          "C#5:2 E5:2 A5:4 .:2 A4:1 A4:1 C5:2 A4:2",
          "E5:4 G5:2 E5:2 C5:2 D5:2 E5:4",
          "F#5:4 A5:2 F#5:2 D5:2 E5:2 F#5:4",
          "A5:6 G5:2 E5:2 C5:2 A4:4",
          "A5:12 .:4"]
BRIDGE = ["F5:8 C5:4 A4:4", "G5:8 D5:4 B4:4", "A5:4 E5:4 C#5:4 E5:4", "A5:16"]

def chord_tones(root):
    f = hz(root); return [f, f * 2 ** (4 / 12), f * 2 ** (7 / 12)]  # major triad

def bass_bar(tr, t, root, style):
    f = hz(root)
    if style == 'drive':   # 8ths with octave pops
        pat = [1, 1, 2, 1, 1, 1, 2, 1.5]
        for k, m in enumerate(pat):
            ff = f * (2 if m == 2 else (2 ** (7 / 12) if m == 1.5 else 1))
            tr.note(t + k * 2 * S16, ff, 2, 'tri', 0.34)
    elif style == 'whole':
        tr.note(t, f, 16, 'tri', 0.36)
    elif style == 'pulse':
        tr.note(t, f, 4, 'tri', 0.22); tr.note(t + 8 * S16, f, 4, 'tri', 0.22)

def arp_bar(tr, t, root, vol):
    tones = chord_tones(root.replace('2', '4').replace('3', '4'))
    order = [0, 1, 2, 1] * 4
    for s, k in enumerate(order):
        tr.note(t + s * S16, tones[k], 1, 'pulse', vol, duty=0.125)

sections = [  # (name, bars)
    ('intro', 8), ('riff', 8), ('verse', 8), ('chorus', 8), ('riff', 4),
    ('verse', 8), ('chorus', 8), ('bridge', 4), ('chorus', 8), ('outro', 4)]
total_bars = sum(b for _, b in sections)
lead, harm, arp, bass, drums = (Track(total_bars) for _ in range(5))

t = 0.0
for si, (name, bars) in enumerate(sections):
    last = si == len(sections) - 1
    nxt = sections[si + 1][0] if not last else None
    for b in range(bars):
        bt = t + b * BAR
        fill = (b == bars - 1) and not last
        if name == 'intro':
            root = ['A2', 'A2', 'G2', 'G2'][b % 4]
            arp_bar(arp, bt, root, 0.03 + 0.08 * b / bars)          # the build: arpeggio swells in
            drum_bar(drums.buf, bt, 'pulse' if b < 4 else 'build', fill=fill)
            if b >= 4: bass_bar(bass, bt, root, 'pulse')
        elif name == 'riff':
            root = RIFF_CH[b % 4]
            lead.line(bt, [HOOK[b % 4]], 'pulse', 0.2, duty=0.5)
            bass_bar(bass, bt, root, 'drive')
            drum_bar(drums.buf, bt, 'rock', fill=fill, crash_=(b == 0))
        elif name == 'verse':
            root = RIFF_CH[b % 4]
            lead.line(bt, [VERSE[b]], 'pulse', 0.18, duty=0.25)
            arp_bar(arp, bt, root, 0.035)
            bass_bar(bass, bt, root, 'drive')
            drum_bar(drums.buf, bt, 'rock', fill=fill, crash_=(b == 0))
        elif name == 'chorus':
            root = CHORUS_CH[b % 4]
            final = si == len(sections) - 2
            lead.line(bt, [CHORUS[b]], 'pulse', 0.21, duty=0.5)
            harm.line(bt, [CHORUS[b]], 'pulse', 0.09 if not final else 0.11, duty=0.125, transpose=0.5)
            if final: harm.line(bt, [CHORUS[b]], 'pulse', 0.05, duty=0.25, transpose=2 ** (-5 / 12))  # a 4th below for the last chorus
            arp_bar(arp, bt, root, 0.04)
            bass_bar(bass, bt, root, 'drive')
            drum_bar(drums.buf, bt, 'stomp', fill=fill, crash_=(b % 4 == 0))
        elif name == 'bridge':
            root = BRIDGE_CH[b]
            lead.line(bt, [BRIDGE[b]], 'pulse', 0.17, duty=0.25)
            arp_bar(arp, bt, root, 0.06)
            bass_bar(bass, bt, root, 'whole')
            drum_bar(drums.buf, bt, 'half', fill=fill, crash_=(b == 0))
        elif name == 'outro':
            if b < 3:
                lead.line(bt, [HOOK[b]], 'pulse', 0.2); bass_bar(bass, bt, RIFF_CH[b], 'drive')
                drum_bar(drums.buf, bt, 'rock', fill=(b == 2), crash_=(b == 0))
            else:  # the final hit
                lead.line(bt, ["A4:16"], 'pulse', 0.22); harm.line(bt, ["A4:16"], 'pulse', 0.1, duty=0.125, transpose=0.5)
                bass.note(bt, hz('A2'), 16, 'tri', 0.4); kick(drums.buf, bt, 0.7); crash(drums.buf, bt, 0.16)
    t += bars * BAR

# a little slap-back echo on the lead, like the old cartridge reverb tricks
d = int(3 * S16 * SR)
lead_fx = lead.buf.copy(); lead_fx[d:] += lead.buf[:-d] * 0.28

L = lead_fx * 0.95 + harm.buf * 1.1 + arp.buf * 0.7 + bass.buf + drums.buf
R = lead_fx * 0.95 + harm.buf * 0.7 + arp.buf * 1.1 + bass.buf + drums.buf
end = int(t * SR) + int(1.6 * SR)
mix = np.stack([L[:end], R[:end]], 1)
mix /= np.max(np.abs(mix)) / 0.89
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

with wave.open('/home/claude/song/viral_chiptune.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('bars', total_bars, 'length', round(len(mix) / SR, 1), 's')
