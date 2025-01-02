# Documentation for `EKEEL` apps
For deep overview of the system look [here](reports/System%20Overview.pdf) or click ->
<button onclick="const spec = document.getElementById('system-overview'); if(spec.style.display==='block'){ spec.style.display='none'; this.innerHTML=this.innerHTML.replace('Hide','Show'); } else { spec.style.display='block'; this.innerHTML=this.innerHTML.replace('Show','Hide'); }" style="cursor: pointer">
    `Show System Overview`
</button>

![System Overview](reports/System%20Overview.pdf){ type=application/pdf id="system-overview" style="min-height:70vh;width:100%; display:none" }

For annotation protocol specifications look [here](reports/PREAP%20Annotation%20Protocol%20specifications.pdf) or click ->
<button onclick="const spec = document.getElementById('protocol-specifications'); if(spec.style.display==='block'){ spec.style.display='none'; this.innerHTML=this.innerHTML.replace('Hide','Show'); } else { spec.style.display='block'; this.innerHTML=this.innerHTML.replace('Show','Hide'); }" style="cursor: pointer">
    `Show Annotation Protocol`
</button>

![Annotation Protocol](reports/PREAP%20Annotation%20Protocol%20specifications.pdf){ type=application/pdf id="protocol-specifications" style="min-height:70vh;width:100%; display:none" }

## `Annotation`

Follows sequence diagrams of typical function calls: 
<button onclick="
    const graphs = document.getElementsByClassName('mermaid-container');
    if (graphs[0].style.display === 'block') {
        for(graph of graphs)
            graph.style.display = 'none';
        this.innerHTML = this.innerHTML.replace('Hide', 'Show');
    } else {
        for(graph of graphs)
            graph.style.display = 'block';
        this.innerHTML = this.innerHTML.replace('Show', 'Hide');
    }
" style="cursor: pointer">
    `Hide Sequence Diagrams`
</button>



<div class="mermaid-container" id="annotator1"></div>
<br>
<div class="mermaid-container" id="annotator2"></div>
<br>
<div class="mermaid-container" id="annotator3"></div>
<style>
    #root-6 rect, #root-10 rect {
        rx: 50%; /* Fully round the corners to create a circle */
        ry: 50%;
    }
</style>
<script>
    
    async function updateDiagrams() {
    
        const diagramDefinitions = [
                {
                    containerId: "annotator1",
                    graph: `
                        %%{init: { 'sequence': {'mirrorActors':false} } }%%
                        sequenceDiagram
                            actor u as User
                            participant f as JS-Frontend
                            participant b as Flask-Backend

                            u->>+f: Opens the Website
                            f->>+b: GET /
                            b->>+f: python: main.index()
                            deactivate b
                            f->>f: render index.html
                            deactivate f
                    `,
                },
                {
                    containerId: "annotator2",
                    graph: `
                        %%{init: { 'sequence': {'mirrorActors':false} } }%%
                        sequenceDiagram
                            actor u as User
                            participant f as JS-Frontend
                            participant b as Flask-Backend
                            participant mongo as MongoDB

                            u->>+f: click "Sign up" button 
                            f->>+b: GET /register
                            b->>+f: python: main.register()
                            deactivate b
                            f->>f: render register.html
                            deactivate f
                            u->>+f: fills the form      
                            f->>+b: POST /register
                            b->>+mongo: db.unverified_users.insert_one()
                            mongo->>+b: response
                            deactivate mongo
                            b->>+f: python: main.register()
                            deactivate b
                            f->>f: render confirm_code.html
                            deactivate f
                            f->>+b: POST /confirm_code

                            alt code is correct
                                b->>+mongo: db.unverified_users.delete_one()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+mongo: db.users.insert_one()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+f: python: main.confirm_code()
                                deactivate b
                                f->>f: render confirm_code.html
                                deactivate f

                            else is wrong
                                b->>+mongo: db.unverified_users.update_one()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+f: python: main.flash()
                                deactivate b
                                f->>f: alert()
                                deactivate f
                            end
                            
                    `,
                },
                {
                    containerId: "annotator3",
                    graph: `
                        %%{init: { 'sequence': {'mirrorActors':false} } }%%
                        sequenceDiagram
                            actor u as User
                            participant f as JS-Frontend
                            participant b as Flask-Backend
                            participant mongo as MongoDB
                            participant t as Transcriber Service

                            
                            u->>+f: click "Manual Annotator" button 
                            mongo->>+t: response
                            t->>t: sleep
                            deactivate t
                            Note over f,mongo: The user must be authenticated to see the videos
                            f->>+b: GET /video_selection
                            
                            par transcriber-service
                                loop every 60 seconds
                                    t->>t: scheduled wake up
                                    t->>+mongo: transcriber.get_untranscribed_videos()
                                    mongo->>+t: response
                                    deactivate mongo
                                    t->>t: sleep
                                    deactivate t
                                end

                            and ekeel-service
                                b->>+mongo: main.video_selection() -> mongo.get_videos()
                                mongo->>+b: response
                                deactivate mongo
                            end
                            
                            b->>+f: main.video_selection()
                            f->>f: render video_selection.html
                            deactivate f
                            u->>+f: Inserts an url
                            
                            Note over f,mongo: The user must be authenticated to add videos
                            f->>+b: POST /video_selection
                            b->>b: main.video_selection()
                            b->>b: Download video, automatic transcript, and extract terms and thumbnails
                            b->>+mongo: VideoAnalyzer -> mongo.insert_video_data()
                            mongo->>+b: response
                            deactivate mongo

                            par transcriber-service
                                t->>+mongo: transcribe.py -> mongo.get_untranscribed_videos()
                                mongo->>+t: response
                                deactivate mongo
                                t->>t: stable_whisper.transcribe()
                                t->>+mongo: transcribe.py -> mongo.remove_annotations()
                                mongo->>+t: response
                                deactivate mongo
                                t->>+mongo: transcribe.py -> mongo.insert_video_data()
                                mongo->>+t: response
                                deactivate mongo
                                t->>t: sleep
                                deactivate t

                            and ekeel-service                 
                                b->>b: Create interactable transcript in html
                                b->>+mongo: mongo.get_concept_map()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+mongo: mongo.get_definitions()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+mongo: mongo.get_annotation_status()
                                mongo->>+b: response
                                deactivate mongo
                                b->>+mongo: mongo.get_vocabulary()
                                mongo->>+b: response
                                deactivate mongo
                                b->>b: add concepts and relations to payload
                            
                            end
                            b->>+f: main.video_selection()
                            f->>f: render mooc_annotator.html
                            deactivate f
                    `,
                },
            ];

        for (const { containerId, graph } of diagramDefinitions) {
            await renderDiagram(containerId, graph);
        }
    }
