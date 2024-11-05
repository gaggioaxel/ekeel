import requests
import time
from pandas import DataFrame


class ItaliaNLAPI():

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ItaliaNLAPI, cls).__new__(cls)
            cls._server_address = "http://api.italianlp.it"
            cls._max_term_len = 5
            # TODO ask "f" (fine) option for the start terms seems not to work
            cls._term_extraction_configs = { "name-misc-name": 
                                                {   'pos_start_term':   ['c:S','c:A'],              # begin with a fine common name (diritto, legge) or an adjective (interdisciplinare, aggregato)
                                                    'pos_internal_term':['c:E','c:A','f:S','c:B'],  # continue with a preposition (del, da, su, verso) and other names
                                                    'pos_end_term':     ['c:S','c:A'],              # end with a fine common name 
                                                    'max_length_term':  3 
                                                },
                                              "alzetta-conf":
                                                {
                                                  'pos_start_term': ['c:S'],
                                                  'pos_internal_term': ['c:A','c:E','c:S','c:EA','c:SP'],
                                                  'pos_end_term': ['c:A','c:S','c:SP'],
                                                  'statistical_threshold_single': 30,
                                                  'statistical_threshold_multi': 10000,
                                                  'statistical_frequency_threshold': 1,
                                                  'max_length_term': 5,
                                                  'apply_contrast': True
                                                },
                                              "alzetta-conf-no-contrast":
                                                {
                                                  'pos_start_term': ['c:S'],
                                                  'pos_internal_term': ['c:A','c:E','c:S','c:EA','c:SP'],
                                                  'pos_end_term': ['c:A','c:S','c:SP'],
                                                  'statistical_threshold_single': 30,
                                                  'statistical_threshold_multi': 10000,
                                                  'statistical_frequency_threshold': 1,
                                                  'max_length_term': 5,
                                                  'apply_contrast': False
                                                }
                                           }

        return cls._instance

    def upload_document(self, text:str, language:str, async_call:bool=True):
        r = requests.post(self._server_address + '/documents/',
                          data={'text': text,  # si carica il documento nel server
                                'lang': language.upper(),
                                'async': async_call})  # indica se la chiamata alle api viene fatta in modo sincrono o asincrono

        doc_id = r.json()['id']  # questo è l'id del documento nel server

        return doc_id
    
    def wait_for_named_entity_tag(self,doc_id):
        api_res = {'postagging_executed': False, 'sentences': {'next': False, 'data': []}}
        while not api_res['postagging_executed'] or api_res['sentences']['next']:
            r = requests.get(self._server_address + '/documents/action/named_entity/%s' % (doc_id))
            api_res = r.json()
    

    def wait_for_pos_tagging(self,doc_id):
        page = 1
        # inizializzazione dummy della risposta del server per poter scrivere la condizione del while
        api_res = {'postagging_executed': False} #, 'sentences': {'next': False, 'data': []}}
        while not api_res['postagging_executed']: #or api_res['sentences']['next']:
            r = requests.get(self._server_address + '/documents/details/%s?page=%s' % (doc_id, page))
            api_res = r.json()

            if api_res['postagging_executed']:
                sentences = api_res["sentences"]["data"]
                return [{"sentence": sentence["raw_text"], "words":sentence["tokens"]} for sentence in sentences]
            
            print('Waiting for pos tagging...')
            time.sleep(5)
            continue


    
    def execute_term_extraction(self, doc_id, configuration=None, apply_contrast=False, n_try=60) -> DataFrame:
        if configuration is None:
            configuration = self._term_extraction_configs['alzetta-conf'+"-no-contrast"*(not apply_contrast)]
        
        url = self._server_address + '/documents/term_extraction'
        term_extraction_id = requests.post(url=url,
                                 json={'doc_ids': [doc_id],
                                       'configuration': configuration}).json()['id']
        for _ in range(n_try):
            res = requests.get(url=url,params={'id': term_extraction_id}).json()
            if res['status'] == "OK":
                if len(res["terms"]) == 0:
                    raise Exception("With this config ItaliaNLP.term_extraction() has not found anything")
                else:
                    break
            elif res["status"] == "IN_PROGRESS":
                print(f"Been waiting term extraction for {(_+1)*10} seconds...")
            time.sleep(10)
        else:
            raise Exception(f"ItalianNLP API hasn't sent the requested data in {n_try*5} seconds")
        
        #import json
        #with open("terms.json","w") as f:
        #    json.dump(res,f,indent=4)
        terms = DataFrame(res['terms'])
        terms['word_count'] = terms['term'].apply(lambda x: len(x.split()))
        return terms.sort_values(by='word_count').drop(columns=['word_count'])

if __name__ == '__main__':
    ItaliaNLAPI().execute_term_extraction(1750)