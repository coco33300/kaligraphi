import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { KalListSelection } from 'src/projects/kalidea/kaligraphi/src/lib/molecules/kal-list/kal-list-selection';
import { KalListComponent } from 'src/projects/kalidea/kaligraphi/src/lib/molecules/kal-list/kal-list.component';

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

  icon = 'keyboard_arrow_right';

  selectRowOnContentClick = false;

  @ViewChild(KalListComponent) kalListComponent: KalListComponent;

  constructor() {
  }

  selectRow($event) {
    this.listSelection = $event;
    this.kalListComponent.highlighted = null;
  }

  highlightItem($event) {
    this.listSelection = new KalListSelection();
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
    this.icon = 'keyboard_arrow_right';
    this.selectionMode = 'multiple';
  }

  unselectRows() {
    this.icon = null;
    this.selectionMode = 'none';
  }

  selectSingleRow() {
    this.icon = 'keyboard_arrow_right';
    this.selectionMode = null;
  }

  changeSelection() {
    this.listSelection = new KalListSelection<{ id: string }>([{id: '1'}], false, []);
    this.selectedValue = new KalListSelection<{ id: string }>([{id: '1'}], false, []);
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
