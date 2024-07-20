from RAKE import Rake
#from stopwordsiso import stopwords
import phrasemachine
import spacy
from spacy import Language as SpacyModel
import re
from nltk.corpus import words
from nltk import WordNetLemmatizer
from typing import List,Tuple
from bisect import insort_left
from sklearn.feature_extraction.text import CountVectorizer
from deepmultilingualpunctuation import PunctuationModel
from difflib import ndiff
import re
from numpy import empty,prod,sum,all
from numpy.linalg import norm
from transformers import pipeline
from collections import Counter

#################################################################################
# Issue with online server (incompatibility with gunicorn)
# Edited import to fix issue: (https://github.com/chrisspen/punctuator2/issues/3)
#import sys
#incompatible_path = '/home/anaconda3/envs/myenv/bin'
#if incompatible_path in sys.path:
#    sys.path.remove(incompatible_path)
#from punctuator import Punctuator

# TODO-TORRE per punctuator e questo modello abbiamo questa precisione -> https://pypi.org/project/punctuator/
# Considerei di cambiare libreria e usare questa -> https://pypi.org/project/deepmultilingualpunctuation/
# e questo modello oliverguhr/fullstop-punctuation-multilang-large
#################################################################################

from nltk.tokenize import sent_tokenize
import nltk

#try:
#    nltk.data.find('corpora/wordnet')
#except LookupError:
#    nltk.download("wordnet")

try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download("words")


try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download("punkt")

from sentence_transformers import SentenceTransformer

import db_mongo
from locales import Locale 

TOKENIZERS_PARALELLISM = True


class NLPSingleton(object):
    '''
    Multilanguage NLP Singleton
    '''
    _instance = None
    _punct:PunctuationModel
    _spacy_models:'dict[str,SpacyModel]'
    _embedder:'dict[str,SentenceTransformer]'
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(NLPSingleton, cls).__new__(cls)
            cls._punct = PunctuationModel()

            models_name = { 'en':'en_core_web_sm',
                            'it':'it_core_news_sm'}
            cls._spacy_models = {}

            # Dictionary comprehension to download and load models
            cls._spacy_models = {
                language: spacy.load(models_name[language]) 
                for language in Locale().get_supported_languages() 
                if models_name[language] in spacy.util.get_installed_models() or not spacy.cli.download(models_name[language])
            }

            cls._embedder = {
                language: SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
                for language in Locale().get_supported_languages()
            }
        return cls._instance



#class NLPSingleton(object):
#    '''
#    Singleton for Natural Language Processing
#
#    language: must be provided as ISO639-1 (pt1 or 2 letters 'en' for 'english') 
#    '''
#    _instance = None
#
#    def __new__(cls,language:str=None):
#        if cls._instance is None:
#            cls._instance = super(NLPSingleton, cls).__new__(cls)
#            cls.rake_models:dict[str,Rake] = {}
#            cls.spacy_models:dict[str,SpacyModel] = {}
#            cls.models_names = {'spacy': {'en':'en_core_web_sm',
#                                          'it':'it_core_news_sm'},
#                                'punctuator': {"en": "oliverguhr/fullstop-punctuation-multilang-large", 
#                                               "it": "oliverguhr/fullstop-punctuation-multilang-large"},
#                                'sentence_transformer': {"en": 'paraphrase-distilroberta-base-v2', #TODO-TORRE using berta even if other models perform better? https://www.sbert.net/docs/pretrained_models.html
#                                                         "it": 'paraphrase-multilingual-MiniLM-L12-v2'} # No italian paraphraser but just multilingual. Consider training one?
#                               }
#            cls._title_openings = {'it':'[Dd]efinizione|[Ii]ntroduzione|\n', 
#                            'en':'[Dd]efinition|[Ii]ntroduction|\n'}
#            cls.punctuator_models:dict[str,PunctuationModel] = {}
#            cls.sentence_transformer_models:dict[str,SentenceTransformer] = {}
#        if language is not None:
#            cls._instance.load_language(language)
#        return cls._instance
#
#
#    def load_language(self,language:str) -> bool:
#        if language not in Locale().get_supported_languages():
#                return False
#        
#        if not language in self.rake_models.keys():
#            self.rake_models[language] = Rake(list(stopwords(language)))
#            self.spacy_models[language] = spacy.load(self.models_names['spacy'][language])
#            self.sentence_transformer_models[language] = SentenceTransformer(self.models_names['sentence_transformer'][language])
#            self.punctuator_models[language] = PunctuationModel(self.models_names["punctuator"][language])#Punctuator(os.path.join(os.path.dirname(os.path.abspath(getfile(self.__class__))), "punctuator", self.models_names['punctuator'][language]))
#        return True
#    
#    def unload(self,language:str=None) -> None:
#        if language is not None:
#            if language in self.rake_models.keys():
#                self.rake_models.pop(language)
#                self.spacy_models.pop(language)
#                self.sentence_transformer_models.pop(language)
#                self.punctuator_models.pop(language)
#            return
#        else:
#            for language in self.rake_models.keys():
#                self.rake_models.pop(language)
#                self.spacy_models.pop(language)
#                self.sentence_transformer_models.pop(language)
#                self.punctuator_models.pop(language)      



