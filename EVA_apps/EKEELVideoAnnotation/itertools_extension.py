from itertools import zip_longest, tee
from typing import Generator, Iterable

def _pairwise_linked_reversed(iterable,None_tail):
    '''
    Returns reversed list
    '''
    curr_index = len(iterable)-1
    while curr_index > 0:
        yield iterable[curr_index], iterable[curr_index-1]
        curr_index -= 1
    if None_tail:
        yield iterable[0], None
    return

def pairwise(iterable, None_tail=True,reversed=False) -> Generator:
    '''
    Generator of a list of tuple of linked elements
    (s0,s1)->(s1,s2)->(s2,s3)-> ... -> (sN-1,sN) and optionally (sN,None)\n

    Params
    ------
    iterator : the iterable object
    None_tail : if True returns also the (last element, None) tuple
    reversed : if True elemens are returned in reverse order (sN, sN-1)->...->(s1,s0) and optionally also (s0,None) if none_tail is set

    Returns
    --------
    An iterator of tuples
    '''
    if not reversed:
        a,b = tee(iterable)
        next(b,None)
        return zip_longest(a,b, fillvalue=None) if None_tail else zip(a,b)
    else: return _pairwise_linked_reversed(iterable,None_tail)


def pairwise_iterator(iterable,None_tail=True,reversed=False) -> 'Generator[Iterable, Iterable or None]':
    '''
    Generator of a list of tutples of elements
    (s0,s1)->(s2,s3)->(s4,s5)-> ... -> (sN-1,sN) and optionally (sN,None)\n
    
    Params
    ------
    None_tail : if True returns also the (last element, None) tuple if the list is odd
    reversed : if True elemens are returned in reverse order (sN, sN-1)->...->(s1,s0) and optionally also (s0,None)

    Returns
    --------
    An iterator of tuples
    '''
    if not reversed:
        iterable = iter(iterable)
        while True:
            try: a = next(iterable)
            except StopIteration: return

            try: yield a,next(iterable)
            except StopIteration: 
                if None_tail: 
                    yield a, None 
                return
    else:
        curr_index = len(iterable)-1
        while curr_index > 1:
            yield iterable[curr_index], iterable[curr_index-1]
            curr_index -= 2
        if None_tail and curr_index == 0:
            yield iterable[0], None
        return

def double_iterator(iterable,enumerated:bool=False) -> 'Generator[Iterable,Iterable] or Generator[int,int,Iterable,Iterable]':
    '''
    Generates an iterator of both the upper and lower triangular matrix of every pair (diag not included) of elements from the given iterable:\n
    Example: 
        this: [1,2,3]
        returns: (1,2)->(1,3)->(2,1)->(2,3)->(3,1)->(3,2)

    Parameters
    ----------
    enumerated : if true returns (i,j) (x,y) with i index of x in iterable, j index of y

    Returns
    -------
    every (x,y) where index(x) != index(y) belonging to iterable or (i,j),(x,y)
    '''
    if not enumerated:
        for x in iter(iterable):
            for y in iter(iterable):
                if x is not y:
                    yield (x,y)
    else:
        for i, x in enumerate(iter(iterable)):
            for j, y in enumerate(iter(iterable)):
                if x is not y:
                    yield (i, j, x, y)
