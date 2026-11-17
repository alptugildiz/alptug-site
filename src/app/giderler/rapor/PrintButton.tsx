"use client";

import { primaryButton } from "../ui";

/** Opens the browser's print dialog; "Save as PDF" there produces the file (see giderler.css @media print). */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={primaryButton}>
      PDF kaydet
    </button>
  );
}