############## Used to download all the missing models at the startup ##################
#for model in NLPSingleton().models_names['spacy'].values():
#    if not model in spacy.util.get_installed_models():
#        spacy.cli.download(model)

############## Download other models on request (because it instanciate them) ###########
#for language in Locale().get_supported_languages():
#    NLPSingleton(language)
#########################################################################################


class SemanticText(NLPSingleton):
    _text:str
    _tokenized_text:'str or None'
    _language:str
    _nlp:NLPSingleton

    def __init__(self,text:str,language:str) -> None:
        assert text is not None and language is not None, 'must set both text and language'
        self._text = text
        self._tokenized_text = None
        self._language = language

    def set_text(self,text:str,language:str=None):
        '''
        If language is None, it's assumed the same 
        '''
        self._text = text
        if language is not None:
            self._language = language
        self._tokenized_text = None
    
    def get_text(self):
        return self._text

    def get_language(self):
        return self._language
    
    def lemmatize_abbreviations(self):
        '''
        Used for english
        '''
        if self._language == Locale.get_pt1_from_full('English'):
            self._text = self._text.replace("'ve", " have").replace("'re", " are").replace("'s", " is").replace("'ll", " will")
    
    def extract_keywords(self,maxWords:int=3,minFrequency:int=1):
        self.lemmatize_abbreviations()

        nlp = self._nlp_processors
    
        concepts = [j[0] for j in nlp.rake_models[self.language].run(self._text, maxWords=maxWords, minFrequency=minFrequency)[0:15]]

        doc = nlp.spacy_models[self.language](self._text.lower())

        tokens = [token.text for token in doc]
        pos = [token.pos_ for token in doc]
        concepts_machine = phrasemachine.get_phrases(tokens=tokens, postags=pos)

        for c in concepts_machine["counts"].most_common(3):
            if len(c[0].split(" ")) < 3:
                concepts.append(c[0])

        concepts_lemmatized = []

        lemmatizer = WordNetLemmatizer()

        for concept in concepts:
            lemmatized = ""

            for word in concept.split(" "):
                lemmatized += lemmatizer.lemmatize(word.lower()) + " "

            lemmatized = lemmatized.rstrip()

            if lemmatized not in concepts_lemmatized:
                concepts_lemmatized.append(lemmatized)


        for i, concept in enumerate(concepts):
            concepts[i] = concept.replace("-", " ").replace("/", " / ")

        #print(concepts)
        return concepts
    
    def extract_keywords_from_title(self):
        # TODO redo
        #str_text = re.sub(self.get_title_opening(),' ',self._text.lower())
        return None #[keyword[0] for keyword in self._nlp_processors.rake_models[self._language].run(str_text, maxWords=3, minFrequency=1)] 
    
    def _upper_first_cases_after_point(self):
        # Upper first character after a full stop
        self._text = self._text[0].upper() + re.sub(r'(?<=\.\s)([a-z])', lambda match: match.group(1).upper(), self._text[1:])

    def punctuate(self, upper_first_word:bool= True):
        assert self._text is not None
        self._text = self._punct.restore_punctuation(self._text)
        if upper_first_word:
            self._upper_first_cases_after_point()

    def lemmatize(self):
        assert self._text is not None
        return [token.lemma_ for token in self._spacy_models[self._language](self._text)]

    def tokenize(self):
        if self._tokenized_text is None:
            self._tokenized_text = sent_tokenize(self._text,Locale.get_full_from_pt1(self._language))
        return self._tokenized_text
    
    def get_embeddings(self,convert_to_tensor=True):
        if self._tokenized_text is None:
            self.tokenize()
        return self._embedder[self._language].encode(self._tokenized_text,convert_to_tensor=convert_to_tensor)

