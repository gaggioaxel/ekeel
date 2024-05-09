from sklearn import svm
import sklearn.metrics as metrics
from sklearn.model_selection import cross_val_score
import pickle
import optuna

# Transform from one hot encoding to 1-dimensional list
def oneHot_to_1D(y):

	y_final = []
	for i in range(0,len(y)):
		for j in range(0, 4):
			if y[i,j] == 1:
				y_final.append(j)
				break

	return y_final


# Transform from 1-dimensional list to one-hot-encoding
def oneD_to_oneHot(y):
	y_final = []
	for i in range(0,len(y)):
		if y[i] == 0:
			y_final.append([1,0,0,0])
		elif y[i] == 1:
			y_final.append([0,1,0,0])
		elif y[i] == 2:
			y_final.append([0,0,1,0])
		else:
			y_final.append([0,0,0,1])
	return y_final


# Used for cross validation score
def train_and_score(X_train, X_test, y_train, y_test):

	y_train_new = y_train
	y_test_new = y_test

	clf = svm.SVC(random_state=0)
	clf.fit(X=X_train, y=y_train_new)
	y_pred = clf.predict(X_test)
	score = clf.score(X_test,y_test_new)

	ac_score = metrics.accuracy_score(y_test_new, y_pred)
	print("\nSVM score:\t", score)
	print("metrics.accuracy score SVM:\t"+ str(ac_score))

	cross_score = cross_val_score(clf, X_train, y_train_new, cv=5)
	print("cross val score SVM:\t\t" + str(cross_score))
	print("cross val score SVM mean:\t" + str(cross_score.mean()))
	print("%f accuracy with a standard deviation of %f" % (cross_score.mean(), cross_score.std()))

	y_pred = oneD_to_oneHot(y_pred)
	return y_pred


# Train and save to file the model
def train(X_train,y_train,best_params):

	model = svm.SVC(**best_params, random_state=0)
	model.fit(X_train, y_train) # Training del modello con i dati

	cross_score = cross_val_score(model, X_train, y_train, cv=5) # training accuracy
	print("best: %f accuracy with a standard deviation of %f" % (cross_score.mean(), cross_score.std()))
	# save the model to disk
	filename = 'svm.sav'
	pickle.dump(model, open(filename, 'wb'))

	return model


# Find the best hyperparameters with Optuna
def findBestHyperparameters(X_train, y_train):

	def objective(trial):
		dtc_params = dict(
			kernel=trial.suggest_categorical('kernel',['rbf','poly','linear','sigmoid']),
			C=trial.suggest_float("C",0.1,3.0,log=True),
			gamma=trial.suggest_categorical('gamma',['auto','scale']),
			degree=trial.suggest_int("degree",1,3,log=True),
		)
		DTC = svm.SVC(**dtc_params, random_state=0)
		cross_score = cross_val_score(DTC, X_train, y_train, cv=5)
		error = 1.0 - cross_score.mean()
		return error


	# 3. Create a study object and optimize the objective function.
	study = optuna.create_study() # di default è minimize, quindi di minimizzare l'errore
	study.optimize(objective, n_trials=1000)

	print(study.best_params) # Printa i migliori parametri
	print(1.0 - study.best_value) # Printa l'accuracy
	return study
