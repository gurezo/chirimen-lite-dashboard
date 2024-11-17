// import { NgFor } from '@angular/common';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
// import { MatIconModule } from '@angular/material/icon';
// import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-breadcomb',
  standalone: true,
  // imports: [MatToolbarModule, MatIconModule, MatDividerModule, NgFor],
  imports: [MatDividerModule, NgClass],
  templateUrl: './breadcomb.component.html',
  styleUrl: './breadcomb.component.scss',
})
export class BreadcombComponent implements OnInit {
  // for demo
  styleFlag = false;

  appitems = [
    {
      label: 'Item 1',
      icon: 'keyboard_arrow_right',
      items: [
        {
          label: 'Item 1.1',
          link: '/item-1-1',
          icon: 'pan_tool',
        },
        {
          label: 'Item 1.2',
          icon: 'keyboard_arrow_right',
          items: [
            {
              label: 'Item 1.2.1',
              link: '/item-1-2-1',
              icon: 'perm_scan_wifi',
            },
            {
              label: 'Item 1.2.2',
              icon: 'keyboard_arrow_right',
              items: [
                {
                  label: 'Item 1.2.2.1',
                  link: 'item-1-2-2-1',
                  icon: 'room',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: 'Item 2',
      icon: 'keyboard_arrow_right',
      items: [
        {
          label: 'Item 2.1',
          link: '/item-2-1',
          icon: 'favorite',
        },
        {
          label: 'Item 2.2',
          link: '/item-2-2',
          icon: 'favorite_border',
        },
      ],
    },
    {
      label: 'Item 3',
      link: '/item-3',
      icon: 'offline_pin',
    },
    {
      label: 'Item 4',
      link: '/item-4',
      icon: 'star_rate',
      hidden: true,
    },
  ];

  ngOnInit() {
    // this.appitemsTravel = this.appitems;
    // this.appitemsTravel = this.appitems[3].items;
    setInterval(() => (this.styleFlag = !this.styleFlag), 2000);
  }

  menuHeader: any = [];
  breadCrumbMain() {
    this.appitemsTravel = this.appitems;
    this.menuHeader = [];
  }

  appitemsTravel: any;
}
