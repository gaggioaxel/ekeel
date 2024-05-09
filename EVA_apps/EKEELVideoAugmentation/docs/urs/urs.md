# EKEEL – Video Augmentation and Graph Exploration'

## User Requirements Specification Document
## DIBRIS – Università di Genova. Scuola Politecnica, Corso di Software Engineering 80154
                                 
### 1.  Introduction
#### 1.1 Aim of the Document
    
The aim of the document is to describe the requirements to be implemented for the EKEEL software assigned by Teldh for the SE course.

#### 1.2  Overview
* General project introduction
* Stakeholders overview
* System functionalities

#### 1.3  Definitions and Acronyms
| **Acronym** |  **Definition** |
|-------------|-----------------|
| SE          | Software Engineering |
| EKEEL     | EduResource knowledge graph extraction and in-context support to learners |
| MOOC        | Massive Open Online Course |

#### 1.4 Project Documents 
[*EKEEL PROJECT*](https://docs.google.com/document/d/1pQxl-iNJNbpYCMdUDcU7I9hkEgLvayDcyAM34pSnDII/edit?usp=sharing)

### 2.  System Description
#### 2.1  Context
The proliferation of e-learning platforms, MOOCs and online resources has raised new challenges in the field of Education. Video-based learning has seen a rapid growth in the last decade, and during the last year forced by the COVID-19 pandemic, its spread has been exponential. The pandemic situation, moreover, has only speeded up a process that was already under way. Video lessons available on educational portals and on video-sharing platforms have thus hugely grown. 

#### 2.2 Motivations
Educational materials in audiovisual format are designed by teachers or experts in the discipline, to present students with a sequence of educational concepts, highlighting the relevant connections between topics and concepts. However, when made in a poorly structured way, the videos suffer from some limitations that reduce their engagement, for example with excessive length that tempts the learner to follow the video partially or to skip some parts on the progress bar. The creation of augmented video or hypervideo, supported by the presence of a semantic knowledge graph extracted previously, can help the user to obtain a personalized exploration of the contents.

#### 2.3 Objectives
The main goal of the project is the creation of a responsive web app, which allows non-linear consumption of audiovisual content on the basis of a temporal semantic knowledge graph. In this graph nodes represent the concepts explained in the video and arcs are temporal prerequisite relations between the concepts.

The knowledge graph will be provided as input from another project, as well as the pointers that connect the graph nodes to the portions of the video where the related concepts are explained (by timestamp).

#### 2.4 Stakeholders
The stakeholders of this project are university students who approach the study of a discipline as beginners, they need to follow lecture in a video-based education format.

The teachers that will upload their educative videos.

The researchers/students that are working with us on other parts of the project (video annotation/segmentation and graph knowledge ) 

### 3. User Requirements
| **PRIORITY** |  **MEANING** |
|------------- |-----------------|
| M            | Mandatory |
| D            | Desiderable. Requirement that should be entered into the system, unless the cost of implementing it is too high. |
| O            | Optional. A feature marked with O can be entered into the system, at the discretion of the project manager. For example if the development time is less than expected or if |
| E            | Future Enhancement (for a next release). |

#### 3.1  Hypervideo user interface
Requirements:
| **ID** |  **DESCRIPTION** | **PRIORITY** |
|--------|----------------- |-----------|
| 1.1.1    |The system must allow the embedding of Youtube external media player.                                    | M|
| 1.1.2    |The system must take as input the url of the video and the transcript of the video.                                                | M|
| 1.1.3    |The system must take as input the transcript of the video.                                                | M| 
| 1.2     |The system must show automatic transcription of the text and subtitles.                                            | M|
| 1.3    |The system must allow the download of the transcript.                                                              | M|
| 1.4    | The system must show an index, the content of the index still needs to be defined (concepts, video fragments ?).   |M|
| 1.5.1    | The system must have a search bar to explore concepts within the video | M|
| 1.5.2    | The search bar enable the access to the part of the video where the concept is explained/used   | M|
| 1.6     | The system must take as input a file describing how to fragment the video, and have a graphic interface (slider) to navigate to every video fragments.                                          | M|
| 1.7.1    | Login system for the students                                                                             | O|
| 1.7.2    | Register system for the students                                                                             | O|
| 1.8    | Homepage                                                                             | D|


#### 3.2 Graph Exploration
Requirements:
| **ID** |  **DESCRIPTION** | **PRIORITY** |
|--------|-----------------|-----------|
| 2.1    | The system must take a .json file containing the graph data as input, and display it to the user  | M|
| 2.2    | The system must allow the exploration of the interactive graph with the related hyperlinks to the video (click on the concept displayed on the graph to access the according part of the video). | M|
| 2.3    | The system must have a tracking on the graph of the progress of the video by the user (highlight/zoom the concept(s) that is/are currently explained/used). | M|
| 2.4     |The system must allow the download of the graph and subgraphs.                                                                           | M|
| 2.5    | The system must allow the extraction from the graph and the display of subtrees that represent the prerequisites of the given concept.   | M|


#### 3.3 Contextual Help
Requirements:
| **ID** |  **DESCRIPTION** | **PRIORITY** |
|-------------|-----------------|-----------|
| 3.1| The system must have a contextual help box.                                                                                                                                                                                                                    |M|
  | 3.2 | The contextual help keeps track of the learner's progress on the video and provides information about the concept in the video at the given time by advising which portions of the video to view with priority over others, based on the concept’s requirements   | M|
  | 3.3 | The contextual help exploits and integrates the functions for hypervideo navigation and graph exploration. | M|
  |3.4| The contextual help is implemented as a conversational agent                    | O|
  | 3.5| The system must allow the deepening of a concept through external resources (like Wikipedia).   | O|
