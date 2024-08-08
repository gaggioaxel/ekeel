#------------------------------------------------------------------
# Class for evaluating prerequisite relationship using temporal
# patterns
#
# Author: sampas85
# Integrated in EKEEL by Luca Mirenda
#------------------------------------------------------------------
import pandas as pd

from rdflib import Graph, URIRef, RDF, BNode, ConjunctiveGraph, Namespace
from rdflib.namespace import SKOS, XSD
from rdflib.term import Literal
from rdflib.serializer import Serializer

from burst_extractor import BurstExtractor
from burst_weight_assigner import WeightAssigner
from burst_weight_normalizer import WeightsNormalizer
import burst_results_processor as burst_proc
from segmentation import VideoAnalyzer
import sys
import copy
from conllu import parse
from conll import get_text
from db_mongo import get_conll
import agreement
from segmentation import get_timed_sentences
from nltk import tokenize
import time
import datetime
from nltk import WordNetLemmatizer
from numpy import delete


import json
import pyld

from itertools_extension import double_iterator
from db_mongo import get_video_data

oa = Namespace("http://www.w3.org/ns/oa#")
dc = Namespace("http://purl.org/dc/elements/1.1/")
dctypes = Namespace("http://purl.org/dc/dcmitype/")
dcterms = Namespace("http://purl.org/dc/terms/")
edu = Namespace("https://teldh.github.io/edurell#")

data = {}
videoid = ""


edurell = "https://teldh.github.io/edurell#"





def burst_extraction(video_id, concepts, n=90):
    print("***** EKEEL - Video Annotation: burst_class.py::burst_extraction(): Inizio ******")

    text, conll = get_text(video_id, return_conll=True)
    text = text.replace("-", " ")


    concept_map_burst, burst_definitions = Burst(text, concepts, video_id, conll, threshold=0.7,
                                                 top_n=n, max_gap=1).launch_burst_analysis()

    return concept_map_burst, burst_definitions

# Get mapping of concepts and synonyms to selected word (alphabetically)
def get_synonyms_mappings(conceptVocabulary):
    print("***** EKEEL - Video Annotation: burst_class.py::get_synonyms_mappings(): Inizio ******")
    
    syn_map = {}
    new_concepts = []

    # get unique id for each syn set
    for concept in conceptVocabulary:
        synset = [concept]
        synset = synset + conceptVocabulary[concept]
        synset.sort()
        syn_map[concept] = synset[0]
        new_concepts.append(synset[0])

    new_concepts = list(set(new_concepts))
    
    print("***** EKEEL - Video Annotation: burst_class.py::get_synonyms_mappings(): Fine ******")
    return syn_map, new_concepts

def burst_extraction_with_synonyms(video_id, concepts, conceptVocabulary, n=90):
    print("***** EKEEL - Video Annotation: burst_class.py::burst_extraction_with_synonyms(): Inizio ******")

    text, conll = get_text(video_id, return_conll=True)
    text = text.replace("-", " ")

    syn_map, new_concepts = get_synonyms_mappings(conceptVocabulary)

    concept_map_burst, burst_definitions = Burst(text, new_concepts, video_id, conll, syn_map, threshold=0.7,
                                                 top_n=n, max_gap=1).launch_burst_analysis()

    print("***** EKEEL - Video Annotation: burst_class.py::burst_extraction_with_synonyms(): Fine ******")
    return concept_map_burst, burst_definitions

