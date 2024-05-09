from synonyms import create_skos_dictionary
import db_mongo
from ontology import annotations_to_jsonLD

# Function to merge dictionaries
def mergeDictionary(d1, d2):
   d3 = {**d1, **d2}
   for key in d3.keys():
       if key in d1 and key in d2:
            d3[key] = list(set(d3[key]+d1[key]))
   return d3

def create_gold(video, annotators, combination_criteria, name):

    relations = []
    definitions = []
    conceptVocabulary = {}
    if combination_criteria == "union":
        for annotator in annotators:
            relations += db_mongo.get_concept_map(annotator, video)
            definitions += db_mongo.get_definitions(annotator, video)
            #db_conceptVocabulary = db_mongo.get_vocabulary(annotator, video) take from db
            db_conceptVocabulary = None # to start empty
            if(db_conceptVocabulary != None):
                conceptVocabulary = mergeDictionary(conceptVocabulary, db_conceptVocabulary)

        # If the concept vocabulary is new (empty) then initialize it to empty synonyms
        if(conceptVocabulary == {}) :
            for i in db_mongo.get_concepts(annotators[0], video):
                conceptVocabulary[i] = []

        annotations = {"relations":relations, "definitions":definitions, "id":video}
        _, jsonld = annotations_to_jsonLD(annotations, isAutomatic=True)

        data = jsonld.copy()
        data["video_id"] = video
        data["graph_type"] = "gold standard"
        data["gold_name"] = name
        data["conceptVocabulary"] = create_skos_dictionary(conceptVocabulary, video,"auto")

        db_mongo.insert_gold(data)


    print(relations)



