import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { buildProviders, FormElementComponent } from '../../utils/forms/form-element.component';
import { AutoUnsubscribe } from '../../utils/decorators/auto-unsubscribe';

@Component({
  selector: 'kal-textarea',
  templateUrl: './kal-textarea.component.html',
  styleUrls: ['./kal-textarea.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: buildProviders(KalTextareaComponent)
})
export class KalTextareaComponent extends FormElementComponent<string> implements OnInit, OnDestroy {

  /**
   * Form control
   */
  formControl = new FormControl('');

  /**
   * Subscription of formControl
   */
  @AutoUnsubscribe()
  private subscription: Subscription = Subscription.EMPTY;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  /**
   * @inheritDoc
   */
  writeValue(value: string) {
    this.formControl.patchValue(value, {emitEvent: false});
    this.cdr.markForCheck();
  }

  ngOnInit() {
    this.subscription = this.formControl.valueChanges.subscribe(
      value => {
        this.notifyUpdate(value);
      }
    );
  }

  ngOnDestroy() {
  }

}