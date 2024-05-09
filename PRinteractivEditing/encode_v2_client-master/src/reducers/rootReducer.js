import {combineReducers} from "redux";
import {user} from "./user.reducer";
import {alert} from "./alert.reducer";
import {topicmap} from "./topicmap.reducer";
import {topicType} from "./topicType.reducer";
import {topic} from "./topic.reducer";
import {associationType} from "./associationType.reducer";
import {linkedTopics} from "./linkedTopics.reducer";
import {occurrence} from "./occurrence.reducer";
import {occurrenceType} from "./occurrenceType.reducer";
import {scope} from "./scope.reducer"
import {schema} from "./schema.reducer";
import {association} from "./association.reducer";
import {effortType} from"./effortType.reducer"


const rootReducer = combineReducers({
    user,
    alert,
    topicmap,
    topicType,
    topic,
    associationType,
    linkedTopics,
    occurrence,
    occurrenceType,
    scope,
    schema,
    association,
    effortType
});

export default rootReducer;