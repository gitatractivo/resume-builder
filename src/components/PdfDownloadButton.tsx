import { Button } from "@/components/ui/button";
import { useCallback, useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Props = { targetRef: React.RefObject<HTMLElement> };

export default function PdfDownloadButton({ targetRef }: Props) {
  const didErrorRef = useRef(false);

  const openWindowPrint = useCallback(() => {
    const node = targetRef.current;
    if (!node) return false;

    try {
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((el) => el.outerHTML)
        .join("\n");

      const win = window.open("", "_blank");
      if (!win) return false;

      const doc = win.document;
      doc.open();
      doc.write(`<!doctype html><html><head>
        <base href="${location.origin}${location.pathname}">
        ${styles}
        <style>@page{size:210mm 297mm;margin:0}</style>
      </head><body>
        ${node.outerHTML}
      </body></html>`);
      doc.close();

      const doPrint = () => {
        try {
          win.focus();
          win.print();

        } finally {
          setTimeout(() => {
            try {
              // win.close();
            } catch (e) {
              // catch error if window is already closed
              console.log("Failed to close window", e);
            }
          }, 1000);
        }
      };

      // Wait briefly for resources to paint
      setTimeout(doPrint, 400);
      return true;
    } catch {
      return false;
    }
  }, [targetRef]);

  const fallbackIframePrint = useCallback(() => {
    const node = targetRef.current;
    if (!node) return false;

    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) return false;

      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((el) => el.outerHTML)
        .join("\n");

      doc.open();
      doc.write(`<!doctype html><html><head>${styles}
        <style>@page{size:210mm 297mm;margin:0}</style>
        </head><body>
        ${node.outerHTML}
        </body></html>`);
      doc.close();

      const win = iframe.contentWindow as Window;
      const onLoadAndPrint = () => {
        try {
          win.focus();
          win.print();
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }
      };

      setTimeout(onLoadAndPrint, 300);
      return true;
    } catch {
      return false;
    }
  }, [targetRef]);

  const handlePrint = useReactToPrint({
    // @ts-ignore
    contentRef: () => targetRef.current,
    documentTitle: "resume",
    removeAfterPrint: true,
    pageStyle: `@page { size: 210mm 297mm; margin: 0; }`,
    onPrintError: () => {
      if (!didErrorRef.current) {
        didErrorRef.current = true;
        const okWin = openWindowPrint();
        if (!okWin) {
          const okIframe = fallbackIframePrint();
          if (!okIframe) window.print();
        }
      }
    },
  });

  const onClick = useCallback(() => {
    if (!targetRef.current) return;
    didErrorRef.current = false;

    // Prefer robust new-window path first
    const okWin = openWindowPrint();
    if (okWin) return;

    // Fallback to react-to-print
    if (typeof handlePrint === "function") {
      handlePrint();
      return;
    }

    // Then iframe
    const okIframe = fallbackIframePrint();
    if (!okIframe) window.print();
  }, [handlePrint, openWindowPrint, fallbackIframePrint, targetRef]);

  return (
    <Button
      className="no-print"
      onClick={onClick}
      variant="default"
      data-pdf-button
    >
      Download PDF
    </Button>
  );
}
