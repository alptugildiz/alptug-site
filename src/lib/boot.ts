export const BOOT_KEY = "alptug:booted";

/** Runs before paint: skips the boot overlay for returning visitors and reduced-motion users. */
export const bootInitScript = `try{if(sessionStorage.getItem("${BOOT_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.boot="done"}catch(e){}`;
