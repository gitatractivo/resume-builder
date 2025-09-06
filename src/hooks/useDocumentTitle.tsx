import { useEffect } from "react";
import type { ResumeData } from "@/data/initialData";

export function useDocumentTitle(data: ResumeData) {
  useEffect(() => {
    const { fullName, title } = data.meta;

    // Create a dynamic title based on name and role
    let documentTitle = "Resume Builder";

    if (fullName && title) {
      documentTitle = `${fullName} - ${title}`;
    } else if (fullName) {
      documentTitle = `${fullName}`;
    } else if (title) {
      documentTitle = `${title}`;
    }

    // Update the document title
    document.title = documentTitle;
  }, [data.meta.fullName, data.meta.title]);
}
