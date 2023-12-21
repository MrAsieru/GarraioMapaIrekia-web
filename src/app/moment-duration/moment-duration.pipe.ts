import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

@Pipe({
    name: 'durationFormat',
    standalone: true
})
export class MomentDurationPipe implements PipeTransform {
    transform(value: moment.DurationInputArg1, unit: moment.unitOfTime.DurationConstructor | undefined, dateFormat: string): any {
        momentDurationFormatSetup(moment);
        if (!value) return '';
        return moment.duration(value, unit).format(dateFormat, {trim: 'both', usePlural: false});
    }
}