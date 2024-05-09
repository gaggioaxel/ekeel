import networkx

def createAllComb(words):
    #creo tutte le possibili coppie di concetti
    all_combs=[]
    for term in words:
        for i in range(len(words)):
            if term != words[i]:
                combination = term+"/-/"+words[i]
                combination_inv = words[i]+"/-/"+term
                if combination_inv not in all_combs:
                    all_combs.append(combination)
    return all_combs


def createUserRel(file, all_combs):
    temp = []
    term_pairs_tuple = []
    for annot_pairs in file:
        concept_pair=annot_pairs["prerequisite"]+"/-/"+annot_pairs["target"]
        if(concept_pair not in all_combs):
            all_combs.append(concept_pair)
        temp.append(concept_pair)

        tupla = (annot_pairs["prerequisite"], annot_pairs["target"])
        term_pairs_tuple.append(tupla)


    return temp, all_combs, term_pairs_tuple


def check_trans(rater, term_pairs_tuple, pair):
    # print(pair)
    # print(rater2)
    g = networkx.DiGraph(term_pairs_tuple[rater])
    if pair.split("/-/")[0] in g and pair.split("/-/")[1] in g:
        if networkx.has_path(g, source=pair.split("/-/")[0], target=pair.split("/-/")[1]):
            return True
    else:
        return False


def creaCoppieAnnot(rater1, rater2, term_pairs, pairs, term_pairs_tuple):
    coppieannot = {}
    conteggio = {"1,1": 0, "1,0": 0, "0,1": 0, "0,0": 0}
    for pair in pairs:
        # per ogni concept pair controllo fra le coppie E i paths di r1
        if pair in term_pairs[rater1] or check_trans(rater1, term_pairs_tuple, pair):
            # se presente, controllo fra coppie e paths di r2 e incremento i contatori
            if pair in term_pairs[rater2] or check_trans(rater2, term_pairs_tuple, pair):
                coppieannot[pair] = "1,1"
                conteggio["1,1"] += 2  # inv_pt1: scelgo di considerare le coppie inverse come both agree
                conteggio["0,0"] -= 1  # inv_pt2: compenso la scelta di tenenre conto le inverse in both agree
            # conteggio["1,1"]+=1 #no_inv: le coppie inverse valgolo come both diagree
            else:
                coppieannot[pair] = "1,0"
                conteggio["1,0"] += 1
        # altrimenti, se manca coppia e percorso in r1 e r2 o solo in r1, incrementa questi contatori
        elif pair not in term_pairs[rater1]:
            if pair not in term_pairs[rater2] and not check_trans(rater2, term_pairs_tuple, pair):
                coppieannot[pair] = "0,0"
                conteggio["0,0"] += 1
            else:
                coppieannot[pair] = "0,1"
                conteggio["0,1"] += 1
    return coppieannot, conteggio



def computeK(conteggio, pairs):
    Po = (conteggio["1,1"] + conteggio["0,0"]) / float(len(pairs))
    Pe1 = ((conteggio["1,1"] + conteggio["1,0"]) / float(len(pairs))) * (
                (conteggio["1,1"] + conteggio["0,1"]) / float(len(pairs)))
    Pe2 = ((conteggio["0,1"] + conteggio["0,0"]) / float(len(pairs))) * (
                (conteggio["1,0"] + conteggio["0,0"]) / float(len(pairs)))
    Pe = Pe1 + Pe2
    k = (Po - Pe) / float(1 - Pe)
    return k




def computeFleiss(term_pairs, all_combs):
    matrix_fleiss = []

    for item in all_combs:

        countZero = 0
        countOne = 0
        for rater, values in term_pairs.items():
            lista = []
            if item not in values:
                countZero = countZero + 1
            if item in values:
                countOne = countOne + 1
        lista.insert(0, countZero)
        lista.insert(1, countOne)
        matrix_fleiss.append(lista)

    return computeKappaFleiss(matrix_fleiss)



def computeKappaFleiss(mat):
    """ Computes the Kappa value
        @param n Number of rating per subjects (number of human raters)
        @param mat Matrix[subjects][categories]
        @return The Kappa value """
    print(mat)
    n = checkEachLineCount(mat)  # PRE : every line count must be equal to n
    print(n)
    N = len(mat)
    k = len(mat[0])

    # Computing p[] (accordo sugli 0 e accordo sugli 1)
    p = [0.0] * k
    for j in range(k):
        p[j] = 0.0
        for i in range(N):
            p[j] += mat[i][j]
        p[j] /= N * n

    # Computing P[]  (accordo su ogni singola coppia di concetti)
    P = [0.0] * N
    for i in range(N):
        P[i] = 0.0
        for j in range(k):
            P[i] += mat[i][j] * mat[i][j]
        P[i] = (P[i] - n) / (n * (n - 1))

    # Computing Pbar (accordo osservato)
    Pbar = sum(P) / N

    # Computing PbarE (accordo dovuto al caso)
    PbarE = 0.0
    for pj in p:
        PbarE += pj * pj

    kappa = (Pbar - PbarE) / (1 - PbarE)

    return kappa




def checkEachLineCount(mat):
    """ Assert that each line has a constant number of ratings
        @param mat The matrix checked
        @return The number of ratings
        @throws AssertionError If lines contain different number of ratings """
    n = sum(mat[0])


    assert all(sum(line) == n for line in mat[1:]), "Line count != %d (n value)." % n

    return n