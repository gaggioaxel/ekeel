#coding=utf-8
from transformers import pipeline, BartTokenizer, AutoTokenizer, AutoModelForSeq2SeqLM
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sacrerouge.metrics import QAEval

import spacy
import pytextrank
import rougescore
import rouge
import torch
import subprocess
import language_tool_python
import json
import os
import bert_score

def extractor(text):
    nlp = spacy.load("en_core_web_sm")
    #Add PyTextRank to the spaCy pipeline
    nlp.add_pipe("textrank")
    doc = nlp(str(text))
    extract= ""
    for sent in doc._.textrank.summary(limit_phrases=20):
        extract += str(sent)
    return extract

def abstractor(text):
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summary = summarizer(text, min_length=50, do_sample=False)
    summ = summary[0]["summary_text"]+"\n"
    return summ

def stopwords(text):
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text)
    filtered_sentence = [w for w in word_tokens if not w.lower() in stop_words]
    filtered_sentence = []
    for w in word_tokens:
        if w not in stop_words:
            filtered_sentence.append(w)
    ssumm = ""
    for x in filtered_sentence:
        if ("'" not in x and "," not in x and "." not in x):
            ssumm += ' '
        ssumm += x
        if ("." in x):
            ssumm+=' '
    return ssumm

def removeTime(text):
    #Removes timestamps
    for i in range(0,60):
        for j in range(0,60):
            p1 = str(i)
            p2 = str(j)
            if i<10:
                p1 = "0"+str(i)
            if j<10:
                p2 = "0"+str(j)
            stringa = p1+":"+p2
            string2 = p1+""+p2
            text = text.replace(stringa, "")
            text = text.replace(string2, "")
    for i in range(0,6000):
        text = text.replace(str(i)+"\n", "")
    return text

def buildPos(text):
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    pos = ""
    for token in doc:
        if token.pos_ != "PUNCT":
            pos += token.pos_+" "
        else:
            pos += str(token)+" "
    pos = pos.replace("-", " ")
    pos = pos.replace(" SYM", " NOUN")
    pos = pos.replace(" /", " NOUN")
    pos = pos.replace(" SPACE", "")
    pos = pos.split(".")
    return pos

def correct(inp):
    score = 0
    corr = ""
    for pos in inp:
        if len(pos) > 1:
            pos += ". #"
        backup = pos
        loop = True
        q = 0
        if pos == " . #" or pos == ". #" or pos == " . # " or pos == ". # ":
            break
        while loop:
            if q > 30:
                print("Couldn't process the sentence")
                break
            print(q)
            print(pos)
            loop = False
            try:
                result = subprocess.run(['./parser2'], input = pos, capture_output = True, encoding = 'UTF-8', timeout = 15)
                out = result.stdout
                print(out)
                out = out.split("\n")
                i = -1
                lispos = pos.split(" ")
                b = False
                for x in out:
                    if x.count("Unexpected"):
                        if x.count("after"):
                            lispos.pop(i)
                        if x.count("before"):
                            lispos.pop(i-1)
                    elif x.count("missing"):
                        b = False
                        if x.count("verb"):
                            lispos.insert(i, "VERB")
                    if b==True:
                        b = False
                        lispos.pop(i)
                    if x.count("syntax error"):
                        loop = True
                        b = True
                        q += 1
                    if x.count("syntax error")==0 and len(x)!=0:
                        i+=1
                re =""
                for x in lispos:
                    if x.count("#"):
                        re+=x
                    else:
                        re+=x+" "
                pos = re
            except subprocess.TimeoutExpired:
                print('process ran too long')
                pass
        corr += pos
        score += q
    return corr, score

for x in os.scandir("./corr"):
    if "sum" not in str(x):
        print(x)
        a = str(x).find("'") +1
        b = str(x)[a:].find("'") +a
        name = str(x)[a:b]
        g = open("./corr/"+name[:name.find(".")]+"sum.txt").readlines()
        gold = ""
        for i in g:
            gold += i+" "
        f = open(x).readlines()
        f = open("./corr/chem01re.txt")
        os.environ["TOKENIZERS_PARALLELISM"] = "false"
        # Text Rank: load a spaCy model, depending on language, scale, etc.
        text=''
        for i in f:
            text += i+" "
        #Preprocessing
        text = text.replace("--", ",")
        text = text.replace("-", " ")
        text = text.replace("'ll", " will")
        text = text.replace("'re", " are")
        text = text.replace("'d", " would")
        text = text.replace("'m", " am")
        text = text.replace("n't", " not")
        text = text.replace(":", "")
        text = text.replace("..", ".")
        text = text.replace(",.", ".")
        text = text.replace(",,", ",")
        text = text.replace(",;", ";")
        text = text.replace(";,", ";")
        text = text.replace(",!", "!")
        text = text.replace("!,", "!")
        #Stopwords removal
        #text = stopwords(text)
        text = removeTime(text)
        extract = extractor(text)
        # BART model
        abstract = abstractor(extract)
        gold = ""
        for i in open("Dataset/blockchain02sum.txt").readlines():
            gold += i
        roug = rouge.Rouge()
        scores = roug.get_scores(abstract, gold)
        print("Gold vs BART")
        print(scores)
        print("Bertscore: "+str(bert_score.score([abstract], [gold], lang='en')))
        print("original vs extr")
        scores3 = roug.get_scores(extract, text)
        print(scores3)
        print("original vs abstr")
        scores4 = roug.get_scores(abstract, text)
        print(scores4)
        print("extr vs abstr")
        print(roug.get_scores(abstract, extract))
        print("Bertscore: "+str(bert_score.score([abstract], [extract], lang='en')))
        abpos = buildPos(abstract)
        b = False
        backupult = abpos
        expos = buildPos(extract)
        excorr, exscore = correct(expos)
        abcorr, abscore = correct(abpos)
        print("Complete original sentence")
        print(expos)
        print("Complete corrected sentence")
        excorr = excorr.replace("#", "")
        print(excorr)
        print("Complete original sentence")
        print(abpos)
        print("Complete corrected sentence")
        abcorr = abcorr.replace("#", "")
        print(abcorr)
        print(exscore)
        print(abscore)
        print(abscore/exscore)
