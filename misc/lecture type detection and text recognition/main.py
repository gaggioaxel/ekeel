import os
import sys

# Controllo degli argomenti passati in linea di comando
if (len(sys.argv)<3):
	print("ERRORE: inserisci il percorso del video da elaborare e ogni quanti secondi prendere un frame.")
	sys.exit()

try:
	secondsForFrameSkip=int(sys.argv[2])
except:
	print("ERRORE: inserire un numero intero come secondo parametro.")
	sys.exit()

PATH_VIDEO = sys.argv[1]
if not os.path.exists(PATH_VIDEO):
	print("ERRORE: video inesistente.")
	sys.exit()


import cv2
import numpy as np
import tensorflow as tf
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as viz_utils
from object_detection.builders import model_builder
from object_detection.utils import config_util
from matplotlib import pyplot as plt
import matplotlib
import pickle
import calculateFeatureAndTrain_module

matplotlib.use("TkAgg", force=True)
#%matplotlib inline
#plt.show()


CUSTOM_MODEL_NAME = 'my_ssd_mobnet'
PRETRAINED_MODEL_NAME = 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8'
PRETRAINED_MODEL_URL = 'http://download.tensorflow.org/models/object_detection/tf2/20200711/ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8.tar.gz'
TF_RECORD_SCRIPT_NAME = 'generate_tfrecord.py'
LABEL_MAP_NAME = 'label_map.pbtxt'

paths = {
	'WORKSPACE_PATH': os.path.join('Tensorflow', 'workspace'),
	'SCRIPTS_PATH': os.path.join('Tensorflow','scripts'),
	'APIMODEL_PATH': os.path.join('Tensorflow','models'),
	'ANNOTATION_PATH': os.path.join('Tensorflow', 'workspace','annotations'),
	'IMAGE_PATH': os.path.join('Tensorflow', 'workspace','images'),
	'MODEL_PATH': os.path.join('Tensorflow', 'workspace','models'),
	'PRETRAINED_MODEL_PATH': os.path.join('Tensorflow', 'workspace','pre-trained-models'),
	'CHECKPOINT_PATH': os.path.join('Tensorflow', 'workspace','models',CUSTOM_MODEL_NAME),
	'OUTPUT_PATH': os.path.join('Tensorflow', 'workspace','models',CUSTOM_MODEL_NAME, 'export'), 
	'TFJS_PATH':os.path.join('Tensorflow', 'workspace','models',CUSTOM_MODEL_NAME, 'tfjsexport'), 
	'TFLITE_PATH':os.path.join('Tensorflow', 'workspace','models',CUSTOM_MODEL_NAME, 'tfliteexport'), 
	'PROTOC_PATH':os.path.join('Tensorflow','protoc')
 }

files = {
	'PIPELINE_CONFIG':os.path.join('Tensorflow', 'workspace','models', CUSTOM_MODEL_NAME, 'pipeline.config'),
	'COCO_NAMES':os.path.join('Tensorflow', 'workspace','pre-trained-models', 'yolo_V3' , 'coco.names'),
	'YOLOV3_CFG':os.path.join('Tensorflow', 'workspace','pre-trained-models', 'yolo_V3' , 'yolov3.cfg'),
	'YOLOV3_SPP_WEIGHTS':os.path.join('Tensorflow', 'workspace','pre-trained-models', 'yolo_V3' , 'yolov3.weights'),
	'PRETRAINED_MODEL':os.path.join('Tensorflow', 'workspace','pre-trained-models', PRETRAINED_MODEL_NAME,'saved_model'),
	'TF_RECORD_SCRIPT': os.path.join(paths['SCRIPTS_PATH'], TF_RECORD_SCRIPT_NAME), 
	'LABELMAP': os.path.join(paths['ANNOTATION_PATH'], LABEL_MAP_NAME)
}

