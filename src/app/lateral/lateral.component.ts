import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, IonicModule } from '@ionic/angular';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { NavegacionAppService } from '../services/navegacion-app.service';

@Component({
  selector: 'app-lateral',
  templateUrl: './lateral.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, NgTemplateOutlet],
})
export class LateralComponent  implements OnInit {
  @Input() nombre: string = "";
  @Input() nivel: number = 1;
  // Modal lateral_modal
  @ViewChild(IonModal) lateralModal: IonModal;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navegacionAppService: NavegacionAppService) { }
  mostrarModal: boolean = true;

  ngOnInit() {
    // https://ionicframework.com/docs/layout/css-utilities#ionic-breakpoints
    this.breakpointObserver.observe("(min-width: 992px)").subscribe((result) => {
      this.mostrarModal = !result.matches; // Si es Large o más, no mostrar el modal
    });
  }

  back() {
    this.lateralModal?.dismiss();
    this.navegacionAppService.back();
  }

  cerrar() {
    this.lateralModal?.dismiss();
    this.navegacionAppService.navegarA([Array(this.nivel).fill('..').join('/')], this.route);
  }

  ngOnDestroy() {
    this.lateralModal?.dismiss();
  }
}
