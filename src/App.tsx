import { useRef, useState } from "react";
import ResumePreview from "@/components/ResumePreview";
import ResumeForm from "@/components/ResumeForm";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import { initialData, type ResumeData } from "@/data/initialData";
import { load, save } from "@/utils/storage";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switcher";

export default function App() {
  const [data, setData] = useState<ResumeData>(() => load(initialData));
  const [showForm, setShowForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const printRef = useRef<HTMLElement>(null!);

  const onChange = (val: ResumeData) => {
    setData(val);
    save(val);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed w-full top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="font-semibold text-lg text-foreground">
            Resume Builder
          </div>
          <div className="flex items-center gap-3">
            <PdfDownloadButton targetRef={printRef} />
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex pt-14 h-full overflow-y-scroll  ">
        {/* Sidebar */}
        <div
          className={`z-20 h-fit overflow-y-scroll  bg-muted transition-all duration-300 ${
            showSidebar
              ? "w-96  translate-x-0"
              : "w-96   -translate-x-full lg:translate-x-0 lg:w-0"
          }`}
        >
          {/* Form */}
          <div
            className={`transition-all flex p-4 flex-col box-border space-y-2 h-full overflow-y-scroll duration-300 w-full max-w-full ${
              showSidebar ? "block" : "hidden"
            }`}
            
          >
            <ThemeSwitch />
            <ResumeForm value={data} onChange={onChange} />
          </div>

          {/* Theme switcher */}
        </div>

        {/* Main content */}
        <div className=" flex flex-col h-full flex-1 overflow-y-scroll">
          {/* Mobile form overlay */}
          {/* <div
            className={`lg:hidden fixed inset-0 z-10 bg-background/80 backdrop-blur-sm transition-all duration-300 ${
              showForm
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowForm(false)}
          >
            <div className="h-full max-w-md mx-auto p-4">
              <div className="bg-background rounded-lg border h-full overflow-hidden">
                <ResumeForm value={data} onChange={onChange} />
              </div>
            </div>
          </div> */}

          {/* Preview area */}
          <div className="overflow-y-scroll h-full p-4 ">
            <div className="bg-muted rounded-lg p-2 sm:p-4 lg:p-6 h-full max-h-[calc(100dvh-110px)] overflow-y-scroll">
              <ResumePreview ref={printRef} data={data} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 ">
            {/* <Separator /> */}
            <p className="text-xs text-muted-foreground ">
              Tip: Use the Raw JSON box to paste/import/export your entire
              resume. Everything is serialized in localStorage.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}
