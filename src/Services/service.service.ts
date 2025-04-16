import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  boleanActivate: boolean = false;
    constructor() { }
  setActivate(){
    this.boleanActivate = !this.boleanActivate;
  }
  getActivate(){
    return this.boleanActivate;
  }
}
