export interface NavItem {
  id: string;
  label: string;
  /** Two-digit index used by the mobile menu. */
  index: string;
}

/** Single source for both the desktop bar and the mobile overlay. */
export const NAV_ITEMS: NavItem[] = [
  { id: "top", label: "INDEX", index: "01" },
  { id: "work", label: "WORK", index: "02" },
  { id: "experience", label: "EXPERIENCE", index: "03" },
  { id: "about", label: "ABOUT", index: "04" },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { id: "top", label: "INDEX", index: "01" },
  { id: "work", label: "WORK", index: "02" },
  { id: "experience", label: "EXPERIENCE", index: "03" },
  { id: "about", label: "ABOUT", index: "04" },
  { id: "contact", label: "CONTACT", index: "05" },
];
