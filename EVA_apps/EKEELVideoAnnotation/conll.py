import requests, re
from nltk import WordNetLemmatizer
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
    # TODO-TORRE aggiungere ita (FATTO)
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

def create_text(subtitles, conll_sentences, language):
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

                sent["text"] += '<span lemma="' + lemma + '" sent_id="' + str(s) + '" word_id="' + str(
                    word_id) + '" >' + w + '</span> '


                if lemma not in all_lemmas:
                    all_lemmas.append(lemma)

                if sentence_finished:
                    sent_id += 1
                    word_id = 0
                    word_counter = 0

        lemmatized_subtitles.append(sent)

    return lemmatized_subtitles, all_lemmas

if __name__ == '__main__':
    print(conll_gen("L94FfnqrJUk",SemanticText("Hello my name is Ekeel","en")))