#######################################YOLO V3, non utilizzata perché rileva oggetti
def testConYoloV3():
	# Load Yolo
	print("LOADING YOLO")
	net = cv2.dnn.readNet(files['YOLOV3_SPP_WEIGHTS'], files['YOLOV3_CFG'])
	#save all the names in file o the list classes
	classes = []
	with open(files['COCO_NAMES'], "r") as f:
		classes = [line.strip() for line in f.readlines()]

	print(classes)

	#get layers of the network
	layer_names = net.getLayerNames()
	#Determine the output layer names from the YOLO model
	output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
	print("YOLO LOADED")


	# Capture frame-by-frame
	IMAGE_PATH = os.path.join(paths['IMAGE_PATH'], 'test', 'thumbsdown.b1f20c56-b4d4-11eb-ae88-240a64b78789.jpg')
	#IMAGE_PATH = os.path.join(paths['IMAGE_PATH'], 'test', 'thumbsup.fd7cdb14-b4d4-11eb-b662-240a64b78789.jpg')
	img = cv2.imread(IMAGE_PATH)
	#img=cv2.imread("test_img.jpg")
	img = cv2.resize(img, None, fx=0.4, fy=0.4)
	height, width, channels = img.shape

	# USing blob function of opencv to preprocess image
	#blob = cv2.dnn.blobFromImage(img, 1 / 255.0, (416, 416),swapRB=True, crop=False)

	blob = cv2.dnn.blobFromImage(img, scalefactor=0.00392, size=(320, 320), mean=(0, 0, 0), swapRB=True, crop=False)

	#for b in blob:
	#	for n,img_blob in enumerate(b):
	#		cv2.imshow(str(n),img_blob)

	#Detecting objects
	net.setInput(blob)
	outs = net.forward(output_layers)


	# Showing informations on the screen
	class_ids = []
	confidences = []
	boxes = []
	for out in outs:
		for detection in out:
			scores = detection[5:]
			class_id = np.argmax(scores)
			confidence = scores[class_id]
			if confidence > 0.3:
				# Object detected
				center_x = int(detection[0] * width)
				center_y = int(detection[1] * height)
				w = int(detection[2] * width)
				h = int(detection[3] * height)

				# Rectangle coordinates
				x = int(center_x - w / 2)
				y = int(center_y - h / 2)

				boxes.append([x, y, w, h])
				confidences.append(float(confidence))
				class_ids.append(class_id)


	isPerson=False
	#We use NMS function in opencv to perform Non-maximum Suppression
	#we give it score threshold and nms threshold as arguments.
	indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.4, 0.6)
	colors = np.random.uniform(0, 255, size=(len(classes), 3))
	for i in range(len(boxes)):
		if i in indexes:
			x, y, w, h = boxes[i]
			label = str(classes[class_ids[i]])
			if(label=="person"):
				isPerson=True
			color = colors[class_ids[i]]
			cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
			cv2.putText(img, label, (x, y -5),cv2.FONT_HERSHEY_SIMPLEX,1/2, color, 2)

	cv2.imshow("Image",img)
	cv2.waitKey(0)


import yolov5
#import torch
# YOLOV5_model=os.path.join('tfod', 'Lib','site-packages', 'yolov5' ,'models', 'yolov5s.yaml'),
# print(os.getcwd()) # returns the currently working directory of a process
# model = yolov5.load(YOLOV5_model) # carico modello tramite formato yaml, però non funziona
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True) # scarico il modello
model = yolov5.load('yolov5s.pt') # se ho il modello in locale

def rilevaPersona(model, frame):
	#######################################YOLO V5

	isPerson=False
	## Immagine per test rilevazione persona
	# IMAGE_PATH = os.path.join(paths['IMAGE_PATH'], 'test', 'livelong.fed895dc-b264-11eb-bccc-086266b476b9.jpg')

	# img = cv2.imread(frame)


	# inference
	#results = model(img)

	results = model(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), size=400)

	labels, cord_thres = results.xyxyn[0][:, -1].numpy(), results.xyxyn[0][:, :-1].numpy() # estraggo labels e coordinate dei rettangoli
	classes = model.names
	label_class = []

	# show results
	for i in labels:
		# print(classes[int(i)])
		label_class.append(classes[int(i)])
		if(classes[int(i)]=="person"):
			isPerson=True

	# show results
	# results.print()
	# results.show()


	# Load pipeline config and build a detection model
	configs = config_util.get_configs_from_pipeline_file(files['PIPELINE_CONFIG'])
	detection_model = model_builder.build(model_config=configs['model'], is_training=False)

	@tf.function
	def detect_fn(image):
		image, shapes = detection_model.preprocess(image)
		prediction_dict = detection_model.predict(image, shapes)
		detections = detection_model.postprocess(prediction_dict, shapes)
		return detections


	if(isPerson==True):
		print("YOLOv5: PERSONA RICONOSCIUTA")
		category_index = label_map_util.create_category_index_from_labelmap(files['LABELMAP'])
		#IMAGE_PATH = os.path.join(paths['IMAGE_PATH'], 'test', 'thumbsdown.b1f20c56-b4d4-11eb-ae88-240a64b78789.jpg')
		#IMAGE_PATH = os.path.join(paths['IMAGE_PATH'], 'test', 'prova_scritte.jpg')

		# img = cv2.imread(frame)
		image_np = np.array(frame)

		input_tensor = tf.convert_to_tensor(np.expand_dims(image_np, 0), dtype=tf.float32)
		detections = detect_fn(input_tensor)

		num_detections = int(detections.pop('num_detections'))
		detections = {key: value[0, :num_detections].numpy()
					for key, value in detections.items()}
		detections['num_detections'] = num_detections

		# detection_classes should be ints.
		detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

		label_id_offset = 1
		image_np_with_detections = image_np.copy()

		viz_utils.visualize_boxes_and_labels_on_image_array(
					image_np_with_detections,
					detections['detection_boxes'],
					detections['detection_classes']+label_id_offset,
					detections['detection_scores'],
					category_index,
					use_normalized_coordinates=True,
					max_boxes_to_draw=5,
					min_score_thresh=.8,
					agnostic_mode=False)

		# plt.imshow(cv2.cvtColor(image_np_with_detections, cv2.COLOR_BGR2RGB))
		# plt.savefig("img_with_person.png")
		# plt.show()
	else:
		print("YOLOv5: PERSONA NON RICONOSCIUTA")


	return isPerson, label_class



