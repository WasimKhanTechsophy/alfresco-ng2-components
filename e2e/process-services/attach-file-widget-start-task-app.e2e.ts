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

import { LoginPage, Widget, ViewerPage, ApplicationsUtil } from '@alfresco/adf-testing';
import { TasksPage } from '../pages/adf/process-services/tasks.page';
import CONSTANTS = require('../util/constants');
import { FileModel } from '../models/ACS/file.model';
import { browser } from 'protractor';
import { NavigationBarPage } from '../pages/adf/navigation-bar.page';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { UsersActions } from '../actions/users.actions';
import { User } from '../models/APS/user';

describe('Start Task - Task App', () => {
    this.alfrescoJsApi = new AlfrescoApi({
        provider: 'BPM',
        hostBpm: browser.params.testConfig.adf_aps.host
    });
    const users = new UsersActions();
    const applicationService = new ApplicationsUtil(this.alfrescoJsApi);

    const loginPage = new LoginPage();
    const viewerPage = new ViewerPage();
    const widget = new Widget();
    const taskPage = new TasksPage();
    const navigationBarPage = new NavigationBarPage();

    let user: User;
    const app = browser.params.resources.Files.WIDGETS_SMOKE_TEST;
    const pdfFile = new FileModel({ 'name': browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_name });
    const wordFile = new FileModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_path
    });
    const appFields = app.form_fields;

    beforeAll(async () => {
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        user = await users.createTenantAndUser(this.alfrescoJsApi);
        await this.alfrescoJsApi.login(user.email, user.password);
        await applicationService.importPublishDeployApp(app.file_path);
        await loginPage.loginToProcessServicesUsingUserModel(user);
   });

    afterAll(async () => {
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.activiti.adminTenantsApi.deleteTenant(user.tenantId);
   });

    it('[C274690] Should be able to open a file attached to a start form', async () => {
        await (await (await navigationBarPage.navigateToProcessServicesPage()).goToTaskApp()).clickTasksButton();

        await taskPage.filtersPage().goToFilter(CONSTANTS.TASK_FILTERS.MY_TASKS);

        const newTask = await taskPage.createNewTask();
        await newTask.addName('View file');
        await newTask.selectForm(app.formName);
        await newTask.clickStartButton();

        await widget.attachFileWidget().attachFile(appFields.attachFile_id, pdfFile.location);
        await widget.attachFileWidget().checkFileIsAttached(appFields.attachFile_id, pdfFile.name);

        await widget.attachFileWidget().viewFile(pdfFile.name);
        await viewerPage.checkFileContent('1', pdfFile.firstPageText);
        await viewerPage.checkCloseButtonIsDisplayed();
        await viewerPage.clickCloseButton();
        await taskPage.tasksListPage().checkContentIsDisplayed('View file');
    });

    it('[C260418] Uploading single file form', async () => {
        const name = 'View Doc file';
        await (await (await navigationBarPage.navigateToProcessServicesPage()).goToTaskApp()).clickTasksButton();
        await taskPage.filtersPage().goToFilter(CONSTANTS.TASK_FILTERS.MY_TASKS);
        await taskPage.createTask({ name, formName: app.formName });

        await widget.attachFileWidget().attachFile(appFields.attachFile_id, wordFile.location);
        await widget.attachFileWidget().checkUploadIsNotVisible(appFields.attachFile_id);
        await widget.attachFileWidget().checkFileIsAttached(appFields.attachFile_id, wordFile.name);
        await taskPage.taskDetails().clickCompleteFormTask();

        await taskPage.filtersPage().goToFilter(CONSTANTS.TASK_FILTERS.COMPLETED_TASKS);
        await taskPage.tasksListPage().selectRow(name);
        await widget.attachFileWidget().checkUploadIsNotVisible(appFields.attachFile_id);
        await widget.attachFileWidget().checkFileIsAttached(appFields.attachFile_id, wordFile.name);
    });
});
