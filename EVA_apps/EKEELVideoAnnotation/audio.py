import subprocess
import os
from pathlib import Path
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

from locales import Locale


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

def extract_transcript_from_audio(video_id:str, language:str) -> str:
    wav_path = _convert_mp4_to_wav(Path(__file__).parent.joinpath("static").joinpath('videos').joinpath(video_id), video_id)

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    #print(device)

    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        "openai/whisper-large-v3", torch_dtype=torch.float32, low_cpu_mem_usage=True, use_safetensors=True
    )
    model.to(device)

    processor = AutoProcessor.from_pretrained(model_id)

    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        max_new_tokens=128,
        torch_dtype=torch.float32,
        device=device,
    )
    
    transcription = pipe(wav_path.__str__(), generate_kwargs={"language": Locale().get_full_from_pt1(language)})
    return transcription["text"]



if __name__ == '__main__':
    
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