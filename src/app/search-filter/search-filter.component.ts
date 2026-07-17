import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input() feedType = '';
  @Input() value = '';
  @Input() resultCount = 0;
  @Input() totalCount = 0;
  @Output() searchChange = new EventEmitter<string>();

  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSub: Subscription;

  get placeholder(): string {
    return this.feedType ? `Search ${this.feedType} stories...` : 'Search stories...';
  }

  get isSearching(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  ngOnInit() {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(term => this.searchChange.emit(term));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this.searchTerm = this.value || '';
    }
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  onInput(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term.trim());
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.searchChange.emit('');
  }
}
