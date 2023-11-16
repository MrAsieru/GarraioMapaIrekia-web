import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, IonicModule } from '@ionic/angular';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lateral',
  templateUrl: './lateral.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, NgTemplateOutlet],
})
export class LateralComponent  implements OnInit {
  // Modal lateral_modal
  @ViewChild(IonModal) lateralModal: IonModal;
  constructor(private route: ActivatedRoute, private router: Router, private breakpointObserver: BreakpointObserver) { }
  mostrarModal: boolean = true;

  ngOnInit() {
    // https://ionicframework.com/docs/layout/css-utilities#ionic-breakpoints
    this.breakpointObserver.observe("(min-width: 992px)").subscribe((result) => {
      this.mostrarModal = !result.matches; // Si es Large o más, no mostrar el modal
    });
  }

  navegarA(ruta: string[]) {
    this.lateralModal?.dismiss();
    this.router.navigate(ruta, {relativeTo: this.route.parent});
  }
}
