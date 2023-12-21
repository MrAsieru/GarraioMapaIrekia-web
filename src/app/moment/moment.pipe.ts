import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
    name: 'dateFormat',
    standalone: true
})
export class MomentPipe implements PipeTransform {
    transform(value: moment.MomentInput, dateFormat: string): any {
        if (!value) return '';
        return moment(value).locale("es").format(dateFormat);
    }
}