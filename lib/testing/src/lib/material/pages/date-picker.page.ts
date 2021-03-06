/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { element, by, ElementFinder } from 'protractor';
import { BrowserActions } from '../../core/utils/browser-actions';
import { DatePickerCalendarPage } from './date-picker-calendar.page';

export class DatePickerPage {

    datePicker: ElementFinder = element.all(by.css('.mat-datepicker-toggle')).first();
    dateTime = new DatePickerCalendarPage();

    async setTodayDateValue(): Promise<void> {
        await BrowserActions.click(this.datePicker);
        await this.dateTime.selectTodayDate();
    }
}
