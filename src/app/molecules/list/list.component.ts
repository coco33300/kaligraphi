import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { KalListSelection } from '@kalidea/kaligraphi';
import { Observable, of } from 'rxjs';
import { KalCheckboxComponent } from 'projects/kalidea/kaligraphi/src/lib/atoms/kal-checkbox/kal-checkbox.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  /**
   * dataSource
   */
  dataSource: any = new TestDataSource();

  /**
   * groupBy function
   */
  groupByFunction = null;

  /**
   * Disable rows function
   */
  disableRowsFunction = null;

  /**
   * selected value
   */
  selectedValue;

  /**
   * items selectionMode
   */
  selectionMode = 'single';

  /**
   * The list selection
   */
  listSelection = null;

  /**
   * The virtual scroll config
   */
  virtualScrollConfig = {
    height: 500,
    itemSize: 48
  };

  displayedCheckbox = false;

  selectedItem = null;

  test = null;

  private selectedRows = [];

  displayPrefixFunction = (item) => (this.test && this.test.id === item.id) || this.selectedRows.length > 0;

  constructor(private cdr: ChangeDetectorRef) {
  }

  changeDataSource() {
    this.virtualScrollConfig = null;

    this.dataSource = [
      {
        id: '1',
        name: 'aTest',
        disabled: true
      },
      {
        id: '2',
        name: 'aTest2',
        disabled: false
      },
      {
        id: '3',
        name: 'aTest3',
        disabled: false
      }, {
        id: '4',
        name: 'bTest4',
        disabled: false
      },
    ];
  }

  /**
   * Add a function that group all items
   */
  addGroupByFunction() {
    this.groupByFunction = !this.groupByFunction ? (item) => item['name'].charAt(0).toLocaleUpperCase() : null;
  }

  /**
   * Add a function that disable rows
   */
  disableRow() {
    this.disableRowsFunction = !this.disableRowsFunction ? (item) => item['disabled'] : null;
  }

  selectMultipleRows() {
    this.selectionMode = 'multiple';
  }

  unselectRows() {
    this.selectionMode = 'none';
  }

  selectSingleRow() {
    this.selectionMode = null;
  }

  changeSelection() {
    this.listSelection = new KalListSelection<{ id: string }>([{id: '1'}], false, []);
    this.selectedValue = new KalListSelection<{ id: string }>([{id: '1'}], false, []);
  }

  toggleValue($event, item, checkbox: KalCheckboxComponent) {
    $event.stopPropagation();
    $event.preventDefault();
    console.log(checkbox.value, $event);
    checkbox.value = !checkbox.value;
    // if ($event) {
    //   this.selectedRows.push(item);
    // } else {
    //   const selectedIndex = this.selectedRows.findIndex(element => element.id === item.id);
    //   if (selectedIndex > -1) {
    //     this.selectedRows.splice(selectedIndex, 1);
    //   }
    // }
  }

  displayCheckbox() {
    this.displayedCheckbox = !this.displayedCheckbox;
    this.cdr.markForCheck();
  }

  // hasCheckbox(item) {
  //   return this.displayedCheckbox && item && this.displayedCheckbox.id === item.id;
  // }

  isRowSelected(item) {
    return this.selectedRows.find(element => element.id === item.id);
  }

  selectRow($event) {
    this.selectedValue = $event;
    this.selectedItem = $event;
    this.selectedRows = [];
  }

}

class TestDataSource implements DataSource<{ id: string, name: string }> {

  /**
   * Return an observable that contains the items list
   */
  connect(): Observable<any> {
    const listItem = [];
    for (let i = 1; i <= 500; i++) {
      listItem.push(
        {
          id: '' + i,
          name: 'rTest' + i,
          disabled: i === 1
        },
      );
    }

    return of(listItem);
  }

  disconnect() {
  }
}