class Burst:

    def __init__(self, text, words, video_id, conll, syn_map=False, threshold=0,  top_n=None, s=1.05, gamma=0.0001, level=1, allen_weights=None,
                 use_inverses=False, max_gap=4, norm_formula="modified"):#occ, f,
        self.text = text
        self.words = words

        self.conll = parse(conll)
        self.video_id = video_id
        self.threshold = threshold
        self.top_n = top_n
        self.data = {}


        #Kleinberg's parameters
        self.S = s
        self.GAMMA = gamma
        self.LEVEL = level

        # #self.occurences
        # #Dataframe contentente le colonne "Lemma", "idFrase", "idParolaStart"
        occurrences_index = []
        self.first_occurence = {}

        '''
        PHASE 0
        Initialize self.occurrences that contains every word and their positions in the conll's sentences
        '''

        max_word_lenght = 0

        for w in self.words:
            l = len(w.split(" "))
            if l > max_word_lenght:
                max_word_lenght = l

        upper_words = [x.upper() for x in self.words]
        lemmatizer = WordNetLemmatizer()


        for sent in self.conll:
            sent_index = int(sent.metadata["sent_id"])-1
            conll_words = self.conll[sent_index].filter(upos=lambda x: x != "PUNCT")
            #from pprint import pprint
            #pprint(self.conll)
            counter = 0
            skip = 0

            for i_, word in enumerate(conll_words):
                #print(word, word["id"], conll_words[i_+1],conll_words[i_+1]["id"], conll_words[i_+2],conll_words[i_+2]["id"])
                if isinstance(word["id"], tuple): skip += 2
                elif skip > 0: skip -= 1; continue
                counter += 1
                #word_index = int(word["id"]) # TODO fix
                word_index = counter
                words = word["lemma"]
                words_form = word["form"]
                nltk_lemmatized = lemmatizer.lemmatize(word["form"])

                for i in range(1, max_word_lenght+1):

                    occ_words = ""
                    # cerco occorrenza della parola nella forma base, lemmatizata con la conll e lematizzata con nltk
                    if words.upper() in upper_words:
                        occ_words = words.lower()
                    elif words_form.upper() in upper_words:
                        occ_words = words_form.lower()
                    elif nltk_lemmatized.upper() in upper_words:
                        occ_words = nltk_lemmatized

                    if occ_words != "":
                        if occ_words not in self.first_occurence:
                            self.first_occurence[occ_words] = sent_index

                        d = [occ_words, sent_index, word_index]
                        occurrences_index.append(d)

                    if i + i_ < len(conll_words):
                        words += " " + conll_words[i_ + i]["lemma"]
                        words_form += " " + conll_words[i_ + i]["form"]
                        nltk_lemmatized += " " + lemmatizer.lemmatize(conll_words[i_ + i]["form"])
                    else:
                        break

        
        if syn_map == False:
            self.occurrences = pd.DataFrame(data=occurrences_index, columns=["Lemma", "idFrase", "idParolaStart"])
        else:
            occur = pd.DataFrame(data=occurrences_index, columns=["Lemma", "idFrase", "idParolaStart"])
            new_occur = []
            for o in occur.itertuples(): 
                new_occur.append([syn_map[o.Lemma], o.idFrase, o.idParolaStart])
            self.occurrences = pd.DataFrame(new_occur, columns=['Lemma', 'idFrase', 'idParolaStart'])


        # weights for Allen and type of normalization formula
        if allen_weights is None:
            self.ALLEN_WEIGHTS = {'equals': 2, 'before': 5, 'after': 0, 'meets': 3, 'met-by': 0,
                             'overlaps': 7, 'overlapped-by': 1, 'during': 7, 'includes': 7,
                             'starts': 4, 'started-by': 2, 'finishes': 2, 'finished-by': 8}
        else:
            self.ALLEN_WEIGHTS = allen_weights


        self.USE_INVERSES = use_inverses
        self.MAX_GAP = max_gap
        self.NORM_FORMULA = norm_formula

        # decide if preserve relations when giving direction to the burst matrix
        self.PRESERVE_RELATIONS = True

    def _merge_contained_definitions(self,definitions:dict):

        def parse_time(stringed_time:str):
            #            h                    :              mm            :             ss          .            dddddd
            return int(stringed_time[0])*3600 + int(stringed_time[2:4])*60 + int(stringed_time[5:7]) + float("0"+stringed_time[7:])

        to_remove_indexes = []
        for i,j,elem1,elem2 in double_iterator(definitions,enumerated=True):
            if not i in to_remove_indexes \
            and not j in to_remove_indexes \
            and elem1["concept"] == elem2["concept"] \
            and elem1["description_type"] == elem2["description_type"] \
            and parse_time(elem1["start"]) < parse_time(elem2["end"]) \
            and parse_time(elem2["start"]) <= parse_time(elem1["end"]):
                elem1["end"] = elem2["end"]
                elem1["end_sent_id"] = elem2["end_sent_id"]
                to_remove_indexes.append(j)

        return delete(definitions,to_remove_indexes).tolist()

    def launch_burst_analysis(self):
        print("***** EKEEL - Video Annotation: burst_class.py::launch_burst_analysis() ******")
        """Launch Burst analysis"""
        try:
            # FIRST PHASE: extract bursts
            #print("Extracting bursts...\n")

            #print("text")
            #print(self.text)
            #print("words")
            #print(self.words)
            #print("occurrences")
            #print(self.occurrences[0:50])

            burst_extr = BurstExtractor(text=self.text, wordlist=self.words)
            burst_extr.find_offsets(words=self.words, occ_index_file=self.occurrences)
            burst_extr.generate_bursts(s=self.S, gamma=self.GAMMA)
            burst_extr.filter_bursts(level=self.LEVEL, save_monolevel_keywords=True, replace_original_results=True)
            burst_extr.break_bursts(burst_length=30, num_occurrences=3, replace_original_results=True)
            burst_res = burst_extr.bursts

            if burst_res.empty:
                raise ValueError("The chosen parameters do not produce results")

            # obtain json with first, last, ongoing, unique tags
            # bursts_json = burst_proc.get_json_with_bursts(burst_res, self.occurrences)



            # SECOND PHASE: detect relations between bursts and assign weights to them
            #print("Detecting Allen's relations and assign weights to burst pairs...\n")
            weight_assigner = WeightAssigner(bursts=burst_res,
                                             relations_weights=self.ALLEN_WEIGHTS)
            weight_assigner.detect_relations(max_gap=self.MAX_GAP, alpha=0.05, find_also_inverse=self.USE_INVERSES)
            # output data for the gantt interface and ML projects
            burst_pairs_df = weight_assigner.burst_pairs

            bursts_weights = weight_assigner.bursts_weights


            # THIRD PHASE: normalize the bursts' weights
            #print("Normalizing the matrix with weights of burst pairs...\n")
            weight_norm = WeightsNormalizer(bursts=burst_res,
                                            burst_pairs=burst_pairs_df,
                                            burst_weight_matrix=bursts_weights)
            weight_norm.normalize(formula=self.NORM_FORMULA, occ_index_file=self.occurrences)

            burst_norm = weight_norm.burst_norm.round(decimals=6)


            # FINAL STEP: give directionality to bursts
            #print("Giving directionality to the concept matrix built with bursts...\n")

            directed_burst = burst_proc.give_direction_using_first_burst(undirected_matrix=burst_norm,
                                                                         bursts_results=burst_res,
                                                                         indexes=self.occurrences,
                                                                         level=self.LEVEL, preserve_relations=self.PRESERVE_RELATIONS)

            # add rows and columns in the matrices for possible discarded terms
            #print("\nAdding rows and columns for missing concepts in the burst matrix...\n")
            missing_terms = [term for term in self.words
                             if term not in directed_burst.index]

            for term in missing_terms:
                directed_burst.loc[term] = 0
                directed_burst[term] = 0

            #print("Shape of final directed burst matrix:", directed_burst.shape)

            # get an edgelist with the extracted prerequisite relations
            #print("Getting an edgelist with the extracted prerequisite relations...\n")
            sorted_edgelist = pd.DataFrame(burst_proc.to_edgelist(directed_burst),
                                           columns=["prerequisite", "target", "weight"])

            concept_map, definitions = self.df_to_data(sorted_edgelist, burst_res, use_conll=True)
            return concept_map, self._merge_contained_definitions(definitions)


        except ValueError as e:
            print("error:", sys.exc_info())
            #self.updateStatus("failed")
            raise e




    def df_to_data(self, sorted_edgelist, burst_res, use_conll=False):
        print("***** EKEEL - Video Annotation: burst_class.py::df_to_data() ******")
        ''' Transform burst dataframe results in data '''

        concept_map = []
        definitions = []

        video = VideoAnalyzer("https://www.youtube.com/watch?v="+self.video_id)
        video.request_transcript()
        subtitles = video.data["transcript_data"]["timed_text"]
        
        if not use_conll:
            sentences = tokenize.sent_tokenize(self.text)
        else:
            sentences = [sent.metadata["text"] for sent in self.conll]

        timed_sentences = get_timed_sentences(subtitles, sentences)

        if self.top_n is not None:
            sorted_edgelist = sorted_edgelist.head(self.top_n)

        for rel in sorted_edgelist.itertuples():
            if self.threshold < rel.weight:

                if self.first_occurence[rel.prerequisite] > self.first_occurence[rel.target]:
                    sent_id = self.first_occurence[rel.prerequisite]
                else:
                    sent_id = self.first_occurence[rel.target]

                a = {"prerequisite": rel.prerequisite,
                     "target": rel.target,
                     "creator": "Burst_Analysis",
                     "weight": "Strong",
                     "time": str(datetime.timedelta(seconds=timed_sentences[sent_id]["start"])),
                     "sent_id": sent_id,
                     "xywh": "None",
                     "word_id": "None",
                     "weight_burst":rel.weight
                     }
                if a not in concept_map:
                    concept_map.append(a)

        concept_longest_burst = {}

        for d in burst_res.itertuples():
            burst_len = d.end - d.start
            if d.keyword not in concept_longest_burst:
                concept_longest_burst[d.keyword] = burst_len

            elif burst_len > concept_longest_burst[d.keyword]:
                concept_longest_burst[d.keyword] = burst_len

        for d in burst_res.itertuples():
            if d.end - d.start > 1:

                if concept_longest_burst[d.keyword] == d.end - d.start:
                    descr_type = "Definition"
                else:
                    descr_type = "In Depth"

                definitions.append({
                    "concept": d.keyword,
                    "start_sent_id": d.start,
                    "end_sent_id": d.end,
                    "start": str(datetime.timedelta(seconds=timed_sentences[d.start]["start"])),
                    "end": str(datetime.timedelta(seconds=timed_sentences[d.end]["end"])),
                    "description_type": descr_type,
                    "creator": "Burst_Analysis"
                })

        #_,jsonld = create_burst_graph(self.video_id,definitions, concept_map)

        return concept_map, definitions


