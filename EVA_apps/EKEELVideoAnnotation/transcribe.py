"""
External Video Transcription Service
==================================

Provides video transcription services for the EKEEL annotation system.
Used in deployment as an external worker service.

Notes
-----
More details about deployment can be found [here](../../platforms/annotator/transcriber/deploy.md)

Functions
---------
main()
    Main worker process for continuous video transcription
"""

import stable_whisper

def main():
    """
    Continuous video transcription worker process.
    
    Runs an infinite loop to process untranscribed videos by:\n
    1. Retrieving untranscribed videos from MongoDB\n
    2. Downloading the video from YouTube\n
    3. Converting to WAV\n
    4. Transcribing with `stable-whisper` library and large-v3 model\n
    5. Storing results\n
    """
    # TODO stable-ts version 2.17.3: passing the language is not working, will be inferenced at cost of small increase in time
    # self._model.transcribe(wav_path.__str__(), decode_options={"language":language}) \
    #             .save_as_json(json_path.__str__())
    model = stable_whisper.load_model(name='large-v3', in_memory=True, cpu_preload=True)
    print("Model loaded")
    
    from pathlib import Path
    base_folder = Path(__file__).parent.joinpath("static").joinpath("videos")
    
    from database.mongo import get_untranscribed_videos, insert_video_data, get_video_data, remove_annotations_data
    from time import sleep, time
    from json import load
    from media.audio import convert_mp4_to_wav
    from media.segmentation import VideoAnalyzer
    import os
    
    try:
        while True:
            try:
                videos_metadata:list = get_untranscribed_videos()
                print(f"Jobs: {videos_metadata}")
            except Exception as e:
                import sys
                import os
                import traceback

                tb_details = traceback.extract_tb(sys.exc_info()[2])

                print(f"Exception: {e}")
                for frame in tb_details:
                    filename = os.path.basename(frame.filename)
                    # Read the specific line of code
                    line_number = frame.lineno
                    with open(frame.filename, 'r') as f:
                        lines = f.readlines()
                        error_line = lines[line_number - 1].strip()
                    print(f"File: {filename}, Function: {frame.name}, Line: {line_number} | {error_line}")
                # If there is an error at network level sleep and try again reconnecting
                sleep(300)
                from env import MONGO_CLUSTER_USERNAME, MONGO_CLUSTER_PASSWORD
                import pymongo
                global client
                global db
                client = pymongo.MongoClient(
                            "mongodb+srv://"+MONGO_CLUSTER_USERNAME+":"+MONGO_CLUSTER_PASSWORD+"@clusteredurell.z8aeh.mongodb.net/ekeel?retryWrites=true&w=majority")

                db = client.ekeel
                continue
            for (video_id, language) in videos_metadata:
                print(f"New job: {video_id}")
                start_time = time()
                video_folder_path = base_folder.joinpath(video_id)
                try:
                    VideoAnalyzer("https://www.youtube.com/watch?v="+video_id, request_fields_from_db=["video_id"]).download_video()
                    convert_mp4_to_wav(video_folder_path, video_id)
                except Exception as e:
                    print(e)
                    sleep(300)
                    continue

                wav_path = video_folder_path.joinpath(video_id+".wav")
                json_path = video_folder_path.joinpath(video_id+".json")
                
                model.transcribe(wav_path.__str__()).save_as_json(json_path.__str__())
                
                with open(json_path) as f:
                    transcribed_data = load(f)["segments"]
                
                os.remove(wav_path)
                #os.remove(json_path)  # Don't remove json for debug purposes
                
                video_data = get_video_data(video_id)
                video_data["transcript_data"] = {
                                 "is_whisper_transcribed":True, 
                                 "is_autogenerated":True, 
                                 "text":transcribed_data
                                }
                    
                insert_video_data(video_data,update=False)
                remove_annotations_data(video_id)
                print(f"Done job: {video_id} in {round(time()-start_time,1)} seconds")
            sleep(60)
    except Exception as e:
        import sys
        import os
        import traceback
    
        tb_details = traceback.extract_tb(sys.exc_info()[2])

        print(f"Exception: {e}")
        for frame in tb_details:
            filename = os.path.basename(frame.filename)
            # Read the specific line of code
            line_number = frame.lineno
            with open(frame.filename, 'r') as f:
                lines = f.readlines()
                error_line = lines[line_number - 1].strip()
            print(f"File: {filename}, Function: {frame.name}, Line: {line_number} | {error_line}")
    

if __name__ == "__main__":
    main()