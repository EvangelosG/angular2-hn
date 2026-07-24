import { Injectable } from '@angular/core';

import { Story } from '../models/story';

const STORAGE_KEY = 'savedStories';

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  private saved: Story[] = this.read();

  getAll(): Story[] {
    return this.saved;
  }

  isSaved(id: number): boolean {
    return this.saved.some(story => story.id === id);
  }

  add(story: Story): void {
    if (this.isSaved(story.id)) {
      return;
    }
    this.saved = [story, ...this.saved];
    this.write();
  }

  remove(id: number): void {
    if (!this.isSaved(id)) {
      return;
    }
    this.saved = this.saved.filter(story => story.id !== id);
    this.write();
  }

  toggle(story: Story): boolean {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
      return false;
    }
    this.add(story);
    return true;
  }

  private read(): Story[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saved));
  }
}
