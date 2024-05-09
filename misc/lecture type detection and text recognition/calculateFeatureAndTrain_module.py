import numpy as np
import cv2 as cv
import pathlib
import os
import mediapipe as mp
import svm_module
import xgboost_module
import pandas as pd
import sklearn.metrics as metrics
from matplotlib import pyplot as plt
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import cross_val_score

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

IMAGE_TRAIN_PATH= "images\\train"
IMAGE_TEST_PATH= "images\\test"

# Plot the color histogram divided in 16 groups
def plotList(array):
	objects = ('0', '1', '2', '3', '4', '5','6','7','8','9','10','11','12','13','14','15')
	y_pos = np.arange(len(objects))
	performance = array

	plt.bar(y_pos, performance, align='center', alpha=0.5)
	plt.xticks(y_pos, objects)

	plt.show()

# Print the confusion matrix
def confusionMatrix(y_test, y_pred, actions):
	print("\nCONFUSION MATRIX\n")

	# print(y_pred)
	# print(y_pred.argmax(axis=1))

	# Model Accuracy, how often is the classifier correct?
	# print("metrics.accuracy score 1D (non tiene conto dei null):\t",metrics.accuracy_score(y_test.argmax(axis=1), y_pred.argmax(axis=1)))
	print("metrics.accuracy score normale (considera i null sbagliati) - Testing score:\t",metrics.accuracy_score(y_test, y_pred))

	matrix = [[0 for x in range(len(actions))] for y in range(len(actions))]
	errori = 0
	predNull = 0
	for i in range(0,len(y_test)):
		if 1 in y_pred[i]:
			if(np.argmax(y_pred[i]) != np.argmax(y_test[i])):
				matrix[np.argmax(y_test[i])][np.argmax(y_pred[i])]=matrix[np.argmax(y_test[i])][np.argmax(y_pred[i])] + 1
				errori=errori+1
			#print("valore predetto per campione "+ str(i)+ ": "+str(actions[np.argmax(y_pred[i])])) #prediction
			#print("valore effettivo per campione "+ str(i)+ ": "+str(actions[np.argmax(y_test[i])])+"\n") #valore effettivo
			else:
				matrix[np.argmax(y_test[i])][np.argmax(y_pred[i])]=matrix[np.argmax(y_test[i])][np.argmax(y_pred[i])] + 1
		else:
			errori+=1
			predNull+=1

	mat=pd.DataFrame(np.row_stack(matrix))
	col=[]
	for i in range(len(actions)):
		col.append(actions[i])

	mat.columns=col
	mat.index=actions

	print("numero campioni di test: "+str(len(y_pred))+"   campioni erroneamente classificati: "+str(errori) + "   campioni classificati nulli: " + str(predNull) + "\n")
	print(mat)

	# print("\nmetrics.confusion_matrix")
	# print(confusion_matrix(y_test.argmax(axis=1), y_pred.argmax(axis=1)))


# Extract features from multiple images in a folder
def featureExtraction(IMAGE_TRAIN_PATH):
	PROJECT_PATH=pathlib.Path(__file__).parent.resolve() #restituisce il path del progetto
	FINAL_IMAGE_TRAIN_PATH=os.path.join(PROJECT_PATH,IMAGE_TRAIN_PATH)

	list_subfolders_with_paths = [f.path for f in os.scandir(FINAL_IMAGE_TRAIN_PATH) if f.is_dir()]

	numero_gruppi = 16


	X_train = []
	y_train = []

	for directory in list_subfolders_with_paths:

		#cancella le 2 righe sotto al commento
		#cartella=os.path.basename(os.path.normpath(directory))
		#if cartella=="noAlzateLaterali":
			#directory=FULL_VIDEO_PATH
		print("sto processando le img in: "+ directory )
		for file in os.listdir(directory):
			path_directory = os.path.join(FINAL_IMAGE_TRAIN_PATH, directory)
			filename = os.fsdecode(file)
			final_file_path = os.path.join(path_directory, filename)

			img = cv.imread(final_file_path,0)
			hist = cv.calcHist([img],[0],None,[256],[0,256])

			dimensione_gruppo = len(hist) / numero_gruppi

			counter = 0
			array_of_hist = []
			sum = 0
			for i in range(0, len(hist)):
				counter+=1

				sum = sum + hist[i][0].astype(int)
				if counter == dimensione_gruppo:
					array_of_hist.append(sum)
					counter = 0
					sum = 0

			totalPixel = np.sum(array_of_hist)

			normalized_array_of_hist = [el / totalPixel for el in array_of_hist]

			features = normalized_array_of_hist



			# # PLOTTA IL COLOR HISTOGRAM
			# plotList(normalized_array_of_hist)


			# TROVA LA POSIZIONE DELLA FACCIA PIù GRANDE (xmedio)
			with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:

					# Convert the BGR image to RGB and process it with MediaPipe Face Detection.
					results = face_detection.process(cv.cvtColor(img, cv.COLOR_BGR2RGB))

					# Draw face detections of each face.
					if not results.detections:
						xmedio = 0 # ###################################### forse mettere -1, 0 è come il paper
						grandezza_faccia = 0
						n_facce = 0

					else:
						if len(results.detections) > 1:
							n_facce = 2
						elif len(results.detections) == 1:
							n_facce = 1

						for i in range(len(results.detections)):
							if i==0:

								xmedio = results.detections[i].location_data.relative_bounding_box.width/2 + results.detections[i].location_data.relative_bounding_box.xmin 
								grandezza_faccia = results.detections[i].location_data.relative_bounding_box.width * results.detections[i].location_data.relative_bounding_box.height
							else:
								grandezza_faccia2 = results.detections[i].location_data.relative_bounding_box.width * results.detections[i].location_data.relative_bounding_box.height
								if grandezza_faccia2 > grandezza_faccia:

									grandezza_faccia = grandezza_faccia2
									xmedio = results.detections[i].location_data.relative_bounding_box.width/2 + results.detections[i].location_data.relative_bounding_box.xmin 



			features.extend((xmedio, grandezza_faccia, n_facce))

			X_train.append(features)

			if os.path.basename(directory) == 'blackboard':
				y_train.append(0)
			elif os.path.basename(directory) == 'slide':
				y_train.append(1)
			elif os.path.basename(directory) == 'slide-and-talk':
				y_train.append(2)
			elif os.path.basename(directory) == 'talk':
				y_train.append(3)

	return X_train, y_train


