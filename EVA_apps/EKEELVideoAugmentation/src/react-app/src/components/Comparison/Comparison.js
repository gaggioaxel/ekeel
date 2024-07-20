import Header from '../Header/Header';
import React from 'react';
import Grid from '@mui/material/Grid';
import { useContext,useState,useEffect, useRef} from 'react';
import {TokenContext} from '../account-management/TokenContext';
import Querybar from './Querybar.js';
import Listvideo from './Listvideo.js';
import { StyledEngineProvider } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ContextComparison } from './ContextComparison';
import handleFetchHttpErrors from '../../helpers/handleFetchHttpErrors';
import Button from '@mui/material/Button';
import C_Start from './C_Start.js';
import Typography from '@mui/material/Typography';
import Tutorial from './Tutorial.js'
import {
    Link,
    Redirect,
    Switch, 
    Route,
    useLocation
  } from "react-router-dom";

/*


DEVI CAMBIARE FLASK MAIN.PY PER FAR IN MODO CHE NON PRENDE
IL PIU RECENTE MA ANCHE LA SOMMA DI TUTTI I GRAFI E FARCI LA SOMMA

SEMPRE SU MAIN.PY GUARDARE SE SI SPOSTA IL LOGIN FUORI  DA FUNZIONE
POSSO CHIAMARE SOLO LE QUERY SENZA AVERE PROBLEMI CON LE 500 CONNESSIONI
*/

