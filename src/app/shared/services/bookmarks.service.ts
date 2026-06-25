import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Story } from '../models/story';

const STORAGE_KEY = 'bookmarks';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  private bookmarks: Story[] = this.load();
  private bookmarksSubject = new BehaviorSubject<Story[]>(this.bookmarks);
  bookmarks$: Observable<Story[]> = this.bookmarksSubject.asObservable();

  isBookmarked(id: number): boolean {
    return this.bookmarks.some(story => story.id === id);
  }

  toggle(story: Story) {
    if (this.isBookmarked(story.id)) {
      this.remove(story.id);
    } else {
      this.add(story);
    }
  }

  add(story: Story) {
    if (this.isBookmarked(story.id)) {
      return;
    }
    this.bookmarks = [story, ...this.bookmarks];
    this.persist();
  }

  remove(id: number) {
    this.bookmarks = this.bookmarks.filter(story => story.id !== id);
    this.persist();
  }

  get count(): number {
    return this.bookmarks.length;
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
    this.bookmarksSubject.next(this.bookmarks);
  }

  private load(): Story[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}