</script>




Slides extraction is described [here](reports/SWLD2023%20-%20Video%20Slide%20Segmentation.pdf) or click ->
<button onclick="const spec = document.getElementById('video-segmentation'); if(spec.style.display==='block'){ spec.style.display='none'; this.innerHTML=this.innerHTML.replace('Hide','Show'); } else { spec.style.display='block'; this.innerHTML=this.innerHTML.replace('Show','Hide'); }" style="cursor: pointer">
    `Show Slide Segmentation Protocol`
</button>

![Annotation Protocol](reports/SWLD2023%20-%20Video%20Slide%20Segmentation.pdf){ type=application/pdf id="video-segmentation" style="min-height:70vh;width:100%; display:none" }

In the current implementation, slides extraction has been disabled to avoid overloading the server and should be reimplemented using novel NLP models like [LLaVA](https://llava-vl.github.io/)


## `Augmentation`

## `flask-server`


## `react-app`




<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<style>
    .md-grid {
      margin-left:auto;
      margin-right:auto;
      max-width:80rem;
    }
</style>
<script>
    function getColorScheme() {
        const bodyColorMedia = document.body.getAttribute("data-md-color-media");
        if (bodyColorMedia === "(prefers-color-scheme)") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else if (bodyColorMedia === "(prefers-color-scheme: dark)") {
            return "dark";
        }
        return "light";
    }
    async function renderDiagram(containerId, graphDefinition) {
        try {
            const theme = getColorScheme();
            mermaid.initialize({
                startOnLoad: false,
                theme: theme,
            });
            const container = document.getElementById(containerId);
            container.innerHTML = ''; // Clear existing content
            const { svg } = await mermaid.render(containerId+"_graph", graphDefinition);
            container.innerHTML = svg;
            const lineElements = document.querySelectorAll('svg#annotator3_graph line.actor-line');
            lineElements.forEach(line => {
                line.setAttribute('y2', '3500'); // Set the y2 attribute
            });
        } catch (error) {
            console.error('Failed to render Mermaid diagram:', error);
        }
    }
    document.addEventListener('DOMContentLoaded', async () => {
        await updateDiagrams();
        const observer = new MutationObserver(async () => {
            await updateDiagrams();
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["data-md-color-media"],
        });
        // Check visibility and update only visible diagrams periodically
        setInterval(async () => {
            const containers = document.querySelectorAll('[class^="mermaid-container"]')
            if (containers.length && !containers[0].hasChildNodes())
                await updateDiagrams();
        }, 2000); // Check every 2 seconds
    });
</script>