def automatic_transcript_to_str(timed_transcript:'list[dict]'):
    return " ".join(timed_sentence["text"] for timed_sentence in timed_transcript if not "[" in timed_sentence['text'])


class TextCleaner:

    def __init__(self) -> None:
        # selects all chars except to alphanumerics space & -
        self.pattern = re.compile('[^a-zA-Z\d &-]')
    
    def clean_text(self,text:str):
        return ' '.join(self.pattern.sub(' ',text).split()).lower()


class VideoSlide:
    """
    Representation of a Slide in a video
    A slide made of:
        - _full_text: full string built for comparison purposes (not to be changed)
        - _framed_sentences: list of portions of a full_text composed field and their absolute location on the screen 
        - start_end_frames: list of tuples of num start and num end frames of this text
        
    """
    _full_text: str
    _framed_sentences: List[Tuple[Tuple[int,int],Tuple[int,int,int,int]]]
    start_end_frames: List[Tuple[(int,int)]]

    def __init__(self,framed_sentences:List[Tuple[str,Tuple[int,int,int,int]]],startend_frames:List[Tuple[(int,int)]]) -> None:
        self.start_end_frames = startend_frames
        full_text = ''
        converted_framed_sentence:List[Tuple[Tuple[int,int],Tuple[int,int,int,int]]] = []
        curr_start = 0
        for sentence,bb in framed_sentences:
            full_text += sentence
            len_sent = len(sentence)
            converted_framed_sentence.append(((curr_start,curr_start+len_sent),bb))
            curr_start += len_sent
        self._framed_sentences = converted_framed_sentence
        self._full_text = full_text
 
    def copy(self):
        tft_copy = VideoSlide(framed_sentences=None,start_end_frames=self.start_end_frames)
        tft_copy._framed_sentences=self._framed_sentences
        tft_copy._full_text = self._full_text
        return tft_copy
    
    def extend_frames(self, other_start_end_list:List[Tuple[(int,int)]]) -> None:
        '''
        extend this element's start_end frames with the other list in a sorted way
        '''
        for other_start_end_elem in other_start_end_list:
            insort_left(self.start_end_frames,other_start_end_elem)

    def get_full_text(self):
        return self._full_text
    
    def get_split_text(self):
        '''
        returns the full text splitted by new lines without removing them
        '''
        return self._full_text.split("(?<=\n)")

    def get_framed_sentences(self):
        '''
        converts the full text string into split segments of text with their respective bounding boxes
        '''
        full_text = self._full_text
        return [((full_text[start_char_pos:end_char_pos]),bb) for (start_char_pos,end_char_pos),bb in self._framed_sentences]

    def merge_adjacent_startend_frames(self,max_dist:int=15) -> 'VideoSlide':
        '''
        Merges this object adjacent (within a max_dist) frame times
        '''
        start_end_frames = self.start_end_frames
        merged_start_end_frames = []
        curr_start,curr_end = start_end_frames[0]
        for new_start,new_end in start_end_frames:
            if new_start-curr_end <= max_dist:
                curr_end = max(curr_end,new_end)
            else:
                merged_start_end_frames.append((curr_start,curr_end))
                curr_start = new_start
                curr_end = new_end
        merged_start_end_frames.append((curr_start,curr_end))
        self.start_end_frames = merged_start_end_frames
        return self

    def __lt__(self, other:'VideoSlide'):
        return self.start_end_frames[0][0] < other.start_end_frames[0][0]
    
    def __repr__(self) -> str:
        return 'TFT(txt={0}, on_screen_in_frames={1}, text_portions_with_bb_normzd={2})'.format(
            repr(self._full_text),repr(self.start_end_frames),repr(self._framed_sentences))
    

COMPARISON_METHOD_TXT_SIM_RATIO:int=0
COMPARISON_METHOD_TXT_MISS_RATIO:int=1
COMPARISON_METHOD_MEANINGFUL_WORDS_COUNT:int=2
COMPARISON_METHOD_FRAMES_TIME_PROXIMITY:int=3


