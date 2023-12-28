import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.use(window.navigator.language.split('-')[0]);
  }
}
