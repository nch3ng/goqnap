import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Output() logoutFired = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {
  }

  fireLogout(){
    console.log("fire logout");
    this.logoutFired.emit();
  }

}
