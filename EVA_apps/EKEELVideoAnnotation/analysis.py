import db_mongo
import networkx as nx
import agreement
from conllu import parse
#import pandas as pd
from pprint import pprint
import random
#pip install python-igraph
#pip install pandas


class Graph:
    def __init__(self):
        self.graph = {}
        self.nodes = []

    def add_edge(self, u, v):

        if u not in self.nodes:
            self.nodes.append(u)
            self.graph[u] = []

        if v not in self.nodes:
            self.nodes.append(v)
            self.graph[v] = []

        self.graph[u].append(v)


def compute_data_summary(video_id,concept_map, definitions):

    unique_relations = []
    strong_relations = []
    weak_relations = []
    concepts = []

    G = nx.DiGraph()

    for rel in concept_map:

        G.add_edge(rel["prerequisite"], rel["target"])

        r = {"prerequisite":rel["prerequisite"], "target": rel["target"]}

        if r not in unique_relations:
            unique_relations.append(r)

        if rel["weight"] == "Strong":
            strong_relations.append(rel)
        else:
            weak_relations.append(rel)

        if rel["prerequisite"] not in concepts:
            concepts.append(rel["prerequisite"])

        if rel["target"] not in concepts:
            concepts.append(rel["target"])

    defs = 0
    depth = 0
    for d in definitions:
        if d["concept"] not in concepts:
            concepts.append(d["concept"])

        if d["description_type"] == "Definition":
            defs += 1
        else:
            depth += 1

    results = {"analysis_type": "data_summary", "concept_map": concept_map,
               "num_rels": len(concept_map), "num_weak": len(weak_relations),"num_strong": len(strong_relations),
               "num_unique": len(unique_relations), "num_descriptions":len(definitions), "num_definitions":defs,
               "num_depth":depth, "num_concepts": len(concepts),
               "num_transitives": len(detect_transitive_edges(G,10))}

    return results


def compute_agreement(concept_map1, concept_map2):
    # concept_map1 = db_mongo.get_concept_map(user1, video)
    # concept_map2 = db_mongo.get_concept_map(user2, video)
    words = []
    user1 = "first"
    user2 = "second"

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


    results = {"analysis_type": "agreement", "agreement":round(agreement.computeK(conteggio, all_combs), 3)}

    return results




def fleiss(video_id):

    users = db_mongo.get_graphs_info(video_id)["annotators"]

    words = []
    concept_maps = {}
    for user in users:
        concept_map = db_mongo.get_concept_map(user["id"], video_id)
        for rel in concept_map:
            if rel["prerequisite"] not in words:
                words.append(rel["prerequisite"])

            if rel["target"] not in words:
                words.append(rel["target"])

        concept_maps[user["id"]] = concept_map

    all_combs = agreement.createAllComb(words)

    term_pairs = {}
    for id in concept_maps:
        term_pairs[id] = agreement.createUserRel(concept_maps[id], all_combs)[0]

    try:
        fleiss = agreement.computeFleiss(term_pairs, all_combs)
    except:
        fleiss = 1

    return round(fleiss, 3)



def linguistic_analysis(annotator, video_id):
    concept_map = db_mongo.get_concept_map(annotator, video_id)

    conll = db_mongo.get_conll(video_id)
    #print(conll)
    parsed_conll = parse(conll)

    sent_list = []
    processed_conll = []

    for sent in parsed_conll:
        sent_list.append(sent.metadata["text"])

        for word in sent:
            data = {}
            data['tok_id'] = word["id"]
            data['sent_id'] = sent.metadata["sent_id"]
            data['forma'] = word["form"]
            data['lemma'] = word["lemma"]
            data['pos_coarse'] = word["upos"]
            data['pos_fine'] = word["xpos"]

            processed_conll.append(data)

    concepts = []

    for rel in concept_map:
        rel["sentence"] = parsed_conll[int(rel["sent_id"])-1].metadata["text"]
        if rel["prerequisite"] not in concepts:
            concepts.append(rel["prerequisite"])

        if rel["target"] not in concepts:
            concepts.append(rel["target"])


    results = {"analysis_type": "linguistic","concept_map": concept_map, "concepts": concepts, "sentences": sent_list,
               "conll": processed_conll}

    return results


