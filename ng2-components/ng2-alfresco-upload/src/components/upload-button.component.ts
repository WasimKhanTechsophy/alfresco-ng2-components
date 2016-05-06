/**
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
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


import {Component, ViewChild, ElementRef, Input} from 'angular2/core';
import {UploadService} from '../services/upload.service';
import {FileModel} from '../models/file.model';
import {FileUploadingDialogComponent} from './file-uploading-dialog.component';

declare let componentHandler;
declare let __moduleName: string;

/**
 * <alfresco-upload-button [showDialogUpload]="boolean"
 *                         [showUdoNotificationBar]="boolean"
 *                         [uploadFolders]="boolean"
 *                         [multipleFiles]="boolean"
 *                         [acceptedFilesType]="string">
 * </alfresco-upload-button>
 *
 * This component, provide a set of buttons to upload files to alfresco.
 *
 * @InputParam {boolean} [true] showDialogUpload - hide/show upload dialog.
 * @InputParam {boolean} [true] showUdoNotificationBar - hide/show notification bar.
 * @InputParam {boolean} [false] uploadFolders - allow/disallow upload folders (only for chrome).
 * @InputParam {boolean} [false] multipleFiles - allow/disallow multiple files.
 * @InputParam {string} [*] acceptedFilesType - array of allowed file extensions.
 *
 *
 * @returns {UploadDragAreaComponent} .
 */
@Component({
    selector: 'alfresco-upload-button',
    moduleId: __moduleName,
    directives: [FileUploadingDialogComponent],
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.css'],
})
export class UploadButtonComponent {

    private _uploaderService: UploadService;

    @ViewChild('undoNotificationBar')
    undoNotificationBar;

    @ViewChild('fileUploadingDialog')
    fileUploadingDialogComponent: FileUploadingDialogComponent;

    @Input()
    showUploadDialog: boolean = true;

    @Input()
    showUdoNotificationBar: boolean = true;

    @Input()
    uploadFolders: boolean = false;

    @Input()
    multipleFiles: boolean = false;

    @Input()
    acceptedFilesType: string = '*';

    filesUploadingList: FileModel [] = [];

    constructor(public el: ElementRef) {
        console.log('UploadComponent constructor', el);

        this._uploaderService = new UploadService({
            url: 'http://192.168.99.100:8080/alfresco/service/api/upload',
            withCredentials: true,
            authToken: btoa('admin:admin'),
            authTokenPrefix: 'Basic',
            fieldName: 'filedata',
            formFields: {
                siteid: 'swsdp',
                containerid: 'documentLibrary'
            }
        });
    }

    /**
     * Method called when files are dropped in the drag area.
     *
     * @param {File[]} files - files dropped in the drag area.
     */
    onFilesAdded($event): void {
        let files = $event.currentTarget.files;
        if (files.length) {
            let latestFilesAdded = this._uploaderService.addToQueue(files);
            this.filesUploadingList = this._uploaderService.getQueue();
            if (this.showUploadDialog) {
                this._showDialog();
            }
            if(this.showUdoNotificationBar) {
                this._showUndoNotificationBar(latestFilesAdded);
            }
        }
    }

    /**
     * Show undo notification bar.
     *
     * @param {FileModel[]} latestFilesAdded - files in the upload queue enriched with status flag and xhr object.
     */
    private _showUndoNotificationBar(latestFilesAdded) {
        if (componentHandler) {
            componentHandler.upgradeAllRegistered();
        }

        this.undoNotificationBar.nativeElement.MaterialSnackbar.showSnackbar({
            message: 'Upload in progress...',
            timeout: 5000,
            actionHandler: function () {
                latestFilesAdded.forEach((uploadingFileModel) => {
                    uploadingFileModel.setAbort();
                });
            },
            actionText: 'Undo'
        });
    }

    /**
     * Show the upload dialog.
     */
    private _showDialog(): void {
        this.fileUploadingDialogComponent.showDialog();
    }
}
