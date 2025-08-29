import { resolve } from "$app/paths";
import { page } from "$app/state";
export function getNavLinks() {
  return [
    {
      href: resolve("/"),
      label: "Home",
      get active() {
        return this.href == page.url.pathname;
      },
    },
    {
      href: resolve("/characters"),
      label: "Characters",
      get active() {
        return this.href == page.url.pathname;
      },
    },
  ];
}
