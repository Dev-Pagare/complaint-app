import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countByStatus', standalone: true })
export class CountByStatusPipe implements PipeTransform {
  transform(complaints: any[], status: string): number {
    return complaints.filter(c => c.status === status).length;
  }
}
