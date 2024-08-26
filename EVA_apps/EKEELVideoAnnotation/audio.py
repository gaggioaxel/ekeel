import subprocess
import os
from pathlib import Path
import json


# Function to convert MP4 video to MP3 audio
def _convert_mp4_to_wav(video_path:str, video_id:str) -> Path:
    '''
    Converts the mp4 video into wav file
    '''
    output_file_path = Path(video_path).joinpath(video_id+'.wav')
    if os.path.isfile(output_file_path): 
        return output_file_path
    
    input_file_path = Path(video_path).joinpath(video_id+'.mp4').__str__()
    try:
        # Run ffmpeg command to convert MP4 to WAV
        subprocess.run(['ffmpeg', '-i', input_file_path, output_file_path.__str__()], 
                       check=True, 
                       stdout=subprocess.PIPE, 
                       stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        raise Exception("ERROR SUBPROCESS FFMPEG")
    return output_file_path


class WhisperTranscriber:
    
    @staticmethod
    def _whisper_transcribe(wav_path:Path, json_path:Path):
        import stable_whisper
        # TODO dq True -> va piu veloce ma skippa discorsi molto veloci, inficiando sulla qualita' finale del transcript, ma skippa anche imprecisioni e ripensamenti
        # Tempi quasi raddoppiano
        # TODO stable-ts version 2.17.3: passing the language is not working, will be inferenced at cost of small increase in time
        # self._model.transcribe(wav_path.__str__(), decode_options={"language":language}) \
        #             .save_as_json(json_path.__str__())
        # TODO deallocating the model does not work
        # TODO must move model outside ekeel otherwise will allocate multiple instances when gunicorn spawns workers
        stable_whisper.load_model(name='large-v3', cpu_preload=False).transcribe(wav_path.__str__()).save_as_json(json_path.__str__())
        
    
    @staticmethod
    def transcribe(video_id:str, language:str, min_segment_len:int = 4):
        """
        Transcribe the audio from a video using Whisper and return the transcribed segments with timestamps.
        """
        folder_path = Path(__file__).parent.joinpath("static").joinpath('videos').joinpath(video_id)
        json_path = folder_path.joinpath(video_id+".json")
        wav_path = _convert_mp4_to_wav(folder_path, video_id)
        
        print("Starting transcription...")
        WhisperTranscriber._whisper_transcribe(wav_path, json_path)
        #WhisperTranscriber._whisper_transcribe(json_path, wav_path, language)
        # When used as a separated process it won't release the memory and goes into lock
        #thread = Thread(target=WhisperTranscriber._whisper_transcribe, args=(json_path, wav_path, language))
        #thread.start()
        #thread.join()
        #process = Process(target=_whisper_transcribe, args=(json_path, wav_path, language))
        #process.start()
        #process.join()
        #process.terminate()
        #del process
        #gc.collect()
        
        with open(json_path) as f:
            data = json.load(f)
        os.remove(wav_path)             
        os.remove(json_path)
        
        timed_sentences = []
        for i, segment in enumerate(data["segments"]):
            segment.pop("seek",None)
            segment.pop("tokens", None)
            segment.pop("temperature", None)
            segment.pop("avg_logprob", None)
            segment.pop("compression_ratio", None)
            segment.pop("no_speech_prob", None)
            
            # Moving apostrophes to their line and change it to another character to avoid conflicts in javascript
            if segment["text"].startswith("'"):
                timed_sentences[-1]["text"] = timed_sentences[-1]["text"]+"’"
                segment["text"] = segment["text"][1:]
            
            # Grouping short sentences
            if len(segment["text"].split()) < min_segment_len:
                if segment["text"].endswith(".") and len(timed_sentences) > 0:
                    prev_segment = timed_sentences[-1]
                    for word in segment["words"]:
                        prev_segment["words"].append(word)
                    prev_segment["end"] = segment["end"]
                    prev_segment["text"] += segment["text"]
                elif len(timed_sentences) == 0:
                    timed_sentences.append(segment)
                elif i+1 < len(data["segments"]):  
                    next_segment = data["segments"][i+1]
                    for word in reversed(segment["words"]):
                        next_segment["words"].insert(0, word)
                    next_segment["start"] = segment["start"]
                    next_segment["text"] = segment["text"] + next_segment["text"]
                else:
                    timed_sentences.append(segment)
            else:
                timed_sentences.append(segment)
            
        return timed_sentences
        


if __name__ == '__main__':
    
    WhisperTranscriber.transcribe("","")
    
    from segmentation import VideoAnalyzer
    video1 = VideoAnalyzer("https://www.youtube.com/watch?v=TsONshNsHHw")
    video1.download_video()
    print("transcript 1")
    video1.request_transcript()
    
    import time
    time.sleep(15)
    
    video1 = VideoAnalyzer("https://www.youtube.com/watch?v=Gac9rynIENg")
    video1.download_video()
    print("transcript 2")
    video1.request_transcript()
    
    # Opening JSON file
    #f = open('audio.json')

    # returns JSON object as 
    # a dictionary
    #data = json.load(f)
    #print(data)
    
elif False:
    #import whisper_timestamped
    #help(whisper_timestamped.transcribe)
    
    print(Path(__file__).parent.joinpath("static",'videos',"5rLub-Tz65M","5rLub-Tz65M.wav"))
    import stable_whisper
    model = stable_whisper.load_model('large-v3')
    result = model.transcribe(Path(__file__).parent.joinpath("static",'videos',"5rLub-Tz65M","5rLub-Tz65M.wav").__str__())
    result.save_as_json('audio.json')
    
    #transcript = whisper_timestamped.transcribe(model="openai/whisper-large-v3", 
    #                                            audio = Path(__file__).parent.joinpath("static",'videos',"5rLub-Tz65M","5rLub-Tz65M.wav").__str__(),
    #                                            language="it",
    #                                            compute_word_confidence=False,
    #                                            refine_whisper_precision=0.9,
    #                                            seed=42)
    
    
    
    from pprint import pprint
    pprint(result)
    
elif False:
    
    from pydub import AudioSegment, silence
    from tqdm import tqdm

    wav_path = _convert_mp4_to_wav(Path(__file__).parent.joinpath("static").joinpath('videos').joinpath("5rLub-Tz65M"), "5rLub-Tz65M")

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(device)
    torch_dtype = torch.float32

    model_id = "openai/whisper-large-v3"

    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
    )
    model.to(device)

    processor = AutoProcessor.from_pretrained(model_id)

    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        max_new_tokens=128,
        torch_dtype=torch_dtype,
        device=device,
    )
    
    def give_split(wav_path):
        # Load audio and split on silence
        audio = AudioSegment.from_wav(wav_path)    
        chunks = silence.split_on_silence(
            audio,
            min_silence_len=500,  # Minimum length of silence (in ms) to be used for a split
            silence_thresh=audio.dBFS-40,  # Silence threshold (in dB)
            seek_step=30
        )

        transcription = []

        for i, chunk in enumerate(tqdm(chunks, desc="Transcribing chunks", unit="chunk")):
            chunk_path = wav_path.parent.joinpath(f"chunk_{i}.wav")
            chunk.export(chunk_path, format="wav")
            result = pipe(chunk_path.__str__())
            transcription.append(result["text"])

        #print(" ".join(transcription))
        
    def give_full(wav_path):
        
        transcription = pipe(wav_path.__str__(), generate_kwargs={"language": "italian"})
        #print(" ".join(transcription))
        return
    
    import time
    #curr = time.time()
    #give_split(wav_path)
    #print("SPLIT TEXT TIME",time.time()-curr)
    
    
    curr = time.time()
    give_full(wav_path)
    print("FULL TEXT TIME",time.time()-curr)
    
    #print(Path(__file__).parent.joinpath("static").joinpath('videos').joinpath("5rLub-Tz65M").joinpath("5rLub-Tz65M.wav").__str__())
    #result = pipe(Path(__file__).parent.joinpath("static").joinpath('videos').joinpath("5rLub-Tz65M").joinpath("5rLub-Tz65M.wav").__str__())
    #print(result["text"])