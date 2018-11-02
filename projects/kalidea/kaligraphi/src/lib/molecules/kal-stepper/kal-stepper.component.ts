import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import { CdkStepper, StepperOrientation } from '@angular/cdk/stepper';
import { FocusableOption } from '@angular/cdk/a11y';
import { takeUntil } from 'rxjs/operators';

import { KalStepComponent } from './kal-step.component';
import { END, ENTER, HOME, SPACE } from '@angular/cdk/keycodes';


// bug in cdk, should provide this class ourselves
// https://github.com/angular/material2/pull/10614/files#diff-6c5ad0b93867d084db7acfd30f02d32bR247
// should remove in cdk 7.x
@Directive({
  selector: '[kalStepHeader]',
})
export class KalStepHeaderDirective implements FocusableOption {

  constructor(protected _elementRef: ElementRef<HTMLElement>) {
  }

  /** Focuses the step header. */
  focus() {
    this._elementRef.nativeElement.focus();
  }
}

@Component({
  selector: 'kal-stepper',
  templateUrl: './kal-stepper.component.html',
  styleUrls: ['./kal-stepper.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalStepperComponent extends CdkStepper implements AfterContentInit {


  @HostBinding('attr.role') role = 'tablist';

  /** Steps that the stepper holds. */
  @ContentChildren(forwardRef(() => KalStepComponent))
  _steps: QueryList<KalStepComponent>;

  @ContentChildren(KalStepHeaderDirective)
  _stepHeader: QueryList<KalStepHeaderDirective>;


  @Input()
  @HostBinding('attr.aria-orientation')
  get orientation() {
    return this._orientation;
  }

  set orientation(orientation: StepperOrientation) {
    this._orientation = orientation;
  }


  _onKeydown(event: KeyboardEvent): void {

    const keyCode = event.keyCode;

    if (this['_keyManager'].activeItemIndex != null && (keyCode === SPACE || keyCode === ENTER)) {
      console.log('space or enter')
      event.preventDefault();
    } else if (keyCode === HOME) {
      console.log('HOME')
      this['_keyManager'].setFirstItemActive();
    } else if (keyCode === END) {
      console.log('END')
      this['_keyManager'].setLastItemActive();
    } else {
      console.log('defaut');
      this['_keyManager'].onKeydown(event);
    }
    super._onKeydown(event)
  }

  ngAfterContentInit(): void {
    this._steps.changes.pipe(
      takeUntil(this._destroyed)
    ).subscribe(() => this._stateChanged());
  }

}
