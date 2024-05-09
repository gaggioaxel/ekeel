import sys
import os
this_file_path = str(os.path.abspath(__file__))
rel_path_len = len('/'.join(this_file_path.split('/')[-2:]))
code_path = this_file_path[:len(this_file_path)-rel_path_len]
for (dir_path,dir_names,filenames) in os.walk(code_path):
    if "segmentation.py" in filenames:
        sys.path.insert(0, dir_path)

import csv
import ast

from segmentation import VideoAnalyzer

this_folder_path = '/'.join(this_file_path.split('/')[:-1])
videos_path = os.path.join(this_folder_path,'videos')
with open(this_folder_path+'/videos_slide.csv',newline='') as csvfile:
    spamreader = csv.DictReader(csvfile)
    num_rows = 0
    for row in spamreader:
        # uncomment to download the videos if you don't have in the videos folder
        # it's commented because pytube and pafy libs used to download the videos tend to break quite often
        #video_id = row['\ufeffvideo_id']
        #download('https://www.youtube.com/watch?v='+video_id,path=videos_path)
        num_rows += 1

with open(this_folder_path+'/videos_slide.csv',newline='') as csvfile:
    spamreader = csv.DictReader(csvfile)
    matching_results = []
    slidishnesses = []
    for i,row in enumerate(spamreader):
        video_id = row['\ufeffvideo_id']
        bool_value = ast.literal_eval(row['is_slide_video']) if row['is_slide_video'] in ['True', 'False'] else None
        if bool_value is None:
            raise Exception('csv not correctly formatted')
        correct_answer = bool_value
        vsm = VideoAnalyzer(video_id,_testing_path=videos_path)
        predicted_answer = vsm.is_slide_video()
        slidishnesses.append(vsm._video_slidishness)
        matching_results.append(correct_answer == predicted_answer)
        print(f" processed: {str((i+1)/num_rows*100)[:5]}%"+' '*4,end='\r')
    print(f"Accuracy: {matching_results.count(True)/len(matching_results)}"+' '*6)
    print(f"videos slidishness: {slidishnesses}")