###frame from video with words detection
import pytesseract
pytesseract.pytesseract.tesseract_cmd='C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
import cv2
import mediapipe as mp
from deepface import DeepFace
from dataclasses import dataclass

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

width, height, padding = 0, 0, 50

@dataclass
class Record: # 1 frame
	num_frame: int
	time: float
	list_words: list
	isPersonDetected: bool
	isSpeaker: bool
	# path_faces: list 		# ['faccia1', 'faccia2', 'faccia3']
	idFaces: list 			# [0,1,2] in questo caso ci sono 3 persone distinte e alla fine contare le occorrenze e scegliere il massimo, se il numero delle occorrenze fossero uguali, si prende quello con l'id più basso
	scene: any				# blackboard || slide || slide-and-talk || talk
	objects_detected: any	# lista di oggetti rilevati tramite YoloV5

							# punti mediapipe upperbody position
	def to_dict(self):
			return {"num_frame": self.num_frame, "time": self.time, "list_words": self.list_words, "isPersonDetected": self.isPersonDetected, "isSpeaker": self.isSpeaker, "idFaces": self.idFaces, "scene": self.scene, "objects_detected": self.objects_detected}


# id face, id che assegneremo al momento del compare

@dataclass
class FrameWithFaces:
	num_frame: int
	num_faces: int
	isProcessed: list
	time: float

@dataclass
class Segment:
	id_label: any
	start_time: float
	end_time: float
	list_of_same_scene: list	# lista di Records di quel tipo di scena

	def to_dict(self):
		return {"id_label": self.id_label, "start_time": self.start_time, "end_time": self.end_time, "list_of_same_scene":[ obj.to_dict() for obj in self.list_of_same_scene ]}


listOfRecords=[]
listOfSegments=[]
IMAGE_FACES_PATH = 'images/faces/'

HEAD_VIDEO, NOME_VIDEO = os.path.split(PATH_VIDEO)
video = cv2.VideoCapture(PATH_VIDEO)

i = 0
# a variable to set how many frames you want to skip
fps = video.get(cv2.CAP_PROP_FPS)

frame_skip = fps*secondsForFrameSkip #un frame ogni 5 secondi
frame_counter=0
temp=1/fps
n_frame_analyzed = 0
frame_with_faces = []
lunghezza_isProcessed = 1
totalFrame=0

count_frame_doppi=0

scenes = ["Blackboard", "Slide", "Slide-and-talk", "Talk"]
counter_scenes = [0,0,0,0] # blackboard, slide, slide-and-talk, talk

# Carico il modello migliore per scene prediction
scene_model = pickle.load(open("xgboost500.sav", 'rb'))

