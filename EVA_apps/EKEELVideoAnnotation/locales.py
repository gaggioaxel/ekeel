from iso639 import Lang

FORMAT_PT1 = 0
FORMAT_FULL = 1

class Locale:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Locale, cls).__new__(cls)
            cls._supported_languages = {'it','en'}
        return cls._instance

    def get_supported_languages(self,kind=FORMAT_PT1):
        '''
        Returns ISO of supported languages \n
        of kind FORMAT_PT1 [es: "en"] or kind FORMAT_FULL [es: "english"]
        '''
        if kind == FORMAT_PT1:
            return self._supported_languages.copy()
        elif kind == FORMAT_FULL:
            return {self.get_full_from_pt1(lang) for lang in self._supported_languages.copy()}
        raise Exception("Locale.get_supported_language() -> kind not implemented")
    
    def is_language_supported(self,language:str):
        if len(language) > 2:
            language = Lang(language).pt1
        return language in self._supported_languages
    
    @staticmethod
    def get_pt1_from_full(language:str):
        return Lang(name=language.capitalize()).pt1
    
    @staticmethod
    def get_full_from_pt1(language:str,lower:bool=True):
        return Lang(pt1=language).name if not lower else Lang(pt1=language).name.lower()
