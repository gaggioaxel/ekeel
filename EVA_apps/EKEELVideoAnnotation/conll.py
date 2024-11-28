import requests, re
from conllu import parse
import string

from db_mongo import insert_conll_MongoDB, get_conll
from words import SemanticText
from locales import Locale, FORMAT_FULL

class ConllAPISingleton:

    _instance = None
    _models:'dict[str,str]'

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ConllAPISingleton, cls).__new__(cls)

            # Get all the models
            conll_models = sorted(list(requests.post('http://lindat.mff.cuni.cz/services/udpipe/api/models').json()['models'].keys()))

            langs = sorted(list(Locale().get_supported_languages(FORMAT_FULL)))
            target_langs_models = {lang:[] for lang in langs}

            # Selects only those that are based on supported languages
            for model_name in conll_models:
                model_name_lang = model_name.split("-")[0]
                if model_name_lang < langs[0]:
                    pass
                elif any(model_name_lang == lang for lang in langs):
                    for lang in langs:
                        if lang == model_name_lang:
                            target_langs_models[lang].append(model_name)
                elif model_name_lang > langs[-1]:
                    break
            
            # Filters by best performing model and most recent version
            for lang, models_names in target_langs_models.items():
                for model_name in models_names:
                    _,train_kind,_,version,_ = model_name.split('-')
                    major_version, minor_version = map(int, version.split('.'))
                    if train_kind in ["ewt", "partut"] and \
                            (major_version > 2 or (major_version == 2 and minor_version >= 12)):
                        target_langs_models[lang] = model_name
                        break
            
            # Maps to pt1 for compliance
            for lang in langs:
                target_langs_models[Locale().get_pt1_from_full(lang)] = target_langs_models[lang]
                target_langs_models.pop(lang)
            cls._models = target_langs_models
        return cls._instance

CONLL = ConllAPISingleton() 

def conll_gen(video_id:str,text:SemanticText):
    """
    Takes a text as input and return a conll file
    :param text: txt
    :return sentence: conll of the text
    """
    # checks whether the conll is already on server
    conll = get_conll(video_id)
    
    if conll is not None:
        return parse(conll)
    
    # requests the conll from an api
    # aggiunto ita
    #files = {
    #    'data': text,
    #    'model': (None, 'english-ewt-ud-2.4-190531'),
    #    'tokenizer': (None, ''),
    #    'tagger': (None, ''),
    #    'parser': (None, ''),
    #}
    files = {
        'data': text.get_text(),
        'model': (None, CONLL._models[text.get_language()]),
        'tokenizer': (None, ''),
        'tagger': (None, ''),
        'parser': (None, ''),
    }
    r = requests.post('http://lindat.mff.cuni.cz/services/udpipe/api/process', files=files)
    re = r.json()

    # json da salvare
    conll = re['result']
    insert_conll_MongoDB({'video_id':video_id, 'conll':conll})
    return parse(conll)
    

# get text from a conll in the db
def get_text(video_id:str, return_conll=False):
    conll = get_conll(video_id)
    
    if conll is None:
        return None
    
    parsed = parse(conll)
    text = " ".join([sentence.metadata['text'] for sentence in parsed])
    if return_conll:
        return text, conll
    return text

