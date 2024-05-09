import pymongo


from conllu import parse
from environment import MONGO_CLUSTER_USERNAME,MONGO_CLUSTER_PASSWORD

def load_db():
    client = pymongo.MongoClient("mongodb+srv://"+MONGO_CLUSTER_USERNAME+":"+MONGO_CLUSTER_PASSWORD+"@clusteredurell.z8aeh.mongodb.net/edurell?retryWrites=true&w=majority")
    db = client.edurell
    return db

db = load_db()


def delete_graphs(email):
    collection = db.graphs
    if collection.find({"email":email}) is not None:
        return collection.delete_many({"email":email})

def get_conll(video_id):
    collection = db.conlls
    if collection.find_one({"video_id":video_id}) is not None:
        return collection.find_one({"video_id":video_id})["conll"]
    else:
        return None
def get_sentences(parsed_conll,start_id,end_id):
    sentences = ""
    start_id = int(start_id)
    end_id = int(end_id)
    # print(start_id)
    # print(end_id)
    for i in range(start_id, end_id):
        for k in range(0,len(parsed_conll[i])):
            sentences += parsed_conll[i][k]["lemma"] +" "
    return sentences

def format_datetime(str):

    s = str.split("^^")
    return s[0]

def get_concept_list(annotator, video_id):
    collection = db.graphs
    pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "skos:Concept",
                }

        },

        {"$project":
            {
                "id": "$graph.@graph.id",
                "name": "$graph.@graph.id"
            }
        },

        {"$sort": {"time": 1}}

    ]

    aggregation = collection.aggregate(pipeline)
    concept_list = list(aggregation)
    for c in concept_list:
        c["id"] = c["id"].replace("edu:","").replace("_"," ")

    #get_concept_vocabulary(annotator, video_id)
    
    return concept_list


def get_concept_map(annotator,video_id):
     collection = db.graphs

     pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "oa:annotation",
                    "graph.@graph.motivation": "edu:linkingPrerequisite",
                }

        },

        {"$project":
            {
                "prerequisite": "$graph.@graph.body",
                "target": "$graph.@graph.target.dcterms:subject.id",
                "weight": "$graph.@graph.skos:note",
                "time": "$graph.@graph.target.selector.value",
                "sent_id": "$graph.@graph.target.selector.edu:conllSentId",
                "word_id": "$graph.@graph.target.selector.edu:conllWordId",
                "xywh": "$graph.@graph.target.selector.edu:hasMediaFrag",
                "creator": "$graph.@graph.dcterms:creator",
                "_id": 0
            }
        },


        {"$sort": {"time": 1}}

    ]

     aggregation = collection.aggregate(pipeline)
     concept_map = list(aggregation)

     for rel in concept_map:
        rel["prerequisite"] = rel["prerequisite"].replace("edu:","").replace("_"," ")
        rel["target"] = rel["target"].replace("edu:","").replace("_"," ")
        rel["weight"] = rel["weight"].replace("Prerequisite","")
        rel["time"] = rel["time"].replace("^^xsd:dateTime","")
        if "xywh" not in rel:
            rel["xywh"] = "None"

     return concept_map


def get_concept_vocabulary(annotator, video_id):
    collection = db.graphs

    pipeline = [
        {"$unwind": "$conceptVocabulary.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "conceptVocabulary.@graph.type": "skos:Concept"
                }
        },

        {"$project":
            {
                "prefLabel": "$conceptVocabulary.@graph.skos:prefLabel.@value",
                "altLabel": "$conceptVocabulary.@graph.skos:altLabel.@value",
                "_id": 0
            }
        }

    ]

    aggregation = collection.aggregate(pipeline)
    results = list(aggregation)

    # define new concept vocabulary
    conceptVocabulary = {}

    # if there is none on DB
    if len(results) == 0:
        print(conceptVocabulary)
        return None

    # iterate for each concept and build the vocabulary basing on the number of synonyms
    for concept in results: 
 
        if "altLabel" in concept :
            if isinstance(concept["altLabel"], list):
                conceptVocabulary[concept["prefLabel"]] = concept["altLabel"]
            else:
                conceptVocabulary[concept["prefLabel"]] = [concept["altLabel"]]
        else:
            conceptVocabulary[concept["prefLabel"]]=[]

    #print(conceptVocabulary)

    return conceptVocabulary



