"use client";

interface VideoEmbedProps {
  src: string;
  title?: string;
}

export const VideoEmbed = ({ src, title = "Kurz erklärt Video" }: VideoEmbedProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-4">Kurz erklärt</h3>
      <div className="relative w-full aspect-video">
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full rounded-2xl border border-border"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
