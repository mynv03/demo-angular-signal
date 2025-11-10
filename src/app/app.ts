import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, delay, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  styles: [`
    .container {
      padding: 2rem;
    }
    hr {
      margin: 3rem 0;
      border: none;
      border-top: 2px solid #eee;
    }
  `]
})
export class App {
  protected readonly title = signal('Demo Angular Signal');
  //Issue 1: Derive value from Signal and BehaviorSubject
  // countSignal = signal(1);
  // countBehaviorSubject = new BehaviorSubject(1);

  // doubleCountSignal = computed(() => this.countSignal() * 2);
  // doubleCountBehaviorSubject = this.countBehaviorSubject.pipe(
  //   map((value) => value * 2)
  // )
  // destroy$ = new Subject<void>();

  // constructor() {
  //   console.log(this.doubleCountSignal());
  //   this.doubleCountBehaviorSubject
  //   .pipe(takeUntil(this.destroy$))
  //   .subscribe((value) => {
  //     console.log(value);
  //   });
  // }

  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  //Issue 2: Combine multiple value of Signals and BehaviorSubjects

  // valueSignalA = signal(2);
  // valueSignalB = signal(3);
  // valueBehaviorSubjectA = new BehaviorSubject(2);
  // valueBehaviorSubjectB = new BehaviorSubject(3);

  // combinedSignal = computed(() => {
  //   console.log('valueSignalA', this.valueSignalA());
  //   console.log('valueSignalB', this.valueSignalB());
  //   console.log('Calculating combinedSignal', this.valueSignalA() * this.valueSignalB());
  //   return this.valueSignalA() * this.valueSignalB()
  // });

  // combinedBehaviorSubject = combineLatest([
  //   this.valueBehaviorSubjectA,
  //   this.valueBehaviorSubjectB
  // ]).pipe(
  //   map(([a, b]) => {
  //     console.log('valueBehaviorSubjectA', a );
  //     console.log('valueBehaviorSubjectB', b);
  //     console.log('Calculating combinedBehaviorSubject', a * b);
  //     return a * b;
  //   })
  // );
  
  // changeValueBehaviourSubject() {
  //   this.valueBehaviorSubjectA.next(this.valueBehaviorSubjectA.getValue() + 1);
  //   this.valueBehaviorSubjectB.next(this.valueBehaviorSubjectB.getValue() * 2);
  // }

  // changeValueSignals() {
  //   this.valueSignalA.set(this.valueSignalA() + 1);
  //   this.valueSignalB.set(this.valueSignalB() * 2);
  // }

  //Issue 3: Effect of Signals and BehaviorSubjects

  // valueSignalA = signal(2);
  // valueSignalB = signal(3);
  // valueBehaviorSubjectA = new BehaviorSubject(2);
  // valueBehaviorSubjectB = new BehaviorSubject(3);

  // combinedSignal = computed(() => {
  //   return this.valueSignalA() * this.valueSignalB()
  // });

  // combinedBehaviorSubject = combineLatest([
  //   this.valueBehaviorSubjectA,
  //   this.valueBehaviorSubjectB
  // ]).pipe(
  //   tap(([a, b]) => {
  //     console.log('Effect - combinedBehaviorSubject:', a * b);
  //   }),
  //   map(([a, b]) => {
  //     return a * b;
  //   })
  // );
  // constructor() {
  //   effect(() => {
  //     console.log('Effect - combinedSignal:', this.combinedSignal());
  //   });
    
  // }

  // changeValueBehaviourSubject() {
  //   this.valueBehaviorSubjectA.next(this.valueBehaviorSubjectA.getValue() + 1);
  //   this.valueBehaviorSubjectB.next(this.valueBehaviorSubjectB.getValue() * 2);
  // }
  
  // changeValueSignals() {
  //   this.valueSignalA.set(this.valueSignalA() + 1);
  //   this.valueSignalB.set(this.valueSignalB() * 2);
  // }

  //Issue 4: toSignal and toObservable
  // Problem : Search with debounce
  // BAD APPROACH: Without toObservable
  isShow = signal(false);
  searchBad = signal('');
  apiCallCountBad = signal(0);
  isLoadingBad = signal(false);
  searchResultBad = signal('Type something to search...');

  onSearchBad(value: string) {
    this.searchBad.set(value);
    if (!value) {
      this.searchResultBad.set('Type something to search...');
      return;
    }
    
    // This gets called on EVERY keystroke! 🔥
    this.isLoadingBad.set(true);
    this.apiCallCountBad.update(c => c + 1);
    
    this.searchAPIBad(value).subscribe(result => {
      this.searchResultBad.set(result);
      this.isLoadingBad.set(false);
    });
  }

  private searchAPIBad(query: string) {
    return of(`Found results for "${query}"`).pipe(delay(300));
  }

  // GOOD APPROACH: With toObservable + toSignal
  search = signal('');
  apiCallCount = signal(0);
  isLoading = signal(false);
  
  private search$ = toObservable(this.search);
  
  searchResult = toSignal(
    this.search$.pipe(
      debounceTime(500),
      switchMap(query => {
        if (!query) return of('Type something to search...');
        this.isLoading.set(true);
        this.apiCallCount.update(c => c + 1);
        return this.searchAPI(query);
      })
    ),
    { initialValue: 'Type something to search...' }
  );

  private searchAPI(query: string) {
    // Simulate API call
    return of(`Found results for "${query}"`).pipe(
      delay(800),
      switchMap(result => {
        this.isLoading.set(false);
        return of(result);
      })
    );
  }
}