while video.isOpened():
	ret, frame = video.read()
	if not ret:
		break
	totalFrame += 1
	if i > frame_skip - 1: # In questo caso ogni 5 secondi
		duration = frame_counter*temp
		minutes = int(duration/60)
		seconds = int(duration%60)
		print(" ------------ Frame at " + str(minutes) + " min and " + str(seconds) + " seconds ----------- ")
		n_frame_analyzed+=1
		#cv2.imwrite('test_'+str(i)+'.jpg', frame)
		#print(pytesseract.image_to_string(frame))
		temp_list_words=[]
		boxes=pytesseract.image_to_data(frame)
		frame_counter+=frame_skip
		#print("frame number: " + str(frame_counter))

		# Riconoscimento persona con YoloV5
		isPersonDetected, oggetti_rilevati = rilevaPersona(model, frame)
		print("OGGETTI RILEVATI: ", oggetti_rilevati)
		if isPersonDetected == True:
			'''
			# # BODY LANDMARKS POINTS extraction
			import cv2
			import mediapipe as mp
			import numpy as np
			mp_drawing = mp.solutions.drawing_utils
			mp_drawing_styles = mp.solutions.drawing_styles
			mp_pose = mp.solutions.pose

			# For static images:
			BG_COLOR = (192, 192, 192) # gray
			with mp_pose.Pose(static_image_mode=True, model_complexity=1, enable_segmentation=False, min_detection_confidence=0.5) as pose:
				image = cv2.imread(frame)
				image_height, image_width, _ = image.shape
				# Convert the BGR image to RGB before processing.
				results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

				# I punti non sono più normalizzati (da 0 a 1) ma sono relative alla risoluzione dell'immagine
				for i in range(0,33):
					results.pose_landmarks.landmark[i].x = results.pose_landmarks.landmark[i].x * image_width
					results.pose_landmarks.landmark[i].y = results.pose_landmarks.landmark[i].y * image_height
				print("")
				print(results.pose_landmarks)

				if not results.pose_landmarks:
					print("Non trovo pose.")

			'''
			#aggiungere results.pose_landmarks alla classe record e passare la variabile quando viene popolata

			with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:

				# image = cv2.imread(file)
				# print('width: ', frame.shape[1])
				# print('height:', frame.shape[0])
				width = frame.shape[1]
				height = frame.shape[0]

				# Convert the BGR image to RGB and process it with MediaPipe Face Detection.
				results = face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

				# Draw face detections of each face.
				if not results.detections:
					print("Mediapipe: Nessuna faccia rilevata.")
					continue

				# annotated_image = image.copy()

				# Popola la lista con un frame con tot facce, quando faremo il compare delle facce, useremo questa lista per ottimizzare i tempi
				list_boolean = []
				for i in range(len(results.detections)):
					list_boolean.append(False)
				frame_with_faces.append(FrameWithFaces(n_frame_analyzed, len(results.detections), list_boolean,frame_counter*temp))


				lunghezza_isProcessed = len(frame_with_faces[len(frame_with_faces)-1].isProcessed)


				for i in range(len(results.detections)):
					detection = results.detections[i]
					print("Mediapipe: Faccia rilevata.")
					# print(detection.location_data.relative_bounding_box)
					xmin = int(detection.location_data.relative_bounding_box.xmin*width)
					ymin = int(detection.location_data.relative_bounding_box.ymin*height)
					w = int(detection.location_data.relative_bounding_box.width*width)+xmin
					h = int(detection.location_data.relative_bounding_box.height*height)+ymin

					# controllo immagine croppata che resti dentro all'immagine originale
					if xmin - padding >= 0:
						xmin = xmin - padding
					else:
						xmin = 0

					if ymin - padding >= 0:
						ymin = ymin - padding
					else:
						ymin = 0

					if w + padding <= width:
						w = w + padding
					else:
						w = width

					if h + padding <= height:
						h = h + padding
					else:
						h = height


					# print(xmin)
					# print(ymin)
					# print(w)
					# print(h)

					# print('Nose tip:')
					# print(mp_face_detection.get_key_point(detection, mp_face_detection.FaceKeyPoint.NOSE_TIP))
					cropped_image = frame[ymin:h, xmin:w]
					cv2.imwrite(IMAGE_FACES_PATH + 'face_of_' + str(NOME_VIDEO[:-4]) + '_frame_'+ str(n_frame_analyzed) + '_face_' + str(i) + '.jpg', cropped_image)

					cv2.waitKey(0)
					cv2.destroyAllWindows()




		# Lista delle parole con OCR
		for x,b in enumerate(boxes.splitlines()):
			if x!=0:
				b=b.split()
				if len(b)==12: # gli indici prima del 12 sono altre informazioni del testo (colore, posizione, etc..)
					#print(b[11])
					#lista delle parole
					temp_list_words.append(b[11])

		# Inizializzo la lista delle facce per le facce univoche trovate con isProcessed
		list_idFaces = []
		for i in range(lunghezza_isProcessed):
			list_idFaces.append(-1)

		lunghezza_isProcessed = 1 # se non ci sono facce, la lista idFaces è -1 (anziché vuota)



		print("isPersonDetected: ", isPersonDetected)


		# SCENE PREDICTION
		image_feature = calculateFeatureAndTrain_module.singleImageFeatureExtraction(img=frame)
		image_feature = np.array([image_feature])
		# Predict the response for test dataset
		y_pred = scene_model.predict(image_feature)
		y_pred_proba = scene_model.predict_proba(image_feature)

		counter_scenes[int(y_pred)] += 1

		print("Probabilità del tipo di scena:\t", y_pred_proba)

		sorted_y_pred_proba = y_pred_proba
		sorted_y_pred_proba.sort()
		differenza_prob = sorted_y_pred_proba[0][-1]-sorted_y_pred_proba[0][-2]
		print("Differenza tra le due probabilità più grandi:\t{:.5f} ({:.2f}%)".format(differenza_prob, differenza_prob*100))
		# print("Varianza della probabilità:\t", np.var(y_pred_proba))
		print("Scene:\t", scenes[int(y_pred)])

		print("")

		#struct con numero del frame e la lista di parole
		rec=Record(frame_counter,frame_counter*temp,temp_list_words, isPersonDetected, False, list_idFaces, scenes[int(y_pred)], oggetti_rilevati)
		#controlliamo se questo identico record è già contenuto nella lista
		#potrebbe essere dispendioso, facciamo solo il compare con l'ultimo frame in listOfRecords?
		flag=False

		# conta se ci sono frames con la lista delle parole uguali
		for y in listOfRecords:
			if(y.list_words == rec.list_words):
				flag=True
				count_frame_doppi += 1
				break

		# listOfRecords.append(rec) # Inserisco ogni Record anche se doppione


		if rec.isPersonDetected == True: #se c'è una persona
			listOfRecords.append(rec)
		else: # se NON c'è una persona
			if flag == False: # ma le parole sono diverse
				listOfRecords.append(rec)


		# # SCOMMENTARE PER AVERE I RECORD UNIVOCI IN BASE ALLE PAROLE
		# if(flag==False):
		# 	listOfRecords.append(rec) # avremo listOfRecords UNIVOCI
		i = 0
		continue
	i += 1

