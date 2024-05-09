from pickle import load as load_model
from image import ImageClassifier
from numpy import prod, empty, argmax, ndarray, zeros
from mediapipe.framework.formats.detection_pb2 import Detection
from xgboost import XGBClassifier

class XGBoostModelAdapter:
    '''
    model adapter from the XGBoost pretrained model of the \n
    misc/lecture type detection and text recognition folder
    '''
    _labels = {0:"Blackboard",1:"Slide",2:"Slide-and-Talk",3:"Talk"}

    def __init__(self,model_path:str) -> None:
        try:
            self._model:XGBClassifier = load_model(open(model_path, 'rb'))
        except:
            raise FileExistsError("cannot find model")
    
    def _extract_faces_info(self,detections:'list[Detection] | None'):
        '''
        Extract faces from current image and saves them such that:\n
        0 if there are no faces\n
        1 if there's 1 face\n
        2 if there's more than 1 face
        '''
        out_arr = zeros((1,3),dtype=float)
        if detections is None:
            return out_arr
        for detection in detections:
            bounding_box = detection.location_data.relative_bounding_box
            xmin,width,height = bounding_box.xmin, bounding_box.width,bounding_box.height
            face_size = width*height
            out_arr[0,1] = max(out_arr[0,1],face_size)
            if out_arr[0,1] == face_size:
                out_arr[0,0] = xmin + width/2
            if out_arr[0,2] < 2:
                out_arr[0,2] += 1
        return out_arr

    def _extract_features_from_image(self,image:ImageClassifier,norm_minmax:bool=False):
        '''
        norm_minmax not performed because has been normalized with value/total

        Returns
        -------
        out_array = [x_center,face_size,n_faces]\n
        x_center : is the x value, normalized on the picture width, of the center of the biggest face\n
        face_size : is normalized product of width and height of the biggest face\n
        n_faces : is 0 if no faces are found, 1 if one face has been found, 2 for more than one face\n
        '''
        assert isinstance(image,ImageClassifier) and image.get_img().shape[2] == 3
        out_arr = empty((1,19),dtype=float)
        out_arr[0,:16] = image.get_hists(normalize=norm_minmax,bins=16,grayscaled=True)
        if not norm_minmax:
            out_arr[0,:16] /= prod(image.get_img_shape()[:2])
        out_arr[0,16:] = self._extract_faces_info(image.detect_faces(return_contours=True))
        return out_arr

    def predict_probability(self, image:ImageClassifier):
        return self._model.predict_proba(self._extract_features_from_image(image))

    def predict_max_confidence(self,image:ImageClassifier):
        return int(argmax(self.predict_probability(self._extract_features_from_image(image))))
    
    def get_label(self,prediction):
        if isinstance(prediction,int):
            assert 0 <= prediction <= 3
            return self._labels[prediction]
        elif isinstance(prediction,ndarray):
            assert prediction.shape == (1,4)
            return {self._labels[i]:prediction[0,i] for i in range(4)}
        else:
            return None

    def is_enough_slidish_like(self, image:ImageClassifier):
        '''
        Predicts the probability of slidish image with a small more confidence if unsure to reduce false negative
        '''
        probs = self.predict_probability(image)
        best_slidish_prob = max(probs[0,(1,2)])
        best_not_slidish_prob = max(probs[0,(0,3)])
        return 1.15*best_slidish_prob >= best_not_slidish_prob
