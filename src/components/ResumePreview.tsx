import { forwardRef, memo } from "react";
import type { ResumeData, Section } from "@/data/initialData";
import { cn } from "@/lib/utils";
import { useScrollGradient } from "@/hooks/useScrollGradient";
// import { Separator } from "@radix-ui/react-select";

function SectionBlock({ section }: { section: Section }) {
  return (
    <div className="avoid-break">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-700 mb-2">
        {section.title}
      </h3>
      {section.type === "rich" && (
        <p className="text-sm leading-5 whitespace-pre-line">
          {section.content}
        </p>
      )}
      {section.type === "grouped" && (
        <div className="space-y-3">
          {section.groups.map((g, i) => (
            <div key={i} className="mb-3">
              <div className="text-sm font-medium mb-1">{g.name}</div>
              <div className="text-sm text-neutral-700 flex flex-wrap gap-2">
                {g.items.map((it, j) => (
                  <span
                    key={j}
                    className="chip inline-flex items-center leading-none px-2 py-0.5 rounded bg-neutral-100"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {section.type === "timeline" && (
        <div className="space-y-3">
          {section.items.map((it, idx) => (
            <div key={idx}>
              <div className="text-[0.95rem] font-medium">{it.heading}</div>
              {it.meta && (
                <div className="text-xs text-neutral-500">{it.meta}</div>
              )}

              {/* Render positions if available */}
              {it.positions && it.positions.length > 0 ? (
                <div className="space-y-2">
                  {it.positions.map((position, posIdx) => (
                    <div key={posIdx} className="ml-2">
                      <div className="text-sm text-neutral-700">
                        {position.title}
                      </div>
                      {(position.start || position.end) && (
                        <div className="text-xs text-neutral-500">
                          {[position.start, position.end]
                            .filter(Boolean)
                            .join(" — ")}
                        </div>
                      )}
                      {position.bullets && position.bullets.length > 0 && (
                        <ul className="list-disc ml-5 text-sm leading-5">
                          {position.bullets.map((b, i2) => (
                            <li key={i2}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback to old format for backward compatibility */
                <>
                  {it.subheading && (
                    <div className="text-sm text-neutral-700">
                      {it.subheading}
                    </div>
                  )}
                  {(it.start || it.end) && (
                    <div className="text-xs text-neutral-500">
                      {[it.start, it.end].filter(Boolean).join(" — ")}
                    </div>
                  )}
                  {it.bullets && it.bullets.length > 0 && (
                    <ul className="list-disc ml-5 text-sm leading-5">
                      {it.bullets.map((b, i2) => (
                        <li key={i2}>{b}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PreviewProps = { data: ResumeData };
const ResumePreview = memo(
  forwardRef<HTMLElement, PreviewProps>(function Preview({ data }, ref) {
    const { showTopGradient, showBottomGradient, scrollRef } =
      useScrollGradient();

    const left = data.sections
      .filter((s) => s.placement === "left")
      .sort((a, b) => a.order - b.order);
    const right = data.sections
      .filter((s) => s.placement === "right")
      .sort((a, b) => a.order - b.order);

    // Helper function to format URLs properly
    const formatUrl = (url: string, type: string) => {
      if (type === "link") {
        // Ensure URL has protocol
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return `https://${url}`;
        }
        return url;
      }
      return url;
    };

    return (
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        className="w-full h-full flex items-center justify-center overflow-auto relative"
      >
        <article
          ref={ref}
          className={cn(
            "print-a4 flex flex-col bg-white text-black shadow-lg",
            "w-[210mm] h-[297mm]",
            "p-0",
            "transform transition-transform duration-200",
            "flex-shrink-0 h-full "
          )}
          style={{
            aspectRatio: "210/297",
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: "1.4",
          }}
        >
          <header className=" mb-3 px-6 py-6 bg-zinc-300 ">
            <h1 className="text-4xl font-bold leading-tight">
              {data.meta.fullName}
            </h1>
            <div className="text-sm text-neutral-700">{data.meta.title}</div>
            <div className="text-xs text-neutral-600 flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {data.meta.contact.map((c, i) => (
                <a
                  href={
                    c.type === "link"
                      ? formatUrl(c.value, c.type)
                      : c.type === "phone"
                      ? `tel:${c.value}`
                      : `mailto:${c.value}`
                  }
                  key={i}
                  className="hover:text-blue-600 transition-colors underline"
                  target={c.type === "link" ? "_blank" : undefined}
                  rel={c.type === "link" ? "noopener noreferrer" : undefined}
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </a>
              ))}
            </div>
          </header>

          <div
            className="flex gap-6 flex-1 box-border"
            // style={{
            //   gridTemplateColumns: `${data.layout.leftWidth}% ${data.layout.rightWidth}%`,
            // }}
          >
            <div
              className="space-y-4 p-4 bg-zinc-300"
              style={{
                width: `${data.layout.leftWidth}%`,
              }}
            >
              {left.map((s) => (
                <SectionBlock key={s.key} section={s} />
              ))}
            </div>
            <div
              className="space-y-4 box-border flex-1 py-4 "
              style={{
                width: `${data.layout.rightWidth}%`,
              }}
            >
              {right.map((s) => (
                <SectionBlock key={s.key} section={s} />
              ))}
            </div>
          </div>
        </article>

        {/* Gradient overlays for fade effect with smooth transitions */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 transition-opacity duration-300",
            showTopGradient ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 transition-opacity duration-300",
            showBottomGradient ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    );
  })
);

export default ResumePreview;
