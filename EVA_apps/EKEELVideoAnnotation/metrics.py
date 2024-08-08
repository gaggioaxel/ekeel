import networkx as nx
import pandas as pd
import igraph as igraph
import numpy as np



def create_graph(concept_map):
    """
    Returns a networkx graph from a concept map
    """

    G_nx = nx.DiGraph()

    for rel in concept_map:
        G_nx.add_node(rel["prerequisite"], label=rel["prerequisite"])
        G_nx.add_node(rel["target"], label=rel["target"])
        G_nx.add_edge(rel["prerequisite"], rel["target"])

    return G_nx


def create_i_graph(dataset, terminology):
    """
    Returns a
    """
    #print(igraph.__version__)
    terminology#_vertex = set(dataset["prerequisite"].append(dataset["target"]))
    # I_graph = igraph.Graph(n=0, edges=None, directed=True, graph_attrs=None, vertex_attrs=None, edge_attrs=None)
    i_graph = igraph.Graph()
    # print(dataset["prerequisite"])
    for v in terminology:#_vertex:
        i_graph.add_vertices(v)
    for r in dataset:
        i_graph.add_edge(r["prerequisite"], r["target"])

    return i_graph


def GED_similarity(concept_map1, concept_map2):

    rater1_graph = create_graph(concept_map1)
    rater2_graph = create_graph(concept_map2)
    optimized_edit_distance = 0

    for v in nx.optimize_graph_edit_distance(rater1_graph, rater2_graph,
                                             node_match=lambda node1, node2: node1['label'] == node2['label']):
        #print(v)
        optimized_edit_distance = v
        break

    #print("optimized_edit_distance", optimized_edit_distance)

    return optimized_edit_distance



def pageRank_similarity(graphs, terminology):
    """
    Get a list of nx graphs and the terminology to calculate pageRank
    """

    pagerank_df = pd.DataFrame(columns=['concept', 'Burst', 'Annotator'])
    pagerank_df['concept'] = list(terminology)
    rank = pagerank_df.set_index('concept', verify_integrity=True)

    for graph in graphs:
        pagerank = nx.pagerank(graph["graph"])
        for k, v in pagerank.items():
            rank.loc[k, graph["author"]] = v

    rank.astype(float)
    p = rank.fillna(0)

    return round(p.corr(method='pearson').loc["Burst", "Annotator"], 3)






def edge_overlap(concept_map1, concept_map2):
    count_edge_comuni = 0
    count_vertex_comuni = 0

    vertexes1 = []
    vertexes2 = []

    for rel in concept_map2:
        if rel["prerequisite"] not in vertexes2:
            vertexes2.append(rel["prerequisite"])

        if rel["target"] not in vertexes2:
            vertexes2.append(rel["target"])


    for rel in concept_map1:

        if rel["prerequisite"] not in vertexes1:
            vertexes1.append(rel["prerequisite"])
            if rel["prerequisite"] in vertexes2:
                count_vertex_comuni += 1

        if rel["target"] not in vertexes1:
            vertexes1.append(rel["target"])
            if rel["target"] in vertexes2:
                count_vertex_comuni += 1

        for r in concept_map2:
            if r["target"] == rel["target"] and r["prerequisite"] == rel["prerequisite"]:
                count_edge_comuni += 1
    if len(vertexes1)+len(vertexes2)+len(concept_map1)+len(concept_map2) != 0:
        VEO = 2 * ((count_vertex_comuni + count_edge_comuni)/(len(vertexes1)+len(vertexes2)+len(concept_map1)+len(concept_map2)))
    else:
        return 0

    return round(VEO, 3)





def LO_PN(graphs, terminology):
    # intialise data of leafs
    temporal_leafs_df = pd.DataFrame(columns=['concept', 'Burst', 'Annotator'])

    # intialise data of roots
    temporal_roots_df = pd.DataFrame(columns=['concept', 'Burst', 'Annotator'])

    temporal_leafs_roots_df = pd.DataFrame(
        columns=['concept', 'Burst', 'Annotator'])

    temporal_leafs_df['concept'] = list(terminology)
    leafs_df = temporal_leafs_df.set_index('concept', verify_integrity=True)
    temporal_roots_df['concept'] = list(terminology)
    roots_df = temporal_roots_df.set_index('concept', verify_integrity=True)
    temporal_leafs_roots_df['concept'] = list(terminology)
    leafs_roots_df = temporal_leafs_roots_df.set_index('concept', verify_integrity=True)

    for graphs in graphs:
        networkx_graph = graphs["graph"]
        rater = graphs["author"]

        leafs = [{x: networkx_graph.in_degree(x)} for x in networkx_graph.nodes() if networkx_graph.out_degree(x) == 0
                 and networkx_graph.in_degree(x) >= 1]

        for item in leafs:
            leafs_df.loc[next(iter(item)), rater] = item[next(iter(item))]
            leafs_roots_df.loc[next(iter(item)), rater] = item[next(iter(item))]

        roots = [{x: networkx_graph.out_degree(x)} for x in networkx_graph.nodes() if networkx_graph.in_degree(x) == 0
                 and networkx_graph.out_degree(x) >= 1]

        for item in roots:
            # set negative numbers for the # of out-degree arcs
            roots_df.loc[next(iter(item)), rater] = item[next(iter(item))]
            leafs_roots_df.loc[next(iter(item)), rater] = -item[next(iter(item))]

    leafs_df.astype(float)
    df_0 = leafs_df.fillna(0)
    LO = df_0.corr(method='pearson').loc["Burst", "Annotator"]

    roots_df.astype(float)
    df_roots_0 = roots_df.fillna(0)
    PN = df_roots_0.corr(method='pearson').loc["Burst", "Annotator"]

    return round(LO,3), round(PN,3)



def calculate_metrics(automatic_map, manual_map, terminology):

    print("***** EKEEL - Video Annotation: metrics.py::calculate_metrics() ******")

    automatic_graph = create_graph(automatic_map)
    annotator_graph = create_graph(manual_map)

    graphs = [
        {
            "author": "Burst",
            "graph": automatic_graph,
        },
        {
            "author": "Annotator",
            "graph": annotator_graph,
        }
    ]

    pageRank = pageRank_similarity(graphs, terminology)

    LO, PN = LO_PN(graphs, terminology)

    eo = edge_overlap(automatic_map, manual_map)

    ged_sim = GED_similarity(automatic_map, manual_map)


    if np.isnan(pageRank):
        pageRank = 0

    if np.isnan(LO):
        LO = 0

    if np.isnan(PN):
        PN = 0


    return eo, pageRank, LO, PN, ged_sim