class TextSimilarityClassifier:
    """
    Text diffences classifier\n
    Using various methods can check if some text is part of other text\n
    or if two texts are similar
    """

    def __init__(self,comp_methods:List[int]=None,
                 max_removed_chars_over_total_diff:float=0.1,
                 min_common_chars_ratio:float=0.8,
                 max_removed_chars_over_txt:float=0.3,
                 max_added_chars_over_total:float= 0.2,
                 time_frames_tol = 10  ) -> None:
        self._CV = CountVectorizer()
        self._txt_cleaner:TextCleaner = TextCleaner()
        if comp_methods is None:
            self._comp_methods = {COMPARISON_METHOD_TXT_MISS_RATIO,COMPARISON_METHOD_TXT_SIM_RATIO}
        else:
            self.set_comparison_methods(comp_methods)
        self.removed_chars_diff_ratio_thresh = max_removed_chars_over_total_diff
        self.added_chars_diff_ratio_thresh = max_added_chars_over_total
        self.common_chars_txt_ratio_thresh = min_common_chars_ratio
        self.removed_chars_txt_ratio_thresh = max_removed_chars_over_txt
        self.time_frames_tol = time_frames_tol
        self._words = set(words.words())
        self._noise_classifier = pipeline('text-classification', model='textattack/bert-base-uncased-imdb')

    def is_partially_in(self,TFT1:VideoSlide,TFT2:VideoSlide) -> bool:
        '''
        Finds if the framed_text1 is part of the framed_text2

        Then are compared in terms of one or more predefined methods: 
            - time proximity of their frames within a tolerance\n
        
        Then it is passed to is_partially_in_txt_version(), check that documentation

        Order is based on performance maximization
            
        ### No checks are performed on input

        -------

        Returns
        -------
        True if text1 is part of the text2

        '''
        comp_methods = self._comp_methods
        checks:list[bool] = [bool(TFT1) and bool(TFT2)]

        if all(checks) and COMPARISON_METHOD_FRAMES_TIME_PROXIMITY in comp_methods:
            frames_tol = self.time_frames_tol
            startends1 = TFT1.start_end_frames; startends2 = TFT2.start_end_frames
            found_all = True
            for startend1 in startends1:
                found = False
                for startend2 in startends2:
                    if startend2[0] - frames_tol <= startend1[0] and startend1[1] <= startend2[1] + frames_tol:
                        found = True
                        break
                if not found: found_all = False; break
            checks.append(found_all)
                    
        return all(checks) and self.is_partially_in_txt_version(TFT1.get_full_text(),TFT2.get_full_text())
        
    def is_partially_in_txt_version(self,text1:str,text2:str) -> bool:
        '''
        Finds if text1 is partial text of text2
        texts are cleaned of all non alphanumeric characters.

        Then are compared in terms of one or more predefined methods: 
            - diffs percentage of all the merged texts with respect to 3 thresholds:\n
                removed chars from txt1 with respect to txt2 over the total diff\n
                common chars of both texts\n
                added chars in txt1 to reach txt2 over the total diff\n
            - most rich and meaningful text\n
            - removed chars percentage over the string

        
        Order is based on performance maximization
            
        ### No checks are performed on input

        -------

        Returns
        -------
        True if text1 is part of the text2

        '''
        checks = [bool(text1) and bool(text2)]
        comp_methods = self._comp_methods
        removed_chars_count = None

        if all(checks) and COMPARISON_METHOD_TXT_SIM_RATIO in comp_methods:
            cleaner = self._txt_cleaner
            text1_cleaned = cleaner.clean_text(text1); text2_cleaned = cleaner.clean_text(text2)
            counter = Counter([change[0] for change in ndiff(text1_cleaned,text2_cleaned)])
            removed_chars_count = 0 if not '-' in counter.keys() else counter['-']
            common_chars_count = 0 if not ' ' in counter.keys() else counter[' ']
            added_chars_count = 0 if not '+' in counter.keys() else counter['+']
            diffs_len = removed_chars_count+common_chars_count+added_chars_count
            text1_len = len(text1_cleaned)
            checks.append(  diffs_len > 0 and 
                            text1_len > 0 and 
                            removed_chars_count/diffs_len < self.removed_chars_diff_ratio_thresh and 
                            common_chars_count/text1_len > self.common_chars_txt_ratio_thresh  and
                            added_chars_count/diffs_len < self.added_chars_diff_ratio_thresh)
        
        if all(checks) and COMPARISON_METHOD_MEANINGFUL_WORDS_COUNT in comp_methods:
            all_words = self._words
            txt1_split = text1_cleaned.split(); txt2_split = text2_cleaned.split()
            len_txt1_split = len(txt1_split); len_txt2_split = len(txt2_split) 
            checks.append(( 0 < len_txt1_split <= len_txt2_split 
                                and ( len([word for word in txt1_split if word in all_words]) / len(txt1_split) 
                                        <= 
                                      len([word for word in txt2_split if word in all_words]) / len(txt2_split)) ) 
                            or len_txt1_split <= len_txt2_split )
        
        if all(checks) and COMPARISON_METHOD_TXT_MISS_RATIO in comp_methods:
            if removed_chars_count is None:
                cleaner = self._txt_cleaner
                text1_cleaned = cleaner.clean_text(text1); text2_cleaned = cleaner.clean_text(text2)
                counter = Counter([change[0] for change in ndiff(text1_cleaned,text2_cleaned)])
                removed_chars_count = 0 if not '-' in counter.keys() else counter['-']
                text1_len = len(text1_cleaned)
            checks.append(  text1_len > 0 and 
                            removed_chars_count/len(text1_cleaned) < self.removed_chars_txt_ratio_thresh)
        
        return all(checks)

    def are_cosine_similar(self,text1:str,text2:str,confidence:float=0.9) -> bool:
        '''
        Determine if two texts are cosine similar.

        This is evaluated in terms of words mapped to a unique number\n
        ### May collapse when performed on texts with num words = 1 vs 2 or 2 vs 1

        -----------

        Parameters:
        ----------
            - text1 (str): The first text to compare.
            - text2 (str): The second text to compare.
            - confidence (float, optional): The minimum confidence level required to consider
                the texts similar. Defaults to 0.9

        Returns:
        --------
            bool: True if the texts are cosine similar with a confidence level above
                `confidence`, False otherwise.  

        '''
        cleaner = self._txt_cleaner
        text1_clean_split, text2_clean_split = cleaner.clean_text(text1).split(), cleaner.clean_text(text2).split()
        len_split1, len_split2 = len(text1_clean_split), len(text2_clean_split)
        max_len = max(len_split1,len_split2)
        words_set = set(text1_clean_split+text2_clean_split)
        values = list(range(1,len(words_set)+1))
        words_dict = dict(zip(words_set,values))
        text1_vectorized = list(map(lambda key: words_dict[key], text1_clean_split))
        text2_vectorized = list(map(lambda key: words_dict[key], text2_clean_split))
        texts_vectorized = empty((2,max_len),dtype=int)
        texts_vectorized[0,:len_split1] = text1_vectorized; texts_vectorized[0,len_split1:] = 0
        texts_vectorized[1,:len_split2] = text2_vectorized; texts_vectorized[1,len_split2:] = 0
        return sum(prod(texts_vectorized,axis=0))/prod(norm(texts_vectorized,axis=1)) > confidence


    def is_exactly_in_txt_version(self,text1:str,text2:str,chars_tol_percentage:float=0.9):
        '''
        Checks whether there's the same string text1 in text2, within a reasonable margin of error\n
        Based on perfect match from left to right so if text1 has char in second position different\n
        from what is in text2, the match is insignificant\n\n

        TODO can be improved with match in reversed string but might get expensive
        '''
        cleaner = self._txt_cleaner
        clean_text1 = cleaner.clean_text(text1)
        res = re.search(clean_text1,cleaner.clean_text(text2))
        return res is not None and len(res.group(0))/len(clean_text1) > chars_tol_percentage

    def subtract_common_text(self,text1:str,text2:str):
        '''
        Performs text1 - text2 where they are in common
        
        Can be improved by using ndiff alg but for now keep it simple
        '''
        return self._txt_cleaner.clean_text(text1.replace(text2,'').lstrip())

    def set_comparison_methods(self,methods:List[int]):
        self._comp_methods = set(methods)


