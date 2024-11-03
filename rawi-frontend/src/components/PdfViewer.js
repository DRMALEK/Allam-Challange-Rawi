import {
    Inject, PdfViewerComponent, Toolbar, Magnification, Navigation, Annotation,
    LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, FormFields,
    FormDesigner, PageOrganizer
} from '@syncfusion/ej2-react-pdfviewer';
import './PdfViewer.css';
import { FabComponent } from '@syncfusion/ej2-react-buttons';
import { Browser } from '@syncfusion/ej2-base';
import { AIAssistViewComponent, AssistViewModel, PromptRequestEventArgs, ToolbarSettingsModel } from '@syncfusion/ej2-react-interactive-chat';
import { useEffect } from 'react';

function PdfViewer() {
    // Replace the SERVICE_URL with your local host
    const SERVICE_URL = 'localhost:5000';
    useEffect(() => {
        document.body.setAttribute('id', 'e-pv-AI-body-container');
    }, []);
    let pdfviewer;
    let fabButton;
    let aiAssistViewInst;
    let leftContainer;
    let rightContainer;
    let assistViews = [{ iconCss: "e-icons e-assistview-icon" }];
    let initialResponse = false;

    /* Function for the document load event*/
    function documentLoad() {
        if (fabButton) {
            fabButton.element.style.display = 'block';
        }
    }

    /* Function for the document unload event*/
    function documentUnLoad() {
        if (rightContainer) {
            rightContainer.style.display = "none";
        }
        if (!Browser.isDevice) {
            if (leftContainer) {
                leftContainer.style.width = "100%";
            }
            pdfviewer.updateViewerContainer();
        }
        if (fabButton) {
            fabButton.element.style.display = 'block';
        }
        aiAssistViewInst.prompts = [];
        aiAssistViewInst.promptSuggestions = [];
        initialResponse = false;
    }

    /* Function for the show the interchat*/
    function showAI() {
        if (fabButton) {
            fabButton.element.style.display = 'none';
        }
        if (!Browser.isDevice) {
            if (leftContainer) {
                leftContainer.style.width = "70%";
            }
            pdfviewer.updateViewerContainer();
        }
        if (rightContainer) {
            rightContainer.style.display = "block";
        }
        if (!initialResponse) {
            aiAssistViewInst.executePrompt("Summarize the document");
        }
    }

    const bannerViewTemplate = () => {
        return (
            <div className="ai-assist-banner">
                <div className="e-icons e-assistview-icon"></div>
                <h2>AI Assistance</h2>
                <div className="ai-assist-banner-subtitle">Your everyday AI companion</div>
            </div>
        );
    };

    /* Interactive chat toolbar settings */
    let assistViewToolbarSettings = {
        itemClicked: function (args) {
            if (args.item.iconCss == 'e-icons e-close') {
                if (fabButton) {
                    fabButton.element.style.display = 'block';
                }
                if (!Browser.isDevice) {
                    if (leftContainer) {
                        leftContainer.style.width = "100%";
                    }
                }
                if (rightContainer) {
                    rightContainer.style.display = "none";
                }
                if (!Browser.isDevice) {
                    pdfviewer.updateViewerContainer();
                }
            }
            if (args.item.iconCss == 'e-icons e-refresh') {
                let lastPropmt = aiAssistViewInst.prompts[aiAssistViewInst.prompts.length - 1].prompt;
                let editedPrompts = aiAssistViewInst.prompts;
                editedPrompts.pop();
                aiAssistViewInst.prompts = editedPrompts;
                aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
                aiAssistViewInst.executePrompt(lastPropmt);
            }
        },
        items: [{ iconCss: 'e-icons e-refresh', align: 'Right' }, { iconCss: 'e-icons e-close', align: 'Right' }]
    };

    /*Function trigger when the prompt request is made*/
    function promptRequestToAI(args) {
        if (!initialResponse) {
            initialResponse = true;
            callAIAssist();
        }
        else {
            var post = args.prompt;
            let url = SERVICE_URL + "/GetAnswer";
            let xhr = new XMLHttpRequest();
            xhr.open('Post', url, true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let response = xhr.responseText;
                    try {
                        let summarizeResponse = GetResponse(response);
                        let responseSuggestions = GetSuggestion(response);
                        const _promptSuggestions = responseSuggestions;
                        let references = extractReferences(summarizeResponse);
                        let modifiedResponse = summarizeResponse;
                        const referenceToLink = {};
                        references.forEach((ref) => {
                            let pageNumber = ref.replace(/[\[\]]/g, '');
                            let linkTag = `<a href='#' id="page-${pageNumber}" onclick="handlePageLinkClick(${parseInt(pageNumber, 10)})">${pageNumber}</a>`;
                            referenceToLink[ref] = linkTag;
                        });
                        Object.keys(referenceToLink).forEach(ref => {
                            let regex = new RegExp(ref, 'g');
                            modifiedResponse = modifiedResponse.replace(regex, referenceToLink[ref]);
                        });
                        aiAssistViewInst.addPromptResponse(modifiedResponse);
                        aiAssistViewInst.promptSuggestions = _promptSuggestions;
                        aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                    }
                } else {
                    console.error('Request failed with status:', xhr.status, xhr.statusText);
                }
            };
            xhr.onerror = function () {
                console.error('Network error');
            };
            xhr.send(JSON.stringify({ question: post }));
        }
    }

    function GetResponse(text) {
        let jsonResponse = JSON.parse(text);
        let suggestions = jsonResponse.split('\nsuggestions');
        suggestions = suggestions.filter((suggestion) => suggestion.trim() !== '');
        let summarizeResponse = suggestions[suggestions.length - 2].trim();/*Get the response */
        return summarizeResponse;
    }

    function GetSuggestion(text) {
        let jsonResponse = JSON.parse(text);
        let suggestions = jsonResponse.split('\nsuggestions');
        suggestions = suggestions.filter((suggestion) => suggestion.trim() !== '');
        suggestions.shift();
        let responseSuggestions = suggestions[0].split('\n');/*Get the suggestions */
        responseSuggestions = responseSuggestions.filter((suggestion) => suggestion.trim() !== '');
        responseSuggestions = responseSuggestions.map((line) => line.replace(/^\d+\.\s*/, ''));
        return responseSuggestions;
    }

    /*Fucntion to separate the page number */
    function extractReferences(text) {
        const referenceRegex = /\[(.*?)\]/g;
        const matches = [];
        let match;
        while ((match = referenceRegex.exec(text)) !== null) {
            const numbers = match[1].split(',').map(num => num.trim());
            matches.push(...numbers);
        }
        return matches;
    }

    /*Function fro navigate the page of the viewer*/
    window.handlePageLinkClick = function (pageNumber) {
        pdfviewer.navigation.goToPage(pageNumber);
    };

    /*Initial prompt request method*/
    function callAIAssist() {
        let data = pdfviewer.getRootElement();
        var hashId = data.ej2_instances[0].viewerBase.hashId;
        var dictionary = {
            "hashId": hashId,
        };
        var post = JSON.stringify(dictionary);
        let url = SERVICE_URL + "/SummarizePDF";
        let xhr = new XMLHttpRequest();
        xhr.open('Post', url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                let response = xhr.responseText;
                try {
                    let summarizeResponse = GetResponse(response);
                    let responseSuggestions = GetSuggestion(response);
                    const _promptSuggestions = responseSuggestions;
                    aiAssistViewInst.promptSuggestions = _promptSuggestions;
                    aiAssistViewInst.addPromptResponse(summarizeResponse);
                    aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', e);
                }
            } else {
                console.error('Request failed with status:', xhr.status, xhr.statusText);
            }
        };
        xhr.onerror = function () {
            console.error('Network error');
        };
        xhr.send(post);
    }

    return (
        <>
            <div className="description-container e-card">
                <div className='e-card-content '>
                    <p>This sample demonstrates how the Syncfusion React PDF Viewer offers intelligent PDF summarization and Q&A.
                        By clicking the <mark>AI AssistView</mark> button at the bottom-right, users can get a summary of the PDF and then ask
                        questions about the document using their own queries or AI-generated suggestions.
                        Know more <a target="_blank" href="https://github.com/syncfusion/smart-ai-samples/blob/master/react/src/ai-components/pdfviewer/Readme.md">here</a>.
                    </p>
                    <p>Make sure you have replaced <b>SERVICE_URL</b> with your local host.</p>
                </div>
            </div>
            <div id="e-pv-AI-parent-container">
                <div id="e-pv-left-container"
                    ref={container => leftContainer = container}>
                    <FabComponent id="e-pv-fab-btn" title="Open AI Assist" style={{ display: 'none' }}
                        ref={fab => fabButton = fab}
                        iconCss='e-icons e-assistview-icon'
                        onClick={showAI}
                    ></FabComponent>
                    <PdfViewerComponent id="PdfViewer" style={{ height: '100%', width: '100%' }}
                        ref={pdfviewerObj => pdfviewer = pdfviewerObj}
                        documentPath="https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf"
                        serviceUrl={SERVICE_URL}
                        documentLoad={documentLoad}
                        zoomMode="FitToPage"
                        documentUnload={documentUnLoad}
                    >
                        <Inject services={[Toolbar, Magnification, Navigation, Annotation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, FormFields, FormDesigner, PageOrganizer]} />
                    </PdfViewerComponent>
                </div>
                <div id="e-pv-right-container" style={{ display: 'none' }}
                    ref={container => rightContainer = container}>
                    <div id="container-ai-assist">
                        <AIAssistViewComponent
                            ref={(aiAssistView) => aiAssistViewInst = aiAssistView}
                            id="e-pv-defaultAIAssistView"
                            promptPlaceholder="Type your prompt for assistance..."
                            promptSuggestionsHeader="Suggested Prompts"
                            responseIconCss="e-icons e-assistview-icon"
                            views={assistViews}
                            toolbarSettings={assistViewToolbarSettings}
                            width="100%"
                            height="100vh"
                            bannerTemplate={bannerViewTemplate}
                            promptRequest={promptRequestToAI}
                        ></AIAssistViewComponent>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PdfViewer;