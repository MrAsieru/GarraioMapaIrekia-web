import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { Observable } from 'rxjs';
import moment from 'moment-timezone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MomentPipe } from '../moment/moment.pipe';

@Component({
  selector: 'app-modal-alertas',
  templateUrl: './modal-alertas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, MomentPipe, TranslateModule],
})
export class ModalAlertasComponent  implements OnInit {
  @Input("alertas") alertas: Observable<Array<transit_realtime.IAlert>>;

  idiomasAlertas: string[] = [];
  zonaHoraria: string;

  idiomaAplicacion: string | undefined = undefined;

  causeEnum = transit_realtime.Alert.Cause;
  effectEnum = transit_realtime.Alert.Effect;
  severityLevelEnum = transit_realtime.Alert.SeverityLevel;

  constructor(private modalCtrl: ModalController, private translateService: TranslateService) {
    this.zonaHoraria = moment.tz.guess();
  }

  ngOnInit() {
    this.idiomaAplicacion = this.translateService.currentLang;

    this.alertas.subscribe(alertas => {
      const idiomas = new Set<string>();
      alertas.forEach(alerta => {
        if (alerta.headerText?.translation) {
          alerta.headerText.translation.forEach(headerText => {
            if (headerText.language) {
              idiomas.add(headerText.language);
            }
          });
        }
      });
      
      if (this.idiomaAplicacion && !idiomas.has(this.idiomaAplicacion)) this.idiomaAplicacion = undefined;
      this.idiomasAlertas = Array.from(idiomas);
    });
  }

  cerrar() {
    this.modalCtrl.dismiss('modal-alertas')
  }

  abrirUrl(url: string) {
    window.open(url, '_blank');
  }
}