def compute_agreement_burst(concept_map1, concept_map2):
    print("***** EKEEL - Video Annotation: burst_class.py::compute_agreement_burst() ******")

    words = []
    user1 = "gold"
    user2 = "burst"

    for rel in concept_map1:
        if rel["prerequisite"] not in words:
            words.append(rel["prerequisite"])

        if rel["target"] not in words:
            words.append(rel["target"])

    for rel in concept_map2:
        if rel["prerequisite"] not in words:
            words.append(rel["prerequisite"])

        if rel["target"] not in words:
            words.append(rel["target"])

    all_combs = agreement.createAllComb(words)

    # Calcolo agreement kappa no-inv all paths
    term_pairs = {user1: [], user2: []}
    term_pairs_tuple = {user1: [], user2: []}
    term_pairs[user1], all_combs, term_pairs_tuple[user1] = agreement.createUserRel(concept_map1, all_combs)
    term_pairs[user2], all_combs, term_pairs_tuple[user2] = agreement.createUserRel(concept_map2, all_combs)

    coppieannotate, conteggio = agreement.creaCoppieAnnot(user1, user2, term_pairs, all_combs, term_pairs_tuple)


    results = {"analysis_type": "agreement",
               "agreement":round(agreement.computeK(conteggio, all_combs), 3)}

    return results



