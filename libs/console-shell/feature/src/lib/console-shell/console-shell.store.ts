import { computed, inject, Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';

type ConsoleShellPanel = 'terminal' | 'editor' | 'example';

export interface ConsoleShellState {
  activePanel: ConsoleShellPanel;
  leftNavOpen: boolean;
  rightNavOpen: boolean;
  isConnected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConsoleShellStore {
  private readonly ngRxStore = inject(Store);

  private readonly stateSignal = signal<ConsoleShellState>({
    activePanel: 'terminal',
    leftNavOpen: true,
    rightNavOpen: true,
    isConnected: false,
  });

  readonly state = this.stateSignal.asReadonly();

  readonly activePanel = computed(
    () => this.stateSignal().activePanel,
  );

  readonly leftNavOpen = computed(
    () => this.stateSignal().leftNavOpen,
  );

  readonly rightNavOpen = computed(
    () => this.stateSignal().rightNavOpen,
  );

  readonly isConnected = computed(
    () => this.stateSignal().isConnected,
  );

  setActivePanel(panel: ConsoleShellPanel): void {
    this.stateSignal.update((state) => ({
      ...state,
      activePanel: panel,
    }));
  }

  toggleLeftNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      leftNavOpen: !state.leftNavOpen,
    }));
  }

  openLeftNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      leftNavOpen: true,
    }));
  }

  closeLeftNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      leftNavOpen: false,
    }));
  }

  toggleRightNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      rightNavOpen: !state.rightNavOpen,
    }));
  }

  openRightNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      rightNavOpen: true,
    }));
  }

  closeRightNav(): void {
    this.stateSignal.update((state) => ({
      ...state,
      rightNavOpen: false,
    }));
  }

  setConnectionStatus(isConnected: boolean): void {
    this.stateSignal.update((state) => ({
      ...state,
      isConnected,
    }));
  }
}