def html_interactable_transcript_legacy(subtitles, conll_sentences, language):
    """
    Creation of the transcript, every word is a span element with attributes sent_id and word_id, corresponding to the
    sentence id and word id of the conll.
    """
    #lemmatizer = WordNetLemmatizer()
    sem_text = SemanticText("",language)

    sent_id = 0
    word_id = 0
    word_counter = 0

    all_lemmas = []
    lemmatized_subtitles = []

    for sub in subtitles:
        sent = {"text": ""}
        text:str = sub["text"]
        text = text.replace("\n", " ").replace("’", " ’").replace("'", " '")
        in_phrase_word_indx = 0


        # # aggiungo uno spazio vuoto prima e dopo la punteggiatura
        # text = re.sub('([.,!?():])', r' \1 ', text)
        # text = re.sub('\s{2,}', ' ', text)
        text = text.replace("/", " / ")#.replace("-", " - ")
        text = text.replace("'", " '").replace("’", " ’").replace("”", " ” ").replace("“", " “ ")
        if language == "it":
            text = text.replace("l '","l' ")
        #text_words = text.split(" ")
        text_words = re.split(' |-', text)
        #print(text_words)
        for w in text_words:
            sentence_finished = False
            if w != '':

                if w not in [".",":","?","!",",",";","/","“","'",'"',"”"]:

                    text_word = w.lower().translate(str.maketrans('', '', string.punctuation))\
                        .replace('”', '').replace("“", "").replace('…', '')

                    # there is a bug where sent_id value is over the len of conll_senteces
                    # i add this if to solve it
                    if sent_id < len(conll_sentences):
                        conll_words = conll_sentences[sent_id].filter(upos=lambda x: x != "PUNCT")

                    for i, c in enumerate(conll_words):
                        if "-" in c["form"]:
                            conll_words.insert(i, c.copy())
                            conll_words[i]["form"] = conll_words[i]["form"].split("-")[0]
                            conll_words[i+1]["form"] = conll_words[i+1]["form"].split("-")[1]

                    for i in range(word_counter, len(conll_words)):

                        conll_word = str(conll_words[i]["form"]).lower().translate(str.maketrans('', '', string.punctuation))
                        #print( conll_word, text_word)

                        if text_word == conll_word:
                            word_id = conll_words[i]["id"]
                            word_counter += 1

                            if conll_words[i]["id"] == conll_words[-1]["id"]:
                                sentence_finished = True
                            break

                if w in ["!", "?", "."]:
                    s = sent_id
                else:
                    s = sent_id + 1

                #print(s)
                toLemmatize = w.lower()
                if toLemmatize[-1] in ["?", ".", "!", ";", ","]:
                    toLemmatize = toLemmatize[:-1]
                sem_text.set_text(toLemmatize)
                lemma = sem_text.lemmatize()[0]
                #lemma = lemmatizer.lemmatize(toLemmatize)
                #print(toLemmatize, lemma)
                #print(sub)
                
                sent["text"] += f'<span lemma="{lemma}" sent_id="{str(s)}" word_id="{str(word_id)}" start_time="{sub["start"]}" end_time="{sub["end"]}" >' + w + '</span> '


                if lemma not in all_lemmas:
                    all_lemmas.append(lemma)

                if sentence_finished:
                    sent_id += 1
                    word_id = 0
                    word_counter = 0
                in_phrase_word_indx += 1

        lemmatized_subtitles.append(sent)

    return lemmatized_subtitles, all_lemmas