def create_burst_graph(video_id,definitions,concept_map):

    print("***** EKEEL - Video Annotation: burst_class.py::create_burst_graph(): Inizio ******")

    creator = URIRef("Burst_Analysis")
    
    g = Graph()

    g.bind("oa", oa)
    g.bind("dctypes", dctypes)
    g.bind("edu", edu)
    g.bind("SKOS", SKOS)
    g.bind("dcterms", dcterms)


    video = URIRef("video_" + str(video_id))
    #video = URIRef(edurell + "video_" + str(video_id))
    g.add((video, RDF.type, dctypes.MovingImage))

    conll = URIRef("conll_" + str(video_id))
    #conll = URIRef(edurell + "conll_" + str(video_id))
    g.add((conll, RDF.type, dctypes.Text))


    # linking video conll
    ann_linking_conll = URIRef("ann0")
    g.add((ann_linking_conll, RDF.type, oa.Annotation))
    g.add((ann_linking_conll, oa.motivatedBy, edu.linkingConll))
    g.add((ann_linking_conll, oa.hasBody, conll))
    g.add((ann_linking_conll, oa.hasTarget, video))

    date = Literal(datetime.datetime.fromtimestamp(time.time()))

    #creo il nuovo nodo dei concetti
    #localVocabulary = URIRef("localVocabulary")
    #g.add((localVocabulary, RDF.type, SKOS.Collection))


    # add triples for every annotation
    for i, annotation in enumerate(definitions):
        ann = URIRef("ann" + str(i + 1))

        g.add((ann, RDF.type, oa.Annotation))

        g.add((ann, dcterms.creator, creator))

        g.add((ann, dcterms.created, date))
        g.add((ann, oa.motivatedBy, oa.describing))
        if annotation["description_type"] == "In Depth":
            g.add((ann, SKOS.note, Literal("conceptExpansion")))
        if annotation["description_type"] == "Definition":
            g.add((ann, SKOS.note, Literal("concept"+annotation["description_type"]))) 

        concept = URIRef("concept_" + annotation["concept"].replace(" ", "_"))

        
        #g.add((localVocabulary, SKOS.member, concept))
        #g.add((concept, RDF.type, SKOS.Concept))


        g.add((ann, oa.hasBody, concept))

        blank_target = BNode()

        
        blank_selector = BNode()

        g.add((ann, oa.hasTarget, blank_target))
        g.add((blank_target, RDF.type, oa.SpecificResource))

        g.add((blank_target, oa.hasSelector, blank_selector))
        g.add((blank_selector, RDF.type, oa.RangeSelector))

        g.add((blank_target, oa.hasSource, video))

        blank_startSelector = BNode()
        blank_endSelector = BNode()

        g.add((blank_startSelector, RDF.type, edu.InstantSelector))
        g.add((blank_endSelector, RDF.type, edu.InstantSelector))

        g.add((blank_selector, oa.hasStartSelector, blank_startSelector))
        g.add((blank_selector, oa.hasEndSelector, blank_endSelector))

        g.add((blank_startSelector, RDF.value, Literal(annotation["start"] + "^^xsd:dateTime")))
        g.add((blank_startSelector, edu.conllSentId, Literal(annotation["start_sent_id"])))
        #g.add((blank_startSelector, edu.conllWordId, Literal(annotation["word_id"])))

        g.add((blank_endSelector, RDF.value, Literal(annotation["end"] + "^^xsd:dateTime")))
        g.add((blank_endSelector, edu.conllSentId, Literal(annotation["end_sent_id"])))
        

    num_definitions = len(definitions) + 1

    for i, annotation in enumerate(concept_map):
        ann = URIRef("ann" + str(num_definitions + i))

        target_concept = URIRef("concept_" +  annotation["target"].replace(" ", "_"))
        prereq_concept = URIRef("concept_" +  annotation["prerequisite"].replace(" ", "_"))

        #g.add((target_concept, RDF.type, SKOS.Concept))
        #g.add((prereq_concept, RDF.type, SKOS.Concept))

        g.add((ann, RDF.type, oa.Annotation))

        g.add((ann, dcterms.creator, creator))

        g.add((ann, dcterms.created, date))
        g.add((ann, oa.motivatedBy, edu.linkingPrerequisite))

        g.add((ann, oa.hasBody, prereq_concept))
        g.add((ann, SKOS.note, Literal(annotation["weight"].lower() + "Prerequisite")))

        blank_target = BNode()

        g.add((ann, oa.hasTarget, blank_target))
        g.add((blank_target, RDF.type, oa.SpecificResource))
        g.add((blank_target, dcterms.subject, target_concept))

        g.add((blank_target, oa.hasSource, video))

        blank_selector_video = BNode()

        g.add((blank_target, oa.hasSelector, blank_selector_video))
        g.add((blank_selector_video, RDF.type, edu.InstantSelector))
        g.add((blank_selector_video, RDF.value, Literal(annotation["time"] + "^^xsd:dateTime")))

        if annotation["xywh"] != "None":
            g.add((blank_selector_video, edu.hasMediaFrag, Literal(annotation["xywh"])))


        g.add((blank_selector_video, edu.conllSentId, Literal(annotation["sent_id"])))

        if annotation["word_id"] != "None":
            g.add((blank_selector_video, edu.conllWordId, Literal(annotation["word_id"])))

    context = ["http://www.w3.org/ns/anno.jsonld", {
               "@base": "https://edurell.dibris.unige.it/annotator/auto/"+video_id+"/",
      			"@version": 1.1,
      			"edu": "https://teldh.github.io/edurell#"
             } ]

    jsonld = json.loads(g.serialize(format='json-ld'))
    jsonld = pyld.jsonld.compact(jsonld, context)


    for o in jsonld["@graph"]:
        if "target" in o:
            for i, t in enumerate(jsonld["@graph"]):
                if o["motivation"] != "edu:linkingConll" and o["target"] == t["id"]:
                    o["target"] = t
                    del jsonld["@graph"][i]
                    for j, s in enumerate(jsonld["@graph"]):
                        if o["target"]["selector"] == s["id"]:
                            o["target"]["selector"] = s
                            del jsonld["@graph"][j]

                            if o["motivation"] == "describing":
                                for k, p in enumerate(jsonld["@graph"]):
                                    if o["target"]["selector"]["startSelector"] == p["id"]:
                                        o["target"]["selector"]["startSelector"] = p
                                        del jsonld["@graph"][k]
                                        break

                                for k, p in enumerate(jsonld["@graph"]):
                                    if o["target"]["selector"]["endSelector"] == p["id"]:
                                        o["target"]["selector"]["endSelector"] = p
                                        del jsonld["@graph"][k]
                                        break
    
    # sort by "id": "ann#" value
    jsonld["@graph"] = sorted(jsonld["@graph"],key=lambda x: int(x["id"][3:]) if str(x["id"][3:]).isnumeric() else 4242)
    return g, jsonld


