import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Swords,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import characterAsset from "@/assets/M1.png.asset.json";
import ravenAsset from "@/assets/S1.png.asset.json";
import wildAsset from "@/assets/symwild.png.asset.json";
import vsAsset from "@/assets/VS.png.asset.json";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const phases = ["Alap", "Kiterjedés", "Párbaj", "Lövés", "Eredmény", "Kész"] as const;
const phaseTimes = [700, 1100, 900, 650, 900] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Expanding Wild — animációs prototípus" },
      {
        name: "description",
        content: "Egyetlen tárcsás Expanding Wild és hollópárbaj animációs tesztfelület.",
      },
      { property: "og:title", content: "Expanding Wild — animációs prototípus" },
      {
        property: "og:description",
        content: "Fázisonként vezérelhető, egyetlen tárcsás Wild animációs prototípus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReelPrototype,
});

function ReelPrototype() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [topMultiplier, setTopMultiplier] = useState(4);
  const [bottomMultiplier, setBottomMultiplier] = useState(9);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (phase >= phases.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(
      () => setPhase((current) => Math.min(current + 1, phases.length - 1)),
      (phaseTimes[phase] ?? 700) / speed,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, playing, speed]);

  const restart = () => {
    setPlaying(false);
    setPhase(0);
    setRun((value) => value + 1);
  };

  const play = () => {
    if (phase === phases.length - 1) {
      setPhase(0);
      setRun((value) => value + 1);
    }
    setPlaying(true);
  };

  const setManualPhase = (next: number) => {
    setPlaying(false);
    setPhase(Math.max(0, Math.min(next, phases.length - 1)));
    setRun((value) => value + 1);
  };

  const winner = Math.max(topMultiplier, bottomMultiplier);

  return (
    <main className="prototype-shell">
      <section className="stage-panel" aria-label="Animációs előnézet">
        <header className="stage-header">
          <div>
            <p className="eyebrow">Egytárcsás prototípus</p>
            <h1>Expanding Wild</h1>
          </div>
          <div className="phase-readout" aria-live="polite">
            <span>Fázis {String(phase + 1).padStart(2, "0")}</span>
            <strong>{phases[phase]}</strong>
          </div>
        </header>

        <div className="reel-wrap">
          <div className="reel-frame" data-phase={phase} key={run}>
            <div className="reel-grid" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="reel-cell" key={index}>
                  <span>{index % 2 === 0 ? "✦" : "◆"}</span>
                </div>
              ))}
            </div>

            <div className={cn("energy-layer", phase >= 1 && "is-visible")} aria-hidden="true">
              <i className="energy-line energy-line-a" />
              <i className="energy-line energy-line-b" />
              <i className="energy-line energy-line-c" />
            </div>

            <img
              className={cn("vs-emblem", phase >= 1 && phase < 4 && "is-visible")}
              src={vsAsset.url}
              alt="VS embléma"
            />

            <div className={cn("duel-layer", phase >= 2 && phase < 4 && "is-visible")}>
              <div className="duelist duelist-top">
                <img src={ravenAsset.url} alt="Felső holló" />
                <strong>{topMultiplier}×</strong>
              </div>
              <div className="duelist duelist-bottom">
                <img src={characterAsset.url} alt="Alsó párbajozó" />
                <strong>{bottomMultiplier}×</strong>
              </div>
              <div className={cn("shot shot-top", phase === 3 && "is-active")} />
              <div className={cn("shot shot-bottom", phase === 3 && "is-active")} />
              <div className={cn("impact", phase === 3 && "is-active")} />
            </div>

            <div className={cn("result-layer", phase >= 4 && "is-visible")}>
              <img src={wildAsset.url} alt="Kiterjedt Wild sírkő" />
              <div className="winner-mark">
                <span>Nyertes szorzó</span>
                <strong>{winner}×</strong>
              </div>
            </div>

            <div className="reel-glass" aria-hidden="true" />
          </div>
        </div>

        <ol className="phase-track" aria-label="Animáció fázisai">
          {phases.map((label, index) => (
            <li key={label} className={cn(index < phase && "done", index === phase && "active")}>
              <button type="button" onClick={() => setManualPhase(index)} aria-label={`${label} fázis`}>
                <span>{index + 1}</span>
                <small>{label}</small>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <aside className="control-panel" aria-label="Animáció vezérlése">
        <div className="control-heading">
          <div>
            <p className="eyebrow">Tesztpad</p>
            <h2>Vezérlés</h2>
          </div>
          <Swords aria-hidden="true" />
        </div>

        <div className="transport">
          <Button variant="outline" size="icon" onClick={restart} aria-label="Újrakezdés" title="Újrakezdés">
            <RotateCcw />
          </Button>
          <Button
            className="play-button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Szünet" : "Lejátszás"}
          >
            {playing ? <Pause /> : <Play />}
            {playing ? "Szünet" : phase === 5 ? "Újra" : "Lejátszás"}
          </Button>
        </div>

        <div className="step-controls">
          <Button variant="outline" onClick={() => setManualPhase(phase - 1)} disabled={phase === 0}>
            <ChevronLeft /> Előző
          </Button>
          <Button variant="outline" onClick={() => setManualPhase(phase + 1)} disabled={phase === 5}>
            Következő <ChevronRight />
          </Button>
        </div>

        <div className="control-section">
          <div className="section-label">
            <span>Szorzók</span>
            <span className="sum-chip">max. {winner}×</span>
          </div>
          <MultiplierControl label="Felső holló" value={topMultiplier} onChange={setTopMultiplier} />
          <MultiplierControl label="Alsó párbajozó" value={bottomMultiplier} onChange={setBottomMultiplier} />
        </div>

        <div className="control-section">
          <div className="section-label">
            <span><Gauge /> Animáció sebessége</span>
            <strong>{speed.toFixed(2)}×</strong>
          </div>
          <Slider
            min={0.5}
            max={2}
            step={0.25}
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0] ?? 1)}
            aria-label="Animáció sebessége"
          />
          <div className="slider-scale"><span>0,5×</span><span>1×</span><span>2×</span></div>
        </div>

        <div className="state-note">
          <span className={cn("status-dot", playing && "playing")} />
          <div>
            <strong>{playing ? "Szekvencia fut" : "Kézi tesztmód"}</strong>
            <p>{playing ? "A fázisok automatikusan követik egymást." : "Bármely fázis külön megnyitható."}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}

function MultiplierControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="multiplier-control">
      <label>{label}</label>
      <div>
        <Button variant="outline" size="icon" onClick={() => onChange(Math.max(1, value - 1))} aria-label={`${label} csökkentése`}>−</Button>
        <output>{value}×</output>
        <Button variant="outline" size="icon" onClick={() => onChange(Math.min(100, value + 1))} aria-label={`${label} növelése`}>+</Button>
      </div>
    </div>
  );
}