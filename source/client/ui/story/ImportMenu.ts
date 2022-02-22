/**
 * 3D Foundation Project
 * Copyright 2021 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Popup, { customElement, html } from "@ff/ui/Popup";

import "@ff/ui/Button";
import "@ff/ui/TextEdit";
import CVLanguageManager from "client/components/CVLanguageManager";
import { EDerivativeQuality, TDerivativeQuality } from "client/schema/model";
import CVModel2 from "client/components/CVModel2";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-import-menu")
export default class ImportMenu extends Popup
{
    protected url: string;
    protected language: CVLanguageManager = null;
    protected filename: string = "";
    protected modelOptions: {name: string, id: string}[] = [{name: "New Model", id: "-1"}];
    protected qualitySelection: EDerivativeQuality = EDerivativeQuality.Thumb;
    protected parentSelection: {name: string, id: string} = null;

    static show(parent: HTMLElement, language: CVLanguageManager, filename: string): Promise<[EDerivativeQuality, string]>
    {
        const menu = new ImportMenu(language, filename);
        parent.appendChild(menu);

        return new Promise((resolve, reject) => {
            menu.on("close", () => resolve([menu.qualitySelection, menu.parentSelection.id]));
        });
    }

    constructor( language: CVLanguageManager, filename: string )
    {
        super();

        this.language = language;
        this.filename = filename;
        this.modelOptions = this.modelOptions.concat(language.getGraphComponents(CVModel2).map(model => ({name: model.node.name, id: model.id})));
        this.position = "center";
        this.modal = true;
        this.parentSelection = this.modelOptions.length > 1 ? this.modelOptions[1] : this.modelOptions[0];

        this.url = window.location.href;
        this.style.height = "300px";
    }

    close()
    {
        this.dispatchEvent(new CustomEvent("close"));
        this.remove();
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("sv-import-menu", "sv-option-menu");
    }

    protected renderQualityEntry(quality: EDerivativeQuality, index: number)
    {
        return html`<div class="sv-entry" @click=${e => this.onClickQuality(e, index)} ?selected=${ quality === this.qualitySelection }>
            ${EDerivativeQuality[quality] as TDerivativeQuality}
        </div>`;
    }

    protected renderParentEntry(option: string, index: number)
    {
        return html`<div class="sv-entry" @click=${e => this.onClickParent(e, index)} ?selected=${ option === this.parentSelection.name }>
            ${option}
        </div>`;
    }

    protected render()
    {
        const language = this.language;

        return html`
        <div>
            <div class="ff-flex-column ff-fullsize">
                <div class="ff-flex-row">
                    <div class="ff-flex-spacer ff-title">${"File: "}<i>${this.filename}</i></div>
                    <ff-button icon="close" transparent class="ff-close-button" title=${language.getLocalizedString("Close")} @click=${this.close}></ff-button>
                </div>
                <div class="ff-flex-row">
                    <div class="ff-flex-spacer ff-header">${language.getLocalizedString("Derivative Quality")}</div>
                </div>
                <div class="ff-splitter-section" style="flex-basis: 70%">
                    <div class="ff-scroll-y">
                        ${Object.keys(EDerivativeQuality).filter(key => typeof EDerivativeQuality[key] === 'number').map((key, index) => this.renderQualityEntry(EDerivativeQuality[key], index))}
                    </div>
                </div>
                <div class="ff-flex-row">
                    <div class="ff-flex-spacer ff-header">${language.getLocalizedString("Parent Model")}</div>
                </div>
                <div class="ff-splitter-section" style="flex-basis: 30%">
                        <div class="ff-scroll-y">
                            ${this.modelOptions.map((option, index) => this.renderParentEntry(option.name, index))}
                        </div>
                </div>
                <div class="ff-flex-row sv-centered">
                    <ff-button icon="upload" class="ff-button ff-control" text=${language.getLocalizedString("Import Model")} title=${language.getLocalizedString("Import Model")} @click=${this.close}></ff-button>
                </div>
            </div>
        </div>
        `;
    }

    protected onClickQuality(e: MouseEvent, index: number)
    {
        e.stopPropagation();

        this.qualitySelection = EDerivativeQuality[EDerivativeQuality[index]];
        this.requestUpdate();
    }

    protected onClickParent(e: MouseEvent, index: number)
    {
        e.stopPropagation();

        this.parentSelection = this.modelOptions[index];
        this.requestUpdate();
    }
}