#def html_interactable_transcript_word_old(subtitles:list, language:str, concepts:list=None):
#    """
#    creates the html code (hard coded) from subtitles and concept by lemmatizing and incapsulating one or multiple words concepts
#     
#    Args:
#        subtitles (list): list of dict of subtitles
#        language (str): language for the lemmatizer
#        concepts (list, optional): pre-highlight concepts given. Defaults to None.
#
#    Returns:
#        html_lemmatized_sents: html code of the trascript
#        all_lemmas: list of all lemmas
#    """
#    sem_text = SemanticText("",language)
#    concepts = [] if concepts is None else [concept.split(" ") for concept in concepts]
#    sent_id = 0
#    all_lemmas = []
#    html_lemmatized_sents = []
#    
#    def get_lemma_and_align_punctuation(word, word_id):
#        word_text:str = word["word"]
#        to_lemmatize = word_text.strip().lower()
#            
#        # Remove 'word (example dell'autista split into del 'autista)
#        if to_lemmatize.startswith("'"):
#            to_lemmatize = to_lemmatize[1:]
#            word_text = word_text[1:]
#        # Remove punctuation
#        if to_lemmatize[-1] in ["?", ".", "!", ";", ","]:
#            to_lemmatize = to_lemmatize[:-1]
#        
#        # Reassigns the apostrophe to the correct letter
#        if word_id + 1 < len(words) and words[word_id + 1]["word"].startswith("'"):
#            word_text += "' "
#        lemma = sem_text.set_text(to_lemmatize, language).lemmatize()[0]
#        
#        return word_text, lemma
#        
#        
#    # For every sentence
#    for sent_id, sub in enumerate(subtitles):
#        html_sent = []
#        word_id = 0
#        words = sub["words"]
#        
#        # For every word
#        for word_index,word_sub in enumerate(words):
#            word_text, lemma = get_lemma_and_align_punctuation(word_sub, word_index)
#            #print(word_text,"->", lemma)
#            if lemma not in all_lemmas:
#                all_lemmas.append(lemma)
#                
#            added_concept_class = ""
#            
#            for concept in concepts:
#                if concept[0] == lemma:
#                    if len(concept) == 1:
#                        added_concept_class += ' class= "concept"'
#                        
#                    elif len(concept) > 1:
#                        next_word_indx = word_index + 1
#                        concept_indx = 1
#                        perfect_match = True
#                        while next_word_indx < len(words) and concept_indx < len(concept):
#                            _, next_lemma = get_lemma_and_align_punctuation(words[next_word_indx], next_word_indx)
#                            #print(concept[concept_indx], next_lemma)
#                            if concept[concept_indx] not in next_lemma:
#                                perfect_match = False
#                                break
#                            elif concept[concept_indx] == next_lemma or next_lemma.endswith(concept[concept_indx]):
#                                next_word_indx += 1
#                            concept_indx += 1
#                        if perfect_match:
#                            html_sent += [f'<span class="concept" lemma="{"_".join(concept)}">']
#
#            if len(lemma.split(" ")) == 2:
#                html_sent += [f'<span{added_concept_class} lemma="{lemma}" sent_id="{str(sent_id)}" word_id="({str(word_id)+"-"+str(word_id+1)})" start_time="{word_sub["start"]}" end_time="{word_sub["end"]}" >{word_text}</span>']
#                word_id += 2
#            else:
#                html_sent += [f'<span{added_concept_class} lemma="{lemma}" sent_id="{str(sent_id)}" word_id="{str(word_id)}" start_time="{word_sub["start"]}" end_time="{word_sub["end"]}" >{word_text}</span>']
#                word_id += 1
#                
#        if len(concepts):
#            multi_word_concept:str = None
#            for i, sent in enumerate(html_sent):
#                sent:str
#                if multi_word_concept is not None:
#                    lemma = sent.split('lemma="')[1].split('"')[0]
#                    #print(lemma, multi_word_concept, sent)
#                    if lemma not in multi_word_concept:
#                        html_sent.insert(i, "</span>")
#                        multi_word_concept = None
#                        print(html_sent[i-5:i+2])
#                    else:
#                        multi_word_concept = multi_word_concept.replace(lemma,"",1)
#                if not "</span>" in sent:
#                    #print(sent)
#                    multi_word_concept = " ".join(sent.split('"')[-2].split("_"))
#        html_lemmatized_sents.append({"text": "".join(html_sent)})
#        #print(html_lemmatized_sents[-1])
#    
#    
#    return html_lemmatized_sents, all_lemmas
    
def html_interactable_transcript_word_level(sentences):
    html_lemmatized_sents = []
    for sent_id, sentence in enumerate(sentences):
        html_sent = []
        for word_id, word in enumerate(sentence["words"]):
            word_text = word["word"]
            html_sent += [f'<span lemma="{word["lemma"]}"' +
                                f' sent_id="{str(sent_id)}"' +
                                f' word_id="{str(word_id)}"' +
                                f' start_time="{word["start"]}"' +
                                f' end_time="{word["end"]}"' +
                                f' cpos="{word["cpos"]}"' +
                                f' pos="{word["pos"]}"' +
                                f' gen="{word["gen"]}"' +
                                f' num="{word["num"]}" >' +
                                f'{word_text}' +
                            '</span>', " "]
            # if articulated preposition with apostrophe eg. "dell'" 
            # or verb with after a cyclic pronoun eg. "specchiar-si" 
            # or word that has a punctutation mark after
            # don't add space between 
            if ((word["pos"] in ["EA","E"] or word["cpos"] == "R") and word["word"].endswith("'")) or \
                (word["cpos"] == "V" and word_id + 1 < len(sentence["words"]) and sentence["words"][word_id+1]["pos"] == "PC") or \
                (word_id + 1 < len(sentence["words"]) and sentence["words"][word_id+1]["pos"] in ["FC","FF","FS"]) :
               html_sent.pop()
        html_lemmatized_sents.append({"text": "".join(html_sent)})
    return html_lemmatized_sents

if __name__ == '__main__':
    from segmentation import VideoAnalyzer
    vid = VideoAnalyzer("https://www.youtube.com/watch?v=jBcCqelFgCE")
    print(html_interactable_transcript_word_level(vid.data["transcript_data"]["text"]))
    #print(conll_gen("L94FfnqrJUk",SemanticText("Hello my name is Ekeel","en")))