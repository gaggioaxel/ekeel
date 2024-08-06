from typing_extensions import Literal
from typing import List,Tuple

from numpy import round,empty,sum,array,clip,all,average,var,where,ones,dtype,quantile
import os
from pathlib import Path
import cv2
from youtube_transcript_api import YouTubeTranscriptApi as YTTranscriptApi
from youtube_transcript_api import Transcript
from math import floor, ceil
from collections import deque
from matplotlib import pyplot as plt
import time
from operator import itemgetter
from itertools import groupby
from conllu import parse
from re import match, search
import yt_dlp
import requests
from enum import Enum, auto
from multiprocessing import Process
from bisect import insort_left
from multiprocessing.managers import ListProxy

from audio import *
from image import *
from video import VideoSpeedManager, LocalVideo, SimpleVideo
from xgboost_model import XGBoostModelAdapter
from itertools_extension import double_iterator, pairwise
from collections_extension import LiFoStack
from conll import get_text
from Cluster import create_cluster_list, aggregate_short_clusters
import db_mongo
from words import *
from locales import Locale
from NLP_API import *
os.environ['LIBGL_ALWAYS_SOFTWARE'] = '1'

MAX_VIDEO_SECONDS = 18000

'''
variables to consider:
    * punctuator net,
    * bert model,
    * cosine similarity threshold - c_threshold,
    * summary model - bert vs sumy,
    * min time to merge short clusters,
    * add_sentence vs deprecated,
    * color_histogram threshold and frame range,
'''