# Extract features from a single image (either image path or the image already read)
def singleImageFeatureExtraction(final_file_path = None, img = None):
	numero_gruppi = 16
	flagException = False

	try:
		if (final_file_path == None) and (img == None):
			flagException = True
	except:
		pass

	try:
		if ((final_file_path == None) and (img.all() == None)):
			flagException = True
	except:
		pass

	if flagException == True:
		raise Exception("inserire un parametro alla funzione singleImageFeatureExtraction")

	if final_file_path != None:
		img = cv.imread(final_file_path,0)

	hist = cv.calcHist([img],[0],None,[256],[0,256])

	dimensione_gruppo = len(hist) / numero_gruppi

	counter = 0
	array_of_hist = []
	sum = 0
	for i in range(0, len(hist)):
		counter+=1

		sum = sum + hist[i][0].astype(int)
		if counter == dimensione_gruppo:
			array_of_hist.append(sum)
			counter = 0
			sum = 0

	totalPixel = np.sum(array_of_hist)

	normalized_array_of_hist = [el / totalPixel for el in array_of_hist]

	features = normalized_array_of_hist



	# # PLOTTA IL COLOR HISTOGRAM
	# plotList(normalized_array_of_hist)


	# TROVA LA POSIZIONE DELLA FACCIA PIù GRANDE (xmedio)
	with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:

		# Convert the BGR image to RGB and process it with MediaPipe Face Detection.
		results = face_detection.process(cv.cvtColor(img, cv.COLOR_BGR2RGB))

		# Draw face detections of each face.
		if not results.detections:
			xmedio = 0 # ###################################### forse mettere -1, 0 è come il paper
			grandezza_faccia = 0
			n_facce = 0

		else:
			if len(results.detections) > 1:
				n_facce = 2
			elif len(results.detections) == 1:
				n_facce = 1

			for i in range(len(results.detections)):
				if i==0:

					xmedio = results.detections[i].location_data.relative_bounding_box.width/2 + results.detections[i].location_data.relative_bounding_box.xmin 
					grandezza_faccia = results.detections[i].location_data.relative_bounding_box.width * results.detections[i].location_data.relative_bounding_box.height
				else:
					grandezza_faccia2 = results.detections[i].location_data.relative_bounding_box.width * results.detections[i].location_data.relative_bounding_box.height
					if grandezza_faccia2 > grandezza_faccia:

						grandezza_faccia = grandezza_faccia2
						xmedio = results.detections[i].location_data.relative_bounding_box.width/2 + results.detections[i].location_data.relative_bounding_box.xmin 



	features.extend((xmedio, grandezza_faccia, n_facce))

	return features


# Print the model's score
def print_model_score(model):
	X_train, y_train = featureExtraction(IMAGE_TRAIN_PATH)
	cross_score = cross_val_score(model, X_train, y_train, cv=5)
	print("Model's score: %f accuracy with a standard deviation of %f" % (cross_score.mean(), cross_score.std()))


# Function to train the XGBoost model
def train():
	X_train, y_train = featureExtraction(IMAGE_TRAIN_PATH)
	X_test, y_test = featureExtraction(IMAGE_TEST_PATH)


	# # SVM training
	# print("# SVM --- Best HP training: ")
	# study=svm_module.findBestHyperparameters(X_train, y_train)
	# model=svm_module.train(X_train, y_train, study.best_params)
	# y_pred = model.predict(X_test)
	# print("------ y_pred")
	# print(y_pred)

	scenes = [0,1,2,3]
	# # confusionMatrix(y_test, y_pred, scenes)
	# print(confusion_matrix(y_true=y_test, y_pred=y_pred, labels=scenes))



	# XGBoost training
	print("# XGBoost --- Best HP training: ")
	study=xgboost_module.findBestHyperparameters(X_train, y_train)
	model=xgboost_module.train(X_train, y_train, study.best_params)
	y_pred = model.predict(X_test)
	print_model_score(model)
	print(confusion_matrix(y_true=y_test, y_pred=y_pred, labels=scenes))

