import { Injectable } from '@angular/core';
import { Location } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

// Nils Mehlhorn: https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
export class NavegacionService {
  private history: string[] = [];
 
  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }
 
  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl("/");
    }
  }

  navegarA(ruta: string[], route: ActivatedRoute) {
    this.router.navigate(ruta, {relativeTo: route});
  }

  redirigirA(ruta: string[], route: ActivatedRoute) {
    this.router.navigate(ruta, {relativeTo: route}).then(() => {
      this.history.pop();
    });
  }
}