def lemmatize(lemmas):
    concepts_lemmatized = []

    lemmatizer = WordNetLemmatizer()

    for concept in lemmas:
        lemmatized = ""

        for word in concept.split(" "):
            lemmatized += lemmatizer.lemmatize(word.lower()) + " "

        lemmatized = lemmatized.rstrip()

        if lemmatized not in concepts_lemmatized:
            concepts_lemmatized.append(lemmatized)

    return concepts_lemmatized


def get_real_keywords(video_id, annotator_id=None):
    graphs = db_mongo.get_graphs_info(video_id)
    if graphs is None:
        video_doc = db_mongo.get_video_metadata(video_id)
        return video_doc['title'], video_doc['extracted_keywords']

    indx_annotator = 0
    if annotator_id is not None:
        annotators = graphs['annotators']
        for i,annot in enumerate(annotators):
            if annot['id']==annotator_id:
                indx_annotator = i
                break
    annotator_id = graphs["annotators"][indx_annotator]['id']
    #print("Annotator: ", graphs["annotators"][0]["name"])
    concept_map_annotator = db_mongo.get_concept_map(annotator_id, video_id)
    definitions = db_mongo.get_definitions(annotator_id, video_id)
    keywords = []

    for d in definitions:
        if d["concept"] not in keywords:
            keywords.append(d["concept"])

    for rel in concept_map_annotator:
        if rel["prerequisite"] not in keywords:
            keywords.append(rel["prerequisite"])
        if rel["target"] not in keywords:
            keywords.append(rel["target"])

    return graphs["title"], keywords
    