class VideoAnalyzer:
    '''
    This class analyzes videos from their ids in the path "__class__"-path/static/videos \n
    _testing_path is for changing the folder path but it's used just for testing\n\n
        - It provides a method to get the transcript from the youtube link associated to the id provided\n
        - segment the transcript to obtain keyframes\n
        - Analyze the whole video stream or frames to segment slides,text and times on screen of those\n
        - Get the extracted text in different formats (tipically only one is used and the others are for debug)\n
        - Check if the video contains slides (for now this means text around the center of the screen) and the proportion with respect to the whole video len\n
        - Extract titles from the slides found\n
        - Create thumbnails based on the slides segmentation after having analyzed the text\n
        - Find definitions and in-depths of concepts expressed in the title of every slide
    checks of valid session are performed sometimes to ensure user did not want to stop analysis
    '''
    url:str
    video_id:str
    images_path:list = None
    data:dict = None
    timed_subtitles:dict = None

    _text_in_video: list[VideoSlide] | None = None
    _cos_sim_img_threshold = None
    _frames_to_analyze = None
    _slide_startends = None
    _slide_titles = None


    def __init__(self, url:str, _testing_path=None) -> None:
        if self.is_youtube_url(url):
            url = self.standardize_url(url)
            self.video_id = self.get_video_id(url)
            self.url = url
        else:
            raise Exception("not implemented!")

        response = requests.get(url)
        if response.status_code == 200 and ("Video non disponibile" in response.text or "Video unavailable" in response.text):
            raise Exception("Video unavailable")
        
        self.data = db_mongo.get_video_data(self.video_id)
        if self.data is None:
            self.data = {'video_id': self.video_id,
                         'title': search(r'"title":"(.*?)"', response.text).group(1),
                         'creator': search(r'"ownerChannelName":"(.*?)"', response.text).group(1),
                         'duration': str(int(search(r'"approxDurationMs":"(\d+)"', response.text).group(1)) // 1000),
                         'upload_date': search(r'"uploadDate":"(.*?)"', response.text).group(1)
                        }
            if int(self.data["duration"]) > MAX_VIDEO_SECONDS:
                raise Exception("The video is too long, please choose another video.")
            
        if _testing_path is None:
            self.folder_path = Path(__file__).parent \
                                            .joinpath('static') \
                                            .joinpath('videos') \
                                            .joinpath(self.video_id)
        else:
            self.folder_path = _testing_path

    @staticmethod
    def standardize_url(url: str) -> str:
        pattern = r'(?:=|\/|&)([A-Za-z0-9_\-]{11})(?=[=/&]|\b)'
        id = re.findall(pattern,url)[0]
        return "https://www.youtube.com/watch?v="+id
    
    @staticmethod
    def is_youtube_url(url:str) -> bool:
        youtube_video_regex = (
            r'(https?://)?(www\.)?'
            '(youtube|youtu|youtube-nocookie)\.(com|be)/'
            '(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})')

        return match(youtube_video_regex, url) is not None

    @staticmethod
    def get_video_id(url:str):
        '''
        From a YouTube url extracts the video id
        '''
        video_link = url.split('&')[0]
        if '=' in video_link:
            return video_link.split('=')[-1]
        return video_link.split('/')[-1]

    def download_video(self):
        '''
        Downloads the video from the url provided (YouTube video)\n
        If the video has been removed from youtube, it attempts to remove the folder from both the drive and the database, then raises an Exception\n

        --------------
        # Warning
        NOTE: there are problems very often with (maybe) YouTube APIs that lead both
        pytube and pafy not to work. Take this into account and maybe try downloading videos on your own.\n
        Then in the code allow skipping video informations retrival because those raise Exceptions.
        '''
        url = self.url
        #video_link = url.split('&')[0]
        video_id = self.video_id
        folder_path = self.folder_path

        os.makedirs(folder_path, exist_ok=True)

        if os.path.isfile(os.path.join(folder_path,video_id+'.mp4')):
            return

        downloaded_successfully = False
        
        # Both pafy and pytube seems to be not mantained anymore, only youtube_dlp is still alive

        prev_cwd = os.getcwd()
        os.chdir(folder_path)

        if not downloaded_successfully:
            try:
                #print("using ytdl")
                yt_dlp.YoutubeDL({  'quiet': True,
                                    'format': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
                                    'outtmpl': video_id+'.mp4',
                                    'merge_output_format': 'mp4'
                                      }).download([url])
                downloaded_successfully = True
            except Exception as e:
                print(e)

        os.chdir(prev_cwd)

        for file in os.listdir(folder_path):
            if file.endswith(".mp4"):
                os.rename(folder_path.joinpath(file),folder_path.joinpath(video_id+"."+file.split(".")[-1]))
                vidcap = cv2.VideoCapture(folder_path.joinpath(video_id+"."+file.split(".")[-1]))
                if not vidcap.isOpened() or not min((vidcap.get(cv2.CAP_PROP_FRAME_WIDTH),vidcap.get(cv2.CAP_PROP_FRAME_HEIGHT))) >= 360:
                    raise Exception("Video does not have enough definition to find text")
                break
  

    def _create_keyframes(self,start_times,end_times,S,seconds_range, image_scale:float=1,create_thumbnails=True):
        """
        Take a list of clusters and compute the color histogram on end and start of the cluster
        
        Parameters
        ----------
        cluster_list :
        S : scala per color histogram
        seconds_range : Adjust the start and end of segments based on the difference in color histograms.
        """
        assert len(start_times) == len(end_times)
        vsm = VideoSpeedManager(self.video_id,output_colors=COLOR_RGB)
        vid_ref = vsm.vid_ref
        vidcap = vid_ref._vidcap
        start_end_frames = [(vid_ref.get_num_frame_from_time(s_time),vid_ref.get_num_frame_from_time(e_time)) 
                                for s_time,e_time in zip(start_times,end_times)]

        curr_num_frame = 0
        vidcap.set(cv2.CAP_PROP_POS_FRAMES, curr_num_frame)
        has_frame,curr_frame = vidcap.read()
        next_frame_offset = 10*vid_ref.get_fps()
        summation = 0
        prev_hist = []
        all_diffs = []
        while has_frame:
            curr_frame = cv2.resize(curr_frame,(240,180))
            image = cv2.cvtColor(curr_frame, cv2.COLOR_RGB2GRAY)
            hist = cv2.calcHist([image], [0], None, [32], [0, 128])
            hist = cv2.normalize(hist, hist)
            
            if curr_num_frame > 0 :
                diff = 0
                for i, bin in enumerate(hist):
                    diff += abs(bin[0] - prev_hist[i][0])
                all_diffs.append(diff)
                summation += diff
            
            curr_num_frame += next_frame_offset
            vidcap.set(cv2.CAP_PROP_POS_FRAMES, curr_num_frame)
            has_frame,curr_frame = vidcap.read()
            prev_hist = hist

            #if cv2.waitKey(1) & 0xFF == ord('q'):
            #    break
        threshold = S * (summation / curr_num_frame)

        '''
        checking if there is a scene change within a timeframe of "seconds_range" frames from the beginning and end of each cluster.
        '''
        fps = vid_ref.get_fps()

        for j,(start_f,end_f) in enumerate(start_end_frames):
            changes_found = [False,False]
            for i in range(seconds_range):
                diffs = [int(start_f / next_frame_offset),int(end_f / next_frame_offset)]
                if not changes_found[0] and diffs[0] + i < len(all_diffs) and all_diffs[diffs[0] + i] > threshold:
                    sec = (start_f + i) / fps
                    start_times[j] = round(sec,2)
                    changes_found[0] = True
                
                if not changes_found[1] and diffs[1] + i < len(all_diffs) and all_diffs[diffs[1] + i] > threshold:
                    sec = (end_f + i) / fps
                    end_times[j] = round(sec,2)
                    changes_found[1] = True

                if all(changes_found): break
    
        if not create_thumbnails:
            return list(zip(start_times, end_times))
        
        # saving images to show into the timeline
        images_path = []
        folder_path = Path(__file__).parent.joinpath("static","videos",self.video_id)
        for i, start_end in enumerate(start_end_frames):
            vidcap.set(cv2.CAP_PROP_POS_FRAMES, start_end[0])
            ret, image = vidcap.read()
            image = cv2.resize(image,(array([image.shape[1],image.shape[0]],dtype='f')*image_scale).astype(int))
            name_file = folder_path.joinpath(str(i) + ".jpg")
            #print(saving_position)
            #saving_position = "videos\\" + video_id + "\\" + str(start) + ".jpg"
            cv2.imwrite(name_file.__str__(), image)
            images_path.append("videos/" + self.video_id + "/" + str(i) + ".jpg")
        vsm.close()
        #print(images_path)
        self.images_path = images_path
        return list(zip(start_times, end_times))
        

    def request_transcript(self, extract_from_audio=False):
        '''
        Downloads the transcript associated with the video and returns also whether the transcript is automatically or manually generated \n
        Preferred manually generated
        '''

        if "transcript_data" in self.data.keys():
            return
        
        language = self.identify_language()

        if extract_from_audio:
            return extract_transcript_from_audio(self.video_id, language)
            
        
        transcripts = YTTranscriptApi.list_transcripts(self.video_id)
        transcript:Transcript
        try:
            transcript = transcripts.find_manually_created_transcript([language])
            autogenerated = False
        except:
            transcript = transcripts.find_generated_transcript([language])
            autogenerated = True

        subs_dict = transcript.fetch()
        for sub in subs_dict: sub["end"] = sub["start"] + sub.pop("duration")

        text = " ".join([sub["text"] for sub in subs_dict if sub['text'][0] != "["])
        
        sub_text = SemanticText(text, language)
        punctuated_transcript = sub_text._text
        timed_subtitles = []
        punctuated_lowered = punctuated_transcript.lower()
        for entry in subs_dict:
            # Create a regex pattern for the current text entry
            music_flag = "[" in entry["text"]
            if not music_flag:
                pattern = " ".join(r'[' + word[0].upper() + r'|' + word[0] + r']' + word[1:] + r'[.,:]?' 
                                   for word in entry['text'].split())
                regex = re.compile(pattern, re.IGNORECASE)
                match = regex.search(punctuated_lowered)
            if music_flag or match:
                timed_subtitles.append({
                    'text': entry["text"] 
                                    if music_flag else punctuated_transcript[match.start():match.end()],
                    'start': entry['start'],
                    'end': entry['end']
                })
        self.data["transcript_data"] = {"timed_text": timed_subtitles, 
                                        "is_autogenerated": autogenerated
                                        }


    def transcript_segmentation_and_thumbnails(self, c_threshold=0.22, sec_min=35, S=1, frame_range=15, create_thumbnails=True):
        """
        :param c_threshold: threshold per la similarità tra frasi
        :param sec_min: se un segmento è minore di sec_min verrà unito con il successivo
        :param S: scala per color histogram
        :param frame_range: aggiustare inizio e fine dei segmenti in base a differenza nel color histogram nel frame_range
        :return: segments
        """
        video_id = self.video_id
        language = self.identify_language()

        # get punctuated transcription from the conll in the db
        #transcription:str = get_text(video_id)
        #if transcription is None:
        #    if self.timed_subtitles is None:
        #        self.request_transcript()
#
        #    '''Get the transcription from the subtitles'''
        #    transcription:str = " ".join([sub["text"] for sub in self.timed_subtitles["timed_text"]])
        #    if language == Locale().get_pt1_from_full('English'):
        #        transcription:str = transcription.replace('\n', ' ').replace(">>", "") \
        #                                         .replace("Dr.","Dr").replace("dr.","dr") \
        #                                         .replace("Mr.","Mr").replace("mr.","mr")
        #print("Checking punctuation...")
        semantic_transcript = SemanticText(automatic_transcript_to_str(self.data["transcript_data"]["timed_text"]),language)

        #video = db_mongo.get_video(video_id)
        
        '''Divide into sentences the punctuated transcription'''
        print("Extracting sentences..")
        sentences = semantic_transcript.tokenize()

        '''For each sentence, add its start and end time obtained from the subtitles'''
        timed_sentences = get_timed_sentences(self.data["transcript_data"]["timed_text"], sentences)


        '''Define the BERT model for similarity'''
        print("Creating embeddings..")
        #model = SentenceTransformer('paraphrase-distilroberta-base-v1')
        #model = SentenceTransformer('stsb-roberta-large')

        '''Compute a vector of numbers (the embedding) to idenfity each sentence'''
        #embeddings = model.encode(sentences, convert_to_tensor=True)
        embeddings = semantic_transcript.get_embeddings()

        '''Create clusters based on semantic textual similarity, using the BERT embeddings'''
        print("Creating initials segments..")
        clusters = create_cluster_list(timed_sentences, embeddings, c_threshold)


        '''Aggregate togheter clusters shorter than 40 seconds in total'''
        refined_clusters = aggregate_short_clusters(clusters, sec_min)

        start_times = []
        end_times = []

        '''Print the final result'''
        for c in refined_clusters:
            start_times.append(c.start_time)
            end_times.append(c.end_time)
        self.data["video_data"] = {"segments": list(zip(start_times, end_times))}


        print("Reached the part of finding clusters")

        '''Find and append to each cluster the 2 most relevant sentences'''
        #num_sentences = 2
        #sumy_summary(refined_clusters, num_sentences)
        #self.transcript = semantic_transcript


        '''Adjust end and start time of each cluster based on detected scene changes'''
        #path = Path(__file__).parent.joinpath("static", "videos", video_id)
        #if not create_thumbnails:
        #    self.data["video_data"]['segments'] = self._create_keyframes(start_times, end_times, S, frame_range, create_thumbnails=False)
        #    return
#
        #if not any(File.endswith(".jpg") for File in os.listdir(path)):
        #    self.data["video_data"]['segments'] = self._create_keyframes(start_times, end_times, S, frame_range)
        #else:
        #    print("keyframes already present")
        #    images = []
        #    for File in os.listdir(path):
        #        if File.endswith(".jpg"):
        #            images.append(File.split(".")[0])
        #    images.sort(key=int)
        #    self.images_path = ["videos/" + video_id + "/" + im + ".jpg" for im in images]
        return
    

    #def extract_keywords(self,maxWords:int=1,minFrequency:int=3) -> None:
    #    video_doc = db_mongo.get_video_metadata(self.video_id)
    #    if video_doc is None:
    #        if self.transcript is None:
    #            self.transcript_segmentation_and_thumbnails(create_thumbnails=False)
    #        self.data["extracted_keywords"] = self.transcript.extract_keywords(maxWords, minFrequency)
    #        return
    #    self.data["extracted_keywords"] = video_doc["extracted_keywords"]


    def is_too_long(self,max_seconds=MAX_VIDEO_SECONDS):
        video = VideoSpeedManager(self.video_id).get_video()
        return video.get_count_frames() / video.get_fps() > max_seconds


#######################
    def _preprocess_video(self, vsm:VideoSpeedManager,num_segments:int=150,estimate_threshold=False,_show_info=False):
        '''
        Split the video into `num_segments` windows frames, for every segment it's taken the frame that's far enough to guarantee a minimum sensibility\n
        The current frame is analyzed by XGBoost model to recognize the scene\n
        If there are two non-slide frames consecutively the resulting frame window is cut\n
        Bounds are both upper and lower inclusive to avoid a miss as much as possible\n
        Then both are compared in terms of cosine distance of their histograms (it's faster than flattening and computing on pure pixels)\n\n
        Lastly the distance between wach frame is selected as either the average of values, either with fixed value.\n
        In this instance with videos that are mostly static, the threshold is set to 0.9999
        #TODO further improvements: for more accuracy this algorithm could include frames similarity to classify a segment as slide (which is a generally very static)

        Returns
        ----------
        The cosine similarity threshold and the list of frames to analyze (tuples of starting and ending frames)

        ----------
        Example
        ----------
        A video split into 10 segments:\n\n
        slide_segments : 0,1,3,6,9,10\n
        non_slide_segments : 2,4,5,7,8\n
        results in segmentation = [(0,4),(5,7)(8,10)]\n
        with holes between segments 4-5 and 7-8
        '''
        num_frames = vsm.get_video().get_count_frames()
        step = floor(num_frames / (num_segments))
        vsm.lock_speed(step)
        iterations_counter:int = 0
        txt_cleaner = TextCleaner()
        if estimate_threshold:
            cos_sim_values = empty((num_segments,vsm.get_video().get_dim_frame()[2]))

        # Optimization is performed by doing a first coarse-grained analysis with the XGBoost model predictor
        # then set those windows inside the VideoSpeedManager
        model = XGBoostModelAdapter(Path(__file__).parent.joinpath("models","xgboost500.sav").__str__())
        #XGBoostModelAdapter(os.path.dirname(os.path.realpath(__file__))+"/xgboost/model/xgboost500.sav")

        start_frame_num = None
        frames_to_analyze:List[Tuple[int,int]] = []
        answ_queue = deque([False,False])
        curr_frame = ImageClassifier(None)
        prev_frame = curr_frame.copy()
        frame_w,frame_h,num_colors = vsm.get_video().get_dim_frame()
        
        # Loops through num segments and for every segment checks if is a slide
        # When at least one 
        # Iterates over num segments
        while iterations_counter < num_segments:
            
            # Stores two frames
            prev_frame.set_img(vsm.get_frame())
            curr_frame.set_img(vsm.get_following_frame())
            if model.is_enough_slidish_like(prev_frame):
                frame = prev_frame.get_img()

                # validate slide in frame by slicing the image in a region that removes logos (that are usually in corners)
                region = (slice(int(frame_h/11),int(frame_h*8/9)),slice(int(frame_w/8),int(frame_w*7/8)))
                prev_frame.set_img(frame[region])

                # double checks the text  
                is_slide = bool(txt_cleaner.clean_text(prev_frame.extract_text(return_text=True)).strip())
                #from matplotlib import pyplot as plt; plt.figure("Figure 1"); plt.imshow(frame); plt.figure("Figure 2"); plt.imshow(prev_frame.get_img())
            else:
                is_slide = False
            answ_queue.appendleft(is_slide); answ_queue.pop()

            # if there's more than 1 True discontinuity -> cut the video
            if any(answ_queue) and start_frame_num is None:
                start_frame_num = int(clip(iterations_counter-1,0,num_segments))*step
            elif not any(answ_queue) and start_frame_num is not None:
                frames_to_analyze.append((start_frame_num,(iterations_counter-1)*step))
                start_frame_num = None

            if estimate_threshold:
                cos_sim_values[iterations_counter,:] = prev_frame.get_cosine_similarity(curr_frame)
            iterations_counter+=1
            if _show_info: print(f" Coarse-grained analysis: {ceil((iterations_counter)/num_segments * 100)}%",end='\r')
        if start_frame_num is not None:
            frames_to_analyze.append((start_frame_num,num_frames-1))

        if estimate_threshold:
            cos_sim_img_threshold = clip(average(cos_sim_values,axis=0)+var(cos_sim_values,axis=0)/2,0.9,0.9999)
        else:
            cos_sim_img_threshold = ones((1,num_colors))*0.9999
        
        if _show_info:
            if estimate_threshold:
                print(f"Estimated cosine similarity threshold: {cos_sim_img_threshold}")
            else:
                print(f"Cosine_similarity threshold: {cos_sim_img_threshold}")
            print(f"Frames to analyze: {frames_to_analyze} of {num_frames} total frames")
        self.data["video_data"]["slides_percentage"] = sum([frame_window[1] - frame_window[0] for frame_window in frames_to_analyze])/(num_frames-1)
        self._cos_sim_img_threshold = cos_sim_img_threshold 
        self._frames_to_analyze = frames_to_analyze    


    def analyze_video(self,_show_info:bool=True):
        """
        Analyzes a video to identify and extract slides, transitioning between different states 
        (WAITING_OPENING, OPENING, CONTENT, ENDED) based on the content of the video frames.

        Parameters:
        _show_info (bool): Flag to control the display of processing information. Defaults to True.

        Returns:
        None
        """
        if not self.is_slide_video() or "slides" in self.data["video_data"].keys():
            return

        class State(Enum):
            WAITING_OPENING = auto()
            OPENING = auto()
            CONTENT = auto()
            ENDED = auto()
            
            
        video = SimpleVideo(self.video_id)
        video.step = video.get_fps()

        TFT_list:list[VideoSlide] = []
        
        # We start looking for EduOpen
        # Then transit to content
        # Ending is optional (sometimes videos are cut)
        state_machine = {"state": list(State)[0]}
        next_state = { from_state:to_state for from_state, to_state in list(zip(list(State), list(State)[1:] + [None])) }
        prev_frame = ImageClassifier(video.get_frame())
        curr_frame = prev_frame.copy()
        speed_up_coef = 0.35
        max_speed = video.get_fps() * 10
        
        while True:
            
            if not curr_frame.has_image():
                state_machine["state"] = State.ENDED
                
            curr_state = state_machine['state']
            if curr_state == State.WAITING_OPENING:
                if not curr_frame.is_same_image(prev_frame):
                    text = curr_frame.extract_text(return_text=True)
                    if "edu" in text and "pen" in text:
                        state_machine["state"] = next_state[curr_state]
                        video.step = video.get_fps()
                        
                else:
                    video.step = np.clip(int(video.step+2), 1, video.get_fps()*2, dtype=int)

            elif curr_state == State.OPENING:
                text = curr_frame.extract_text(return_text=True)
                if not "edu" in text and "pen" in text:
                    state_machine['state'] = next_state[curr_state]
            
            elif curr_state == State.CONTENT:
                texts_with_bb = curr_frame.extract_text(return_text=True, with_contours=True)
                if any(texts_with_bb):
                    slide = VideoSlide(texts_with_bb, (video.get_time(),None))
                    if not len(TFT_list):
                        TFT_list.append(slide)
                    elif slide != TFT_list[-1]:
                        TFT_list[-1].start_end_frames[-1] = (TFT_list[-1].start_end_frames[-1][0], video.get_time(1))
                        TFT_list.append(slide)
                        video.step = video.get_fps()//2
                    else:
                        video.step = int(np.clip(video.step + speed_up_coef * max_speed, 0, max_speed))
            
            elif curr_state == State.ENDED:
                if any(texts_with_bb) and len(TFT_list) and TFT_list[-1].start_end_frames[-1][1] is None:
                    TFT_list[-1].start_end_frames[-1] = (TFT_list[-1].start_end_frames[-1][0], video.get_time(1))
                break   
                
            prev_frame.set_img(curr_frame.get_img())
            curr_frame.set_img(video.get_frame())
            
            if _show_info: print(f"Doing {np.round((video._curr_frame_idx-video.step)/video.get_count_frames()*100, 2)}%  curr step {video.step} num slides {len(TFT_list)}    ",end="\r")
        
        # Final refinement
        txt_classif = TextSimilarityClassifier(comp_methods={ComparisonMethods.FUZZY_PARTIAL_RATIO, ComparisonMethods.CHARS_COMMON_DISTRIB})
        changed = True
        n_iter = 0
        while changed:
            changed = False
            for to_reverse in [False, True]:
                for slide1,slide2 in pairwise(TFT_list, None_tail=False, reversed=to_reverse):
                    if txt_classif.is_partially_in(slide1,slide2):
                        slide2:VideoSlide
                        slide2.merge_frames(slide1)
                        TFT_list.remove(slide1)
                        changed = True
                    n_iter += 1
                    
            for slide1, slide2 in double_iterator(TFT_list):
                if txt_classif.is_partially_in(slide2,slide1):
                    slide1:VideoSlide
                    slide1.merge_frames(slide2)
                    TFT_list.remove(slide2)
                    changed = True
                n_iter += 1

        self.data["video_data"]["slides"] = [dict(tft) for tft in TFT_list]


#######################


############ New Methods ###########
    def identify_language(self, format:Literal['full','pt1']='pt1') -> str:
        '''
        Recognizes the video language (currently implemented ita and eng so it raises exception if not one of these)
        '''
        if not 'language' in self.data.keys():
            self.data['language'] = list(YTTranscriptApi.list_transcripts(self.video_id)._generated_transcripts.keys())[0] 
            
        locale = Locale()
        if not locale.is_language_supported(self.data['language']):
            raise Exception(f"Language is not between supported ones: {locale.get_supported_languages()}")
        return self.data['language'] if format =='pt1' else locale.get_full_from_pt1(self.data['language'])

    def analyze_transcript(self, async_call=False, lemmatize_terms=False):
        '''
        TODO can concat the slides content to further refine the analysis
        '''
        #assert self.identify_language() == "it", "implementation error cannot analyze other language transcripts here"
        if "ItaliaNLP_doc_id" in self.data["transcript_data"].keys():
            return
        
        transcript = automatic_transcript_to_str(self.data["transcript_data"]["timed_text"])
        language = self.identify_language()
        api_obj = ItaliaNLAPI()
        doc_id = api_obj.upload_document(transcript, language = language, async_call=async_call)
        api_obj.wait_for_pos_tagging(doc_id)
        terms = api_obj.execute_term_extraction(doc_id)
        if lemmatize_terms:
            terms["term"] = terms["term"].apply(lambda t: " ".join(SemanticText(t.lower(),language=language).lemmatize()))

        try:
            self.data["transcript_data"].update({ "ItaliaNLP_doc_id":   doc_id, 
                                                  "terms":              terms.to_dict('records')})
        except Exception:
            raise Exception("Error extracting terms with the API")
        
        self.transcript_segmentation_and_thumbnails()

        
    def lemmatize_terms(self):
        assert "transcript_data" in self.data.keys() and "terms" in self.data["transcript_data"].keys(), "Error in pipeline in segmentation.py -> lemmatize_terms()"
        terms = self.data["transcript_data"]["terms"]
        lang = self.identify_language()
        return [" ".join(SemanticText(term["term"], language=lang).lemmatize()) for term in terms]
####################################


    def get_extracted_text(self,format:Literal['str','list','list[text,box]','set[times]','list[text,time,box]','list[time,list[text,box]]','list[id,text,box]']='list'): 
        """
        Returns the text extracted from the video.\n
        Text can be cleaned from non-alphanumeric characters or not.

        Parameters :
        ------------
        - format (str): The desired format of the output. Defaults to 'list[text_id, timed-tuple]'.
            - 'str': single string with the text joined together.\n
            - 'list': list of VideoSlides\n
            - 'set[times] : list of unique texts' times (in seconds) (used for creation of thumbnails)
            - 'list[time,list[text,box]]': a list of (times, list of (sentence, bounding-box))
            - 'list[text,box]': list of texts with bounding boxes
            - 'list[id,text,box]': list of tuple of id, text, and bounding boxes
            - 'list[text,time,box]': list of repeated times (in seconds) for every text_bounding_boxed
            - 'list[tuple(id,timed-text)]': list of tuples made of (startend times in seconds, text as string present in those frames)
        """
        if self._text_in_video is None:
            return None
        if format=='list':
            return self._text_in_video
        elif format=='str':
            return ' '.join([tft.get_full_text() for tft in self._text_in_video])
        elif format=='set[times]':
            out = []
            video = LocalVideo(self.video_id)
            for tft in self._text_in_video:
                out.extend([(video.get_time_from_num_frame(st_en_frames[0]),video.get_time_from_num_frame(st_en_frames[1])) for st_en_frames in tft.start_end_frames])
            return out
        elif format=='list[text,box]':
            out_lst = []
            for tft in self._text_in_video:
                out_lst.extend(tft.get_framed_sentences())
            return out_lst
        elif format=='list[id,text,box]':
            timed_text_with_bb = []
            _id = 0
            for tft in self._text_in_video:
                for sentence,bb in tft.get_framed_sentences():
                    timed_text_with_bb.append((_id,sentence,bb))
                    _id +=1
            return timed_text_with_bb
        elif format=='list[text,time,box]':
            timed_text_with_bb = []
            video = LocalVideo(self.video_id)
            for tft in self._text_in_video:
                st_en_frames = tft.start_end_frames[0]
                for sentence,bb in tft.get_framed_sentences():
                    timed_text_with_bb.append((sentence.strip('\n'),(video.get_time_from_num_frame(st_en_frames[0]),video.get_time_from_num_frame(st_en_frames[1])),bb))
            return timed_text_with_bb
        elif format=='list[time,list[text,box]]':
            video = LocalVideo(self.video_id)
            timed_text = []
            texts = self._text_in_video
            for tft in texts:
                for startend in tft.start_end_frames:
                    insort_left(timed_text,((video.get_time_from_num_frame(startend[0]),video.get_time_from_num_frame(startend[1])), tft.get_full_text()))
            return timed_text
        elif format=='list[tuple(id,timed-text)]':
            video = LocalVideo(self.video_id)
            return [(id,(video.get_time_from_num_frame(startend[0]),video.get_time_from_num_frame(startend[1])), tft.get_full_text()) 
                            for id, tft in enumerate(self._text_in_video) 
                            for startend in tft.start_end_frames]
            

    def is_slide_video(self,slide_frames_percent_threshold:float=0.5,_show_info=True):
        '''
        Computes a threshold against a value that can be calculated or passed as precomputed_value
        
        Returns
        -------
        value and slide frames if return value is True\n
        else\n
        True and slide frames if percentage of recognized slidish frames is above the threshold
        '''
        if not "slides_percentage" in self.data["video_data"].keys():
            self._preprocess_video(vsm=VideoSpeedManager(self.video_id,COLOR_RGB),_show_info=_show_info)
        return self.data["video_data"]['slides_percentage'] > slide_frames_percent_threshold

    def extract_slides_title(self,quant:float=.8,axis_for_outliers_detection:Literal['w','h','wh']='h',union=True,with_times=True) -> list:
        """
        Titles are extracted by performing statistics on the axis defined, computing a threshold based on quantiles\n
        and merging results based on union of results or intersection\n
        #TODO improvements: now the analysis is performed on the whole list of sentences, but can be performed:\n
            - per slide\n
            - then overall\n
        but i don't know if can be beneficial, depends on style of presentation. 
        For now the assumption is that there's uniform text across all the slides and titles are generally bigger than the other text

        Then titles are further more filtered by choosing that text whose size is above the threshold, only if it's
        the first sentence of the slide\n
            
        Prerequisites :
        ------------
        Must have runned analyze_video()ffmpeg -i /home/gaggio/Documents/Research/ekeel/EVA_apps/EKEELVideoAnnotation/static/videos/lskmIRldsyU/lskmIRldsyU.mp4 -o /home/gaggio/Documents/Research/ekeel/EVA_apps/EKEELVideoAnnotation/static/videos/lskmIRldsyU/lskmIRldsyU.wav
        
        Parameters :
        ----------
        - quant : quantile as lower bound for outlier detection
        - axis_for_outliers_detection : axis considered for analysis are 'width' or 'height' or both 
        - union : lastly it's perfomed a union of results (logical OR) or an intersection (logical AND)
        - with_times : if with_times returns a list of tuples(startend_frames, text, bounding_box)
                otherwise startend_frames are omitted
            
        Returns :
        ---------
        List of all the detected titles
        """
        assert axis_for_outliers_detection in {'w','h','wh'} and 0 < quant < 1 and self.get_extracted_text(format='list[text,time,box]') is not None
        # convert input into columns slice for analysis
        sliced_columns = {'w':slice(2,3),'h':slice(3,4),'wh':slice(2,4)}[axis_for_outliers_detection]
        texts_with_bb = self.get_extracted_text(format='list[text,time,box]')
        
        # select columns
        axis_array = array([text_with_bb[2][sliced_columns] for text_with_bb in texts_with_bb],dtype=dtype('float','float'))
        
        # compute statistical analysis on columns
        indices_above_threshold = list(where((axis_array > quantile(axis_array,quant,axis=0)).any(axis=1))[0]) if union else \
                                  list(where((axis_array > quantile(axis_array,quant,axis=0)).all(axis=1))[0])

        slides_group = []
        # group by slide
        # x[0] is one element of indices_above_threshold to compare, x[1] is another
        # [1] accesses the startend seconds of that VideoSlide  [text, startend, bounding_boxes]
        # [0] picks the start second of that object [start_second, end_second]
        for _,g in groupby(enumerate(indices_above_threshold),lambda x: texts_with_bb[x[0]][1][0] - texts_with_bb[x[1]][1][0]):
            slides_group.append(list(reversed(list(map(lambda x:x[1], g)))))
        slides_group = list(reversed(slides_group))

        # remove indices of text that are classified as titles but are just big text that's not at the top of every slide
        for group in slides_group:
            for indx_text in group:
                if indx_text > 0 and indx_text-1 not in group and (                        # if i'm not at the first index and the text of the previous index is not in the group
                   texts_with_bb[indx_text-1][1][0] == texts_with_bb[indx_text][1][0] and  # and the text is in the same slide
                   texts_with_bb[indx_text-1][2][1] < texts_with_bb[indx_text][2][1]):     # and has a y value lower than my current text (there's another sentence before this one)
                    indices_above_threshold.remove(indx_text)

        # selects the texts from the list of texts
        if len(indices_above_threshold) == 0:
            return None
        
        if not with_times:
            if len(indices_above_threshold) > 1:
                return itemgetter(*indices_above_threshold)(list(zip(*list(zip(*texts_with_bb))[0:3:2])))
            return [itemgetter(*indices_above_threshold)(list(zip(*list(zip(*texts_with_bb))[0:3:2])))]
        if len(indices_above_threshold) > 1:
            return itemgetter(*indices_above_threshold)(texts_with_bb)
        return [itemgetter(*indices_above_threshold)(texts_with_bb)]
        
        
    def create_thumbnails(self):
        '''
        Create thumbnails of keyframes from slide segmentation
        '''
                
        #times = self._slide_startends
        #if times is None:
        #    times = sorted(self.get_extracted_text(format='set[times]'))
        #else:
        #    times = sorted(times)

        images_path = []
        path = Path(__file__).parent.joinpath("static","videos",self.video_id) #os.path.dirname(os.path.abspath(__file__))
        if any(File.endswith(".jpg") for File in os.listdir(path)):
            for file in sorted(os.listdir(path)):
                if file.endswith(".jpg"):
                    images_path.append(f"videos/{self.video_id}/{file}")
            self.images_path = images_path
            return
        
        times = self.data["video_data"]["segments"]
        video = LocalVideo(self.video_id)
        for i,(start_seconds,_) in enumerate(times):
            video.set_num_frame(video.get_num_frame_from_time(start_seconds+0.5))
            image = video.extract_next_frame()
            file_name = str(i) + ".jpg"
            image_file_dir = path.joinpath(file_name)
            cv2.imwrite(image_file_dir.__str__(), image)
            images_path.append(f"videos/{self.video_id}/{i}.jpg")
        
        self.images_path = images_path


    def adjust_or_insert_definitions_and_indepth_times(self,burst_concepts:List[dict],definition_tol_seconds:float = 3,_show_output=False):
        '''
        This is an attempt to find definitions from timed sentences of the transcript and the timed titles of the slides.\n
        Heuristic is that if there's a keyword in the title of a slide (frontpage slide excluded)
        find the first occurence of that keyword in the transcript within a tolerance seconds window before and after the appearance of the slide
        set that as "definition" only if it contains the keyword of the title .\n 
        Heuristic for the in-depth is that after definition there's an in-depth of the slide, this means that the concept is explained further there, until the slide with that title won't disappear.\n
        
        On the algorithmic side sentences of the transcript used by the heuristic are mapped to the conll version of the text,
        cleaning operation is performed to remove errors (it groups the contiguous hit of every used sentence of the transcript to the conll by groups len and picks the biggest)\n
        Then the mapped sentences are aggregated by start and end sentence ids\n
        Lastly if the burst analysis has different definition times it is overwritten, if it does not contain the definition, this is appended at the end
        '''
        if self._slide_titles is None:
            raise Exception('slide titles not set')
        
        
        # extract definitions and in-depths in the transcript of every title based on slide show time and concept citation (especially with definition)
        timed_sentences = get_timed_sentences(self.request_transcript()[0],[sent.data["text"] for sent in parse(get_text(self.video_id,return_conll=True)[1])])

        video_defs = {}
        video_in_depths = {}
        is_introductory_slide = True
        for title in self._slide_titles:
            if is_introductory_slide or title['start_end_seconds'] == start_end_times_introductory_slides: # TODO is there always an introductory slide?
                start_end_times_introductory_slides = title['start_end_seconds']
                is_introductory_slide = False
            else:
                start_time_title,end_time_title = title['start_end_seconds']
                title_lowered = title["text"].lower()
                title_keyword = [burst_concept['concept'] for burst_concept in burst_concepts if burst_concept['concept'] in title_lowered]
                if len(title_keyword) > 0:
                    title_keyword = title_keyword[0]
                else:
                    title_keyword = SemanticText(title['text'],self.data['language']).extract_keywords_from_title()[0]
                for sent_id, timed_sentence in enumerate(timed_sentences):
                    if title_keyword not in video_defs.keys() and \
                       abs(start_time_title - timed_sentence['start']) < definition_tol_seconds and \
                       title_keyword in timed_sentence['text']:
                        if _show_output:
                            print()
                            print('********** Here comes the definition of the following keyword *******')
                            print(f'keyword from title: {title_keyword}')
                            print(f"time: {str(timed_sentence['start'])[:5]} : {str(timed_sentence['end'])[:5]}  |  sentence: {timed_sentence['text']}")
                            print()
                        #timed_sentence['id'] = ts_id
                        video_defs[title_keyword] = [(sent_id,timed_sentence)]
                        
                    # enlarge end time threshold to incorporate split slides with the same title
                    if title_keyword in video_defs.keys() and \
                       end_time_title > timed_sentence['end'] - 1 and \
                       timed_sentence['start'] > video_defs[title_keyword][0][1]['start']: # and \
                       #txt_classif.is_partially_in_txt_version(title_keywords[0],timed_sentence['text']):
                        if title_keyword not in video_in_depths.keys():
                            if _show_output:
                                print('********** Here comes the indepth of the following keyword *******')
                                print(f'keyword from title: {title_keyword}')
                                print(f"time: {str(timed_sentence['start'])[:5]} : {str(timed_sentence['end'])[:5]}  |  sentence: {timed_sentence['text']}")
                            #timed_sentence['id'] = ts_id
                            video_in_depths[title_keyword] = [(sent_id,timed_sentence)]
                            
                        elif not any([True for _,tmd_sentence in video_in_depths[title_keyword] if tmd_sentence['start'] == timed_sentence['start']]):
                            #timed_sentence['id'] = ts_id
                            video_in_depths[title_keyword].append((sent_id,timed_sentence))
                            if _show_output:
                                print(f"time: {str(timed_sentence['start'])[:5]} : {str(timed_sentence['end'])[:5]}  |  sentence: {timed_sentence['text']}")


        def seconds_to_h_mm_ss_dddddd(time:float):
            millisec = str(time%1)[2:8]
            millisec += '0'*(6-len(millisec))
            seconds = str(int(time)%60)
            seconds = '0'*(2-len(seconds)) + seconds
            minutes = str(int(time/60))
            minutes = '0'*(2-len(minutes)) + minutes
            hours = str(int(time/3600))
            return hours+':'+minutes+':'+seconds+'.'+millisec

        # Creating or modifying burst_concept definition of the video results 
        added_concepts = []
        concepts_used = {concept:False for concept in video_defs.keys()}
        concept_description_type = "Definition"
        for burst_concept in burst_concepts:
            if burst_concept["concept"] in video_defs.keys() and burst_concept["description_type"] == concept_description_type:

                if burst_concept["start_sent_id"] != video_defs[burst_concept["concept"]][0][0] or \
                   burst_concept["end_sent_id"] != video_defs[burst_concept["concept"]][-1][0]:
                    burst_concept_name = burst_concept['concept']
                    burst_concept['start_sent_id'] = video_defs[burst_concept_name][0][0]
                    burst_concept['end_sent_id'] = video_defs[burst_concept_name][-1][0]
                    burst_concept['start'] = seconds_to_h_mm_ss_dddddd(video_defs[burst_concept_name][0][1]["start"])
                    burst_concept['end'] = seconds_to_h_mm_ss_dddddd(video_defs[burst_concept_name][-1][1]["end"])
                    burst_concept['creator'] = "Video_Analysis"
                    concepts_used[burst_concept_name] = True
        
        for concept_name in video_defs.keys():
            if not concepts_used[concept_name]:
                burst_concepts.append({ 'concept':concept_name,
                                        'start_sent_id':video_defs[concept_name][0][0],
                                        'end_sent_id':video_defs[concept_name][-1][0],
                                        'start':seconds_to_h_mm_ss_dddddd(video_defs[concept_name][0][1]['start']),
                                        'end':seconds_to_h_mm_ss_dddddd(video_defs[concept_name][-1][1]["end"]),
                                        'description_type':concept_description_type,
                                        'creator':'Video_Analysis'})
                if not concept_name in added_concepts:
                    added_concepts.append(concept_name)

        # In Depths must be managed differently since there can be more than one
        concepts_used = {concept:False for concept in video_in_depths.keys()}
        concept_description_type = "In Depth"
        for video_concept_name in video_in_depths.keys():
            most_proximal = {'found':False}
            for id_, burst_concept in reversed(list(enumerate(burst_concepts))):
                
                if burst_concept["concept"] == video_concept_name and burst_concept["description_type"] == concept_description_type:
                    if not most_proximal["found"]:
                        most_proximal['found'] = True
                        most_proximal["id"] = id_
                        most_proximal['diff_start_sent_id'] = abs(burst_concept['start_sent_id']-video_in_depths[video_concept_name][0][0])
                        most_proximal['diff_end_sent_id'] = abs(burst_concept['end_sent_id']-video_in_depths[video_concept_name][-1][0])
                    else:
                        if most_proximal['diff_start_sent_id'] > abs(burst_concept['start_sent_id']-video_in_depths[video_concept_name][0][0]):
                            most_proximal["id"] = id_
                            most_proximal['diff_start_sent_id'] = abs(burst_concept['start_sent_id']-video_in_depths[video_concept_name][0][0])
                            most_proximal['diff_end_sent_id'] = abs(burst_concept['end_sent_id']-video_in_depths[video_concept_name][-1][0])
                
                elif most_proximal['found'] and burst_concept["concept"] != video_concept_name:
                    target_concept = burst_concepts[most_proximal['id']]
                    target_concept['start'] = seconds_to_h_mm_ss_dddddd(video_in_depths[video_concept_name][0][1]["start"])
                    target_concept['end'] = seconds_to_h_mm_ss_dddddd(video_in_depths[video_concept_name][-1][1]["end"])
                    target_concept['start_sent_id'] = video_in_depths[video_concept_name][0][0]
                    target_concept['end_sent_id'] = video_in_depths[video_concept_name][-1][0]
                    target_concept['creator'] = 'Video_Analysis'
                    break
                
            if not most_proximal['found']:
                burst_concepts.append({ 'concept':video_concept_name,
                                        'start_sent_id':video_in_depths[video_concept_name][0][0],
                                        'end_sent_id':video_in_depths[video_concept_name][-1][0],
                                        'start':seconds_to_h_mm_ss_dddddd(video_in_depths[video_concept_name][0][1]['start']),
                                        'end':seconds_to_h_mm_ss_dddddd(video_in_depths[video_concept_name][-1][1]["end"]),
                                        'description_type':concept_description_type,
                                        'creator':'Video_Analysis'})
                if not concept_name in added_concepts:
                    added_concepts.append(concept_name)
                    
        return added_concepts,burst_concepts


def _run_one_segmentation_job(video_id):
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
    #print(db_mongo.get_video_segmentation(video_id,raise_error=False))
    vid_analyzer = VideoAnalyzer(video_id)
    if not vid_analyzer.is_not_too_long():
        segmentation_data = {'video_id':video_id,'slides_percentage':0.0,'slidish_frames_startend':[]}
    else: 
        if vid_analyzer.is_slide_video():
            # if it's classified as a slides video analyze it and insert results in the structure that will be uploaded online
            vid_analyzer.analyze_video()
            results = vid_analyzer.extract_slides_title()
            #from pprint import pprint
            #pprint(results)
            # insert titles data in the structure that will be loaded on the db
            segmentation_data = {**segmentation_data, 
                                 **{'slide_titles':[{'start_end_seconds':start_end_seconds,'text':title,'xywh_normalized':bb} for (title,start_end_seconds,bb) in results] if results is not None else [],
                                    'slide_startends': vid_analyzer.get_extracted_text(format='set[times]')}}
    db_mongo.insert_video_text_segmentation(segmentation_data)


def _run_jobs(queue):
    '''
    Periodically checks if the segmentation queue is empty, if not it starts a segmentation and runs it until the end\n
    if it's empty it goes to sleep to avoid cpu usage 
    '''
    #db_mongo.open_socket()
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
    while True:
        #print(" Scheduler says: No jobs",end="\r")
        if len(queue) > 0:
            
            # Ensuring video has to be analyzed (is not already present in mongo) to prevent looping through the same video cliecked by the user
            # in a short amount of time
            video_id = None
            while len(queue) > 0:
                url:str = queue.pop(0)
                if VideoAnalyzer.is_youtube_url(url) and db_mongo.get_video_segmentation(VideoAnalyzer.get_video_id(url),raise_error=False) is None:
                    video_id = VideoAnalyzer.get_video_id(url)
                    break
                

            if video_id is not None:
                #print("Segmentation job on "+video_id+" starts  working...")
                video_analyzer = VideoAnalyzer(url)
                if not video_analyzer.is_not_too_long():
                    segmentation_data = {"video_id":video_id, 'slides_percentage':0.0, 'slidish_frames_startend':[]}
                else: 
                    
                    if video_analyzer.is_slide_video():
                        # if it's classified as a slides video analyze it and insert results in the structure that will be uploaded online
                        video_analyzer.analyze_video()
                        results = video_analyzer.extract_slides_title()

                        #from pprint import pprint
                        #pprint(results)

                        # insert titles data in the structure that will be loaded on the db
                        segmentation_data = {**segmentation_data, 
                                             **{'slide_titles':[{'start_end_seconds':start_end_seconds,'text':title,'xywh_normalized':bb} for (title,start_end_seconds,bb) in results] if results is not None else [],
                                                'slide_startends': video_analyzer.get_extracted_text(format='set[times]')}}
                db_mongo.insert_video_text_segmentation(segmentation_data,update=True)
                #print(f"Job on {video_id} done!"+" "*20)
        time.sleep(10)

def workers_queue_scheduler(queue:'ListProxy[any]'):
    '''
    Creates a separated process that runs the segmentation of every video in the queue
    '''
    Process(target=_run_jobs,args=(queue,)).start()    



if __name__ == '__main__':
    vid = VideoAnalyzer("https://www.youtube.com/watch?v=iiovZBNkC40").analyze_videoVSimple()
    #vid.is_slide_video()
    pass