def create_local_vocabulary(video_id,conceptVocabulary):
    context = ["http://www.w3.org/ns/anno.jsonld", {
               "@base": "https://edurell.dibris.unige.it/annotator/auto/"+video_id+"/",
      			"@version": 1.1,
      			"edu": "https://teldh.github.io/edurell#"
             } ]
    language = get_video_data(video_id)["language"]
    graph = Graph()

    for concept in conceptVocabulary.keys():        
        uri_concept = URIRef("concept_" + concept.replace(" ", "_"))
        graph.add((uri_concept, RDF['type'], SKOS.Concept))
        graph.add((uri_concept, SKOS.prefLabel, Literal(concept, lang=language)))
        for synonym in conceptVocabulary[concept]:
            graph.add((uri_concept, SKOS.altLabel, Literal(synonym, lang=language)))

    jsonld = json.loads(graph.serialize(format='json-ld'))
    jsonld = pyld.jsonld.compact(jsonld, context)
    print(jsonld)
    local_vocabulary = {"id": "localVocabulary", "type": "skos:Collection"}
    if "@graph" in jsonld.keys():
        local_vocabulary["skos:member"] = jsonld["@graph"]
    return local_vocabulary

def convert_to_skos_concepts(concepts_name,conceptVocabulary,language):
    graph = Graph()
    for concept in concepts_name:        
        uri_concept = URIRef("concept_" + concept.replace(" ", "_"))
        graph.add((uri_concept, RDF['type'], SKOS.Concept))
        graph.add((uri_concept, SKOS.prefLabel, Literal(concept, lang=language)))
        for synonym in conceptVocabulary[concept]:
            graph.add((uri_concept, SKOS.altLabel, Literal(synonym, lang=language)))
    
    jsonld = json.loads(graph.serialize(format='json-ld'))
    #jsonld = pyld.jsonld.compact(jsonld, context)
    return jsonld["@graph"]


