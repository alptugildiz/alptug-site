export const sections = [
  { id: "about", index: "001", label: "About" },
  { id: "experience", index: "002", label: "Log" },
  { id: "stack", index: "003", label: "Stack" },
  { id: "work", index: "004", label: "Work" },
  { id: "contact", index: "005", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
