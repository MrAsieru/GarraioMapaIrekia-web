import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { Observable } from 'rxjs';
import moment from 'moment-timezone';

@Component({
  selector: 'app-modal-alertas',
  templateUrl: './modal-alertas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalAlertasComponent  implements OnInit {
  @Input("alertas") alertas: Observable<Array<transit_realtime.IAlert>>;

  idiomasAlertas: string[] = [];
  zonaHoraria: string

  causeEnum = transit_realtime.Alert.Cause;
  effectEnum = transit_realtime.Alert.Effect;
  severityLevelEnum = transit_realtime.Alert.SeverityLevel;

  constructor(private modalCtrl: ModalController) {
    this.zonaHoraria = moment.tz.guess();
  }

  ngOnInit() {
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
