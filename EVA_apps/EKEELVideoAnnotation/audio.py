import subprocess
import wave
from speech_recognition import Recognizer, AudioFile
import os

from locales import Locale


# Function to convert MP4 video to MP3 audio
def _convert_mp4_to_mp3(video_path:str, video_id:str) -> str:
    '''
    Converts the mp4 video into wav file
    '''
    output_file_path = os.path.join(video_path, video_id+'.wav')    
    if os.path.isfile(output_file_path): 
        return output_file_path
    
    input_file_path = os.path.join(video_path, video_id+'.mp4')
    try:
        # Run ffmpeg command to convert MP4 to MP3
        subprocess.run(['ffmpeg', '-i', input_file_path, output_file_path], 
                       check=True, 
                       stdout=subprocess.PIPE, 
                       stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        return None
    return output_file_path


def _get_audio_sample_duration(audio_path, offset:float, max_seconds:float):
    """
    Get minimum duration of an audio file, capped at max_seconds.
    
    Parameters:
        audio_path (str): The path to the audio file.
    
    Returns:
        float: The duration of the audio file in seconds.
    """
    with wave.open(audio_path, 'rb') as audio_file:
        # Get the number of frames and the frame rate
        num_frames = audio_file.getnframes()
        frame_rate = audio_file.getframerate()
        # Calculate duration in seconds
        duration_seconds = num_frames / float(frame_rate)
    return min(max_seconds,duration_seconds-offset)


def identify_language_audio(video_path:str, video_id:str):
    '''
    Extracts the spoken language from the video file provided using speech recognition.
    '''
    recognizer = Recognizer()
    mp3_path = _convert_mp4_to_mp3(video_path, video_id)
    step = 10
    with AudioFile(mp3_path) as source:
        languages_score = []
        i = 0
        while True:
            audio = recognizer.record(source,offset=i, duration=_get_audio_sample_duration(mp3_path, i, step))
            result = None
            for language in Locale().get_supported_languages():
                try:
                    result = recognizer.recognize_google(audio,show_all=True,language=language)['alternative'][0]
                    languages_score.append((language,result['confidence'],len(result['transcript'])))
                except Exception:
                    pass
            if result is not None:
                break
            i += step
            
    languages_score.sort(key=lambda x: x[1]-10/x[2],reverse=True)
    os.remove(mp3_path)
    return languages_score[0][0]



#identify_language_audio("/home/gagg/Desktop/edurell/EVA_apps/EKEELVideoAnnotation/static/videos/syzhEsmhLoE","syzhEsmhLoE")