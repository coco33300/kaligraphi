import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Inject, Input, OnInit, Optional, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { Highlightable } from '@angular/cdk/a11y';

import { KalTabGroupComponent } from '../kal-tab-group/kal-tab-group.component';

@Component({
  selector: 'kal-tab-header',
  templateUrl: './kal-tab-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalTabHeaderComponent implements AfterViewInit, Highlightable {

  /**
   * The label of the header
   */
  @Input() label = '';

  /**
   * If the label contains icons, we need to use the templateLabel
   */
  @Input() templateLabel: TemplatePortal<any> = null;

  /**
   * Is the header selected
   */
  private isSelected = false;

  /**
   * Is the header disabled
   */
  private isDisabled = false;

  /**
   * Is a tab highlighted
   */
  highlighted: boolean;

  /**
   * The reference to the cdk portal outlet
   */
  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

  constructor(private cdr: ChangeDetectorRef,
              @Optional() @Inject(forwardRef(() => KalTabGroupComponent)) public tabGroup: KalTabGroupComponent) {
  }

  /**
   * Is the header disabled
   */
  @Input()
  get disabled() {
    return this.isDisabled;
  }

  set disabled(value: boolean) {
    this.isDisabled = value;
    this.cdr.markForCheck();
  }

  /**
   * Is the header selected
   */
  @Input()
  get selected() {
    return this.isSelected;
  }

  set selected(value: boolean) {
    this.isSelected = coerceBooleanProperty(value);
    this.cdr.markForCheck();
  }

  setActiveStyles(): void {
    this.highlighted = true;
    this.cdr.markForCheck();
  }

  setInactiveStyles(): void {
    this.highlighted = false;
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    if (this.tabGroup) {
      this.tabGroup.attachTemplatePortal(this.portalOutlet, this.templateLabel, this.cdr);
    }
  }
}