video.release()
cv2.destroyAllWindows()



# CICLO CHE VA A COMPARARE TUTTE LE FACCE
# Compara le due foto e definisce se le due persone trovate sono la stessa persona
# result = DeepFace.verify(img1_path = "images/lec3.jpg", img2_path = IMAGE_FACES_PATH+"face_of_lec2_face0.jpg")
# print(result)
# print(frame_with_faces)

from os import listdir
from os.path import isfile, join

mypath = 'images/faces/'
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
# print(onlyfiles)


FILENAME = os.path.splitext(NOME_VIDEO)[0]
idFace = -1
totalFace=[]

# Loop che compara le facce trovate e conta il numero di occorrenze della relativa faccia
for i in range(len(frame_with_faces)):
	frame = frame_with_faces[i]
	for n_face in range(frame.num_faces):
		# La prima immagine di faccia
		path_img = 'images/faces/face_of_' + FILENAME + '_frame_' + str(frame.num_frame) + '_face_' + str(n_face) + '.jpg'

		if frame_with_faces[i].isProcessed[n_face] == False: # assegnamo una faccia se non è stata processata

			try:
				obj = DeepFace.verify(img1_path=path_img, img2_path=path_img) # se trova una faccia continua, se no exception
				idFace+=1
				totalFace.append(1)
				frame_with_faces[i].isProcessed[n_face] = True
				for k in range(i,len(listOfRecords)):
					if(listOfRecords[k].time == frame_with_faces[i].time):
						listOfRecords[k].idFaces[n_face] = idFace
						break


				for j in range(i+1, len(frame_with_faces)):
					for k in range(frame_with_faces[j].num_faces): # numero di facce di quel frame specifico j

						if frame_with_faces[j].isProcessed[k] == False:

							# Compara le due foto e definisce se le due persone trovate sono la stessa persona
							path_img2 = 'images/faces/face_of_' + FILENAME + '_frame_' + str(frame_with_faces[j].num_frame) + '_face_' + str(k) + '.jpg'
							try:
								df_result = DeepFace.verify(img1_path = path_img, img2_path = path_img2)
								# print(df_result)

								if df_result['verified'] == True:
									totalFace[idFace]+=1
									frame_with_faces[j].isProcessed[k] = True
									for f in range(j,len(listOfRecords)):
										if(listOfRecords[f].time == frame_with_faces[j].time):
											listOfRecords[f].idFaces[k] = idFace # metto lo stesso idFace della stessa faccia trovata
											break
							except:
								# print("DeepFace: Face could not be detected.")
								pass

						else:
							# print("Gia' processata.")
							continue

			except:
				# print("EXCEPTION: Faccia non trovata")
				pass