if __name__ == "__main__":
    #from pprint import pprint
    #definitions = [{'concept': 'machine', 'start_sent_id': 0, 'end_sent_id': 7, 'start': '0:00:00.060000', 'end': '0:00:31.319000', 'description_type': 'In Depth', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'machine', 'start_sent_id': 64, 'end_sent_id': 74, 'start': '0:05:37.310000', 'end': '0:07:06.509000', 'description_type': 'Definition', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'machine learning', 'start_sent_id': 0, 'end_sent_id': 7, 'start': '0:00:00.060000', 'end': '0:00:31.319000', 'description_type': 'In Depth', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'machine learning', 'start_sent_id': 64, 'end_sent_id': 74, 'start': '0:05:37.310000', 'end': '0:07:06.509000', 'description_type': 'Definition', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'learning', 'start_sent_id': 0, 'end_sent_id': 3, 'start': '0:00:00.060000', 'end': '0:00:14.879000', 'description_type': 'In Depth', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'learning', 'start_sent_id': 38, 'end_sent_id': 42, 'start': '0:03:29.250000', 'end': '0:04:25.850000', 'description_type': 'In Depth', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'learning', 'start_sent_id': 45, 'end_sent_id': 50, 'start': '0:04:19.350000', 'end': '0:04:59.690000', 'description_type': 'In Depth', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'learning', 'start_sent_id': 64, 'end_sent_id': 74, 'start': '0:05:37.310000', 'end': '0:07:06.509000', 'description_type': 'Definition', 'creator': 'Burst Analysis'}, 
    #               {'concept': 'checker', 'start_sent_id': 8, 'end_sent_id': 13, 'start': '0:00:24.609000', 'end': '0:01:13.349000', 'description_type': 'Definition', 'creator': 'Burst Analysis'}]
    #pprint(_merge_contained_definitions(definitions))
    pass