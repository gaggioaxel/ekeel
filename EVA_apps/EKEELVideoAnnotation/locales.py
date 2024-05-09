from iso639 import Lang

class Locale:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Locale, cls).__new__(cls)
            cls._supported_languages = {'it','en'}
        return cls._instance

    def get_supported_languages(self):
        return self._supported_languages.copy()
    
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
