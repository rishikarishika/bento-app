import {
  Component, ChangeDetectionStrategy, signal,
  OnInit, OnDestroy, HostListener, inject, PLATFORM_ID, NgZone
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface BentoFeature {
  id: number;
  icon: string;
  label: string;
  headline: string;
  body: string;
  tag: string;
  accentVar: string;
}

const FEATURES: BentoFeature[] = [
  {
    id: 0,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="16" y="3" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="3" y="16" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M20.5 16v9M16 20.5h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    label: 'Real-time Analytics',
    headline: 'Decisions powered by live data',
    body: 'Sub-second event ingestion with streaming dashboards. Watch your metrics update as they happen — no page refresh required.',
    tag: 'Analytics',
    accentVar: '--forsythia',
  },
  {
    id: 1,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M9 14h10M14 9l5 5-5 5" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    label: 'AI-Powered Insights',
    headline: 'Intelligence built in, not bolted on',
    body: 'Natural-language queries over your data. Ask questions in plain English and get structured answers with citations.',
    tag: 'AI',
    accentVar: '--deep-saffron',
  },
  {
    id: 2,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="9" r="4" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="6"  cy="21" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="22" cy="21" r="3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 12.5L6 18M18 12.5L22 18M10 21h8" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round"/>
    </svg>`,
    label: 'Team Collaboration',
    headline: 'Async by design, real-time when it counts',
    body: 'Shared workspaces with fine-grained permission controls. Comment threads, @mentions, and live presence indicators.',
    tag: 'Collaboration',
    accentVar: '--mystic-mint',
  },
  {
    id: 3,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 4L5 8v7c0 5 4 9.5 9 10.5C19 24.5 23 20 23 15V8L14 4z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M10 14l3 3 5-5" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    label: 'Security & Compliance',
    headline: 'SOC 2 Type II certified infrastructure',
    body: 'End-to-end encryption at rest and in transit. GDPR, HIPAA and ISO 27001 compliant. Audit logs retained for 7 years.',
    tag: 'Security',
    accentVar: '--nocturnal',
  },
  {
    id: 4,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M4 12h20M9 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11 17h6M14 15v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    label: 'API Integration',
    headline: 'Connect anything in minutes',
    body: 'REST, GraphQL and WebSocket APIs with OpenAPI 3.1 specs. SDK libraries for 12 languages. Webhooks with automatic retry.',
    tag: 'Developer',
    accentVar: '--forsythia',
  },
  {
    id: 5,
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="10" stroke="currentColor" stroke-width="1.5"/>
      <path d="M4 14h20M14 4c-3 3-4.5 6-4.5 10s1.5 7 4.5 10M14 4c3 3 4.5 6 4.5 10S17 21 14 24"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    label: 'Global CDN',
    headline: '< 20 ms to 95% of the world',
    body: '300+ edge nodes across 6 continents. Intelligent routing, automatic failover, and zero-config TLS. Latency SLA guaranteed.',
    tag: 'Infrastructure',
    accentVar: '--deep-saffron',
  },
];

/** Breakpoint that separates bento (desktop) from accordion (mobile). */
const MQ = '(max-width: 767px)';

@Component({
  selector: 'app-bento',
  standalone: true,
  imports: [],
  templateUrl: './bento.component.html',
  styleUrl: './bento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BentoComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone       = inject(NgZone);

  readonly features = FEATURES;

  /**
   * Bento card currently hovered on desktop.
   * null = nothing active.
   */
  activeDesktop = signal<number | null>(null);

  /**
   * Accordion item currently expanded on mobile.
   * null = all collapsed.
   */
  activeMobile = signal<number | null>(null);

  /** Drives the @if switch between bento grid and accordion. */
  isMobile = signal<boolean>(false);

  /**
   * ID of the accordion item that was just transferred from desktop hover.
   * Used to apply a one-shot highlight CSS class so the user can see which
   * panel was auto-opened by the layout transition.
   */
  transferredId = signal<number | null>(null);

  // ── Internal resize snapshot ─────────────────────────────────────────────────
  // We snapshot activeDesktop on the FIRST resize event of each drag session.
  // This protects against mouseleave clearing the signal during the debounce
  // window while the user's hand moves from the card to the window edge.
  private _snapshotDesktop: number | null = null;
  private _snapshotTaken                  = false;

  private _mq:         MediaQueryList | null = null;
  private _mqListener: ((e: MediaQueryListEvent) => void) | null = null;
  private _debounceId: ReturnType<typeof setTimeout> | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._mq = window.matchMedia(MQ);
    this.isMobile.set(this._mq.matches);

    this._mqListener = (e: MediaQueryListEvent) =>
      this.zone.run(() => this._onBreakpointChange(e.matches));

    this._mq.addEventListener('change', this._mqListener);
  }

  ngOnDestroy(): void {
    this._mq?.removeEventListener('change', this._mqListener!);
    if (this._debounceId) clearTimeout(this._debounceId);
  }

  // ── window:resize — snapshot active card at the start of each drag ────────────
  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Capture on the very first event of this drag session, before any
    // mouseleave can fire and wipe activeDesktop.
    if (!this._snapshotTaken && !this.isMobile()) {
      this._snapshotDesktop = this.activeDesktop();
      this._snapshotTaken   = true;

      if (this._snapshotDesktop !== null) {
        const label = FEATURES.find(f => f.id === this._snapshotDesktop)?.label;
        console.log(
          `[Bento] 📸 Snapshot captured: card ${this._snapshotDesktop} ("${label}") — ` +
          `protected against mouseleave during resize drag`
        );
      }
    }

    // Reset snapshot flag once the resize gesture settles
    if (this._debounceId) clearTimeout(this._debounceId);
    this._debounceId = setTimeout(() => {
      this._snapshotTaken   = false;
      this._snapshotDesktop = null;
    }, 300);
  }

  // ── Breakpoint crossing — the actual state transfer ───────────────────────────
  private _onBreakpointChange(nowMobile: boolean): void {
    const wasMobile = this.isMobile();

    if (!wasMobile && nowMobile) {
      // ── Desktop → Mobile ──────────────────────────────────────────────────────
      // Prefer the snapshot; fall back to current signal value.
      const transferId = this._snapshotTaken
        ? this._snapshotDesktop
        : this.activeDesktop();

      console.log(
        `[Bento] 📐 Layout: desktop → mobile | ` +
        `snapshot=${this._snapshotDesktop} activeDesktop=${this.activeDesktop()} ` +
        `→ transferId=${transferId}`
      );

      // 1. Clear desktop state and switch layout FIRST.
      //    The accordion DOM is created in its natural closed state.
      this.activeDesktop.set(null);
      this.isMobile.set(true);

      // 2. After two animation frames the accordion list is mounted and its
      //    CSS transitions are active.  Only NOW open the target panel so the
      //    grid-template-rows transition (350 ms ease-out) plays visibly.
      if (transferId !== null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.zone.run(() => {
              this.activeMobile.set(transferId);
              this.transferredId.set(transferId);

              const label = FEATURES.find(f => f.id === transferId)?.label;
              console.log(
                `[Bento] ✅ Transfer complete: acc-panel-${transferId} ("${label}") ` +
                `opened smoothly via layout transition`
              );

              // Remove highlight class after animation plays (800 ms)
              setTimeout(() => this.transferredId.set(null), 800);
            });
          });
        });
      }

    } else if (wasMobile && !nowMobile) {
      // ── Mobile → Desktop ──────────────────────────────────────────────────────
      console.log('[Bento] 📐 Layout: mobile → desktop | accordion state cleared');
      this.activeMobile.set(null);
      this.isMobile.set(false);
    }

    // Reset snapshot
    this._snapshotTaken   = false;
    this._snapshotDesktop = null;
  }

  // ── Desktop card event handlers ───────────────────────────────────────────────
  onCardEnter(id: number): void {
    if (!this.isMobile()) this.activeDesktop.set(id);
  }

  onCardLeave(): void {
    // Guard: only clear in desktop mode — prevents mouseleave from wiping the
    // signal after isMobile has already been set to true during a transition.
    if (!this.isMobile()) this.activeDesktop.set(null);
  }

  // ── Mobile accordion toggle ───────────────────────────────────────────────────
  toggleAccordion(id: number): void {
    this.activeMobile.update(cur => (cur === id ? null : id));
    this.transferredId.set(null); // clear any transfer highlight on manual interaction
  }
}
