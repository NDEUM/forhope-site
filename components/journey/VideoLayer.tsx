import { videoSlots } from "@/content/journey";

/**
 * Emplacements vidéo du voyage (voir content/journey.ts → videoSlots).
 * Une vidéo n'est rendue que si sa source est renseignée ; elle ne se
 * charge qu'à l'approche de sa fenêtre (JourneyDirector), puis sa lecture
 * suit le scroll. Les vidéos générées portent la mention « illustration ».
 */
export function VideoLayer() {
  const slots = videoSlots.filter((v) => v.src);
  if (!slots.length) return null;
  return (
    <div className="journey__videos" aria-hidden="true">
      {slots.map((v) =>
        (
          [
            ["paysage", v.src!],
            ["portrait", v.srcPortrait ?? v.src!],
          ] as const
        ).map(([format, src]) => (
          <figure
            key={`${v.id}-${format}`}
            className={`journey__video journey__video--${format}`}
            data-video={`${v.from},${v.to}`}
            data-window={`${v.from},${v.from + 0.012},${v.to - 0.012},${v.to}`}
          >
            <video src={src} poster={v.poster} muted playsInline preload="none" />
            {v.illustrative && <figcaption>Image d&apos;illustration</figcaption>}
          </figure>
        )),
      )}
    </div>
  );
}