def get_timed_sentences(subtitles, sentences: List['str']):
    '''For each sentence, add its start and end time obtained from the subtitles'''
    # TODO improvements: add a way to return it as a list of tuples because accessing inside a list of dicts can be slow
    # Compute the number of words for each sentence and for each sub
    num_words_sentence = []
    num_words_sub = []

    for s in sentences:
        num_words_sentence.append(len(s.split()))
    for s in subtitles:
        num_words_sub.append(len(s["text"].split()))

    # Get start and end time of the punctuated sentences from the subtitles
    timed_sentences = [{"text": sentences[0], "start": subtitles[0]["start"]}]

    i = 0
    j = 0

    while i < len(num_words_sentence) and j < len(num_words_sub):
        if num_words_sentence[i] > num_words_sub[j]:
            num_words_sentence[i] = num_words_sentence[i] - num_words_sub[j]
            j += 1  # qui manca controllo su j, ma non serve

        elif num_words_sentence[i] < num_words_sub[j]:
            timed_sentences[i]["end"] = subtitles[j]["end"]
            num_words_sub[j] = num_words_sub[j] - num_words_sentence[i]
            i += 1
            if i < len(num_words_sentence) and j < len(num_words_sub):
                timed_sentences.append({"text": sentences[i], "start": subtitles[j]["start"]})
        else:
            timed_sentences[i]["end"] = subtitles[j]["end"]
            num_words_sentence[i] = 0
            num_words_sub[j] = 0
            i += 1
            j += 1
            if i < len(num_words_sentence) and j < len(num_words_sub):
                timed_sentences.append({"text": sentences[i], "start": subtitles[j]["start"]})

    timed_sentences[len(timed_sentences)-1]["end"] = subtitles[len(subtitles)-1]["end"]

    """
    for i in range(0, len(timed_sentences)):

        start_to_fix = []

        j = i
        tot_length = timed_sentences[j]["start"]

        while j+1 < len(timed_sentences) and timed_sentences[j]["start"] == timed_sentences[j+1]["start"]:
            start_to_fix.append(j)
            if j+1 not in start_to_fix:
                start_to_fix.append(j+1)
                tot_length += len(timed_sentences[j]["text"])
            j+=1

        for k in range(1,len(start_to_fix)):
            time_to_add = len(timed_sentences[k-1]["text"])/tot_length
            timed_sentences[k - 1]["end"] -= time_to_add
            timed_sentences[k]["start"] = timed_sentences[k - 1]["end"]
    """
    return timed_sentences



if __name__ == '__main__':
    text = '=. =\n“Estimation of Stature ws\n[Avitinacint from Intact Long Limb Bones\nUniversity PGi ain «¢\n130, (Fem+Tib) +6329 +259\n238 Fem stat\nCes to.\n\na sme $337\n\n  \n  \n\n  \n    \n    \n  \n\n \n\n(Fem. Tin) +5320 +35!\n\nFi. s5o61 £357\nrib $6153 2366\n0 am\nitimemiiilimmici\nUna 45776 2430\nHum 457897\n‘rotor (970):\n{Eximation of nature from intact long ib Bonet\nInstant O(adPesonal a\nMase Blsnars 1,'
    text1 = 'Forensic Archaeology and Anthropology\nPart.4\nEstimating Stature'
    text2 = 'an\nA Ablinerrin\ni oy\n\nThis example: (2.47 x [bone measurement 45.4cm]) + 54.10cm'
    text3 = 'YY\nS [ 2blteeretiny\n\nLeaves'
    text4 = 'Machine Learning definition'
    text5 = 'La divina commedia di Dante Alighieri è divisa su tre libri'

    print(SemanticText("esperti","it").lemmatize())
    raise Exception()


    print(SemanticText(text2,'en').extract_keywords_from_title())
    print(SemanticText(text4,'en').extract_keywords_from_title())
    print(SemanticText(text5,'it').extract_keywords_from_title())
    #print(extract_title(text))
    #print(TextSimilarityClassifier().is_partially_in(text1,text2))