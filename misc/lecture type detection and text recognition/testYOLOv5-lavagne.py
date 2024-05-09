import yolov5
import cv2

fileName = "models/best-senzaAug.pt"
model = yolov5.load(fileName) # se ho il modello in locale

# non funziona bene, rileva lavagne in ogni immagine. Il problema può essere la scarsità e qualità del dataset.
def rilevaLavagna(model, frame):
	model.conf = 0.6

	isLavagna = False

	results = model(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), size=400)

	print("--- Lavagne trovate ---")
	print(results.pandas().xyxy[0])

	labels, cord_thres = results.xyxyn[0][:, -1].numpy(), results.xyxyn[0][:, :-1].numpy() # estraggo labels e coordinate dei rettangoli
	classes = model.names
	# show results
	for i in labels:
		# print(classes[int(i)])
		if(classes[int(i)]=="lavagna"):
			isLavagna=True

	# show results
	results.print()
	results.show()
	print(isLavagna)


frame = cv2.imread("images/lec8.jpg")
rilevaLavagna(model, frame)