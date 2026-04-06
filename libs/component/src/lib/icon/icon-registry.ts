import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IconRegistry {
  private icons = new Map<string, string>();

  register(name: string, svg: string) {
    this.icons.set(name, svg);
  }

  registerAll(icons: Record<string, { name: string; data: string }>) {
    Object.values(icons).forEach(({ name, data }) => this.icons.set(name, data));
  }

  get(name: string): string {
    const svg = this.icons.get(name);
    if (!svg) console.warn(`Icon "${name}" not found.`);
    return svg ?? '';
  }
}