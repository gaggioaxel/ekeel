# EKEEL Video Annotation

# Installation

### Prerequisites: ffmpeg

Open a Terminal and type:
```    
sudo apt update && sudo apt upgrade
```
```
sudo apt install ffmpeg
```

### Prerequisites: Anaconda  

<br>

Start by running Anaconda/Conda terminal:

<br>

Create the virtual environment (if first time):
```
conda create -n myenv python=3.7 pip pytorch
```
    
Activate the environment:
```
conda activate myenv
```

(Facoltative) Open VSCode with conda (if dev using VScode ide)
```
code
```

Download the repository:
```    
git clone https://github.com/Teldh/edurell.git
```

"cd" to the folder EKEELVideoAnnotation
```
cd {path to the folder EKEELVideoAnnotation}
```

Install requirements:
```    
pip install -r requirements.txt
python -m spacy download en
```

Create a folder "punctuator" (lowercase) in the same level of the .py files, and put inside the file downloaded at the link:
https://drive.google.com/drive/folders/1NYyehpB5fAlL42_TwTnXLokLz8K-TS3W?usp=sharing


Open the python console 
```
python
```
and type:

    >>> import nltk
    >>> nltk.download('stopwords')
    >>> nltk.download('punkt')
    >>> nltk.download('wordnet')
    >>> nltk.download('omw-1.4')
    
now exit from the python console

    >>> exit()

(Facoltative) If you have a gpu, to improve performances:

    > conda install m2w64-toolchain
    > conda install libpython

Installation completed, with the environment activated launch the project with:

    > python main.py
    
<br>

# Notes:

- Account:

    email account of this app is written in the sendmail.py file

- Dislike count error:  

    YouTube just removed the dislike count, for this reason the pafy package returns an error. 
    Until there is a patch use:

        > pip uninstall -y pafy
        > pip install git+https://github.com/Cupcakus/pafy
    
    If still not working you may addictionally do:

        > python -m spacy download en_core_web_lg
        > python -m spacy download en_core_web_sm
    
    And have a look on this:

    https://exerror.com/oserror-e050-cant-find-model-en_core_web_sm-it-doesnt-seem-to-be-a-shortcut-link-a-python-package-or-a-valid-path-to-a-data-directory/

- Python Version:  

    Updated python version to 3.7.11
    Packeges must be adapted to that version

- Save burst auto and semiauto on DB

    To save into db the burst results decomment the lines of code (544-569) of main.py

- Get synonyms from wordnet NLTK (manual annotator)

  to get synonyms automatically at the start change the commented lines on:   
  main.py - (line 265-273)

  there we have 2 ways: 
    * 1) - starting from empty
    * 2) - getting from wordnet   

  leave not commented only the choosen one.

- Synonyms on burst mode

  to select the way to proceed in the burst (auto or semiauto) you can either:
  - activate the popup to select the procedure (line 43-60 of burst_result.html file)  
    * .. by turning setPopup = true;
  - have a look and edit (burst type) on the code at:
    * burst_result (line 43-60 [popup], 300, 312)
    * burst_vocabulary (line 349-378 [launchBurstAnalysis])
    * main.py (line 494-572 [burst])   

- Variables:   

    If you change the name of the virtual-environment 
    then you have to change the path in the first rows of segmentation.py:
    
    ```python
    incompatible_path = '/home/anaconda3/envs/{ENV NAME}/bin'
    ```
- Email 

    After some months the email sender could stop working and you can find errors on register or forgot password:

    * Login to the google account with this app credentials   
    (you can find those credentials on file sendmail.py line ~126) 
    
    * go to security settings -> allow less secure app

    * (More info -> https://support.google.com/accounts/answer/6010255?hl=en)

    If still not working:

    * after log in with the google account open this link:  
      https://accounts.google.com/DisplayUnlockCaptcha

    * (More info -> https://stackoverflow.com/questions/16512592/login-credentials-not-working-with-gmail-smtp)

# Run locally

Start by running Anaconda/Conda terminal:

<br>

Activate the "myenv" virtual environment:

    > conda activate myenv

(Facoltative) Open VSCode with conda (if dev using VScode ide)

    > code

With the environment activated launch the app locally with:

    > python main.py

# Deploy and run on server

Follow this guide:
https://drive.google.com/file/d/1hta5qeYVr-2U9mcQdjT0-a_NacvhYUPC/view?usp=sharing