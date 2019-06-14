import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  HostBinding,
  OnDestroy} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { TemplatePortal } from '@angular/cdk/portal';
import { ESCAPE } from '@angular/cdk/keycodes';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Subscription, Observable, combineLatest, of } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AutoUnsubscribe, buildProviders, FormElementComponent } from '../../utils';
import { KalDataSourceManager } from '../../utils/classes/kal-data-source-manager';

export interface KalVirtualScrollConfig {
  itemSize: number;
  height: number;
}

type KalSelectDataSource<T> = DataSource<T> | Observable<T[]> | T[];

const defaultVirtualScrollConfig: KalVirtualScrollConfig = {
  itemSize: 27,
  height: 270
};

@Component({
  selector: 'kal-select-virtual-scroll',
  templateUrl: './kal-select-virtual-scroll.component.html',
  styleUrls: ['./kal-select-virtual-scroll.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: buildProviders(KalSelectVirtualScrollComponent)
})
export class KalSelectVirtualScrollComponent<T extends {id: number, label: string }>
  extends FormElementComponent
  implements OnInit, OnDestroy, CollectionViewer {

  options: T[] = [];

  viewChange: Observable<ListRange>;

  /**
   * Overlay Portal Options
   */
  @ViewChild('optionsPortal') optionsPortal: TemplatePortal<any>;

  @Input() selected: T;

  @Input() noSearchResult = 'No results found';

  /**
   * tab index for this element
   */
  @Input()
  @HostBinding('attr.tabIndex')
  tabIndex: number = null;

  @Output() readonly selectChange = new EventEmitter();

  /**
   * Copy of the options
   */
  originalOptions: T[];

  /**
   * control used to filter options
   */
  searchControl = new FormControl();

  /**
   * Overlay Reference
   */
  private overlayRef: OverlayRef;

  /**
   * Whether the overlay panel is open or not
   */
  isPanelOpen: boolean;

  /**
   * Whether the select is disabled or not
   */
    disabled: boolean;

  /**
   * Whether this element is focused
   */
  isFocused: boolean;

  @AutoUnsubscribe()
  private subscription: Subscription = Subscription.EMPTY;

  constructor(
    private elementRef: ElementRef,
    private overlay: Overlay,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }


  /**
  * DataSourceManager
  */
  private _dataSourceManager = new KalDataSourceManager<T>(this);

  @Input()
  get dataSource(): KalSelectDataSource<T> {
     return this._dataSourceManager.dataSource;
  }
  set dataSource( dataSource: KalSelectDataSource<T>) {
    this._dataSourceManager.dataSource = dataSource;
    this.subscription.unsubscribe();
    if (dataSource) {
      this.setOptions(this._dataSourceManager.observable);
    } else {
      this.options = [];
      this.originalOptions = [];
    }
  }

  /**
   * The virtual scroll config
   */
  private _virtualScrollConfig: KalVirtualScrollConfig = defaultVirtualScrollConfig;

  @Input()
  get virtualScrollConfig(): KalVirtualScrollConfig {
    return this._virtualScrollConfig;
  }

  set virtualScrollConfig(value: KalVirtualScrollConfig) {
    if (value) {
      this._virtualScrollConfig = {
        height: value.height || defaultVirtualScrollConfig.height,
        itemSize: value.itemSize || defaultVirtualScrollConfig.itemSize
      };
    } else {
      this._virtualScrollConfig = defaultVirtualScrollConfig;
    }
  }

  get virtualScrollHeight(): number {
    if (this.options.length === 0) {
      return this.virtualScrollConfig.itemSize;
    }
    if (this.options.length * this.virtualScrollConfig.itemSize > this.virtualScrollConfig.height) {
      return this.virtualScrollConfig.height;
    }
    return this.options.length * this.virtualScrollConfig.itemSize;
  }

  /**
   * Focus the select element
   */
  @HostListener('focus')
  focus(): void {
    if (!this.disabled) {
      this.elementRef.nativeElement.focus();
      this.isFocused = true;
    }
  }

  /**
   * Whether or not the overlay panel is open
   */
  get panelOpen(): boolean {
    return this.isPanelOpen;
  }

  /**
   * Select the given option
   */
  select(optionId: number) {
    this.selected = this.originalOptions.find( o => o.id === optionId);
    this.searchControl.patchValue(this.label);
    this.selectChange.emit(this.selected.id);
    this.close();
  }

  /**
   * Reset selection
   */
  reset() {
    this.selected = null;
    this.cdr.markForCheck();
  }

  /**
   * Open the overlay select
   */
  open(): void {
    if (this.disabled || !this.options || this.isPanelOpen) {
      return;
    }

    if (!this.isFocused) {
      this.focus();
    }

    if (!this.overlayRef) {
      this.createOverlay();
    }
    this.overlayRef.attach(this.optionsPortal);
    this.isPanelOpen = true;
  }

  /**
   * close the select overlay
   */
  close(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
    this.isPanelOpen = false;
  }

  /**
   * create overlayRef
   */
  private createOverlay() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'}
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'kal-overlay__transparent',
      width: this.elementRef.nativeElement.getBoundingClientRect().width,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.isFocused = false;
      this.close();
    });

    this.overlayRef.keydownEvents()
      .pipe(filter(event => event.keyCode === ESCAPE))
      .subscribe(() => this.close());
  }

  isActive(option) {
    if (!this.selected) {
      return false;
    }
    return option.id === this.selected.id;
  }

  get label(): string {
    return this.selected ? this.selected.label : !this.placeholder ? '' : this.placeholder;
  }

  private setOptions( dataSource$: Observable<T[] | ReadonlyArray<T>>) {
    this.subscription = combineLatest( dataSource$, this.searchControl.valueChanges.pipe(startWith(''))).pipe(
      map( ([items, term]: [T[], string]) => {
        this.originalOptions = items || [];
        return items.filter( item => item.label.includes(term));
      })
    ).subscribe(
      (items: T[] ) => {
        this.options = items !== undefined ? items : [];
        this.cdr.markForCheck();
      }
    );
  }

  ngOnInit() {
    if (!!this.selected && !!this.selected.id) {
      this.selected = this.options.find(
        currentOption => currentOption.id === this.selected.id
      );
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
    this.subscription.unsubscribe();
  }
}