export default function Comparison(){


    //this block used for tutorial to setup anchor to jump and open and close the window
    const anchor1 = useRef(null);
    const [anchor2,setAnchor2] = useState(null)
    const [openTutorial, setOpenTutorial] = useState(false);
    function closeTutorial(){
      setOpenTutorial(false);
    }

    function openTutorialFunc(){
      setOpenTutorial(true);

    }

 

    //list of video selected for comparison
    const [listvideo, setListVideo]= useState([]);

    //a bool to check if download list of video from DB is successful
    //if its false, doesnt list the videos in the page
    //if true, catalog is populate with the videos and display all the videos available
    const [loading,setLoading]=useState(true);

    //list of video from the mongodb collection vidoes. if successful get the data, set loading to true
    const [catalog,setCatalog]=useState(null);

    //each video in catalog has multiple concepts and each concepts has extra data required for the website
    const [catalogExtra, SetCatalogExtra]=useState([]);

    //its the catalog but with fewer elements due to filters
    const [catalogoriginal, SetCatalogOriginal] = useState(null);

    //extract from catalog a list of unique concepts, so no duplicates used for textfield list
    const [listConcepts, setListConcepts]=useState([]);

    //used for textfield list, where we read all the concept user has selected.
    const [querylist, setQueryList]=useState([]);

    //list of filters selected saved to be sended to Result to show filter selected
    const [filterlist, setFilterList]=useState([null,null,null,null,null,null,"recent"])


    //used to retrieve the context, used to save the logged user
    const context = useContext(TokenContext);
    const nameSurname  = context.nameSurname;

    //if from querylist, there is no video with that combination of concepts, set this to false otherwise true
    //used to make the textfield red to show errors
    const [nomatch,setNomatch]=useState(false);

    //in the previous page, you select a concept. this is used to capture that concept sent from previous page to this one
    let location = useLocation();

    //its used to show the list of videos selected under the queryinput.
    //by default its hidden when this is false. when you select a concept to search it becomes true
    const [searchClicked, SetSearchClicked] = useState(false);

    //check if concept selected to filter video to match
    const [searchFilterClicked,setSearchFilterClicked] = useState(false);


   
    useEffect(()=>{
      if(document.cookie == "" && searchFilterClicked){
        openTutorialFunc()
        document.cookie = "tutorial=done; expires=Thu, 18 Dec 2100 12:00:00 UTC";
      }
    },)

    
    //capturing the concept sent from previous page
    useEffect(() => {
      if(location.state != undefined)
      console.log("data from previous search comparison COMPARISONJS: ", location.state.data);
    }, [location]);


    //a function used to check if small is included into big
    let checker = (big, small) => {

      return small.every(v => big.includes(v));
    };

    //request from mongodb to the value inside collection videos
    useEffect(() => {

        const fetchData = async () => {
            let response=null
            try{
              response = await fetch('/api/get_catalog', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(context.token+':unused')
                  },
                })
                .then(handleFetchHttpErrors)
                .then(res => res.json())
            }
            catch(err){

              if(err.message==="401"){
                  
                  context.setToken('')
                  return <Redirect to="/" />
              }
              else  {
                
                  alert('Unknown Error')
                  return
              }
            }

            if(response===undefined){
              alert('Unknown Server Error')
              return
            }
            else{

              //if answered correctly update data
              setCatalog(response.catalog)
              SetCatalogOriginal(response.catalog)
              setLoading(false)
          }
        };
        fetchData();

      }, []);

      //if query to videos collection is successful or not, depending on variable loading
      useEffect(() => {

        if (loading) {
          // if loading do nothing
        } else {
          // create unique list of concepts to use for queryinputs 

           
          let x=0;
          let newlistconcepts=[]
          catalog.map(video=>{
              
              video.extracted_keywords.map(concept=>{
                  
                  if(!newlistconcepts.includes(concept)){
                      newlistconcepts = [...newlistconcepts, concept];
                  }

                
              })

              
      
          })
          x=x+1;

          setListConcepts(newlistconcepts);
          //used to get all type and preconcept of all video. not used anymore. just for reference in the future.
        }
      }, [loading]);

      //used to query n times more information from Graphs collection in mongodb using SPARQL query

      useEffect(()=>{

        if(searchFilterClicked){
          SetCatalogExtra(catalogExtra=>[])
          let videoidlist=[]
          catalog.map((video,idx)=>{
            videoidlist=[...videoidlist,video.video_id]
          })
          QueryConceptExtra(videoidlist, querylist)
        }
      },[searchFilterClicked])


    //used to update the concept selected from queryinput component
    //depending on the concept, if present, or null, change the videos listed in listvideo component
    function AddQueryElement(concept){
      
      SetSearchClicked(true);
  
      setCatalog(catalogoriginal);
      const newquerylist = [...concept];
      setQueryList(newquerylist);
      if(concept[0]==null || concept[0].trim().length===0){
          setNomatch(false);
          return;
      }
      setSearchFilterClicked(true);
      
      let newcatalog = catalogoriginal.filter(video=>checker(video.extracted_keywords,concept));
      if(concept.length>0 && newcatalog.length==0){
          setNomatch(true)
      }else if(concept.length!=querylist.length){
          setNomatch(false);
      }  
      setCatalog(newcatalog)
          
    }

   
    //given two array start and end, with the format 0:01:01.820000^^xsd:dateTime" it will compute the duration in seconds
    function ComputeDuration(start,end){
      let duration=0
      for(let i=0; i<start.length;i++){

          const time1 = end[i] .split("^^")[0];
          const time2 = start[i] .split("^^")[0];

          let [hours1, minutes1, seconds1] = time1.split(":");
          seconds1=Math.floor(seconds1)
          seconds1=seconds1+hours1*3600
          seconds1=seconds1+minutes1*60

          let [hours2, minutes2, seconds2] = time2.split(":");
          seconds2=Math.floor(seconds2)
          seconds2=seconds2+hours2*3600
          seconds2=seconds2+minutes2*60

          let resultseconds = Math.abs(seconds2-seconds1);
          duration = duration+resultseconds;
        
        
      }

        return duration
    }

    //as the function before, it will compute only if the type is similar to conceptDefinition
    function ComputeDurationCD(start,end,type){
      let duration=0
      for(let i=0; i<start.length;i++){
        if(type[i]=="conceptDefinition"){
          const time1 = end[i] .split("^^")[0];
          const time2 = start[i] .split("^^")[0];

          let [hours1, minutes1, seconds1] = time1.split(":");
          seconds1=Math.floor(seconds1)
          seconds1=seconds1+hours1*3600
          seconds1=seconds1+minutes1*60

          let [hours2, minutes2, seconds2] = time2.split(":");
          seconds2=Math.floor(seconds2)
          seconds2=seconds2+hours2*3600
          seconds2=seconds2+minutes2*60

          let resultseconds = Math.abs(seconds2-seconds1);
          duration = duration+resultseconds;
        }
        

      }

        return duration
    }


    //same as before but for conceptExpansion
    function ComputeDurationCE(start,end,type){
      let duration=0
      for(let i=0; i<start.length;i++){
        if(type[i]=="conceptExpansion"){
          const time1 = end[i] .split("^^")[0];
          const time2 = start[i] .split("^^")[0];

          let [hours1, minutes1, seconds1] = time1.split(":");
          seconds1=Math.floor(seconds1)
          seconds1=seconds1+hours1*3600
          seconds1=seconds1+minutes1*60

          let [hours2, minutes2, seconds2] = time2.split(":");
          seconds2=Math.floor(seconds2)
          seconds2=seconds2+hours2*3600
          seconds2=seconds2+minutes2*60

          let resultseconds = Math.abs(seconds2-seconds1);
          duration = duration+resultseconds;
        }
        
      }

        return duration
    }

    // when in the website you press apply filters, this function will run and filter the video available
    function ApplyFilters(listfilters){
      setFilterList(listfilters)
     
       let catalogfiltered=[...catalogoriginal];
        catalogfiltered = catalogfiltered.filter(video=>checker(video.extracted_keywords,querylist));


        // Select if novice or expert

        // if no prerequsiite
        // if all prerequisite explained in the video
        // if 80% of prerequisite explained in the video
        if(listfilters[0] == "novice"){
         catalogfiltered = catalogfiltered.filter(video=>{
           if(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"].length == 0){
            return true;
           }
           let list_pre = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"]
           let maxnum=list_pre.length;
           let countnum=0;
           for(let i=0;i<maxnum; i++){
              if (checker(video.extracted_keywords,[list_pre[i]])){
                countnum++;
              }
           }
           if(countnum/maxnum >= 0.8){
            return true;
           }
           return checker(video.extracted_keywords, catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"])});
        //the other case from novice
        }else if(listfilters[0] == "expert"){
         catalogfiltered = catalogfiltered.filter(video=>{
           if(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"].length == 0){
            return false;
           }
           let list_pre = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"]
           let maxnum=list_pre.length;
           let countnum=0;
           for(let i=0;i<maxnum; i++){
              if (checker(video.extracted_keywords,[list_pre[i]])){
                countnum++;
              }
           }
           if(countnum/maxnum >= 0.8){
            return false;
           }

           return !checker(video.extracted_keywords, catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["list_preconcept"]);
         })
       }

       


        //check if concept selected is conceptDefinition or ConceptExpansion
        if(listfilters[1] == "essential"){
         catalogfiltered = catalogfiltered.filter(video=>{

           if(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"].length == 0){
            return true;
           }
           return !checker(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"],["conceptExpansion"]);
         })

       }else if(listfilters[1]=="detailed"){
         catalogfiltered = catalogfiltered.filter(video=>{

           if(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"].length == 0){
            return true;
           }
           return checker(catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"],["conceptExpansion"]);
         })
  
       }
     


       //check if slide is present in the video
       if(listfilters[2] == "withslide"){
         catalogfiltered = catalogfiltered.filter(video=>{

           return catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["slides_percentage"] > 0.1? true:false;
         })
 
       }else if(listfilters[2] == "withoutslide"){
         catalogfiltered = catalogfiltered.filter(video=>{

           return catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["slides_percentage"] <= 0.1? true:false;
         })
    
       }
       


       //conceptDefinition duration filter

       if(listfilters[3]=="less4"){
          catalogfiltered = catalogfiltered.filter(video=>{
            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]

            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCD(endtime, starttime,type) < 240

          });
    
       }else if(listfilters[3]=="4to20"){
          catalogfiltered = catalogfiltered.filter(video=>{
            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]

            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCD(endtime, starttime,type) >= 240 && ComputeDurationCD(endtime, starttime,type) <= 1200

          });
      
       }else if(listfilters[3]=="greater20"){
          catalogfiltered = catalogfiltered.filter(video=>{
            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]

            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCD(endtime, starttime,type) > 1200

          });
    
       }
   


       //conceptExpansion duration filter
       if(listfilters[4]=="less4"){
          catalogfiltered = catalogfiltered.filter(video=>{
            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]
            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCE(endtime, starttime,type) < 240

          });

       }else if(listfilters[4]=="4to20"){
          catalogfiltered = catalogfiltered.filter(video=>{

            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]
            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCE(endtime, starttime,type) >= 240 && ComputeDurationCE(endtime, starttime,type) <= 1200

          });

       }else if(listfilters[4]=="greater20"){
          catalogfiltered = catalogfiltered.filter(video=>{

            let starttime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_starttime"]
            let endtime = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["concept_endtime"]
            let type = catalogExtra.filter(videoExtra=>videoExtra.video_id == video.video_id)[0]["explain"]
            return ComputeDurationCE(endtime, starttime,type) > 1200

          });

       }



       //whole video duration filter
       if(listfilters[5]=="less4"){
          catalogfiltered = catalogfiltered.filter(video=>video.duration < 240)
       }else if(listfilters[5]=="4to20"){
          catalogfiltered = catalogfiltered.filter(video=>video.duration >= 240 && video.duration < 1200)
       }else if(listfilters[5]=="greater20"){
          catalogfiltered = catalogfiltered.filter(video=>{
            return video.duration > 1200;}) 
       }


       //Sort the video based on 
       //recent: data creation of the annotation
       //videolength: length of the video
       //deflength: conceptDefinition of concept length
       //detailedlength: conceptExpansion length
       if(listfilters[6]=="recent"){
          catalogfiltered = catalogfiltered.sort(
            function(a,b){

              console.log("recent ",catalogExtra.filter(videoExtra=>{
                console.log("dentro: ",videoExtra.video_id," ",a.video_id," ",b.video_id)
                return videoExtra.video_id == a.video_id
              }))
              let date1=catalogExtra.filter(videoExtra=>videoExtra.video_id == a.video_id)[0]["created"];
              let date2=catalogExtra.filter(videoExtra=>videoExtra.video_id == b.video_id)[0]["created"];
              
              if(date1 >date2){
                return 1;
              }else if(date2 > date1){
                return -1;
              }else{
                return 0;
              }
            }
          )
   
       }else if(listfilters[6]=="videolength"){
          catalogfiltered = catalogfiltered.sort(
              function(a,b){
                if(a.duration > b.duration){
                  return 1;
                }else if(a.duration < b.duration){
                  return -1;
                }else{
                  return 0;
                }
              }



          )

       }else if(listfilters[6]=="deflength"){
        catalogfiltered = catalogfiltered.sort(
          function(a,b){
            let start1=catalogExtra.filter(videoExtra=>videoExtra.video_id == a.video_id)[0]["concept_starttime"];
            let end1=catalogExtra.filter(videoExtra=>videoExtra.video_id == a.video_id)[0]["concept_endtime"];

            let duration1 = ComputeDuration(end1,start1)

            let start2=catalogExtra.filter(videoExtra=>videoExtra.video_id == b.video_id)[0]["concept_starttime"];
            let end2=catalogExtra.filter(videoExtra=>videoExtra.video_id == b.video_id)[0]["concept_endtime"];
            
            let duration2 = ComputeDuration(end2,start2)
            if(duration1 >duration2){
              return 1;
            }else if(duration2 > duration1){
              return -1;
            }else{
              return 0;
            }
          }
        )
   
       }else if(listfilters[6]=="detailedlength"){
        catalogfiltered = catalogfiltered.sort(
          function(a,b){
            let start1=catalogExtra.filter(videoExtra=>videoExtra.video_id == a.video_id)[0]["derivatedconcept_starttime"];
            let end1=catalogExtra.filter(videoExtra=>videoExtra.video_id == a.video_id)[0]["derivatedconcept_endtime"];
            let duration1 = ComputeDuration(end1,start1)

            let start2=catalogExtra.filter(videoExtra=>videoExtra.video_id == b.video_id)[0]["derivatedconcept_starttime"];
            let end2=catalogExtra.filter(videoExtra=>videoExtra.video_id == b.video_id)[0]["derivatedconcept_endtime"];
            let duration2 = ComputeDuration(end2,start2)
            if(duration1 >duration2){
              return 1;
            }else if(duration2 > duration1){
              return -1;
            }else{
              return 0;
            }
          }
        )
     
       }

       setCatalog(catalogfiltered)


    }

  

    //used to add the video for comparison in querybar component

    function AddVideo(img, title,setAdd,idxurl){
        const newListVideo = [...listvideo,{img:img,title:title,idx:idxurl, setAdd:setAdd}];
        setListVideo(newListVideo);
        setAdd(true);
     
    }


    //used to remove the video for comparison in querybar component

    function RemoveVideo(idx){
        const newListVideo = listvideo.filter(video => video.idx != idx);
        setListVideo(newListVideo);
        
    }


    
    //query to the extra data for a specific concept inside Graphs collection in mongodb using SPARQL query
    //videoid and concept is needed
    async function QueryConceptExtra(videoidlist, concept) {

      let risposta=null
      try{

       risposta = await fetch('/api/ConceptVideoData/'+videoidlist+"/"+concept, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(context.token+':unused')
        },
      })
      }
      catch(err){
        console.log(err)
      }
      if(risposta===undefined){
        alert("problem  qeury")
        return
      }else{

        var data = await risposta.json();
   

        for(let i=0;i<data.length;i++){
          SetCatalogExtra(catalogExtra=>[...catalogExtra,data[i]]);
        }
        

      }
      

    }


    //theme of MUI

    const theme = createTheme({
        palette: {
          primary: {
            main: '#C6EBDC',
          },
          secondary: {
            main: '#FA824C',
    
          },
          closexenter:{
            main: "#e64a19",
        
          },
          closexexit:{
            main:"#e57373",
          },
          whito:{
            main:'#FFFFFF',
          }
        },
      });
    

      //used in videofiltered to update the value inside catalogExtra
      function UpdateCatalogExtra(video_id, conceptLength, derivatedLength){

        let newcatalogExtra = catalogExtra.map(video=>{
          if(video.video_id == video_id){
            video["conceptLength"] = conceptLength;
            video["derivatedLength"] = derivatedLength;
            return video
          }else{
            return video
          }
          
        })

        SetCatalogExtra(newcatalogExtra);
      }
      
    return(
        <>
        <Tutorial anchor1={anchor1} anchor2={anchor2} open={openTutorial} closeTutorial={closeTutorial}/>
        <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst> {/* to override the default style with your custom css */}
        <Header page="dashboard" login={nameSurname}/>
        <ContextComparison.Provider value={[AddVideo,RemoveVideo,setSearchFilterClicked, listConcepts]}>

            <>
            <Querybar filterlist={filterlist} ref={anchor1} openTutorial={openTutorialFunc} querylist={querylist} catalog = {catalog} catalogExtra = {catalogExtra} ApplyFilters = {ApplyFilters} searchClicked={searchClicked} listvideo={listvideo} listconcepts={listConcepts} AddQueryElement={AddQueryElement} nomatch={nomatch} location={location.state===undefined?null:location.state.data}/>
            <br/>
            <Listvideo setAnchor2={setAnchor2} UpdateCatalogExtra={UpdateCatalogExtra}  catalogExtra={catalogExtra} catalog={catalog} loading={loading} querylist={querylist} catalogoriginal={catalogoriginal}/>
            </>
            
        </ContextComparison.Provider>
        </StyledEngineProvider>
        </ThemeProvider>
        <Grid
        
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{backgroundColor:"#9BDDC1", m:0, p:5}}
        >
            <Grid item>
                <Typography variant="overline" display="block" gutterBottom sx={{color:"white"}}>

                   <b>EKEEL Platform for enhanced Video-based Learning</b>

                </Typography>
            </Grid>
        </Grid>
        </>
    );
}