def get_concept_instants(annotator, video_id):
   pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "oa:annotation",
                    "graph.@graph.motivation": "describing",
                }

        },

        {"$project":
            {
                "concept_id": "$graph.@graph.body",
                "start_time":"$graph.@graph.target.selector.startSelector.value",
                "end_time": "$graph.@graph.target.selector.endSelector.value",
                "start_sent_id": "$graph.@graph.target.selector.startSelector.edu:conllSentId",
                "end_sent_id":  "$graph.@graph.target.selector.endSelector.edu:conllSentId",
            }
        },


        {"$sort": {"time": 1}}]


    
   collection = db.graphs
   aggregation = collection.aggregate(pipeline)
   concept_instants = list(aggregation)
   for c in concept_instants:
        c["start_time"] = format_datetime(c["start_time"])
        c["end_time"] = format_datetime(c["end_time"])
        c["concept_id"] = c["concept_id"].replace("edu:","").replace("_"," ")
   return concept_instants
   
def get_concept_targets(concept_map, concept_id):
    targets = []
    for relation in concept_map:
        if relation["prerequisite"] == concept_id:
            targets.append(relation["target"])
    return targets

def get_concept_prerequisites(concept_map, concept_id):
    prerequisites = []
    for relation in concept_map:
        if relation["target"] == concept_id:
            prerequisites.append(relation["prerequisite"])
    return prerequisites

def build_concept_without_sub_graph(concept_instants,concept_id):
    concept = {"conceptName": "", 
                        "type": "", 
                        "description": "", 
                        "startTimestamp": "",
                        "endTimestamp": "",
                        "image": "",
                        "subgraph": []}
    concept["conceptName"] = concept_id

    for c in concept_instants:
        if c["concept_id"] == concept_id:
            concept["startTimestamp"] = c["start_time"]
            concept["endTimestamp"] = c["end_time"]
    return concept

def build_concept_sub_graph_without_target_recursively(concept_map, concept_instants, concept_id):
    sub_graph = {"targets": [], "prerequisites": [], "primary_notions": []}
    prerequisites = get_concept_prerequisites(concept_map, concept_id)
    prerequisites_concept = []
    for c in prerequisites:
        concept = build_concept_without_sub_graph(concept_instants, c)
        if concept not in prerequisites_concept:
            prerequisites_concept.append(concept)
    sub_graph["prerequisites"] = prerequisites_concept
    for c in sub_graph["prerequisites"]:
        c["subgraph"] =  build_concept_sub_graph_without_target_recursively(concept_map,concept_instants, c["conceptName"])
    return sub_graph

def build_concept_sub_graph(concept_map, concept_instants, concept_id):
    sub_graph = {"targets": [], "prerequisites": [], "primary_notions": [] }
    primary_targets = get_concept_targets(concept_map, concept_id)
    for c in primary_targets:
        sub_graph["targets"].append(build_concept_without_sub_graph(concept_instants, c))

    prerequisites = get_concept_prerequisites(concept_map, concept_id)
    prerequisites_concept = []
    for c in prerequisites:
        c = build_concept_without_sub_graph(concept_instants, c)
        prerequisites_concept.append(c)
    sub_graph["prerequisites"] = prerequisites_concept
    for concept in sub_graph["prerequisites"]:
        concept["subgraph"] = build_concept_sub_graph_without_target_recursively(concept_map,concept_instants, c["conceptName"])

    sub_graph["relations"] = concept_map
    return sub_graph

def retrieve_primary_notions(concept_instance):
    primary_notions = []
    for c in concept_instance["subgraph"]["prerequisites"]:
        if c["subgraph"]["prerequisites"] == []:
            primary_notions.append(c)
        else:
            primary_notions = primary_notions + retrieve_primary_notions(c)
    return primary_notions

def build_array(annotator,video_id):
    concept_map = get_concept_map(annotator,video_id)
    concept_instants = get_concept_instants(annotator,video_id)
    primary_concept_list = get_concept_list(annotator,video_id)
    parsed_conll = parse(get_conll(video_id))
    conceptsList = []
    for c in primary_concept_list:
        conceptsList.append(build_concept_without_sub_graph(concept_instants,c["id"]))
    for c in conceptsList:
        c["subgraph"] =  build_concept_sub_graph(concept_map, concept_instants, c["conceptName"])
        c["subgraph"]["primary_notions"] = retrieve_primary_notions(c)
        for c_i in concept_instants:
            if c_i["concept_id"] == c["conceptName"]:
                c["description"] = get_sentences(parsed_conll, c_i["start_sent_id"], c_i["end_sent_id"])

    return conceptsList



"""concept_map = get_concept_map('60659634a320492e72f72598','sXLhYStO0m8')
concept_instants = get_concept_instants('60659634a320492e72f72598','sXLhYStO0m8')
concept = build_concept_without_sub_graph(concept_instants,'sciatic notch")
concept["subgraph"] = build_concept_sub_graph(concept_map, concept_instants, "sciatic notch")
concept["subgraph"]["primary_notions"] = retrieve_primary_notions(concept)

print(build_array('60659634a320492e72f72598','sXLhYStO0m8'))
"""
conll = get_conll("sXLhYStO0m8")
conll = parse(conll)
sentences = get_sentences(conll,50,60)
# print(sentences)