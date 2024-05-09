class Node:
    def __init__(self,value=None):
        self.value = value
        self._prev:Node or None = None
    
    def set_prev(self,prev) -> 'Node':
        self._prev = prev 
        return self
    
    def get_prev(self) -> 'Node or None':
        return self._prev


class LiFoStack:

    _tail = Node()
    _cursor = _tail
    _len = 0

    def __init__(self,from_list:'list'= None) -> None:
        if from_list is not None: i=0; [ self.push(elem) for elem in from_list ]

    def __str__(self):
        cur = self._tail.get_prev()
        out = ""
        max_len = 0
        # can be improved but for now is just for debug purposes
        while cur is not None:
            max_len = max(max_len, len(str(cur.value)))
            out += "| " + str(cur.value) + " |\n"
            cur = cur.get_prev()
        if out=="":
            out= "empty"
        return out + "⎿"+"⎽"*max_len+"⎽⎽⎽⎽"+"⏌ "

    def __iter__(self):
        return self

    def __next__(self):
        node = self._cursor.get_prev()
        if node is not None:
            self._cursor = node
            return node.value
        else:
            self._cursor = self._tail
            raise StopIteration()
    
    def __len__(self):
        return self._len
    
    def is_head(self):
        return self._tail.get_prev() is None

    def push(self,elem):
        '''
        pushes the element into the top of the stack
        '''
        curr_tail = self._tail
        curr_tail.value = elem
        self._tail = Node().set_prev(curr_tail)
        self._cursor = self._tail
        self._len += 1

    def get(self,indx=None,raise_exception=False):
        '''
        returns but not removes the Last In element
        '''
        tail = self._tail
        if tail.get_prev() is None:
            if raise_exception:
                raise Exception("Popping from an empty stack")
            else:
                return None
        return tail.get_prev().value

    def pop(self,raise_exception=False):
        '''
        returns the Last In element or raises an Exception
        '''
        value = self.get(raise_exception)
        if value is not None:
            self._tail = self._tail.get_prev()
            self._len -= 1
        return value