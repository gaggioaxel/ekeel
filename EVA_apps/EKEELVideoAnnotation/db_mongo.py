import pymongo
import time
from pprint import pprint
from rdflib import Graph, plugin
import json
import pyld
from bson.json_util import dumps
from bson.son import SON
from bson import ObjectId
from environment import MONGO_CLUSTER_USERNAME,MONGO_CLUSTER_PASSWORD

#pip install pymongo
#pip3 install pymongo[srv]

# client = pymongo.MongoClient(
#         'mongodb+srv://Luca:edurellMongo@cluster0.ktoan.mongodb.net/edurell?retryWrites=true&w=majority')
import os

client = pymongo.MongoClient(
    "mongodb+srv://"+MONGO_CLUSTER_USERNAME+":"+MONGO_CLUSTER_PASSWORD+"@clusteredurell.z8aeh.mongodb.net/edurell?retryWrites=true&w=majority")

db = client.edurell

users = db.student
unverified_users = db.unverified_student

def string_to_seconds(str):

    s = str.split("^^")[0].split(":")
    seconds = int(s[2]) + int(s[1]) * 60 + int(s[0]) * 60 * 60

    return seconds


def reset_password(email, password):
    query = {"email": email}

    if users.find_one(query) is not None:
        new = {"$set": {"password_hash": password}}
        users.update_one(query, new)

def insert_graph(data):
    
    print("***** EKEEL - Video Annotation: db_mongo.py::insert_graph(): Inizio ******")


    collection = db.graphs
    query = {
        "annotator_id": data["annotator_id"],
        "annotator_name": data["annotator_name"],
        "email": data["email"],
        "video_id": data["video_id"]
    }

    if collection.find_one(query) is None:
        collection.insert_one(data)
    else:
        new_graph = {"$set": {"graph": data["graph"], "conceptVocabulary": data["conceptVocabulary"]}}
        collection.update_one(query, new_graph)

    print("***** EKEEL - Video Annotation: db_mongo.py::insert_graph(): Fine ******")    


def insert_burst(data):

    print("***** EKEEL - Video Annotation: db_mongo.py::insert_burst(): Inizio ******")

    collection = db.graphs
    query = {
        "extraction_method": "Burst",
        "video_id": data["video_id"]
    }

    if collection.find_one(query) is None:
        collection.insert_one(data)
    else:
        new_graph = {"$set": {"graph": data["graph"]}}
        collection.update_one(query, new_graph)

    print("***** EKEEL - Video Annotation: db_mongo.py::insert_burst(): Fine ******")
    

def insert_gold(data):
    print("***** EKEEL - Video Annotation: db_mongo.py::insert_gold(): Inizio ******")


    collection = db.graphs
    query = {
        "graph_type": "gold_standard",
        "video_id": data["video_id"]
    }

    if collection.find_one(query) is None:
        collection.insert_one(data)
    else:
        new_graph = {"$set": {"graph": data["graph"], "conceptVocabulary": data["conceptVocabulary"]}}
        collection.update_one(query, new_graph)

def insert_conll_MongoDB(data):
    print("***** EKEEL - Video Annotation: db_mongo.py::insert_conll_MongoDB() ******")
    collection = db.conlls
    if collection.find_one({"video_id": data["video_id"]}) is None:
        collection.insert_one(data)

def get_video_metadata(video_id:str):
    collection = db.videos
    metadata = collection.find_one({"video_id": video_id})
    if metadata is not None:
        metadata.pop('_id')
    return metadata


def get_video_segmentation(video_id:str, raise_error:bool=True):
    collection = db.video_text_segmentation
    item = collection.find_one({"video_id":video_id})
    if item is None and raise_error:
        raise Exception("Video has not been segmented yet, it must be firstly analyzed")
    return item


def insert_video_data(data,update=False):
    collection = db.videos
    if collection.find_one({"video_id": data["video_id"]}) is None:
        collection.insert_one(data)
    elif update:
        collection.delete_one({'video_id':data['video_id']})
        collection.insert_one(data)
    # else:
    #     new_graph = {"$set": {"extracted_keywords": data["extracted_keywords"]}}
    #     collection.update_one({"video_id": data["video_id"]}, new_graph)

