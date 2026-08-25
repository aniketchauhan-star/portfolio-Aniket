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

/**
 * The mobile overlay is a full screen, not a pill with four slots — so it
 * carries the *complete* index, in page order.
 *
 * That matters more on a phone than on a desktop: there is no persistent bar
 * to scan, the page is seven screens of continuous scroll, and a menu that
 * silently omits Capabilities and Knowledge leaves a visitor with no way to
 * reach them except by scrolling past everything else.
 */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { id: "top", label: "INDEX", index: "00" },
  { id: "about", label: "ABOUT", index: "01" },
  { id: "skills", label: "CAPABILITIES", index: "02" },
  { id: "work", label: "WORK", index: "03" },
  { id: "experience", label: "EXPERIENCE", index: "04" },
  { id: "knowledge", label: "KNOWLEDGE", index: "05" },
  { id: "contact", label: "CONTACT", index: "06" },
];