idSpeaker=totalFace.index(max(totalFace))
maxSpeakerApparence=max(totalFace) # numero delle apparizioni dello speaker

counter=0
# Setta isSpeaker a True per ogni record che contiene gli ID della faccia che è comparsa più volte
for i in range(len(listOfRecords)):
	for j in range(len(listOfRecords[i].idFaces)):
		if listOfRecords[i].idFaces[j]==idSpeaker:
			listOfRecords[i].isSpeaker=True
			counter+=1
			break
	if counter==maxSpeakerApparence:
		break


# Segment
listOfSameSegment=[]
startSegment=0.0
endSegment=0.0
for i in range(0,len(listOfRecords)):
	if i==0:
		#primo elemento
		actualSegmentScene=listOfRecords[i].scene
		listOfSameSegment.append(listOfRecords[i])
		endSegment=listOfRecords[i].time
	else:
		if actualSegmentScene==listOfRecords[i].scene:
			listOfSameSegment.append(listOfRecords[i])
			endSegment=listOfRecords[i].time
		else:
			endSegment=listOfRecords[i].time-secondsForFrameSkip
			listOfSegments.append(Segment(actualSegmentScene,startSegment,endSegment,listOfSameSegment[:]))
			actualSegmentScene=listOfRecords[i].scene
			startSegment=endSegment+secondsForFrameSkip
			endSegment=listOfRecords[i].time
			listOfSameSegment.clear()
			listOfSameSegment.append(listOfRecords[i])
listOfSegments.append(Segment(actualSegmentScene,startSegment,totalFrame*temp,listOfSameSegment[:]))


print(" - - - - - VIDEO SUMMARY - - - - - ")
print("Le facce trovate sono: ", totalFace)
print("La faccia con più apparizioni è quella con id: "+str(idSpeaker)+" ed ha avuto "+str(maxSpeakerApparence)+" apparizioni con una percentuale di " + str(round(maxSpeakerApparence/n_frame_analyzed*100, 2)) + "%")

print("\nScene:")
for i in range(len(counter_scenes)):
	print(scenes[i] + ": " + str(counter_scenes[i]) + " frames (" + str(round((counter_scenes[i]/n_frame_analyzed)*100,2)) + "%)")
print("\nSegmenti:")
for indice,segment in enumerate(listOfSegments):
	print("Segmento {}: {}   da {} a {}".format(indice+1,segment.id_label,round(segment.start_time,0),round(segment.end_time,0)))
print(" - - - - - - - - - - - - - - - - - ")


# print("-------------- List of Records --------------")

# print(listOfRecords)

# print("-------------- Frame with faces ---------------")
# print(frame_with_faces)

# print("-------------- totalFace ---------------")
# print(totalFace)






#for y in listOfRecords:
	#duration=y.time
	#minutes = int(duration/60)
	#seconds = int(duration%60)
	# print('duration (M:S) = ' + str(minutes) + ':' + str(seconds))
	# print(y.list_words)
	# print("Persona presente? " + str(y.isPersonDetected))
	# print("\n")
#print("frame doppi:"+ str(count_frame_doppi))
#print(listOfRecords[0])


# DELETE FACE IMAGES
import os, shutil
for filename in os.listdir(IMAGE_FACES_PATH):
    file_path = os.path.join(IMAGE_FACES_PATH, filename)
    try:
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    except Exception as e:
        print('Failed to delete %s. Reason: %s' % (file_path, e))



# # Write video data in json output file
import json
results = [obj.to_dict() for obj in listOfSegments]
# print(results)
with open('data_'+FILENAME+'.txt', 'w') as outfile:
	json.dump(results, outfile)


# # Read video data from json file
# with open('data_prova2persone.txt') as f:
# 	data = json.load(f)

# print(type(data))

# # Example of reading data structure from JSON file
# for i in data:
# 	for j in i["list_of_same_scene"]:
# 		for k in j["list_words"]:
# 			if k=='\\':
# 				print("!!!!!!!!!!!!")
# 	#print(i)