def insert_video_text_segmentation(data,update=False):
    collection = db.video_text_segmentation
    if collection.find_one({'video_id':data['video_id'] }) is None:
        collection.insert_one(data)
    elif update:
        collection.delete_one({'video_id':data['video_id']})
        collection.insert_one(data)


def get_conll(video_id):
    collection = db.conlls
    document = collection.find_one({"video_id":video_id})
    return None if document is None else document["conll"]


# from string id to object id
def get_user(user_string_id):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_user() ******")
    user_id = ObjectId(user_string_id)
    return list(users.find({'_id': user_id}))[0]


def get_user_graphs(user):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_user_graphs() ******")
    collection = db.graphs
    return list(collection.find({"annotator_id":user}))


def get_graph(user, video):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_graph() ******")
    collection = db.graphs
    item = collection.find_one({"annotator_id":user, "video_id":video},{"_id":0,"graph":1})
    if item is not None:
        return item["graph"]
    return None


def get_videos():
    print("***** EKEEL - Video Annotation: db_mongo.py::get_videos() ******")
    collection = db.videos
    return list(collection.find({}).sort([("creator", pymongo.ASCENDING)]))



def get_graphs_info(selected_video=None):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_graphs_info(): Inizio ******")

    # If selected video is None
    # Returns all videos graphs, with the title, creator and the annotators
    # Else returns only the selected video

    collection = db.graphs

    pipeline = [

        # join con videos collection

        {
            "$lookup":{
                "from": "videos",
                "localField": "video_id",
                "foreignField": "video_id",
                "as": "video"
            }
        },

        {"$project":
            {
                "annotator_id": 1,
                "annotator_name": 1,
                "video_id": 1,
                "title": "$video.title",
                "creator": "$video.creator",
                "_id": 0}
         },

        {"$sort": {"creator": pymongo.ASCENDING}}
    ]

    aggregation = list(collection.aggregate(pipeline))
    graphs_info = {}

    # Remove possibly unavailable videos from resulting list
    for vid in reversed(aggregation):
        if not len(vid["creator"]) or not len(vid["title"]):
            aggregation.remove(vid)

    for vid in aggregation:

        if "annotator_id" in vid:
            annotator = {"id": vid["annotator_id"], "name": vid["annotator_name"]}

            if vid["video_id"] not in graphs_info:
                graphs_info[vid["video_id"]] = {"title": vid["title"][0], "creator": vid["creator"], "annotators": [annotator]}
            else:
                graphs_info[vid["video_id"]]["annotators"].append(annotator)

    if selected_video is not None:
        if selected_video in graphs_info:
            return graphs_info[selected_video]
        else:
            return None

    print("***** EKEEL - Video Annotation: db_mongo.py::get_graphs_info(): Fine ******")

    return graphs_info


def get_concepts(annotator, video_id):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_concepts(): Inizio ******")

    collection = db.graphs

    pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "skos:Concept"
                }

        },

        {"$project":
            {
                "concept": "$graph.@graph.id",
                "_id": 0
            }
        }

    ]

    aggregation = collection.aggregate(pipeline)
    results = list(aggregation)
    concepts = []

    for concept in results:
        concepts.append(concept["concept"].replace("concept_","").replace("_"," "))

    print("***** EKEEL - Video Annotation: db_mongo.py::get_concepts(): Fine ******")


    return concepts


