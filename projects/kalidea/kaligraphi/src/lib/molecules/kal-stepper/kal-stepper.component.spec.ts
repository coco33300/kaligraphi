import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { KalStepperComponent } from './kal-stepper.component';
import { KalStepComponent } from './kal-step/kal-step.component';
import { KalStepLabelDirective } from './directives/kal-step-label.directive';
import { KalStepHeaderComponent } from './kal-step-header/kal-step-header.component';

@Component({
  selector: 'kal-test',
  template: `
    <h1>Test Stepper</h1>
    <kal-stepper #stepper>
      <kal-step [stepControl]="form">
        <ng-template kalStepLabel>
          First step
        </ng-template>
        <form [formGroup]="form">
          <input type="text" formControlName="email">
        </form>
        hello there
      </kal-step>
      <kal-step>
        <ng-template kalStepLabel>
          Second step
        </ng-template>
        hey hey
      </kal-step>
      <kal-step>
        <ng-template kalStepLabel>
          Third step
        </ng-template>
        good to know
      </kal-step>
    </kal-stepper>
  `
})
class TestComponent {
  @ViewChild(KalStepperComponent) stepper: KalStepperComponent;

  form = new FormGroup({
    email: new FormControl('')
  });

  setValidators() {
    this.form.get('email').setValidators(Validators.required);
    this.form.get('email').updateValueAndValidity();
  }
}


describe('KalStepperComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
      ],
      declarations: [
        TestComponent,
        KalStepperComponent,
        KalStepComponent,
        KalStepLabelDirective,
        KalStepHeaderComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const expectVisibilityOf = (stepIndex) => {
    const steps: { nativeElement }[] = fixture.debugElement.queryAll(By.css('.kal-stepper-content'));
    for (let i = 0; i < steps.length; i++) {
      const expected = i === stepIndex ? 'true' : 'false';
      expect(steps[i].nativeElement.getAttribute('aria-expanded')).toBe(expected,
        `step ${i} should be ${i === stepIndex ? 'visible' : 'invisible'}`
      );
    }
  };

  const clickOnHeader = (headerIndex) => {
    const headers = fixture.debugElement.queryAll(By.directive(KalStepHeaderComponent));
    headers[headerIndex].nativeElement.click();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display first step at start', () => {
    expectVisibilityOf(0);
  });

  it('should display second step when second label is clicked', () => {
    clickOnHeader(1);
    fixture.detectChanges();
    expectVisibilityOf(1);
  });

});