def detect_transitive_edges(graph, cutoff):
    '''
    Detect transitive relations manually inserted by the annotator.

    INPUT:
    graph
    cutoff: an int number of edges, after which the searching algorithm stops.

    OUTPUT
    A dict with transitives,
    indexed whether they have been manually inserted by the annotator
    or automatically detected in the graph by the search algorithm.
    '''

    transitives = []

    for source_node in graph.nodes():
        other_nodes = list(graph.nodes())
        other_nodes.remove(source_node)

        for target_node in other_nodes:
            paths = nx.all_simple_paths(graph, source_node, target_node, cutoff)

            for path in paths:
                if len(path) > 2 and graph.has_edge(source_node, target_node):
                    if (source_node, target_node) not in transitives:
                        transitives.append((source_node, target_node))

    return transitives



def scores(annotation, annotation_gold, concepts):
    """
    Concept map scores
    Find accuracy, precision, recall, F1 score of an annotation compared to the gold standard

    This function uses also the transitive relations to calculate the scores.

    :param annotation: concept map of the annotation
    :param annotation_gold: concept map of the gold standard
    :param terminology: all concepts, both gold and ann
    :return: accuracy, precision, recall, f1-score
    """
    TP = 0
    TN = 0
    FP = 0
    FN = 0

    paths_gold = []
    paths_ann = []
    negative_relations = []

    G_ann = nx.DiGraph()
    G_gold = nx.DiGraph()

    for rel in annotation:

        rel["prerequisite"] = rel["prerequisite"].replace("-", " ")
        rel["target"] = rel["target"].replace("-", " ")

        G_ann.add_edge(rel["prerequisite"], rel["target"])

    for rel in annotation_gold:

        rel["prerequisite"] = rel["prerequisite"].replace("-", " ")
        rel["target"] = rel["target"].replace("-", " ")

        G_gold.add_edge(rel["prerequisite"], rel["target"])


    for c1 in concepts:
        for c2 in concepts:
            # se esiste un percorso tra due concetti
            if c1 in G_gold and c2 in G_gold and nx.has_path(G_gold, c1, c2): #BFS(c1, c2, annotation_gold, cut=300):
                paths_gold.append((c1, c2))
            else:
                negative_relations.append((c1, c2))

            if c1 in G_ann and c2 in G_ann and nx.has_path(G_ann, c1, c2): #BFS(c1, c2, annotation, cut=300):
                paths_ann.append((c1, c2))

    for r in paths_gold:
        if r in paths_ann:
            TP += 1
        else:
            FN += 1

    for r in paths_ann:
        if r not in paths_gold:
            FP += 1

    for r in random.sample(negative_relations, len(paths_gold)):
        if r not in paths_ann:
            TN += 1


    accuracy = (TP + TN) / (TP + TN + FP + FN)

    if TP + FP != 0:
        precision = TP / (TP + FP)
    else:
        precision = 0

    if TP + FN != 0:
        recall = TP / (TP + FN)
    else:
        recall = 0

    if precision != 0 or recall != 0:
        F1 = 2 * (precision * recall) / (precision + recall)
    else:
        F1 = 0.0

    return round(accuracy, 3), round(precision, 3), round(recall, 3), round(F1, 3)







def BFS(from_, to_, relations, cut=None):
    """
    Breath First Search in concept map
    """

    queue = [from_]
    already_visited = [from_]
    count = 0

    targets = {}

    for rel in relations:
        if rel["prerequisite"] not in targets:
            targets[rel["prerequisite"]] = []

        targets[rel["prerequisite"]].append(rel["target"])


    while len(queue) > 0:

        if cut is not None:
            if count > cut:
                return False
            count += 1

        curr = queue.pop()
        if curr in targets:
            next_level = targets[curr]
        else:
            next_level = []

        if to_ in next_level:
            return True
        else:
            for i in range(0, len(next_level)):
                if next_level[i] not in already_visited:
                    queue.append(next_level[i])
                    already_visited.append(next_level[i])

    # not found
    return False