def get_concept_map(annotator, video_id):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_concept_map(): Inizio ******")

    collection = db.graphs

    pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "Annotation",
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
                "creator": "$graph.@graph.creator",
                "_id": 0
            }
        },

        {"$sort": {"time": 1}}

    ]

    aggregation = collection.aggregate(pipeline)
    concept_map = list(aggregation)

    for rel in concept_map:
        rel["prerequisite"] = rel["prerequisite"].replace("concept_","").replace("_"," ")
        rel["target"] = rel["target"].replace("concept_","").replace("_"," ")
        rel["weight"] = (rel["weight"].replace("Prerequisite","")).capitalize()
        rel["time"] = rel["time"].replace("^^xsd:dateTime","")
        if "xywh" not in rel:
            rel["xywh"] = "None"
        if "word_id" not in rel:
            rel["word_id"] = "None"
        if "sent_id" not in rel:
            rel["sent_id"] = "None"

    print("***** EKEEL - Video Annotation: db_mongo.py::get_concept_map(): Fine ******")

    return concept_map


def get_definitions(annotator, video_id):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_definitions(): Inizio ******")

    collection = db.graphs

    pipeline = [
        {"$unwind": "$graph.@graph"},
        {
            "$match":
                {
                    "video_id": str(video_id),
                    "annotator_id": str(annotator),
                    "graph.@graph.type": "Annotation",
                    "graph.@graph.motivation": "describing",
                }

        },

        {"$project":
            {
                "concept": "$graph.@graph.body",
                "start": "$graph.@graph.target.selector.startSelector.value",
                "end": "$graph.@graph.target.selector.endSelector.value",
                "start_sent_id": "$graph.@graph.target.selector.startSelector.edu:conllSentId",
                "end_sent_id": "$graph.@graph.target.selector.endSelector.edu:conllSentId",
                "creator": "$graph.@graph.creator",
                "description_type": "$graph.@graph.skos:note",
                "_id": 0
            }
        },

        {"$sort": {"start": 1}}

    ]

    aggregation = collection.aggregate(pipeline)
    definitions = list(aggregation)

    for d in definitions:
        d["concept"] = d["concept"].replace("concept_","").replace("_"," ")
        d["end"] = d["end"].replace("^^xsd:dateTime","")
        d["start"] = d["start"].replace("^^xsd:dateTime", "")
        d["description_type"] = d["description_type"].replace("concept", "")

    print("***** EKEEL - Video Annotation: db_mongo.py::get_definitions(): Fine ******")

    return definitions


def get_vocabulary(annotator, video_id):

    print("***** EKEEL - Video Annotation: db_mongo.py::get_vocabulary(): Inizio ******")


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

    print("***** EKEEL - Video Annotation: db_mongo.py::get_vocabulary(): Fine ******")

    return conceptVocabulary



def get_video(video_id):
    print("***** EKEEL - Video Annotation: db_mongo.py::get_video() ******")

    collection = db.videos
    return collection.find_one({"video_id":video_id})
    

def remove_video(video_id):
    '''
    ### WARNING!!! NOT FULLY TESTED MAY BREAK THE DB DUE TO DATA ENTANGLEMENT
    '''
    query = {"video_id":video_id}
    collections = ['videos','graphs','video_text_segmentation','conll']
    #collections = ['video_text_segmentation']
    for coll_name in collections:
        collection = db.get_collection(coll_name)
        if collection.find_one(query):
            try:
                collection.delete_many(query)
                #collection.delete_one(query)
                print(f'removing from {coll_name}')
            except:
                pass

def remove_account(email):
    '''
    ### WARNING!!! NOT FULLY TESTED MAY BREAK THE DB DUE TO DATA ENTANGLEMENT
    '''
    print("***** EKEEL - Video Annotation: db_mongo.py::remove_account() ******")

    query = {"email": email}

    if users.find_one(query) is not None:
        try: 
            users.delete_one(query)
        except:
            return "Error"
        return "Done verified removed"
    elif unverified_users.find_one(query) is not None:
        try: 
            unverified_users.delete_one(query)
        except:
            return "Error"
        return "Done unverified removed"
    return "Not Found"

if __name__ == '__main__':
    #remove_video('PPLop4L2eGk')
    #graph = get_graph("Burst Analysis","PPLop4L2eGk")
    print("***** EKEEL - Video Annotation: db_mongo.py::__main__ ******")
    #remove_video("FZ1qPqVeMSQ")