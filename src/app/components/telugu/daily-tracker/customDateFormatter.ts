import { CalendarNativeDateFormatter, DateFormatterParams } from 'angular-calendar';

export class CustomDateFormatter extends CalendarNativeDateFormatter {
  // This controls the headers in the week and day views
  public override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  }

  // If you also need to change the month view top header
  public override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  }
}
