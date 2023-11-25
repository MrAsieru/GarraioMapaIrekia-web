import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, IonicModule } from '@ionic/angular';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { NavegacionService } from '../services/navegacion.service';

@Component({
  selector: 'app-lateral',
  templateUrl: './lateral.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, NgTemplateOutlet],
})
export class LateralComponent  implements OnInit {
  // Modal lateral_modal
  @ViewChild(IonModal) lateralModal: IonModal;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navegacionService: NavegacionService) { }
  mostrarModal: boolean = true;

  ngOnInit() {
    // https://ionicframework.com/docs/layout/css-utilities#ionic-breakpoints
    this.breakpointObserver.observe("(min-width: 992px)").subscribe((result) => {
      this.mostrarModal = !result.matches; // Si es Large o más, no mostrar el modal
    });
  }

  back() {
    this.lateralModal?.dismiss();
    this.navegacionService.back();
  }

  ngOnDestroy() {
    this.lateralModal?.dismiss();
  }
}
