from xgboost import XGBClassifier
import sklearn.metrics as metrics
from sklearn.model_selection import cross_val_score
import pickle
import optuna


def oneHot_to_1D(y):

	y_final = []
	for i in range(0,len(y)):
		for j in range(0, 4):
			if y[i,j] == 1:
				y_final.append(j)
				break

	return y_final

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


def train_and_score(X_train, X_test, y_train, y_test):

	y_train_new = y_train
	y_test_new = y_test

	clf = XGBClassifier(use_label_encoder=False, eval_metric = 'mlogloss', random_state=0)
	clf.fit(X=X_train, y=y_train_new)
	y_pred = clf.predict(X_test)
	score = clf.score(X_test,y_test_new) # testing accuracy

	ac_score = metrics.accuracy_score(y_test_new, y_pred)
	print("\nExtreme gradient boosting score:\t", score)
	print("metrics.accuracy score XGBoost:\t"+ str(ac_score))

	cross_score = cross_val_score(clf, X_train, y_train_new, cv=5) # training accuracy
	print("cross val score XGBoost:\t\t" + str(cross_score)) # array di 5 elementi
	print("cross val score XGBoost mean:\t" + str(cross_score.mean()))
	print("%f accuracy with a standard deviation of %f" % (cross_score.mean(), cross_score.std()))

	y_pred = oneD_to_oneHot(y_pred)

	return y_pred # testing accuracy


def train(X_train,y_train,best_params):

	model = XGBClassifier(**best_params, use_label_encoder=False, eval_metric = 'mlogloss', random_state=0)
	model.fit(X_train, y_train) # Training del modello con i dati

	cross_score = cross_val_score(model, X_train, y_train, cv=5) # training accuracy
	print("best: %f accuracy with a standard deviation of %f" % (cross_score.mean(), cross_score.std()))
	# save the model to disk
	filename = 'xgboost500.sav'
	pickle.dump(model, open(filename, 'wb'))

	return model


def findBestHyperparameters(X_train, y_train):

	def objective(trial):
		dtc_params = dict(
	        max_depth=trial.suggest_int("max_depth", 2, 10),
			learning_rate=trial.suggest_float("learning_rate", 1e-4, 1e-1, log=True),
			n_estimators=trial.suggest_int("n_estimators", 100, 2000),
			min_child_weight=trial.suggest_int("min_child_weight", 1, 10),
			colsample_bytree=trial.suggest_float("colsample_bytree", 0.2, 1.0),
			subsample=trial.suggest_float("subsample", 0.2, 1.0),
			reg_alpha=trial.suggest_float("reg_alpha", 1e-4, 1e2, log=True),
			reg_lambda=trial.suggest_float("reg_lambda", 1e-4, 1e2, log=True),
			gamma=trial.suggest_float("gamma", 0, 50),
		)
		DTC = XGBClassifier(**dtc_params, use_label_encoder=False, eval_metric = 'mlogloss', random_state=42) # DTC con i range di parametri dati
		cross_score = cross_val_score(DTC, X_train, y_train, cv=5)
		error = 1.0 - cross_score.mean()
		return error


	# 3. Create a study object and optimize the objective function.
	study = optuna.create_study() # di default è minimize, quindi di minimizzare l'errore
	study.optimize(objective, n_trials=500)

	print(study.best_params) # Printa i migliori parametri
	print(1.0 - study.best_value) # Printa l'accuracy
	return study
