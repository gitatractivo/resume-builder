import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState } from "react";

type Props = {
  targetRef: React.RefObject<HTMLElement>;
  fileName?: string;
};

export default function PdfDownloadButton({
  targetRef,
  fileName = "resume",
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const printStylesRef = useRef<HTMLStyleElement | null>(null);
  // const originalStylesRef = useRef<string>("");

  // Method 1: Same page print with body replacement
  const printOnSamePage = useCallback(() => {
    const node = targetRef.current;
    if (!node) return false;

    setIsProcessing(true);

    try {
      // Store current state
      const originalTitle = document.title;
      const originalBodyContent = document.body.innerHTML;
      const originalBodyClass = document.body.className;

      // Set document title for PDF filename
      document.title = fileName;
      document.head.title = fileName;

      // Create print-specific styles
      const printStyles = document.createElement("style");
      printStyles.textContent = `
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          
          /* Ensure backgrounds and colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Hide no-print elements */
          .no-print {
            display: none !important;
          }
        }
        
        @media screen {
          /* Styles for print preview */
          body.print-preview {
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
        }
      `;

      document.head.appendChild(printStyles);
      printStylesRef.current = printStyles;

      // Replace body content with just the resume
      document.body.innerHTML = node.outerHTML;
      document.body.className = "print-preview";

      // Trigger print dialog
      window.print();

      // Cleanup function
      const cleanup = () => {
        // Restore original content
        document.body.innerHTML = originalBodyContent;
        document.body.className = originalBodyClass;
        document.title = originalTitle;

        // Remove print styles
        if (
          printStylesRef.current &&
          document.head.contains(printStylesRef.current)
        ) {
          document.head.removeChild(printStylesRef.current);
          printStylesRef.current = null;
        }

        setIsProcessing(false);
      };

      // Listen for print completion
      const handleAfterPrint = () => {
        cleanup();
        window.removeEventListener("afterprint", handleAfterPrint);
        window.removeEventListener("beforeprint", handleBeforePrint);
      };

      const handleBeforePrint = () => {
        // Ensure the content is ready for printing
        document.body.className = "";
      };

      window.addEventListener("afterprint", handleAfterPrint);
      window.addEventListener("beforeprint", handleBeforePrint);

      // Fallback cleanup
      setTimeout(cleanup, 10000);

      return true;
    } catch (error) {
      console.error("Same page print failed:", error);
      setIsProcessing(false);
      return false;
    }
  }, [targetRef, fileName]);

  // Method 2: Hidden iframe with better content handling
  const printWithHiddenIframe = useCallback(() => {
    const node = targetRef.current;
    if (!node) return false;

    setIsProcessing(true);

    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        height: 297mm;
        border: 0;
      `;
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        setIsProcessing(false);
        return false;
      }

      // Get current page styles
      const styleSheets = Array.from(document.styleSheets);
      let allStyles = "";

      // Extract CSS rules
      styleSheets.forEach((sheet) => {
        try {
          if (sheet.href) {
            // External stylesheet
            allStyles += `@import url("${sheet.href}");\n`;
          } else if (sheet.cssRules) {
            // Inline styles
            Array.from(sheet.cssRules).forEach((rule) => {
              allStyles += rule.cssText + "\n";
            });
          }
        } catch (e) {
          // Skip if can't access stylesheet (CORS)
          console.warn("Could not access stylesheet:", sheet,e);
        }
      });

      // Also get inline styles from style elements
      const styleElements = Array.from(document.querySelectorAll("style"));
      styleElements.forEach((styleEl) => {
        allStyles += styleEl.textContent || "";
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${fileName}</title>
            <meta name="title" content="${fileName}">
            <meta property="og:title" content="${fileName}">
            <style>
              ${allStyles}
              
              @page { 
                size: A4; 
                margin: 0; 
              }
              
              body { 
                margin: 0; 
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            ${node.outerHTML}
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load
      iframe.onload = () => {
        setTimeout(() => {
          try {
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
              // Set the iframe document title as well
              if (iframeWindow.document) {
                iframeWindow.document.title = fileName;
              }
              iframeWindow.focus();
              iframeWindow.print();
            }
          } catch (printError) {
            console.error("Iframe print failed:", printError);
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              setIsProcessing(false);
            }, 1000);
          }
        }, 500);
      };

      return true;
    } catch (error) {
      console.error("Hidden iframe print failed:", error);
      setIsProcessing(false);
      return false;
    }
  }, [targetRef, fileName]);

  // Method 3: Simple fallback with better filename handling
  const printSimple = useCallback(() => {
    const originalTitle = document.title;

    // Set document title with .pdf extension for better recognition
    document.title = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

    // Also try setting the page title meta tag
    let titleMeta = document.querySelector('meta[name="title"]');
    let originalTitleMeta = "";

    if (!titleMeta) {
      titleMeta = document.createElement("meta");
      titleMeta.setAttribute("name", "title");
      document.head.appendChild(titleMeta);
    } else {
      originalTitleMeta = titleMeta.getAttribute("content") || "";
    }

    titleMeta.setAttribute("content", document.title);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
        if (originalTitleMeta) {
          titleMeta?.setAttribute("content", originalTitleMeta);
        } else {
          titleMeta?.remove();
        }
        setIsProcessing(false);
      }, 1000);
    }, 100);
  }, [fileName]);

  const onClick = useCallback(() => {
    if (!targetRef.current) return;

    // Try iframe method first (more reliable)
    const iframeSuccess = printWithHiddenIframe();
    if (iframeSuccess) return;

    // Fallback to same page
    const samePageSuccess = printOnSamePage();
    if (samePageSuccess) return;

    // Last resort
    printSimple();
  }, [printWithHiddenIframe, printOnSamePage, printSimple, targetRef]);

  return (
    <Button
      className="no-print"
      onClick={onClick}
      variant="default"
      disabled={isProcessing}
      data-pdf-button
    >
      {isProcessing ? "Opening Print Dialog..." : "Download PDF"}
    </Button>
  );
}
