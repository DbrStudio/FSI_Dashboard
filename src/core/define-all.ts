export function defineAllWidgets() {
  import.meta.glob('../widgets/**/**.element.ts', {eager: true})
}